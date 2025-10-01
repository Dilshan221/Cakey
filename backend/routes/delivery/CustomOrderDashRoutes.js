const express = require('express');
const router = express.Router();
const {
    getAllDashboardEntries,
    updateDashboardEntry,
    getDashboardStats
} = require('../../controllers/delivery/CustomOrderDashController');

// @route   GET /api/custom-orders-dash
// @desc    Get all dashboard entries with order details
// @query   status - Filter entries by status (optional)
router.get('/', getAllDashboardEntries);

// @route   PATCH /api/custom-orders-dash/:id
// @desc    Update dashboard entry
// @body    { 
//              status?: 'pending'|'in_progress'|'completed'|'cancelled',
//              assignedTo?: string,
//              priority?: 'low'|'medium'|'high',
//              notes?: { content: string, addedBy: string },
//              paymentStatus?: 'pending'|'partial'|'paid',
//              amountPaid?: number
//          }
router.patch('/:id', updateDashboardEntry);

// @route   GET /api/custom-orders-dash/stats
// @desc    Get dashboard statistics
router.get('/stats', getDashboardStats);

module.exports = router;
