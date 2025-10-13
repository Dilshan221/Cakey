import express from "express";
import Admin from "../models/Adminmodel.js";  
import {
    getAllAdmins,
    addAdmin,
    getById,
    updateAdmin,
    deleteAdmin,
    getAdminsByRole
} from "../controllers/Admincontroller.js";

const router = express.Router();

// Admin routes
router.get("/", getAllAdmins);                 // GET all admins
router.post("/", addAdmin);                    // POST create new admin
router.get("/:id", getById);                   // GET admin by ID
router.put("/:id", updateAdmin);               // PUT update admin
router.delete("/:id", deleteAdmin);            // DELETE admin
router.get("/role/:role", getAdminsByRole);    // GET admins by role

export default router;
