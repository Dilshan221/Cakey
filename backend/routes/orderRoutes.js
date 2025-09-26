import express from "express";
import {
  createOrder,
  getOrderById,
  getOrderByOrderId,
  validateOrderData,
  calculateOrderPrice,
  getAvailableDeliveryDates,
  getCakeOptions,
} from "../controllers/OrderController.js";

const router = express.Router();

router.post("/create", createOrder);
router.get("/:id", getOrderById);
router.get("/track/:orderId", getOrderByOrderId);
router.post("/validate", validateOrderData);
router.post("/calculate-price", calculateOrderPrice);
router.get("/available-dates", getAvailableDeliveryDates);
router.get("/cake-options", getCakeOptions);

export default router;
