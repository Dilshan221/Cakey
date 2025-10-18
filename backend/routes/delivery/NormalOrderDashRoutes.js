import express from "express";
import
    {
        getDashboardStats,
        getRecentOrders,
        getAllOrders,
        getOrdersByStatus,
        updateStatus,
        cancelOrder,
        viewInvoice,
        getOrderAnalytics
    } from "../../controllers/delivery/NormalOrderDashController.js";

const router = express.Router();

// Dashboard routes
router.get("/stats", getDashboardStats); // GET /dashboard/stats - Get dashboard statistics
router.get("/recent", getRecentOrders); // GET /dashboard/recent - Get recent orders
router.get("/orders", getAllOrders); // GET /dashboard/orders - Get all orders for dashboard
router.get(
    "/orders/status/:status",
    getOrdersByStatus
); // GET /dashboard/orders/status/:status - Get orders by status
router.patch("/orders/:id/status", updateStatus); // PATCH /dashboard/orders/:id/status - Update order status
router.patch("/orders/:id/cancel", cancelOrder); // PATCH /dashboard/orders/:id/cancel - Cancel order
router.get("/orders/:id/invoice", viewInvoice); // GET /dashboard/orders/:id/invoice - View invoice
router.get("/analytics", getOrderAnalytics); // GET /dashboard/analytics - Get order analytics

export default router;
