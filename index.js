import express from "express";
import app from "./.server-build/app.js";

// Keep an Express import in this entrypoint so Vercel's Express builder
// can identify the backend, while the complete app remains bundled.
const handler = express();
handler.use(app);

export default handler;
