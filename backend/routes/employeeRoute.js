// RESTful employee routes + OTP endpoints
import express from "express";
import employeeController from "../controllers/employeeController.js";

const router = express.Router();

// quick ping to verify router
router.get("/__ping", (_req, res) =>
  res.json({ ok: true, scope: "employees" })
);

// CRUD
router.post("/", employeeController.create);
router.get("/", employeeController.list);
router.put("/:id", employeeController.update);
router.delete("/:id", employeeController.remove);

// OTP
router.post("/:id/otp/send", employeeController.sendOtp);
router.post("/:id/otp/verify", employeeController.verifyOtp);

export default router;
