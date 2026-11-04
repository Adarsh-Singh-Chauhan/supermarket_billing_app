import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { z } from "zod";
import type { Express, Request, Response } from "express";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import * as db from "../db";
import { ENV } from "./env";

const scrypt = promisify(scryptCallback) as (...args: any[]) => Promise<Buffer>;
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(320),
  password: z.string().min(12).max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(128),
});

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isAuthConfigured() {
  return Boolean(process.env.DATABASE_URL && ENV.cookieSecret.length >= 32);
}

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 64 * 1024 * 1024,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

async function verifyPassword(password: string, encoded: string) {
  const [algorithm, costText, blockText, parallelText, saltHex, hashHex] = encoded.split("$");
  if (
    algorithm !== "scrypt" ||
    costText !== String(SCRYPT_N) ||
    blockText !== String(SCRYPT_R) ||
    parallelText !== String(SCRYPT_P) ||
    !saltHex ||
    !hashHex ||
    !/^[0-9a-f]+$/i.test(saltHex) ||
    !/^[0-9a-f]+$/i.test(hashHex)
  ) {
    return false;
  }

  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 64 * 1024 * 1024,
  });
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function setSession(req: Request, res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    ...getSessionCookieOptions(req),
    maxAge: SESSION_TTL_MS,
  });
}

async function createLocalSession(
  req: Request,
  res: Response,
  user: NonNullable<Awaited<ReturnType<typeof db.getUserByOpenId>>>,
) {
  const token = await sdk.signSession(
    {
      openId: user.openId,
      appId: "storedesk-password",
      name: user.name || user.email || "StoreDesk user",
    },
    { expiresInMs: SESSION_TTL_MS },
  );
  setSession(req, res, token);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/**
 * First-party email/password authentication.
 * New public sign-ups always receive the "user" role; Admin is never self-selected.
 */
export function registerPasswordAuthRoutes(app: Express) {
  app.get("/api/auth/status", (_req, res) => {
    res.status(200).json({
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      sessionSecretConfigured: ENV.cookieSecret.length >= 32,
      emailPasswordAuthAvailable: isAuthConfigured(),
      demoMode: process.env.DEMO_MODE === "true",
    });
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    if (!isAuthConfigured()) {
      res.status(503).json({
        error: "Sign-up is not ready. Configure DATABASE_URL and a JWT_SECRET of at least 32 characters.",
      });
      return;
    }

    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || "Please check your registration details." });
      return;
    }

    const name = parsed.data.name.trim();
    const email = normalizeEmail(parsed.data.email);
    try {
      const existing = await db.getLocalCredentialByEmail(email);
      if (existing) {
        res.status(409).json({ error: "An account with this email already exists." });
        return;
      }

      const user = await db.createLocalAccount({
        openId: \`local_\${randomUUID().replace(/-/g, "")}\`,
        name,
        email,
        passwordHash: await hashPassword(parsed.data.password),
      });
      const publicUser = await createLocalSession(req, res, user);
      res.status(201).json({ success: true, user: publicUser });
    } catch (error) {
      console.error("[Auth] Registration failed", error);
      res.status(500).json({ error: "Unable to create the account. Check database migration status and try again." });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    if (!isAuthConfigured()) {
      res.status(503).json({
        error: "Sign-in is not ready. Configure DATABASE_URL and a JWT_SECRET of at least 32 characters.",
      });
      return;
    }

    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || "Please enter a valid email and password." });
      return;
    }

    const email = normalizeEmail(parsed.data.email);
    try {
      const credentials = await db.getLocalCredentialByEmail(email);
      if (!credentials || !(await verifyPassword(parsed.data.password, credentials.passwordHash))) {
        res.status(401).json({ error: "Email or password is incorrect." });
        return;
      }

      await db.touchUserLastSignedIn(credentials.user.id);
      const user = await db.getUserByOpenId(credentials.user.openId);
      if (!user) {
        res.status(401).json({ error: "Email or password is incorrect." });
        return;
      }

      const publicUser = await createLocalSession(req, res, user);
      res.status(200).json({ success: true, user: publicUser });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Unable to sign in. Please try again." });
    }
  });
}
