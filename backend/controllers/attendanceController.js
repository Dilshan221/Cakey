import mongoose from "mongoose";
import Attendance from "../models/attendanceModel.js";
import Employee from "../models/employeeModel.js";

// Normalize any incoming date to local midnight
const normalizeDay = (d) => {
  if (!d) return new Date(new Date().toDateString());
  const date = new Date(d);
  return Number.isNaN(date.getTime())
    ? new Date(new Date().toDateString())
    : new Date(date.toDateString());
};

// Create / Mark attendance
export const markAttendance = async (req, res) => {
  try {
    const { userId, date, checkIn, checkOut, status, note } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    // ✅ verify EMPLOYEE exists (was User before)
    const emp = await Employee.findById(userId).lean();
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    const day = normalizeDay(date);

    // Block duplicates (also covered by unique index)
    const exists = await Attendance.findOne({ userId, date: day }).lean();
    if (exists) {
      return res
        .status(409)
        .json({ message: "Attendance already marked for this date" });
    }

    const saved = await Attendance.create({
      userId,
      date: day,
      checkIn: checkIn ?? null,
      checkOut: checkOut ?? null,
      status: status || "present",
      note: note || "",
    });

    return res.status(201).json(saved);
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ message: "Attendance already marked for this date" });
    }
    console.error("[ATTENDANCE MARK]", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Get ALL attendance
export const getAttendance = async (_req, res) => {
  try {
    const rows = await Attendance.find({})
      .sort({ date: -1, createdAt: -1 })
      .populate("userId", "name email department position")
      .lean();

    return res.status(200).json(rows);
  } catch (error) {
    console.error("[ATTENDANCE GETALL]", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Get attendance for a specific user (employee)
export const getUserAttendance = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const rows = await Attendance.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .populate("userId", "name email department position")
      .lean();

    return res.status(200).json(rows);
  } catch (error) {
    console.error("[ATTENDANCE GET USER]", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Update attendance
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid attendance id" });
    }

    const patch = { ...req.body };
    if (patch.date) {
      patch.date = normalizeDay(patch.date);
    }

    const updated = await Attendance.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    }).populate("userId", "name email department position");

    if (!updated) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    return res.status(200).json(updated);
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ message: "Attendance already exists for that date" });
    }
    console.error("[ATTENDANCE UPDATE]", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
