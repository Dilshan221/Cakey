/// backend/index.js
import express from "express";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";

import { connectDatabase } from "./utils/database.js";

/* ---------------- Existing routes ---------------- */
import attendanceRoute from "./routes/attendanceRoute.js";
import usermanagementRoute from "./routes/usermanagementRoute.js";
import employeeRoute from "./routes/employeeRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import salaryRoute from "./routes/salaryRoute.js";
import productRoute from "./routes/Productroutes.js";
import orderRoute from "./routes/orderRoutes.js"; // core order flow (your existing)
import reviewRoute from "./routes/ReviewRoutes.js";
import complaintRoute from "./routes/ComplaintRoutes.js";
import adminRoute from "./routes/Adminroutes.js";

/* ---------------- Delivery routes (ESM, default export) ---------------- */
import normalOrderRoute from "./routes/delivery/OrderRoutes.js"; // Normal delivery orders
import customOrderRoute from "./routes/delivery/customOrderRoutes.js"; // Custom/special orders
import normalOrderDashRoute from "./routes/delivery/NormalOrderDashRoutes.js"; // KPIs/metrics

const app = express();
app.disable("x-powered-by");

/* ---------------- Middleware ---------------- */
app.use(
  morgan("dev", {
    skip: (req) => req.path === "/health" || req.path === "/api/health",
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const rawOrigins =
  process.env.CLIENT_ORIGIN ||
  "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173";
const allowList = rawOrigins.split(",").map((s) => s.trim());

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowList.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ---------------- Health ---------------- */
app.get("/", (_req, res) => res.json({ ok: true, service: "Cake&Bake API" }));
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/test", (_req, res) =>
  res.json({ message: "Backend connected successfully!" })
);

// Await one shared connection before running database-backed handlers.
// Health endpoints remain available when the database is unavailable.
app.use("/api", async (_req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (_error) {
    res.status(503).json({
      error: "Database unavailable. Check the backend MONGO_URI and database network access.",
    });
  }
});

/* ---------------- API (existing) ---------------- */
app.use("/api/attendance", attendanceRoute);
app.use("/api/usermanagement", usermanagementRoute);
app.use("/api/employees", employeeRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/salaries", salaryRoute);
app.use("/api/products", productRoute);
app.use("/api/order", orderRoute); // core order flow
app.use("/api/reviews", reviewRoute);
app.use("/api/complaints", complaintRoute);
app.use("/api/admins", adminRoute);

/* ---------------- API (delivery) ---------------- */
// Primary mount
app.use("/api/delivery/orders", normalOrderRoute);
// ✅ Short alias so the frontend can call /api/orders/*
app.use("/api/orders", normalOrderRoute);

app.use("/api/custom-orders", customOrderRoute);
app.use("/api/delivery/dashboard", normalOrderDashRoute);

/* ---------------- 404 ---------------- */
app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.originalUrl}`,
    message: `Route not found: ${req.originalUrl}`,
  });
});

/* ---------------- Error handler ---------------- */
app.use((err, _req, res, _next) => {
  const isCors = err?.message?.startsWith("CORS blocked for origin:");
  const status =
    (res.statusCode && res.statusCode !== 200 ? res.statusCode : null) ||
    (isCors ? 403 : 500);

  const payload = {
    error: err.message || "Server error",
    message: err.message || "Server error",
  };
  if (process.env.NODE_ENV !== "production" && err?.stack) {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
});

export default app;
