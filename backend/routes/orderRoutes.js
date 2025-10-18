import express from "express";
import {
  createOrder,
  getOrderById,
  getOrderByOrderId,
  trackOrderByOrderId,
  getOrdersByCustomer,
  validateOrderData,
  calculateOrderPrice,
  getAvailableDeliveryDates,
  getCakeOptions,
} from "../controllers/OrderController.js";

const router = express.Router();

router.post("/create", createOrder);
router.get("/orderId/:orderId", getOrderByOrderId);
router.get("/track/:orderId", trackOrderByOrderId);
router.get("/customer/:customerId", getOrdersByCustomer);
router.post("/validate", validateOrderData);
router.post("/calculate-price", calculateOrderPrice);
router.get("/available-dates", getAvailableDeliveryDates);
router.get("/cake-options", getCakeOptions);

// keep this LAST
router.get("/:id", getOrderById);

export default router;
