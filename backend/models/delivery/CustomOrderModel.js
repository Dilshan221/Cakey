import mongoose from "mongoose";

const customOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    deliveryMethod: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
    },
    time: { type: String, required: true },

    customerName: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true },
    address: {
      type: String,
      required: function ()
      {
        return this.deliveryMethod === "delivery";
      },
    },
    email: { type: String, required: true, trim: true, lowercase: true },

    size: {
      type: String,
      enum: ["small", "medium", "large", "xlarge"],
      required: true,
    },
    flavor: { type: String, required: true },
    filling: { type: String, default: "" },
    addons: { type: String, default: "" },
    exclusions: { type: String, default: "" },

    theme: { type: String, default: "" },
    colors: { type: String, default: "" },
    inscription: { type: String, default: "" },
    designImage: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Auto-increment orderId like O01, O02, ...
customOrderSchema.pre("save", async function (next)
{
  if (!this.orderId)
  {
    const lastOrder = await this.constructor
      .findOne({})
      .sort({ createdAt: -1 })
      .exec();

    if (!lastOrder)
    {
      this.orderId = "O01";
    } else
    {
      const lastId = lastOrder.orderId; // e.g., "O05"
      const num = parseInt(lastId.slice(1)) + 1; // 6
      this.orderId = "O" + num.toString().padStart(2, "0"); // O06
    }
  }
  next();
});

const CustomOrder = mongoose.model("CustomOrder", customOrderSchema);
export default CustomOrder;
