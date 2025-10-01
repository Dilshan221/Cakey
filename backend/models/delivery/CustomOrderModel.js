import mongoose from "mongoose";

const CustomOrderSchema = new mongoose.Schema(
  {
    // Readable order id (auto-generated)
    orderId: { type: String, unique: true, index: true },

    // Dates
    orderDate: { type: Date, default: Date.now },
    releaseDate: { type: Date, required: true },

    // Logistics
    deliveryMethod: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
    },
    time: { type: String, required: true }, // HH:mm or a slot string

    // Customer
    customerName: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true },
    address: {
      type: String,
      required: function () {
        return this.deliveryMethod === "delivery";
      },
    },
    email: { type: String, required: true, trim: true, lowercase: true },

    // Cake details
    size: {
      type: String,
      enum: ["small", "medium", "large", "xlarge"],
      required: true,
    },
    flavor: { type: String, required: true },
    faculty: { type: String },
    filling: { type: String, default: "" },
    addons: { type: String, default: "" },
    exclusions: { type: String, default: "" },
    theme: { type: String, default: "" },
    colors: { type: String, default: "" },
    inscription: { type: String, default: "" },
    designImage: { type: String, default: "" }, // store URL/filename if you upload

    // Workflow (match your UI: pending/accepted/rejected)
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },

    // Optional numbers
    estimatedPrice: { type: Number, default: 0 },
    price: { type: Number },
  },
  { timestamps: true }
);

// Generate a readable orderId if missing, e.g. CO-2510-AB12C
CustomOrderSchema.pre("save", function (next) {
  if (!this.orderId) {
    const now = new Date();
    const y = now.toISOString().slice(2, 4); // 2-digit year
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const rand = Math.random().toString(36).slice(-5).toUpperCase();
    this.orderId = `CO-${y}${m}-${rand}`;
  }
  next();
});

export default mongoose.model("CustomOrder", CustomOrderSchema);
