import mongoose from "mongoose";

const ProductSnapshotSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // optional
    name: { type: String, required: true, trim: true, maxlength: 200 },
    imageUrl: { type: String, trim: true, maxlength: 1000 }, // <- image stored here
    basePrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, sparse: true },

    // snapshot of the product at time of purchase
    product: { type: ProductSnapshotSchema, required: true },

    customer: {
      name: { type: String, required: true, trim: true, maxlength: 100 },
      phone: {
        type: String,
        required: true,
        trim: true,
        validate: {
          validator(v) {
            const clean = v.replace(/[\s\-\(\)\+]/g, "");
            return /^\d{10,15}$/.test(clean);
          },
          message: "Please provide a valid phone number (10-15 digits)",
        },
      },
      address: { type: String, required: true, trim: true, maxlength: 500 },
    },

    item: {
      name: { type: String, required: true, default: "Chocolate Fudge Cake" },
      size: {
        type: String,
        required: true,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
      quantity: { type: Number, required: true, min: 1, max: 50, default: 1 },
      frosting: {
        type: String,
        required: true,
        enum: ["butterCream", "creamCheese", "chocolateFrosting"],
        default: "butterCream",
      },
      messageOnCake: { type: String, trim: true, maxlength: 120 },
    },

    delivery: {
      date: {
        type: Date,
        required: true,
        validate: {
          validator(v) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return v > today;
          },
          message: "Delivery date must be in the future",
        },
      },
      time: {
        type: String,
        required: true,
        enum: ["morning", "afternoon", "evening"],
        default: "afternoon",
      },
      specialInstructions: { type: String, trim: true, maxlength: 1000 },
    },

    payment: {
      method: {
        type: String,
        required: true,
        enum: ["creditCard", "afterpay", "cashOnDelivery"],
        default: "creditCard",
      },
      subtotal: { type: Number, required: true, min: 0 },
      tax: { type: Number, required: true, min: 0 },
      deliveryFee: { type: Number, required: true, min: 0, default: 500 },
      total: { type: Number, required: true, min: 0 },
    },

    // convenience duplicate of total
    price: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      required: true,
      enum: ["Preparing", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Preparing",
    },
    orderDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    // uncomment while debugging to catch unknown fields
    // strict: "throw",
  }
);

orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    try {
      const count = await mongoose.model("Order").countDocuments();
      this.orderId = `ORD${String(count + 1).padStart(4, "0")}`;
      console.log(`📋 Generated Order ID: ${this.orderId}`);
    } catch (err) {
      console.error("❌ Error generating order ID:", err);
      this.orderId = `ORD${Date.now()}`;
    }
  }
  next();
});

orderSchema.index({ status: 1, orderDate: -1 });
orderSchema.index({ "customer.phone": 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
