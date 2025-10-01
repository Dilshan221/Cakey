import CustomOrder from "../../models/delivery/CustomOrderModel.js";

/** Fallback human-friendly id if model didn't set one (should rarely run) */
const genOrderId = () => {
  const y = new Date().toISOString().slice(2, 4);
  const m = String(new Date().getMonth() + 1).padStart(2, "0");
  const rand = Math.random().toString(36).slice(-5).toUpperCase();
  return `CO-${y}${m}-${rand}`;
};

/** Create a new custom order */
export const createCustomOrder = async (req, res) => {
  try {
    const payload = { ...req.body };

    // Normalize/derive fields
    if (payload.releaseDate && typeof payload.releaseDate === "string") {
      payload.releaseDate = new Date(payload.releaseDate);
    }
    if (!payload.orderDate) payload.orderDate = new Date();
    if (!payload.status) payload.status = "pending";

    const order = new CustomOrder(payload);
    let saved = await order.save();

    // Ensure we respond with a persistent orderId
    if (!saved.orderId) {
      saved.orderId = genOrderId();
      saved = await saved.save();
    }

    res.status(201).json({
      success: true,
      message: "Custom cake order created successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Error creating custom order:", error);
    res.status(500).json({
      success: false,
      message: `Error creating custom order: ${error.message}`,
    });
  }
};

/**
 * List custom orders
 * Supports:
 *  - ?status=pending|accepted|rejected
 *  - ?date=YYYY-MM-DD  (matches releaseDate by day)
 *  - ?search=string    (customerName/orderId/email contains)
 */
export const getAllCustomOrders = async (req, res) => {
  try {
    const { status, date, search } = req.query;
    const filter = {};

    if (status) filter.status = status;

    if (date) {
      // match by calendar day on releaseDate
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      filter.releaseDate = { $gte: d, $lt: next };
    }

    if (search) {
      const rx = new RegExp(search, "i");
      filter.$or = [{ customerName: rx }, { orderId: rx }, { email: rx }];
    }

    const orders = await CustomOrder.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error("Error fetching custom orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching custom orders",
      error: error.message,
    });
  }
};

/** Get a single custom order by id */
export const getCustomOrderById = async (req, res) => {
  try {
    const order = await CustomOrder.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Custom order not found" });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching custom order:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching custom order",
      error: error.message,
    });
  }
};

/** Update order status */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["pending", "accepted", "rejected"];

    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const order = await CustomOrder.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.json({ success: true, message: "Status updated", data: order });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Aggregate dashboard stats */
export const getOrderStats = async (_req, res) => {
  try {
    const stats = await CustomOrder.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $ifNull: ["$estimatedPrice", { $ifNull: ["$price", 0] }],
            },
          },
        },
      },
      { $project: { _id: 0, status: "$_id", count: 1, totalRevenue: 1 } },
      { $sort: { status: 1 } },
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order statistics",
      error: error.message,
    });
  }
};

/** Cancel (delete) a custom order */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await CustomOrder.findByIdAndDelete(id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (err) {
    console.error("Error canceling order:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Optional default export
export default {
  createCustomOrder,
  getAllCustomOrders,
  getCustomOrderById,
  updateOrderStatus,
  getOrderStats,
  cancelOrder,
};
