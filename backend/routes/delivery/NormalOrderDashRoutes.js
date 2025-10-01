import express from "express";
import {
  getDashboardStats,
  getRecentOrders,
  getAllOrders,
  getOrdersByStatus,
  updateStatus,
  cancelOrder,
  viewInvoice,
  getOrderAnalytics,
} from "../../controllers/delivery/NormalOrderDashController.js";

const router = express.Router();

// Base path mounted at: /api/delivery/dashboard
router.get("/stats", getDashboardStats); // GET    /api/delivery/dashboard/stats
router.get("/recent", getRecentOrders); // GET    /api/delivery/dashboard/recent
router.get("/orders", getAllOrders); // GET    /api/delivery/dashboard/orders
router.get("/orders/status/:status", getOrdersByStatus); // GET    /api/delivery/dashboard/orders/status/:status
router.patch("/orders/:id/status", updateStatus); // PATCH  /api/delivery/dashboard/orders/:id/status
router.patch("/orders/:id/cancel", cancelOrder); // PATCH  /api/delivery/dashboard/orders/:id/cancel
router.get("/orders/:id/invoice", viewInvoice); // GET    /api/delivery/dashboard/orders/:id/invoice
router.get("/analytics", getOrderAnalytics); // GET    /api/delivery/dashboard/analytics

export default router;
