import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./server/routers";
import { createContext } from "./server/_core/context";
import { registerOAuthRoutes } from "./server/_core/oauth";

// Vercel detects this root Express entrypoint and runs it as a serverless function.
// Keep API routes here; Vite's production assets are emitted to /public for the CDN.
const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerOAuthRoutes(app);

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "supermarket-billing-app",
    timestamp: new Date().toISOString(),
  });
});

export default app;
