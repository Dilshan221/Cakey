// backend/routes/delivery/orderRoutes.js
import express from "express";
import {
  getAllOrders,
  addOrder,
  getById,
  updateOrder,
  deleteOrder,
  updateStatus,
  getByStatus,
  getByCustomer,
} from "../../controllers/delivery/OrderController.js";

const router = express.Router();

/** Put specific routes before "/:id" */
router.get("/status/:status", getByStatus);
router.get("/customer/:customerName", getByCustomer);

router.get("/", getAllOrders);
router.post("/", addOrder);

router.patch("/:id/status", updateStatus);
router.get("/:id", getById);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;
