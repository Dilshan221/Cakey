import express from "express";
import
{
  createCustomOrder,
  getAllCustomOrders,
  getCustomOrderById,
  updateOrderStatus,
  getOrderStats,
  cancelOrder,
} from "../../controllers/delivery/customOrderController.js";

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) =>
{
  next(); // For now, we'll let all requests through
};

// Public routes
router.post("/", createCustomOrder);
router.get("/:id", getCustomOrderById);

// Admin routes (protected by isAdmin middleware)
router.get("/", isAdmin, getAllCustomOrders);
router.patch("/status/:id", isAdmin, updateOrderStatus);
router.get("/dashboard/stats", isAdmin, getOrderStats);
router.delete("/cancel/:id", isAdmin, cancelOrder);

export default router;
