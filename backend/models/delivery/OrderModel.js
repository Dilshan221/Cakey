import mongoose from "mongoose";

// Create
const orderSchema = new mongoose.Schema(
  {
    //  CUSTOMER INFORMATION
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },

    //  CAKE DETAILS
    cakeName: {
      type: String,
      required: true,
    },
    cakeSize: {
      type: String,
      required: true,
      enum: ["small", "medium", "large"], // Only these values allowed
    },
    quantity: {
      type: Number,
      required: true,
      min: 1, // Must be at least 1
    },
    frostingType: {
      type: String,
      required: true,
      enum: ["Butter Cream", "Cream Cheese", "Chocolate Ganache"],
    },
    specialInstructions: {
      type: String,
      default: "", // Empty string if nothing provided
    },

    //  DELIVERY INFO
    deliveryDate: {
      type: Date,
      required: true,
    },
    deliveryTime: {
      type: String,
      required: true,
      enum: ["morning", "afternoon", "evening"],
    },

    //  PAYMENT INFO
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Credit Card", "Afterpay", "Cash on Delivery"],
    },

    //  PRICING
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      required: true,
      default: 5.0, // Default delivery fee
    },
    total: {
      type: Number,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },

    //  ORDER STATUS
    status: {
      type: String,
      default: "Preparing", // Default status when order is created
      enum: ["Preparing", "Out for Delivery", "Delivered", "Cancelled"],
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
