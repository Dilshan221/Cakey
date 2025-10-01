// backend/models/delivery/NormalOrderDashModel.js
import Order from "./OrderModel.js";

class NormalOrderDashModel {
  static async getDashboardStats() {
    const [totalOrders, preparing, outForDelivery, delivered, cancelled] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: "Preparing" }),
        Order.countDocuments({ status: "Out for Delivery" }),
        Order.countDocuments({ status: "Delivered" }),
        Order.countDocuments({ status: "Cancelled" }),
      ]);
    return { totalOrders, preparing, outForDelivery, delivered, cancelled };
  }

  static async getRecentOrders(limit = 10) {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("_id customerName cakeName total status createdAt")
      .lean();

    return orders.map((o) => ({
      id: o._id.toString(),
      customer: o.customerName,
      item: o.cakeName,
      price: o.total,
      status: o.status,
      createdAt: o.createdAt,
    }));
  }

  static async getOrdersForDashboard() {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .select("_id customerName cakeName total status createdAt")
      .lean();

    return orders.map((o) => ({
      id: o._id.toString(),
      customer: o.customerName,
      item: o.cakeName,
      price: o.total,
      status: o.status,
      createdAt: o.createdAt,
    }));
  }

  static async getOrdersByStatus(status) {
    const orders = await Order.find({ status })
      .sort({ createdAt: -1 })
      .select("_id customerName cakeName total status createdAt")
      .lean();

    return orders.map((o) => ({
      id: o._id.toString(),
      customer: o.customerName,
      item: o.cakeName,
      price: o.total,
      status: o.status,
      createdAt: o.createdAt,
    }));
  }

  static async updateOrderStatus(orderId, newStatus) {
    const valid = ["Preparing", "Out for Delivery", "Delivered", "Cancelled"];
    if (!valid.includes(newStatus)) throw new Error("Invalid status");

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { status: newStatus },
      { new: true }
    ).select("_id customerName cakeName total status createdAt");

    if (!updated) throw new Error("Order not found");

    return {
      id: updated._id.toString(),
      customer: updated.customerName,
      item: updated.cakeName,
      price: updated.total,
      status: updated.status,
      createdAt: updated.createdAt,
    };
  }

  static async cancelOrder(orderId) {
    const updated = await Order.findByIdAndUpdate(
      orderId,
      { status: "Cancelled" },
      { new: true }
    ).select("_id customerName cakeName total status createdAt");

    if (!updated) throw new Error("Order not found");

    return {
      id: updated._id.toString(),
      customer: updated.customerName,
      item: updated.cakeName,
      price: updated.total,
      status: updated.status,
      createdAt: updated.createdAt,
    };
  }

  static async getOrderAnalytics() {
    const [totalRevenueAgg, avgAgg, byStatus, bySize] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, average: { $avg: "$total" } } },
      ]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.aggregate([{ $group: { _id: "$cakeSize", count: { $sum: 1 } } }]),
    ]);

    return {
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      averageOrderValue: avgAgg[0]?.average || 0,
      ordersByStatus: byStatus,
      ordersByCakeSize: bySize,
    };
  }
}

export default NormalOrderDashModel;
