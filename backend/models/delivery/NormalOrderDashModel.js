import mongoose from "mongoose";
import Order from "./OrderModel.js"; // Imported once at the top

// Dashboard-specific model for NormalOrderDash functionality
class NormalOrderDashModel
{
  // Get dashboard statistics
  static async getDashboardStats()
  {
    try
    {
      const totalOrders = await Order.countDocuments();
      const preparing = await Order.countDocuments({ status: "Preparing" });
      const outForDelivery = await Order.countDocuments({
        status: "Out for Delivery",
      });
      const delivered = await Order.countDocuments({ status: "Delivered" });
      const cancelled = await Order.countDocuments({ status: "Cancelled" });

      return {
        totalOrders,
        preparing,
        outForDelivery,
        delivered,
        cancelled,
      };
    } catch (error)
    {
      throw new Error("Error fetching dashboard statistics: " + error.message);
    }
  }

  // Get recent orders for dashboard display
  static async getRecentOrders(limit = 10)
  {
    try
    {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("_id customerName cakeName total status createdAt")
        .lean();

      return orders.map((order) => ({
        id: `#${order._id.toString().slice(-4).toUpperCase()}`,
        customer: order.customerName,
        item: order.cakeName,
        price: order.total,
        status: order.status,
        createdAt: order.createdAt,
      }));
    } catch (error)
    {
      throw new Error("Error fetching recent orders: " + error.message);
    }
  }

  // Get orders with simplified data for dashboard table
  static async getOrdersForDashboard()
  {
    try
    {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .select("_id customerName cakeName total status createdAt")
        .lean();

      return orders.map((order) => ({
        id: `#${order._id.toString().slice(-4).toUpperCase()}`,
        customer: order.customerName,
        item: order.cakeName,
        price: order.total,
        status: order.status,
      }));
    } catch (error)
    {
      throw new Error("Error fetching orders for dashboard: " + error.message);
    }
  }

  // Get orders by status
  static async getOrdersByStatus(status)
  {
    try
    {
      const orders = await Order.find({ status })
        .sort({ createdAt: -1 })
        .select("_id customerName cakeName total status createdAt")
        .lean();

      return orders.map((order) => ({
        id: `#${order._id.toString().slice(-4).toUpperCase()}`,
        customer: order.customerName,
        item: order.cakeName,
        price: order.total,
        status: order.status,
      }));
    } catch (error)
    {
      throw new Error("Error fetching orders by status: " + error.message);
    }
  }

  // Update order status
  static async updateOrderStatus(orderId, newStatus)
  {
    try
    {
      const order = await Order.findOne({
        _id: { $regex: orderId.replace("#", "").toLowerCase() + "$" },
      });

      if (!order) throw new Error("Order not found");

      const validStatuses = [
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ];
      if (!validStatuses.includes(newStatus)) throw new Error("Invalid status");

      order.status = newStatus;
      await order.save();

      return {
        id: `#${order._id.toString().slice(-4).toUpperCase()}`,
        customer: order.customerName,
        item: order.cakeName,
        price: order.total,
        status: order.status,
      };
    } catch (error)
    {
      throw new Error("Error updating order status: " + error.message);
    }
  }

  // Cancel order
  static async cancelOrder(orderId)
  {
    try
    {
      const order = await Order.findOne({
        _id: { $regex: orderId.replace("#", "").toLowerCase() + "$" },
      });

      if (!order) throw new Error("Order not found");

      order.status = "Cancelled";
      await order.save();

      return {
        id: `#${order._id.toString().slice(-4).toUpperCase()}`,
        customer: order.customerName,
        item: order.cakeName,
        price: order.total,
        status: order.status,
      };
    } catch (error)
    {
      throw new Error("Error cancelling order: " + error.message);
    }
  }

  // Get order analytics
  static async getOrderAnalytics()
  {
    try
    {
      const totalRevenue = await Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]);

      const averageOrderValue = await Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, average: { $avg: "$total" } } },
      ]);

      const ordersByStatus = await Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const ordersByCakeSize = await Order.aggregate([
        { $group: { _id: "$cakeSize", count: { $sum: 1 } } },
      ]);

      return {
        totalRevenue: totalRevenue[0]?.total || 0,
        averageOrderValue: averageOrderValue[0]?.average || 0,
        ordersByStatus,
        ordersByCakeSize,
      };
    } catch (error)
    {
      throw new Error("Error fetching order analytics: " + error.message);
    }
  }
}

export default NormalOrderDashModel;
