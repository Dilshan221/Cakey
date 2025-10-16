import express from "express";
import employeeController from "../controllers/employeeController.js";

const router = express.Router();

router.get("/__ping", (_req, res) =>
  res.json({ ok: true, scope: "employees" })
);

// CRUD
router.post("/", employeeController.create);
router.get("/", employeeController.list);

// ⬇️ ADD THIS
router.get("/:id", employeeController.get);

// keep existing
router.put("/:id", employeeController.update);
router.delete("/:id", employeeController.remove);

// OTP
router.post("/:id/otp/send", employeeController.sendOtp);
router.post("/:id/otp/verify", employeeController.verifyOtp);

export default router;
