// backend/routes/delivery/customOrderRoutes.js
import express from "express";
import {
  createCustomOrder,
  getAllCustomOrders,
  getCustomOrderById,
  updateOrderStatus,
  getOrderStats,
  cancelOrder,
} from "../../controllers/delivery/customOrderController.js";

const router = express.Router();

// TODO: replace with real auth/role check
const isAdmin = (_req, _res, next) => next();

/**
 * Put specific paths BEFORE "/:id" so they don't get captured by the dynamic route.
 * Base path in index.js: app.use("/api/custom-orders", router)
 */

// Create new custom order (public)
router.post("/", createCustomOrder);

// Dashboard / reporting (admin)
router.get("/dashboard/stats", isAdmin, getOrderStats);

// List and status mgmt (admin)
router.get("/", isAdmin, getAllCustomOrders);
router.patch("/status/:id", isAdmin, updateOrderStatus);

// Cancel/delete (admin)
router.delete("/cancel/:id", isAdmin, cancelOrder);

// Get one (public)
router.get("/:id", getCustomOrderById);

export default router;
