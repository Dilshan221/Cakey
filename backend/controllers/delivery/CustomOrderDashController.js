const CustomOrderDash = require("../../models/CustomOrderDashModel");
const CustomOrder = require("../../models/CustomOrderModel");

// @desc    Get all dashboard entries with order details
// @route   GET /api/custom-orders-dash
// @access  Public
const getAllDashboardEntries = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        
        if (status) {
            query.status = status;
        }

        const dashEntries = await CustomOrderDash.find(query)
            .populate({
                path: 'orderId',
                select: 'customerName contactNumber email size flavor price status'
            })
            .sort({ updatedAt: -1 });
        
        // Format the response to include both dashboard and order data
        const formattedData = dashEntries.map(entry => ({
            _id: entry._id,
            orderId: entry.orderId._id,
            status: entry.status,
            assignedTo: entry.assignedTo,
            priority: entry.priority,
            notes: entry.notes,
            paymentStatus: entry.paymentStatus,
            amountPaid: entry.amountPaid,
            totalAmount: entry.totalAmount,
            lastUpdated: entry.updatedAt,
            // Order details
            customerName: entry.orderId.customerName,
            contactNumber: entry.orderId.contactNumber,
            email: entry.orderId.email,
            size: entry.orderId.size,
            flavor: entry.orderId.flavor,
            price: entry.orderId.price
        }));

        res.status(200).json({
            success: true,
            count: formattedData.length,
            data: formattedData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
};

// @desc    Update dashboard entry
// @route   PATCH /api/custom-orders-dash/:id
// @access  Public
const updateDashboardEntry = async (req, res) => {
    try {
        const { status, assignedTo, priority, notes, paymentStatus, amountPaid } = req.body;
        
        const updateData = {};
        if (status) updateData.status = status;
        if (assignedTo) updateData.assignedTo = assignedTo;
        if (priority) updateData.priority = priority;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (amountPaid) updateData.amountPaid = amountPaid;
        
        // Add new note if provided
        if (notes && notes.content && notes.addedBy) {
            updateData.$push = {
                notes: {
                    content: notes.content,
                    addedBy: notes.addedBy,
                    addedAt: new Date()
                }
            };
        }

        const updatedEntry = await CustomOrderDash.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({
                success: false,
                message: 'Dashboard entry not found'
            });
        }

        // If status was updated, update the corresponding order status as well
        if (status) {
            await CustomOrder.findByIdAndUpdate(
                updatedEntry.orderId,
                { status },
                { new: true }
            );
        }

        res.status(200).json({
            success: true,
            data: updatedEntry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating dashboard entry',
            error: error.message
        });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/custom-orders-dash/stats
// @access  Public
const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await CustomOrder.countDocuments();
        const pendingOrders = await CustomOrder.countDocuments({ status: 'pending' });
        const inProgressOrders = await CustomOrder.countDocuments({ status: 'in_progress' });
        const completedOrders = await CustomOrder.countDocuments({ status: 'completed' });
        
        // Get total revenue
        const revenueResult = await CustomOrder.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$price' },
                    averageOrderValue: { $avg: '$price' }
                }
            }
        ]);

        const stats = {
            totalOrders,
            pendingOrders,
            inProgressOrders,
            completedOrders,
            totalRevenue: revenueResult[0]?.totalRevenue || 0,
            averageOrderValue: revenueResult[0]?.averageOrderValue || 0
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

module.exports = {
    getAllDashboardEntries,
    updateDashboardEntry,
    getDashboardStats
};
