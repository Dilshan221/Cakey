import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    method: { type: String, enum: ["cash", "bank", "card"], required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "LKR" },
    note: { type: String, default: "" },

    // lightweight metadata for display/receipts
    meta: {
      bankName: String,
      accountLast4: String,
      brand: String,
      last4: String,
      expMonth: Number,
      expYear: Number,
    },

    // simple human-friendly reference (e.g., PMT-2024-000001)
    reference: { type: String, unique: true },
  },
  { timestamps: true, collection: "payments" }
);

// Auto-generate a simple incremental-ish reference
paymentSchema.pre("save", async function (next) {
  if (this.reference) return next();
  const y = new Date().getFullYear();
  // count docs for the year to create a readable counter (race-safe enough for demo)
  const count = await mongoose.model("Payment").countDocuments({
    createdAt: {
      $gte: new Date(`${y}-01-01`),
      $lt: new Date(`${y + 1}-01-01`),
    },
  });
  this.reference = `PMT-${y}-${String(count + 1).padStart(6, "0")}`;
  next();
});

export default mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);
