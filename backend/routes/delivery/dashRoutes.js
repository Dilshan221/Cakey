const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderStats,
  updateOrderStatus,
  cancelOrder,
  getOrderInvoice,
  deleteOrder,
  getRecentOrders,
  searchOrders
} = require('../controllers/DashController');

// Dashboard Routes for Dash.jsx

// @route   GET /api/dashboard/orders
// @desc    Get all orders with pagination
router.get('/orders', getAllOrders);

// @route   GET /api/dashboard/stats
// @desc    Get order statistics
router.get('/stats', getOrderStats);

// @route   GET /api/dashboard/recent-orders
// @desc    Get recent orders
router.get('/recent-orders', getRecentOrders);

// @route   GET /api/dashboard/search
// @desc    Search orders
router.get('/search', searchOrders);

// @route   DELETE /api/dashboard/orders/:id/cancel
// @desc    Cancel order (Delete from database)
router.delete('/orders/:id/cancel', cancelOrder);

// @route   GET /api/dashboard/orders/:id/invoice
// @desc    Get order invoice
router.get('/orders/:id/invoice', getOrderInvoice);

// @route   PATCH /api/dashboard/orders/:id/status
// @desc    Update order status
router.patch('/orders/:id/status', updateOrderStatus);

// @route   DELETE /api/dashboard/orders/:id
// @desc    Delete order
router.delete('/orders/:id', deleteOrder);

module.exports = router;
