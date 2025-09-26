import express from "express";
import {
  markAttendance,
  getAttendance,
  getUserAttendance,
  updateAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/mark", markAttendance);
router.get("/getAll", getAttendance);
router.get("/getUserAttendance/:userId", getUserAttendance);
router.put("/update/:id", updateAttendance);

export default router;
