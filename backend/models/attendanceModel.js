import mongoose from "mongoose";

// normalize to local midnight so "one row per day" works reliably
const todayAtMidnight = () => new Date(new Date().toDateString());

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // <-- matches your userModel.js (model name "User")
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: todayAtMidnight, // always stored as day-only
    },
    checkIn: { type: String, default: "" },
    checkOut: { type: String, default: "" },
    status: {
      type: String,
      enum: ["present", "late", "absent"],
      default: "absent",
    },
    note: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// one record per user per calendar day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);

export default Attendance;
