// controllers/salaryController.js
import mongoose from "mongoose";
import SalaryRecord from "../models/SalaryRecord.js";

/** Utility: ensure "YYYY-MM" format */
function normalizePeriod(period) {
  if (!period) return null;
  const m = String(period).trim();
  // Accept "YYYY-MM" or "YYYY-MM-DD" (take first 7)
  const yyyyMm = m.length >= 7 ? m.slice(0, 7) : m;
  if (!/^\d{4}-\d{2}$/.test(yyyyMm)) return null;
  return yyyyMm;
}

/** GET /api/salaries */
export async function listSalaries(req, res, next) {
  try {
    const { employeeId, period, status, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (employeeId && mongoose.isValidObjectId(employeeId)) {
      filter.employeeId = employeeId;
    }
    const normalized = normalizePeriod(period);
    if (normalized) filter.period = normalized;
    if (status) filter.status = status;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

    const [items, total] = await Promise.all([
      SalaryRecord.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      SalaryRecord.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/salaries/:id */
export async function getSalaryById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid salary id" });

    const doc = await SalaryRecord.findById(id).lean();
    if (!doc)
      return res.status(404).json({ message: "Salary record not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

/** POST /api/salaries */
export async function createSalary(req, res, next) {
  try {
    const {
      employeeId,
      period,
      baseSalary = 0,
      paidAmount = 0,
      currency = "LKR",
      method,
      note = "",
      paymentId = null,
      paymentReference = "",
      status = "paid",
    } = req.body || {};

    if (!employeeId || !mongoose.isValidObjectId(employeeId)) {
      return res.status(400).json({ message: "employeeId is required" });
    }
    const normalized = normalizePeriod(period);
    if (!normalized) {
      return res
        .status(400)
        .json({ message: 'period is required in "YYYY-MM" format' });
    }
    if (!["cash", "bank", "card"].includes(method)) {
      return res
        .status(400)
        .json({ message: "method must be cash, bank, or card" });
    }

    const doc = await SalaryRecord.create({
      employeeId,
      period: normalized,
      baseSalary: Number(baseSalary) || 0,
      paidAmount: Number(paidAmount) || 0,
      currency: currency || "LKR",
      method,
      note: note?.trim() || "",
      paymentId:
        paymentId && mongoose.isValidObjectId(paymentId) ? paymentId : null,
      paymentReference: paymentReference?.trim() || "",
      status: status || "paid",
    });

    res.status(201).json(doc);
  } catch (err) {
    // Handle unique (employeeId, period) violation
    if (err?.code === 11000) {
      return res.status(409).json({
        message: "A salary record for this employee and period already exists.",
        keyValue: err.keyValue,
      });
    }
    next(err);
  }
}

/** PUT /api/salaries/:id */
export async function updateSalary(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid salary id" });

    const update = {};
    const {
      period,
      baseSalary,
      paidAmount,
      currency,
      method,
      note,
      paymentId,
      paymentReference,
      status,
    } = req.body || {};

    if (period !== undefined) {
      const normalized = normalizePeriod(period);
      if (!normalized)
        return res
          .status(400)
          .json({ message: 'period must be "YYYY-MM" if provided' });
      update.period = normalized;
    }
    if (baseSalary !== undefined) update.baseSalary = Number(baseSalary) || 0;
    if (paidAmount !== undefined) update.paidAmount = Number(paidAmount) || 0;
    if (currency !== undefined) update.currency = currency || "LKR";
    if (method !== undefined) {
      if (!["cash", "bank", "card"].includes(method)) {
        return res
          .status(400)
          .json({ message: "method must be cash, bank, or card" });
      }
      update.method = method;
    }
    if (note !== undefined) update.note = note?.trim() || "";
    if (paymentId !== undefined) {
      update.paymentId =
        paymentId && mongoose.isValidObjectId(paymentId) ? paymentId : null;
    }
    if (paymentReference !== undefined)
      update.paymentReference = paymentReference?.trim() || "";
    if (status !== undefined) update.status = status;

    const doc = await SalaryRecord.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
      context: "query",
    }).lean();

    if (!doc)
      return res.status(404).json({ message: "Salary record not found" });
    res.json(doc);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        message: "A salary record for this employee and period already exists.",
        keyValue: err.keyValue,
      });
    }
    next(err);
  }
}

/** DELETE /api/salaries/:id */
export async function deleteSalary(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid salary id" });

    const doc = await SalaryRecord.findByIdAndDelete(id).lean();
    if (!doc)
      return res.status(404).json({ message: "Salary record not found" });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
