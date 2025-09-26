// models/SalaryRecord.js
import mongoose from "mongoose";
const SalaryRecordSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    period: { type: String, required: true }, // "YYYY-MM"
    baseSalary: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    currency: { type: String, default: "LKR" },
    method: { type: String, enum: ["cash", "bank", "card"], required: true },
    note: { type: String, default: "" },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    paymentReference: { type: String, default: "" },
    status: { type: String, default: "paid" },
  },
  { timestamps: true, collection: "salary_records" }
);
SalaryRecordSchema.index({ employeeId: 1, period: 1 }, { unique: true });
export default mongoose.models.SalaryRecord ||
  mongoose.model("SalaryRecord", SalaryRecordSchema);
