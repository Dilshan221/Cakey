// routes/paymentRoutes.js
import express from "express";
import {
  createPayment,
  listPayments,
  getPayment,
  deletePayment,
} from "../controllers/paymentController.js";

const router = express.Router();

// /api/payments
router.get("/", listPayments);
router.post("/", createPayment);
router.get("/:id", getPayment);
router.delete("/:id", deletePayment);

export default router;
