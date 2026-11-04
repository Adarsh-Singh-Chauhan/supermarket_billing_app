import express from "express";
import path from "node:path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./server/routers";
import { createContext } from "./server/_core/context";
import { registerOAuthRoutes } from "./server/_core/oauth";
import { registerPasswordAuthRoutes } from "./server/_core/password-auth";

// Vercel detects this root Express entrypoint and runs it as a serverless function.
// Keep API routes here; Vite's production assets are emitted to /public for the CDN.
const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerOAuthRoutes(app);
registerPasswordAuthRoutes(app);

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


// Vercel's Express runtime sends application requests through this handler.
// Include the generated Vite output in the function and serve it for both
// asset requests and client-side routes.
const clientBuildDirectory = path.resolve(process.cwd(), "public");
app.use(express.static(clientBuildDirectory, { index: false }));
app.get("*", (_req, res, next) => {
  res.sendFile(path.join(clientBuildDirectory, "index.html"), (error) => {
    if (error) next(error);
  });
});
