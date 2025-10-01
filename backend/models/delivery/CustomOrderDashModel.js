const mongoose = require('mongoose');

const customOrderDashSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomOrder',
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    assignedTo: {
        type: String,
        default: ''
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    notes: [{
        content: String,
        addedBy: String,
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    completionDate: {
        type: Date
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid'],
        default: 'pending'
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Index for faster querying
customOrderDashSchema.index({ orderId: 1 });
customOrderDashSchema.index({ status: 1 });

const CustomOrderDash = mongoose.model('CustomOrderDash', customOrderDashSchema);

module.exports = CustomOrderDash;
