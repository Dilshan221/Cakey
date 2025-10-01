const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    unique: true
  },
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
    unique: true,
    validate: {
      validator: function(v) {
        return /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
      },
      message: 'Please provide a valid phone number'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters']
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  preferences: {
    favoriteSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    favoriteFrosting: {
      type: String,
      enum: ['butterCream', 'creamCheese', 'chocolateFrosting'],
      default: 'butterCream'
    },
    preferredDeliveryTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      default: 'afternoon'
    }
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate unique customer ID before saving
customerSchema.pre('save', async function(next) {
  if (!this.customerId) {
    const count = await mongoose.model('Customer').countDocuments();
    this.customerId = `CUST${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Index for better query performance
customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ customerId: 1 });

module.exports = mongoose.model('Customer', customerSchema);
