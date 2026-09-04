/**
 * Tool Hub — Express Backend Server
 *
 * Production-grade, stateless, zero-database backend.
 * All processing happens in-memory. No persistent storage.
 *
 * Security layers:
 *   1. Rate limiting (in-memory, auto-expiring)
 *   2. SSRF protection (DNS resolution + private IP blocking)
 *   3. Input validation (URL regex whitelist, file type checks)
 *   4. Command injection prevention (zero shell execution)
 *   5. Resource cleanup (temp files cleaned after response)
 */

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { pdfRoutes } from "./routes/pdf";
import { mediaRoutes } from "./routes/media";
import { securityMiddleware } from "./middleware/security";

const app = express();
const PORT = process.env.PORT ?? 3001;

// ── Global Middleware ────────────────────────────────────────────────────────

app.use(cors({ origin: true }));
app.use(express.json({ limit: "110mb" })); // slightly above our 100MB file cap
app.use(securityMiddleware);

// Global rate limiter: 60 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});
app.use(globalLimiter);

// ── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/pdf", pdfRoutes);
app.use("/api/media", mediaRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// ── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[Tool Hub] Backend running on http://localhost:${PORT}`);
});
