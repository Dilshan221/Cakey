import NormalOrderDashModel from "../../models/delivery/NormalOrderDashModel.js";

// GET /stats
export const getDashboardStats = async (_req, res) => {
  try {
    const stats = await NormalOrderDashModel.getDashboardStats();
    res.status(200).json({ success: true, stats });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching dashboard statistics" });
  }
};

// GET /recent
export const getRecentOrders = async (_req, res) => {
  try {
    const orders = await NormalOrderDashModel.getRecentOrders(10);
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching recent orders" });
  }
};

// GET /orders
export const getAllOrders = async (_req, res) => {
  try {
    const orders = await NormalOrderDashModel.getOrdersForDashboard();
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// GET /orders/status/:status
export const getOrdersByStatus = async (req, res) => {
  try {
    const orders = await NormalOrderDashModel.getOrdersByStatus(
      req.params.status
    );
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching orders by status" });
  }
};

// PATCH /orders/:id/status
export const updateStatus = async (req, res) => {
  try {
    const updated = await NormalOrderDashModel.updateOrderStatus(
      req.params.id,
      req.body.status
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Status updated successfully",
        order: updated,
      });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        message: err.message || "Error updating status",
      });
  }
};

// PATCH /orders/:id/cancel
export const cancelOrder = async (req, res) => {
  try {
    const cancelled = await NormalOrderDashModel.cancelOrder(req.params.id);
    res
      .status(200)
      .json({
        success: true,
        message: "Order cancelled successfully",
        order: cancelled,
      });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        message: err.message || "Error cancelling order",
      });
  }
};

// GET /orders/:id/invoice
export const viewInvoice = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: `Invoice for order ${req.params.id}`,
      orderId: req.params.id,
      invoiceUrl: `/api/invoices/${req.params.id}`, // placeholder
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error generating invoice" });
  }
};

// GET /analytics
export const getOrderAnalytics = async (_req, res) => {
  try {
    const analytics = await NormalOrderDashModel.getOrderAnalytics();
    res.status(200).json({ success: true, analytics });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching analytics" });
  }
};

export default {
  getDashboardStats,
  getRecentOrders,
  getAllOrders,
  getOrdersByStatus,
  updateStatus,
  cancelOrder,
  viewInvoice,
  getOrderAnalytics,
};
