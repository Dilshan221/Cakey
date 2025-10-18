import mongoose from "mongoose";

const ProductSnapshotSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    imageUrl: { type: String, trim: true },
    basePrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, sparse: true },

    product: { type: ProductSnapshotSchema, required: true },

    // Link order to registered user
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customer: {
      // ✅ OPTIONAL NOW
      name: { type: String, trim: true, maxlength: 100, default: "" },
      phone: {
        type: String,
        required: true,
        trim: true,
        validate: {
          validator(v)
          {
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
        enum: ["small", "medium", "large"],
        default: "medium",
      },
      quantity: { type: Number, min: 1, max: 50, default: 1 },
      frosting: {
        type: String,
        enum: ["butterCream", "creamCheese", "chocolateFrosting"],
        default: "butterCream",
      },
      messageOnCake: { type: String, trim: true, maxlength: 120 },
    },

    delivery: {
      date: { type: Date, required: true },
      time: {
        type: String,
        enum: ["morning", "afternoon", "evening"],
        default: "afternoon",
      },
      specialInstructions: { type: String, trim: true, maxlength: 1000 },
    },

    payment: {
      method: {
        type: String,
        enum: ["creditCard", "afterpay", "cashOnDelivery"],
        required: true,
      },
      subtotal: { type: Number, required: true, min: 0 },
      tax: { type: Number, required: true, min: 0 },
      deliveryFee: { type: Number, required: true, min: 0, default: 500 },
      total: { type: Number, required: true, min: 0 },
    },

    price: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["Preparing", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Preparing",
    },
    orderDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next)
{
  if (!this.orderId)
  {
    try
    {
      const count = await mongoose.model("Order").countDocuments();
      this.orderId = `ORD${String(count + 1).padStart(4, "0")}`;
    } catch
    {
      this.orderId = `ORD${Date.now()}`;
    }
  }
  next();
});

const Order = mongoose.model("OrderModel", orderSchema);
export default Order;
