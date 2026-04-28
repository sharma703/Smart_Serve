/**
 * server.js
 * SmartServe Backend — Express Server Entry Point
 *
 * Start:   npm start
 * Dev:     npm run dev   (requires nodemon)
 * Seed DB: npm run seed
 */

"use strict";

require("dotenv").config();
const connectDB = require("./config/db");

// Connect to Database
connectDB();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

// ── Route Modules ─────────────────────────────────────────────
const reportsRouter = require("./routes/reports");
const volunteersRouter = require("./routes/volunteers");
const dashboardRouter = require("./routes/dashboard");
const assignRouter = require("./routes/assign");

// ── Error Handlers ────────────────────────────────────────────
const { notFound, errorHandler } = require("./middleware/errorHandler");

// ── App Initialisation ────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS Configuration ────────────────────────────────────────
// Allow requests from the frontend (Live Server / file:// / custom port)
const allowedOrigins = [
  "http://127.0.0.1:5500", // VS Code Live Server default
  "http://localhost:5500",
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  "null", // file:// protocol (opening HTML directly)
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(new Error(`CORS policy: origin "${origin}" not allowed`));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// ── Core Middleware ───────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (dev: colourful, production: combined)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Optional: serve frontend files from /public ───────────────
// Uncomment if you want to serve the frontend from the same server:
// app.use(express.static(path.join(__dirname, 'public')));

// ── Health Check ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SmartServe API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ── API Routes ────────────────────────────────────────────────
app.use("/api/reports", reportsRouter);
app.use("/api/volunteers", volunteersRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/assign", assignRouter);

// ── API Docs (basic) ─────────────────────────────────────────
app.get("/api", (req, res) => {
  res.json({
    service: "SmartServe API",
    version: "1.0.0",
    baseUrl: `http://localhost:${PORT}/api`,
    endpoints: {
      health: "GET  /health",
      reports: {
        list: "GET    /api/reports",
        get: "GET    /api/reports/:id",
        create: "POST   /api/reports",
        update: "PATCH  /api/reports/:id",
        updateStatus: "PATCH  /api/reports/:id/status",
        delete: "DELETE /api/reports/:id",
      },
      volunteers: {
        list: "GET    /api/volunteers",
        get: "GET    /api/volunteers/:id",
        create: "POST   /api/volunteers",
        update: "PATCH  /api/volunteers/:id",
        availability: "PATCH  /api/volunteers/:id/availability",
        delete: "DELETE /api/volunteers/:id",
      },
      dashboard: {
        stats: "GET /api/dashboard/stats",
        breakdown: "GET /api/dashboard/breakdown",
        urgent: "GET /api/dashboard/urgent",
        topVolunteers: "GET /api/dashboard/top-volunteers",
        recent: "GET /api/dashboard/recent",
        trend: "GET /api/dashboard/trend",
      },
      assign: {
        autoAssign: "POST /api/assign",
        manual: "POST /api/assign/manual",
        history: "GET  /api/assign/history",
        complete: "POST /api/assign/:reportId/complete",
      },
    },
  });
});

// ── 404 + Global Error Handler (must be last) ─────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║      SmartServe Backend API Server       ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`\n  🚀  Server running at http://localhost:${PORT}`);
  console.log(`  📋  API docs     at http://localhost:${PORT}/api`);
  console.log(`  💚  Health check at http://localhost:${PORT}/health`);
  console.log(`  🌍  Environment: ${process.env.NODE_ENV || "development"}`);
  console.log('\n  Run "npm run seed" to populate starter data.\n');
});

module.exports = app; // For testing
