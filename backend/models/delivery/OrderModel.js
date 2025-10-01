// backend/models/delivery/OrderModel.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    deliveryAddress: { type: String, required: true, trim: true },

    cakeName: { type: String, required: true, trim: true },
    cakeSize: {
      type: String,
      required: true,
      enum: ["small", "medium", "large"],
    },
    quantity: { type: Number, required: true, min: 1 },
    frostingType: {
      type: String,
      required: true,
      enum: ["Butter Cream", "Cream Cheese", "Chocolate Ganache"],
    },
    specialInstructions: { type: String, default: "" },

    deliveryDate: { type: Date, required: true },
    deliveryTime: {
      type: String,
      required: true,
      enum: ["morning", "afternoon", "evening"],
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: ["Credit Card", "Afterpay", "Cash on Delivery"],
    },

    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 5 },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ["Preparing", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Preparing",
    },
  },
  { timestamps: true }
);

// ✅ Use existing compiled model if present (prevents OverwriteModelError)
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
