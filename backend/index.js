// backend/index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import attendanceRoute from "./routes/attendanceRoute.js";
import usermanagementRoute from "./routes/usermanagementRoute.js";
import employeeRoute from "./routes/employeeRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import salaryRoute from "./routes/salaryRoute.js";
import productRoute from "./routes/Productroutes.js";
import orderRoute from "./routes/orderRoutes.js";

dotenv.config();

const app = express();

app.disable("x-powered-by");
app.use(
  morgan("dev", {
    skip: (req) => req.path === "/health" || req.path === "/api/health",
  })
);

// ✅ parsers BEFORE routes
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ CORS
const rawOrigins =
  process.env.CLIENT_ORIGIN ||
  "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173";

const allowList = rawOrigins.split(",").map((s) => s.trim());

const corsOptions = {
  origin(origin, cb) {
    if (!origin || allowList.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Health
app.get("/", (_req, res) => res.json({ ok: true, service: "Cake&Bake API" }));
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ✅ Routes
app.use("/api/attendance", attendanceRoute);
app.use("/api/usermanagement", usermanagementRoute);
app.use("/api/employees", employeeRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/salaries", salaryRoute);
app.use("/api/products", productRoute);
app.use("/api/order", orderRoute);

// test
app.get("/api/test", (_req, res) =>
  res.json({ message: "Backend connected successfully!" })
);

// 404
app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.originalUrl}`,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// error handler
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

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/crud";

let server;
const start = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    server = app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
};
start();

const shutdown = async (signal) => {
  try {
    console.log(`\n${signal} received: closing server...`);
    if (server) await new Promise((r) => server.close(r));
    await mongoose.connection.close();
    console.log("Mongo connection closed.");
    process.exit(0);
  } catch (e) {
    console.error("Error during shutdown:", e);
    process.exit(1);
  }
};
["SIGINT", "SIGTERM"].forEach((sig) => process.on(sig, () => shutdown(sig)));
