const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true,
    sparse: true
  },
  // Customer Information
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
          const cleanPhone = v.replace(/[\s\-\(\)\+]/g, '');
          return /^\d{10,15}$/.test(cleanPhone);
        },
        message: 'Please provide a valid phone number (10-15 digits)'
      }
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address'
      }
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters']
    }
  },
  // Order Information
  orderDate: {
    type: Date,
    default: Date.now
  },
  releaseDate: {
    type: Date,
    required: [true, 'Release date is required'],
    validate: {
      validator: function(v) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return v >= today;
      },
      message: 'Release date must be today or in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  deliveryMethod: {
    type: String,
    required: true,
    enum: {
      values: ['pickup', 'delivery'],
      message: 'Delivery method must be pickup or delivery'
    },
    default: 'pickup'
  },
  // Cake Specifications
  cake: {
    size: {
      type: String,
      required: [true, 'Size is required'],
      enum: {
        values: ['small', 'medium', 'large', 'xlarge'],
        message: 'Invalid cake size'
      }
    },
    flavor: {
      type: String,
      required: [true, 'Flavor is required'],
      enum: {
        values: ['chocolate', 'vanilla', 'redVelvet', 'carrot', 'fruit', 'cheese'],
        message: 'Invalid cake flavor'
      }
    },
    filling: {
      type: String,
      enum: {
        values: ['buttercream', 'ganache', 'fruit', 'custard', 'creamCheese', 'none'],
        message: 'Invalid filling type'
      },
      default: 'none'
    },
    faculty: {
      type: String,
      trim: true,
      maxlength: [100, 'Faculty/event cannot exceed 100 characters']
    },
    addons: {
      type: String,
      trim: true,
      maxlength: [500, 'Add-ons cannot exceed 500 characters']
    },
    exclusions: {
      type: String,
      trim: true,
      maxlength: [500, 'Exclusions cannot exceed 500 characters']
    }
  },
  // Design Details
  design: {
    theme: {
      type: String,
      trim: true,
      maxlength: [200, 'Theme cannot exceed 200 characters']
    },
    colors: {
      type: String,
      trim: true,
      maxlength: [200, 'Colors cannot exceed 200 characters']
    },
    inscription: {
      type: String,
      trim: true,
      maxlength: [500, 'Inscription cannot exceed 500 characters']
    },
    image: {
      filename: String,
      contentType: String,
      data: Buffer
    }
  },
  // Order Management
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'accepted', 'rejected'],
      message: 'Status must be pending, accepted, or rejected'
    },
    default: 'pending'
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Generate unique request ID before saving
customOrderSchema.pre('save', async function(next) {
  if (!this.requestId) {
    try {
      // Get the count of existing custom orders
      const count = await mongoose.model('CustomOrder').countDocuments();

      // Generate request ID with format CB-0001, CB-0002, etc.
      this.requestId = `CB-${String(count + 1).padStart(4, '0')}`;

      console.log(`🎂 Generated Custom Order Request ID: ${this.requestId}`);
    } catch (error) {
      console.error('❌ Error generating custom order request ID:', error);
      // Set a fallback request ID if generation fails
      this.requestId = `CB-${Date.now()}`;
      console.log(`🎂 Fallback Request ID: ${this.requestId}`);
    }
  }
  next();
});

// Indexes for better query performance
customOrderSchema.index({ status: 1, createdAt: -1 });
customOrderSchema.index({ requestId: 1 });
customOrderSchema.index({ 'customer.email': 1 });
customOrderSchema.index({ releaseDate: 1 });

// Virtual for formatted status
customOrderSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending Review',
    'accepted': 'Accepted',
    'rejected': 'Rejected'
  };
  return statusMap[this.status] || this.status;
});

// Method to get order summary
customOrderSchema.methods.getSummary = function() {
  return {
    requestId: this.requestId,
    customerName: this.customer.name,
    status: this.status,
    releaseDate: this.releaseDate,
    cakeSize: this.cake.size,
    cakeFlavor: this.cake.flavor,
    price: this.price
  };
};

module.exports = mongoose.model('CustomOrder', customOrderSchema);
