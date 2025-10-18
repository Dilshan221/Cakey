import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    complaintType: {
      type: String,
      required: true,
      enum: [
        "Product Quality",
        "Customer Service",
        "Delivery Issue",
        "Billing Problem",
      ],
    },
    complaint: { type: String, required: true, trim: true },
    photo: { type: String, default: null },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: { type: String, enum: ["Pending", "Solved"], default: "Pending" },
    adminType: { type: String, default: "Finance" },
  },
  { timestamps: true, collection: "complaints" }
);

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
