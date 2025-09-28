import { Router } from "express";
import {
  getAllComplaints,
  addComplaint,
  getById,
  updateComplaint,
  deleteComplaint,
  updateStatus,
  getByStatus,
} from "../controllers/ComplaintController.js";

const router = Router();

// Route definitions
router.get("/", getAllComplaints); // GET /complaints
router.post("/", addComplaint); // POST /complaints
router.get("/:id", getById); // GET /complaints/:id
router.put("/:id", updateComplaint); // PUT /complaints/:id
router.delete("/:id", deleteComplaint); // DELETE /complaints/:id
router.patch("/:id/status", updateStatus); // PATCH /complaints/:id/status
router.get("/status/:status", getByStatus); // GET /complaints/status/:status

export default router;
