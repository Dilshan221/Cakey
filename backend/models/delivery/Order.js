
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    sparse: true // Allows null values during creation, will be set by pre-save hook
  },
  customer: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Customer name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function(v) {
          // More flexible phone validation - allows various formats
          const cleanPhone = v.replace(/[\s\-\(\)\+]/g, '');
          return /^\d{10,15}$/.test(cleanPhone);
        },
        message: 'Please provide a valid phone number (10-15 digits)'
      }
    },
    address: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters']
    }
  },
  item: {
    name: {
      type: String,
      required: true,
      default: 'Chocolate Fudge Cake'
    },
    size: {
      type: String,
      required: true,
      enum: {
        values: ['small', 'medium', 'large'],
        message: 'Size must be small, medium, or large'
      },
      default: 'medium'
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [50, 'Quantity cannot exceed 50'],
      default: 1
    },
    frosting: {
      type: String,
      required: true,
      enum: {
        values: ['butterCream', 'creamCheese', 'chocolateFrosting'],
        message: 'Invalid frosting type'
      },
      default: 'butterCream'
    }
  },
  delivery: {
    date: {
      type: Date,
      required: [true, 'Delivery date is required'],
      validate: {
        validator: function(v) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return v > today;
        },
        message: 'Delivery date must be in the future'
      }
    },
    time: {
      type: String,
      required: true,
      enum: {
        values: ['morning', 'afternoon', 'evening'],
        message: 'Delivery time must be morning, afternoon, or evening'
      },
      default: 'afternoon'
    },
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [1000, 'Special instructions cannot exceed 1000 characters']
    }
  },
  payment: {
    method: {
      type: String,
      required: true,
      enum: {
        values: ['creditCard', 'afterpay', 'cashOnDelivery'],
        message: 'Invalid payment method'
      },
      default: 'creditCard'
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    tax: {
      type: Number,
      required: true,
      min: [0, 'Tax cannot be negative']
    },
    deliveryFee: {
      type: Number,
      required: true,
      default: 5.00,
      min: [0, 'Delivery fee cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      message: 'Invalid order status'
    },
    default: 'Preparing'
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate unique order ID before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    try {
      // Get the count of existing orders
      const count = await mongoose.model('Order').countDocuments();
      
      // Generate order ID with format ORD0001, ORD0002, etc.
      this.orderId = `ORD${String(count + 1).padStart(4, '0')}`;
      
      console.log(`📋 Generated Order ID: ${this.orderId}`);
    } catch (error) {
      console.error('❌ Error generating order ID:', error);
      // Set a fallback order ID if generation fails
      this.orderId = `ORD${Date.now()}`;
      console.log(`📋 Fallback Order ID: ${this.orderId}`);
    }
  }
  next();
});

// Index for better query performance
orderSchema.index({ status: 1, orderDate: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ 'customer.phone': 1 });

module.exports = mongoose.model('Order', orderSchema);
