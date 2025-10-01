const asyncHandler = require("express-async-handler");
const Order = require("../../models/deliverys/Order");

// @desc    Get all orders for dashboard
// @route   GET /api/dashboard/orders
// @access  Public
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalOrders = await Order.countDocuments();

  res.json({
    success: true,
    count: orders.length,
    totalOrders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit),
    orders: orders,
  });
});

// @desc    Get order statistics for dashboard
// @route   GET /api/dashboard/stats
// @access  Public
const getOrderStats = asyncHandler(async (req, res) => {
  // Order counts by status
  const total = await Order.countDocuments();
  const preparing = await Order.countDocuments({ status: "Preparing" });
  const outForDelivery = await Order.countDocuments({
    status: "Out for Delivery",
  });
  const delivered = await Order.countDocuments({ status: "Delivered" });
  const cancelled = await Order.countDocuments({ status: "Cancelled" });

  // Revenue statistics
  const totalRevenue = await Order.aggregate([
    { $match: { status: { $ne: "Cancelled" } } },
    { $group: { _id: null, total: { $sum: "$payment.total" } } },
  ]);

  const todayRevenue = await Order.aggregate([
    {
      $match: {
        status: { $ne: "Cancelled" },
        orderDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    },
    { $group: { _id: null, total: { $sum: "$payment.total" } } },
  ]);

  // Monthly revenue for the last 6 months
  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        status: { $ne: "Cancelled" },
        orderDate: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$orderDate" },
          month: { $month: "$orderDate" },
        },
        revenue: { $sum: "$payment.total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  res.json({
    success: true,
    stats: {
      orders: {
        total,
        preparing,
        outForDelivery,
        delivered,
        cancelled,
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        today: todayRevenue[0]?.total || 0,
        monthly: monthlyRevenue,
      },
    },
  });
});

// @desc    Update order status
// @route   PATCH /api/dashboard/orders/:id/status
// @access  Public
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (
    !status ||
    !["Preparing", "Out for Delivery", "Delivered"].includes(status)
  ) {
    res.status(400);
    throw new Error("Invalid status provided");
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({
    success: true,
    message: `Order ${order.orderId} status updated to ${status}`,
    order,
  });
});

// @desc    Cancel order (Delete from database)
// @route   DELETE /api/dashboard/orders/:id/cancel
// @access  Public
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Store order info before deletion
  const orderInfo = {
    orderId: order.orderId,
    customerName: order.customer.name,
    total: order.payment.total,
  };

  // Delete the order from database
  await Order.findByIdAndDelete(req.params.id);

  console.log(
    `🗑️ Order deleted: ${orderInfo.orderId} - ${orderInfo.customerName}`
  );

  res.json({
    success: true,
    message: `Order ${orderInfo.orderId} has been cancelled and removed from the system`,
    deletedOrder: orderInfo,
  });
});

// @desc    Get order invoice
// @route   GET /api/dashboard/orders/:id/invoice
// @access  Public
const getOrderInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const invoice = {
    orderId: order.orderId,
    customer: {
      name: order.customer.name,
      phone: order.customer.phone,
      address: order.customer.address,
    },
    item: {
      name: order.item.name,
      size: order.item.size,
      quantity: order.item.quantity,
      frosting: order.item.frosting,
    },
    delivery: {
      date: order.delivery.date,
      time: order.delivery.time,
      specialInstructions: order.delivery.specialInstructions,
    },
    payment: {
      subtotal: order.payment.subtotal,
      tax: order.payment.tax,
      deliveryFee: order.payment.deliveryFee,
      total: order.payment.total,
      method: order.payment.method,
    },
    orderDate: order.orderDate,
    status: order.status,
  };

  res.json({
    success: true,
    invoice,
  });
});

// @desc    Delete order
// @route   DELETE /api/dashboard/orders/:id
// @access  Public
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({
    success: true,
    message: `Order ${order.orderId} has been deleted`,
  });
});

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
// @access  Public
const getRecentOrders = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("orderId customer.name item.name payment.total status orderDate");

  res.json({
    success: true,
    count: orders.length,
    orders,
  });
});

// @desc    Search orders
// @route   GET /api/dashboard/search
// @access  Public
const searchOrders = asyncHandler(async (req, res) => {
  const { query, status, startDate, endDate } = req.query;

  let searchCriteria = {};

  // Text search
  if (query) {
    searchCriteria.$or = [
      { orderId: { $regex: query, $options: "i" } },
      { "customer.name": { $regex: query, $options: "i" } },
      { "customer.phone": { $regex: query, $options: "i" } },
    ];
  }

  // Status filter
  if (status && status !== "all") {
    searchCriteria.status = status;
  }

  // Date range filter
  if (startDate || endDate) {
    searchCriteria.orderDate = {};
    if (startDate) {
      searchCriteria.orderDate.$gte = new Date(startDate);
    }
    if (endDate) {
      searchCriteria.orderDate.$lte = new Date(endDate);
    }
  }

  const orders = await Order.find(searchCriteria)
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({
    success: true,
    count: orders.length,
    searchCriteria,
    orders,
  });
});

module.exports = {
  getAllOrders,
  getOrderStats,
  updateOrderStatus,
  cancelOrder,
  getOrderInvoice,
  deleteOrder,
  getRecentOrders,
  searchOrders,
};
