// routes/salaryRoute.js
import { Router } from "express";
import {
  listSalaries,
  getSalaryById,
  createSalary,
  updateSalary,
  deleteSalary,
} from "../controllers/salaryController.js";

const router = Router();

/**
 * GET /api/salaries
 * Query params:
 *  - employeeId (optional)
 *  - period (optional, "YYYY-MM")
 *  - status (optional)
 *  - limit, page (optional, pagination)
 */
router.get("/", listSalaries);

/** GET /api/salaries/:id */
router.get("/:id", getSalaryById);

/** POST /api/salaries */
router.post("/", createSalary);

/** PUT /api/salaries/:id */
router.put("/:id", updateSalary);

/** DELETE /api/salaries/:id */
router.delete("/:id", deleteSalary);

export default router;
