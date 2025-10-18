import crypto from "crypto";
import Employee from "../models/employeeModel.js";

// OPTIONAL: Twilio for production SMS
import twilio from "twilio";
const isProd =
  String(process.env.NODE_ENV || "").toLowerCase() === "production";
const twilioReady =
  !!process.env.TWILIO_SID &&
  !!process.env.TWILIO_AUTH &&
  !!process.env.TWILIO_FROM;
const twilioClient =
  isProd && twilioReady
    ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
    : null;

const pick = (src = {}, keys = []) =>
  keys.reduce((o, k) => (k in src ? ((o[k] = src[k]), o) : o), {});

const emailLooksValid = (s) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || "").toLowerCase());

const normalize = (p = {}) => {
  const out = pick(p, [
    "name",
    "email",
    "phone",
    "address",
    "department",
    "position",
    "salary",
    "payout",
  ]);

  out.name = String(out.name ?? "").trim();
  out.email = String(out.email ?? "")
    .toLowerCase()
    .trim();
  out.phone = String(out.phone ?? "").trim();
  out.address = String(out.address ?? "").trim();
  out.department = String(out.department ?? "").trim();
  out.position = String(out.position ?? "").trim();

  const s = Number(out.salary);
  out.salary = Number.isFinite(s) && s >= 0 ? s : 0;

  const pIn = p?.payout || {};
  out.payout = {
    methodPreferred: ["", "bank", "card", "finance_manager"].includes(
      pIn?.methodPreferred
    )
      ? pIn.methodPreferred
      : "",
    bank: {
      accountName: String(pIn?.bank?.accountName ?? "").trim(),
      bankName: String(pIn?.bank?.bankName ?? "").trim(),
      branch: String(pIn?.bank?.branch ?? "").trim(),
      accountNumberLast4: String(pIn?.bank?.accountNumberLast4 ?? "")
        .replace(/[^\d]/g, "")
        .slice(-4),
      swift: String(pIn?.bank?.swift ?? "").trim(),
    },
    card: {
      brand: String(pIn?.card?.brand ?? "").trim(),
      last4: String(pIn?.card?.last4 ?? "")
        .replace(/[^\d]/g, "")
        .slice(-4),
      expMonth: pIn?.card?.expMonth ? Number(pIn.card.expMonth) : null,
      expYear: pIn?.card?.expYear ? Number(pIn.card.expYear) : null,
      token: String(pIn?.card?.token ?? "").trim(),
      billingName: String(pIn?.card?.billingName ?? "").trim(),
    },
    consentSaveCard: !!pIn?.consentSaveCard,
  };

  return out;
};

/* ============================== CREATE ============================== */
const create = async (req, res) => {
  try {
    if (!req.body?.name || !req.body?.email) {
      return res.status(400).json({ message: "name and email are required" });
    }
    if (!emailLooksValid(req.body.email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const norm = normalize(req.body);

    const exists = await Employee.findOne({ email: norm.email }).lean();
    if (exists) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const saved = await Employee.create(norm);
    return res.status(201).json(saved);
  } catch (error) {
    console.error("[EMPLOYEE CREATE]", error);
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Email is already in use" });
    }
    if (error?.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Internal error while creating employee" });
  }
};

/* =============================== READ =============================== */
const list = async (_req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    return res.status(200).json(employees);
  } catch (error) {
    console.error("[EMPLOYEE LIST]", error);
    return res
      .status(500)
      .json({ message: "Internal error while fetching employees" });
  }
};

/* ============================== UPDATE ============================== */
const update = async (req, res) => {
  try {
    const { id } = req.params;

    const emp = await Employee.findById(id).select("+_otp");
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    if (req.body?.email) {
      const next = String(req.body.email).toLowerCase().trim();
      if (!emailLooksValid(next)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      if (next !== emp.email) {
        const taken = await Employee.findOne({ email: next }).lean();
        if (taken) {
          return res.status(400).json({ message: "Email is already in use" });
        }
      }
    }

    const prevPhone = emp.phone;
    Object.assign(emp, normalize(req.body));
    if (req.body?.phone && req.body.phone.trim() !== prevPhone) {
      emp.phoneVerified = false; // reset if phone changed
      emp._otp = undefined;
    }

    const saved = await emp.save();
    return res.status(200).json(saved);
  } catch (error) {
    console.error("[EMPLOYEE UPDATE]", error);
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Email is already in use" });
    }
    if (error?.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Internal error while updating employee" });
  }
};

/* ============================== DELETE ============================== */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const emp = await Employee.findById(id);
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    await Employee.findByIdAndDelete(id);
    return res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("[EMPLOYEE DELETE]", error);
    return res
      .status(500)
      .json({ message: "Internal error while deleting employee" });
  }
};

/* =============================== OTP ================================ */
const sendOtp = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone } = req.body || {};

    const emp = await Employee.findById(id).select("+_otp");
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    const phoneToUse = String(phone || emp.phone || "").trim();
    if (!phoneToUse) {
      return res.status(400).json({ message: "Phone is required to send OTP" });
    }

    if (!emp.phone) {
      emp.phone = phoneToUse;
      emp.phoneVerified = false;
    }

    const code = String(crypto.randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    emp._otp = { code, expiresAt, attempts: 0 };
    await emp.save();

    if (isProd && twilioClient) {
      // Real SMS in production
      await twilioClient.messages.create({
        to: phoneToUse, // must be E.164 (+947...)
        from: process.env.TWILIO_FROM,
        body: `Your verification code is: ${code}`,
      });
      return res.status(204).end();
    }

    // Dev (or prod without Twilio configured): return the code so you can test
    if (!isProd || !twilioClient) {
      console.log(`[DEV OTP] ${code} → ${phoneToUse}`);
      return res.status(200).json({ message: "OTP sent (dev)", devCode: code });
    }
  } catch (error) {
    console.error("[EMPLOYEE OTP SEND]", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.body || {};

    const emp = await Employee.findById(id).select("+_otp");
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    if (!emp._otp?.code || !emp._otp?.expiresAt) {
      return res.status(400).json({ message: "No OTP pending" });
    }
    if (!code || String(code).trim().length < 4) {
      return res.status(400).json({ message: "Invalid code" });
    }
    if (new Date(emp._otp.expiresAt).getTime() < Date.now()) {
      emp._otp = undefined;
      await emp.save();
      return res.status(400).json({ message: "OTP expired" });
    }

    const attempts = (emp._otp.attempts || 0) + 1;
    if (attempts > 5) {
      emp._otp = undefined;
      await emp.save();
      return res.status(429).json({ message: "Too many attempts" });
    }

    if (String(code).trim() !== emp._otp.code) {
      emp._otp.attempts = attempts;
      await emp.save();
      return res.status(400).json({ message: "Invalid code" });
    }

    emp.phoneVerified = true;
    emp._otp = undefined;
    await emp.save();

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[EMPLOYEE OTP VERIFY]", error);
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
};

export default {
  create,
  list,
  update,
  remove,
  sendOtp,
  verifyOtp,
};

