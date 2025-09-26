// controllers/paymentController.js
import Payment from "../models/paymentModel.js";
import Employee from "../models/employeeModel.js";
import { sendMail } from "../utils/mailer.js";
import { paymentReceiptEmail } from "../emails/paymentReceiptEmail.js";

export const createPayment = async (req, res) => {
  try {
    const {
      employeeId,
      method,
      amount,
      currency = "LKR",
      note = "",
      meta = {},
    } = req.body;

    if (!employeeId || !method || !(amount >= 0)) {
      return res
        .status(400)
        .json({ message: "employeeId, method, amount are required" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    // Generate a readable reference (unique-enough for receipts)
    const reference = `PAY-${Date.now().toString(36).toUpperCase()}`;

    const payment = await Payment.create({
      employeeId,
      method,
      amount,
      currency,
      note,
      meta,
      reference,
    });

    // Try to send receipt (don't fail the whole request if email fails)
    let email = { sent: false, previewUrl: null };
    try {
      const { subject, html, text } = paymentReceiptEmail({
        appName: process.env.APP_NAME || "Cake & Bake",
        employee: { name: employee.name, email: employee.email },
        amount,
        method,
        reference,
        note,
      });
      const info = await sendMail({
        to: employee.email,
        subject,
        html,
        text,
      });
      email = {
        sent: true,
        messageId: info.messageId,
        previewUrl: info.previewUrl,
      };
    } catch (e) {
      email = { sent: false, error: e.message || String(e) };
    }

    return res.status(201).json({
      _id: payment._id,
      reference: payment.reference,
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
      },
      method: payment.method,
      amount: payment.amount,
      currency: payment.currency,
      note: payment.note,
      meta: payment.meta,
      email,
      createdAt: payment.createdAt,
    });
  } catch (err) {
    console.error("createPayment error:", err);
    return res
      .status(500)
      .json({
        message: "Failed to create payment",
        error: String(err?.message || err),
      });
  }
};

export const listPayments = async (req, res) => {
  try {
    const { employeeId, page = 1, limit = 20 } = req.query;
    const q = {};
    if (employeeId) q.employeeId = employeeId;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Payment.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Payment.countDocuments(q),
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error("listPayments error:", err);
    res.status(500).json({ message: "Failed to list payments" });
  }
};

export const getPayment = async (req, res) => {
  try {
    const p = await Payment.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Payment not found" });
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: "Failed to get payment" });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const p = await Payment.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: "Payment not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: "Failed to delete payment" });
  }
};
