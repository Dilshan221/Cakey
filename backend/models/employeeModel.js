import mongoose from "mongoose";
const { Schema } = mongoose;

const payoutSchema = new Schema(
  {
    methodPreferred: {
      type: String,
      enum: ["", "bank", "card", "finance_manager"],
      default: "",
    },
    bank: {
      accountName: { type: String, default: "" },
      bankName: { type: String, default: "" },
      branch: { type: String, default: "" },
      accountNumberLast4: { type: String, default: "" },
      swift: { type: String, default: "" },
    },
    card: {
      brand: { type: String, default: "" },
      last4: { type: String, default: "" },
      expMonth: { type: Number, default: null },
      expYear: { type: Number, default: null },
      token: { type: String, default: "" },
      billingName: { type: String, default: "" },
    },
    consentSaveCard: { type: Boolean, default: false },
  },
  { _id: false }
);

const otpSchema = new Schema(
  {
    code: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 },
  },
  { _id: false }
);

const employeeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: "" },
    phoneVerified: { type: Boolean, default: false },

    address: { type: String, trim: true, default: "" },
    department: { type: String, trim: true, default: "" },
    position: { type: String, trim: true, default: "" },
    salary: { type: Number, default: 0 },

    payout: { type: payoutSchema, default: () => ({}) },

    // OTP is hidden by default; access with .select("+_otp")
    _otp: { type: otpSchema, select: false },
  },
  { timestamps: true }
);

employeeSchema.index({ createdAt: -1 });

export default mongoose.models.Employee ||
  mongoose.model("Employee", employeeSchema);
