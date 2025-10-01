const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['cakes', 'cupcakes', 'pastries', 'cookies', 'breads'],
    default: 'cakes'
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative']
  },
  sizes: [{
    size: {
      type: String,
      enum: ['small', 'medium', 'large'],
      required: true
    },
    priceMultiplier: {
      type: Number,
      required: true,
      min: [0, 'Price multiplier cannot be negative']
    },
    serves: {
      type: String,
      required: true
    }
  }],
  frostingOptions: [{
    type: {
      type: String,
      enum: ['butterCream', 'creamCheese', 'chocolateFrosting', 'vanilla', 'strawberry'],
      required: true
    },
    label: {
      type: String,
      required: true
    },
    description: String,
    additionalCost: {
      type: Number,
      default: 0,
      min: [0, 'Additional cost cannot be negative']
    }
  }],
  ingredients: [{
    name: {
      type: String,
      required: true
    },
    allergen: {
      type: Boolean,
      default: false
    }
  }],
  allergens: [{
    type: String,
    enum: ['gluten', 'dairy', 'eggs', 'nuts', 'soy']
  }],
  nutritionalInfo: {
    calories: Number,
    fat: Number,
    carbs: Number,
    protein: Number,
    sugar: Number
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  preparationTime: {
    type: Number, // in hours
    required: true,
    min: [1, 'Preparation time must be at least 1 hour']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isCustomizable: {
    type: Boolean,
    default: true
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [String],
  seasonalAvailability: {
    available: {
      type: Boolean,
      default: true
    },
    season: {
      type: String,
      enum: ['spring', 'summer', 'fall', 'winter', 'all'],
      default: 'all'
    }
  }
}, {
  timestamps: true
});

// Generate unique product ID before saving
productSchema.pre('save', async function(next) {
  if (!this.productId) {
    const count = await mongoose.model('Product').countDocuments();
    this.productId = `PROD${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Index for better query performance
productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ productId: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
