import express from "express";
import
{
    getAllOrders,
    addOrder,
    getById,
    updateOrder,
    deleteOrder,
    updateStatus,
    getByStatus,
    getByCustomer,
    getByUserEmail
} from "../../controllers/delivery/OrderController.js";

const router = express.Router();

// Route definitions
router.get("/", getAllOrders); // GET /orders - Get all orders
router.post("/", addOrder); // POST /orders - Add new order
router.get("/:id", getById); // GET /orders/:id - Get order by ID
router.put("/:id", updateOrder); // PUT /orders/:id - Update order
router.delete("/:id", deleteOrder); // DELETE /orders/:id - Delete order
router.patch("/:id/status", updateStatus); // PATCH /orders/:id/status - Update order status
router.get("/status/:status", getByStatus); // GET /orders/status/:status - Get orders by status
router.get("/customer/:customerName", getByCustomer); // GET /orders/customer/:customerName - Get orders by customer
router.get("/user/:email", getByUserEmail);

export default router;
