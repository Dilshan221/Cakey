// backend/controllers/delivery/OrderController.js
import Order from "../../models/delivery/OrderModel.js";

/** GET /api/delivery/orders */
export const getAllOrders = async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      message: "Orders fetched",
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error("getAllOrders:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching orders" });
  }
};

/** POST /api/delivery/orders */
export const addOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      cakeName,
      cakeSize,
      quantity,
      frostingType,
      specialInstructions,
      deliveryDate,
      deliveryTime,
      paymentMethod,
      subtotal,
      tax,
      deliveryFee,
      total,
    } = req.body;

    // basic validations
    const required = [
      customerName,
      customerPhone,
      deliveryAddress,
      cakeName,
      cakeSize,
      quantity,
      frostingType,
      deliveryDate,
      deliveryTime,
      paymentMethod,
      subtotal,
      tax,
      total,
    ];
    if (required.some((v) => v === undefined || v === null || v === "")) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const validSizes = ["small", "medium", "large"];
    if (!validSizes.includes(cakeSize)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid cake size" });
    }

    const validFrostings = [
      "Butter Cream",
      "Cream Cheese",
      "Chocolate Ganache",
    ];
    if (!validFrostings.includes(frostingType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid frosting type" });
    }

    const validPayments = ["Credit Card", "Afterpay", "Cash on Delivery"];
    if (!validPayments.includes(paymentMethod)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment method" });
    }

    const newOrder = new Order({
      customerName,
      customerPhone,
      deliveryAddress,
      cakeName,
      cakeSize,
      quantity: Number(quantity),
      frostingType,
      specialInstructions: specialInstructions || "",
      deliveryDate: new Date(deliveryDate),
      deliveryTime,
      paymentMethod,
      subtotal: Number(subtotal),
      tax: Number(tax),
      deliveryFee: deliveryFee !== undefined ? Number(deliveryFee) : 5.0,
      total: Number(total),
    });

    const saved = await newOrder.save();
    res
      .status(201)
      .json({ success: true, message: "Order created", order: saved });
  } catch (err) {
    console.error("addOrder:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while creating order" });
  }
};

/** GET /api/delivery/orders/:id */
export const getById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    res.json({ success: true, message: "Order fetched", order });
  } catch (err) {
    console.error("getById:", err);
    res.status(400).json({ success: false, message: "Invalid order id" });
  }
};

/** PUT /api/delivery/orders/:id */
export const updateOrder = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.status) {
      const validStatuses = [
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ];
      if (!validStatuses.includes(updateData.status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status" });
      }
    }

    const updated = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.json({ success: true, message: "Order updated", order: updated });
  } catch (err) {
    console.error("updateOrder:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while updating order" });
  }
};

/** DELETE /api/delivery/orders/:id */
export const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    res.json({ success: true, message: "Order deleted", order: deleted });
  } catch (err) {
    console.error("deleteOrder:", err);
    res.status(400).json({ success: false, message: "Invalid order id" });
  }
};

/** PATCH /api/delivery/orders/:id/status  { status } */
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["Preparing", "Out for Delivery", "Delivered", "Cancelled"];
    if (!valid.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.json({ success: true, message: "Status updated", order: updated });
  } catch (err) {
    console.error("updateStatus:", err);
    res.status(400).json({ success: false, message: "Invalid order id" });
  }
};

/** GET /api/delivery/orders/status/:status */
export const getByStatus = async (req, res) => {
  try {
    const orders = await Order.find({ status: req.params.status }).sort({
      createdAt: -1,
    });
    res.json({
      success: true,
      message: "Orders by status",
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error("getByStatus:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while fetching orders by status",
      });
  }
};

/** GET /api/delivery/orders/customer/:customerName */
export const getByCustomer = async (req, res) => {
  try {
    const rx = new RegExp(req.params.customerName, "i");
    const orders = await Order.find({ customerName: rx }).sort({
      createdAt: -1,
    });
    res.json({
      success: true,
      message: "Orders by customer",
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error("getByCustomer:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while searching orders" });
  }
};

export default {
  getAllOrders,
  addOrder,
  getById,
  updateOrder,
  deleteOrder,
  updateStatus,
  getByStatus,
  getByCustomer,
};
