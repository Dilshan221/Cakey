import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";

/**
 * Admin ▸ Financial Dashboard ▸ User Management
 * - Sticky page header with search + quick actions
 * - Responsive table (cards on mobile)
 * - OTP modal for phone verification
 * - Guards Pay/Salary until phoneVerified
 * - SINGLE Pay button (auto-selects method)
 */

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  department: "",
  position: "",
  salary: "",
  // payout (stored on employee)
  payoutMethod: "", // "bank" | "card" | "finance_manager" | ""
  bank_accountName: "",
  bank_name: "",
  bank_branch: "",
  bank_accountLast4: "",
  bank_swift: "",
  card_brand: "",
  card_last4: "",
  card_expMonth: "",
  card_expYear: "",
  card_billingName: "",
  consentSaveCard: false,
};

function toPayload(form) {
  return {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim(),
    department: form.department.trim(),
    position: form.position.trim(),
    address: form.address.trim(),
    salary:
      form.salary === "" || isNaN(Number(form.salary))
        ? 0
        : Number(form.salary),
    payout: {
      methodPreferred: form.payoutMethod || "",
      bank: {
        accountName: form.bank_accountName.trim(),
        bankName: form.bank_name.trim(),
        branch: form.bank_branch.trim(),
        accountNumberLast4: (form.bank_accountLast4 || "").slice(-4),
        swift: form.bank_swift.trim(),
      },
      card: {
        brand: form.card_brand.trim(),
        last4: (form.card_last4 || "").slice(-4),
        expMonth: form.card_expMonth ? Number(form.card_expMonth) : null,
        expYear: form.card_expYear ? Number(form.card_expYear) : null,
        token: "",
        billingName: form.card_billingName.trim(),
      },
      consentSaveCard: !!form.consentSaveCard,
    },
  };
}

function fillFormFromEmployee(emp) {
  const f = { ...emptyForm };
  f.name = emp.name || "";
  f.email = emp.email || "";
  f.phone = emp.phone || "";
  f.address = emp.address || "";
  f.department = emp.department || "";
  f.position = emp.position || "";
  f.salary = typeof emp.salary === "number" ? String(emp.salary) : "";

  const p = emp.payout || {};
  f.payoutMethod = p.methodPreferred || "";
  const b = p.bank || {};
  f.bank_accountName = b.accountName || "";
  f.bank_name = b.bankName || "";
  f.bank_branch = b.branch || "";
  f.bank_accountLast4 = b.accountNumberLast4 || "";
  f.bank_swift = b.swift || "";

  const c = p.card || {};
  f.card_brand = c.brand || "";
  f.card_last4 = c.last4 || "";
  f.card_expMonth = c.expMonth || "";
  f.card_expYear = c.expYear || "";
  f.card_billingName = c.billingName || "";
  f.consentSaveCard = !!p.consentSaveCard;

  return f;
}

function payoutSummary(u) {
  const p = u?.payout || {};
  const m = p.methodPreferred || "";
  if (!m) return "—";
  if (m === "finance_manager") return "Finance Manager";
  if (m === "bank") {
    const last4 = p.bank?.accountNumberLast4
      ? ` ••••${p.bank.accountNumberLast4}`
      : "";
    const bank = p.bank?.bankName ? ` ${p.bank.bankName}` : "";
    return `Bank${bank}${last4}`;
  }
  if (m === "card") {
    const brand = p.card?.brand || "Card";
    const last4 = p.card?.last4 ? ` ••••${p.card.last4}` : "";
    return `${brand}${last4}`;
  }
  return "—";
}

/** Decide which method the single Pay button should use */
function resolvePayMethod(emp) {
  const pref = emp?.payout?.methodPreferred;
  if (pref === "bank" || pref === "card") return pref;
  return "cash";
}

function payButtonLabel(emp) {
  const m = resolvePayMethod(emp);
  if (m === "bank") {
    const bank = emp?.payout?.bank?.bankName || "Bank";
    const last4 = emp?.payout?.bank?.accountNumberLast4
      ? ` ••••${emp.payout.bank.accountNumberLast4}`
      : "";
    return `Pay (${bank}${last4})`;
  }
  if (m === "card") {
    const brand = emp?.payout?.card?.brand || "Card";
    const last4 = emp?.payout?.card?.last4
      ? ` ••••${emp.payout.card.last4}`
      : "";
    return `Pay (${brand}${last4})`;
  }
  return "Pay (Cash)";
}

/* ---------------- UI atoms ---------------- */
const Badge = ({ tone = "gray", children }) => (
  <span className={`adm-badge adm-badge-${tone}`}>{children}</span>
);
const Btn = ({ variant = "default", className = "", ...props }) => (
  <button className={`adm-btn adm-btn-${variant} ${className}`} {...props} />
);

/* ---------------- OTP Modal ---------------- */
function OtpModal({ open, onClose, employee, onVerified }) {
  const [phone, setPhone] = useState(employee?.phone || "");
  const [phase, setPhase] = useState("idle"); // idle | sending | sent | verifying | error
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [devHint, setDevHint] = useState("");

  useEffect(() => {
    if (open) {
      setPhone(employee?.phone || "");
      setPhase("idle");
      setCode("");
      setDevHint("");
      setError("");
    }
  }, [open, employee]);

  if (!open) return null;

  const sendOtp = async () => {
    try {
      setPhase("sending");
      setError("");
      setDevHint("");
      const resp = await apiService.sendEmployeeOtp(employee._id, phone);
      if (resp?.devCode) {
        setDevHint(`Dev code: ${resp.devCode}`);
        setCode(resp.devCode);
      }
      setPhase("sent");
    } catch (e) {
      setError(e?.data?.message || e?.message || "Failed to send OTP");
      setPhase("error");
    }
  };

  const verifyOtp = async () => {
    try {
      setPhase("verifying");
      setError("");
      await apiService.verifyEmployeeOtp(employee._id, code);
      onVerified();
      onClose();
    } catch (e) {
      setError(e?.data?.message || e?.message || "Invalid code");
      setPhase("error");
    }
  };

  return (
    <div className="otp-backdrop" onClick={onClose}>
      <div className="otp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="otp-header">
          <div className="otp-header-left">
            <div className="otp-kicker">Security</div>
            <h4>Verify Employee Phone</h4>
          </div>
          <button className="otp-x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="muted">
          We’ll send a one-time code to confirm this employee before salary or
          payment actions.
        </p>

        <div className="adm-form-group">
          <label className="adm-label">Phone (with country code)</label>
          <input
            className="adm-input"
            placeholder="+94 7X XXX XXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {phase === "sent" && (
          <div className="adm-form-group">
            <label className="adm-label">OTP Code</label>
            <input
              className="adm-input"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))
              }
            />
            {devHint && (
              <div className="muted" style={{ marginTop: 6 }}>
                {devHint}
              </div>
            )}
          </div>
        )}

        {error && <div className="otp-error">⚠ {error}</div>}

        <div className="adm-row-gap" style={{ marginTop: 12 }}>
          {phase !== "sent" ? (
            <Btn
              variant="primary"
              onClick={sendOtp}
              disabled={phase === "sending" || !phone.trim()}
              title={!phone.trim() ? "Enter a phone number first" : undefined}
            >
              {phase === "sending" ? "Sending…" : "Send OTP"}
            </Btn>
          ) : (
            <>
              <Btn
                variant="primary"
                onClick={verifyOtp}
                disabled={phase === "verifying" || code.length < 4}
              >
                {phase === "verifying" ? "Verifying…" : "Verify"}
              </Btn>
              <Btn
                type="button"
                onClick={sendOtp}
                className="adm-btn-sm"
                title="Resend code"
              >
                Resend
              </Btn>
            </>
          )}
          <Btn onClick={onClose}>Cancel</Btn>
        </div>
      </div>

      <style>{`
        .otp-backdrop{position:fixed;inset:0;background:rgba(17,24,39,.55);display:flex;align-items:center;justify-content:center;z-index:60}
        .otp-modal{width:100%;max-width:500px;background:#fff;border-radius:18px;border:1px solid #e5e7eb;padding:18px;box-shadow:0 15px 50px rgba(0,0,0,.18)}
        .otp-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
        .otp-header-left .otp-kicker{font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em}
        .otp-header-left h4{margin:4px 0 0}
        .otp-x{background:transparent;border:none;font-size:22px;line-height:1;cursor:pointer;color:#6b7280}
        .otp-error{color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;padding:8px;border-radius:10px;margin-top:8px}
      `}</style>
    </div>
  );
}

export default function UserManagement() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  // OTP modal state
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpEmployee, setOtpEmployee] = useState(null);
  const [postVerifyAction, setPostVerifyAction] = useState(null); // { type: 'pay'|'salary', method? }

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEmployees();
      setUsers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((u) => {
      const fields = [
        u.name,
        u.email,
        u.phone,
        u.department,
        u.position,
        u.address,
      ]
        .filter(Boolean)
        .map((x) => String(x).toLowerCase());
      return fields.some((f) => f.includes(needle));
    });
  }, [users, q]);

  const handleInputChange = (e) => {
    const { name, type, value, checked } = e.target;

    if (type === "checkbox") {
      return setFormData((prev) => ({ ...prev, [name]: checked }));
    }
    if (name === "salary") {
      const num = value === "" ? "" : Number(value);
      return setFormData((prev) => ({ ...prev, salary: num }));
    }
    if (["card_expMonth", "card_expYear"].includes(name)) {
      return setFormData((prev) => ({
        ...prev,
        [name]: value.replace(/[^\d]/g, ""),
      }));
    }
    if (name === "bank_accountLast4" || name === "card_last4") {
      const trimmed = value.replace(/[^\d]/g, "").slice(-4);
      return setFormData((prev) => ({ ...prev, [name]: trimmed }));
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = toPayload(formData);
      if (editingId) {
        await apiService.updateEmployee(editingId, payload);
      } else {
        await apiService.createEmployee(payload);
      }
      resetForm();
      setShowForm(false);
      await fetchUsers();
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to save user";
      setError(msg);
      console.error("Error saving user:", err);
    } finally {
      setSaving(false);
    }
  };

  // Guarded navigation
  const ensureVerifiedThen = (emp, action) => {
    if (emp?.phoneVerified) {
      if (action.type === "pay") {
        navigate("/admin/payments/new", {
          state: {
            from: "user-management",
            employee: emp,
            payoutMethod: action.method,
          },
        });
      } else if (action.type === "salary") {
        navigate("/admin/salaries/new", {
          state: {
            from: "user-management",
            employee: emp,
            mode: "add-adjustments",
          },
        });
      }
      return;
    }
    setOtpEmployee(emp);
    setPostVerifyAction(action);
    setOtpOpen(true);
  };

  const goToPayment = (emp) => {
    const resolved = resolvePayMethod(emp);
    ensureVerifiedThen(emp, { type: "pay", method: resolved });
  };
  const goToSalaryEdit = (emp) => {
    ensureVerifiedThen(emp, { type: "salary" });
  };

  const handleEditUser = (emp) => {
    setFormData(fillFormFromEmployee(emp));
    setEditingId(emp._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiService.deleteEmployee(id);
      fetchUsers();
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to delete user";
      setError(msg);
      console.error("Error deleting user:", err);
    }
  };

  const onOtpVerified = async () => {
    await fetchUsers();
    if (otpEmployee && postVerifyAction) {
      const fresh =
        (users || []).find((u) => u._id === otpEmployee._id) || otpEmployee;
      ensureVerifiedThen(fresh, postVerifyAction);
    }
  };

  return (
    <div className="um-wrap">
      {/* Page Header */}
      <div className="um-pagehead">
        <div className="um-breadcrumbs">
          Financial Dashboard ▸ Admin ▸ Users
        </div>
        <div className="um-title-row">
          <div>
            <h2>Welcome, Admin</h2>
            <div className="muted-small">
              Manage employees, payout methods and salary actions
            </div>
          </div>
          <div className="adm-row-gap">
            <input
              className="adm-input adm-input-lg"
              placeholder="Search name, email, phone, department, position…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Btn
              variant="primary"
              onClick={() => {
                if (!showForm) resetForm();
                setShowForm((s) => !s);
              }}
            >
              {showForm ? "Close Form" : "Add New User"}
            </Btn>
          </div>
        </div>
      </div>

      {/* Form card */}
      {showForm && (
        <div className="adm-card um-form">
          <div className="adm-card-head">
            <h3>{editingId ? "Edit User" : "Add New User"}</h3>
            {saving && <Badge tone="blue">Saving…</Badge>}
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "10px 16px 16px" }}>
            <div className="adm-grid-2">
              <div className="adm-form-group">
                <label className="adm-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., John Smith"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="adm-input"
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="adm-input"
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+94 7X XXX XXXX"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="adm-input"
                />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Phone secondary </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+94 7X XXX XXXX"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="adm-input"
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Department</label>
                <input
                  type="text"
                  name="department"
                  placeholder="e.g., Engineering"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="adm-input"
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Position</label>
                <input
                  type="text"
                  name="position"
                  placeholder="e.g., Developer"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="adm-input"
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Salary</label>
                <input
                  type="number"
                  name="salary"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="adm-input"
                />
              </div>

              <div className="adm-form-group adm-col-span-2">
                <label className="adm-label">Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g., 123 High Street, Colombo"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="adm-input"
                />
              </div>
            </div>

            <div className="adm-divider" />

            <div className="adm-form-group">
              <label className="adm-label">Preferred Payout</label>
              <select
                name="payoutMethod"
                value={formData.payoutMethod}
                onChange={handleInputChange}
                className="adm-input"
              >
                <option value="">— None —</option>
                <option value="bank">Bank Transfer</option>
                <option value="card">Card (saved)</option>
                <option value="finance_manager">
                  Finance Manager (manual)
                </option>
              </select>
            </div>

            <details className="adm-details">
              <summary>Bank details (optional)</summary>
              <div className="adm-grid-2">
                <input
                  className="adm-input"
                  name="bank_accountName"
                  placeholder="Account Name"
                  value={formData.bank_accountName}
                  onChange={handleInputChange}
                />
                <input
                  className="adm-input"
                  name="bank_name"
                  placeholder="Bank Name"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                />
                <input
                  className="adm-input"
                  name="bank_branch"
                  placeholder="Branch"
                  value={formData.bank_branch}
                  onChange={handleInputChange}
                />
                <input
                  className="adm-input"
                  name="bank_accountLast4"
                  placeholder="Account Last 4"
                  maxLength={4}
                  value={formData.bank_accountLast4}
                  onChange={handleInputChange}
                />
                <input
                  className="adm-input"
                  name="bank_swift"
                  placeholder="SWIFT (optional)"
                  value={formData.bank_swift}
                  onChange={handleInputChange}
                />
              </div>
            </details>

            <details className="adm-details">
              <summary>Card details (optional)</summary>
              <div className="adm-grid-2">
                <input
                  className="adm-input"
                  name="card_brand"
                  placeholder="Brand (e.g., Visa)"
                  value={formData.card_brand}
                  onChange={handleInputChange}
                />
                <input
                  className="adm-input"
                  name="card_last4"
                  placeholder="Last 4 digits"
                  maxLength={4}
                  value={formData.card_last4}
                  onChange={handleInputChange}
                />
                <input
                  className="adm-input"
                  name="card_expMonth"
                  type="number"
                  min="1"
                  max="12"
                  placeholder="Exp. Month"
                  value={formData.card_expMonth}
                  onChange={handleInputChange}
                />
                <input
                  className="adm-input"
                  name="card_expYear"
                  type="number"
                  min="2025"
                  max="2050"
                  placeholder="Exp. Year"
                  value={formData.card_expYear}
                  onChange={handleInputChange}
                />
                <input
                  className="adm-input"
                  name="card_billingName"
                  placeholder="Billing Name"
                  value={formData.card_billingName}
                  onChange={handleInputChange}
                />
                <label className="adm-check">
                  <input
                    type="checkbox"
                    name="consentSaveCard"
                    checked={!!formData.consentSaveCard}
                    onChange={handleInputChange}
                  />
                  <span>Consent to save masked card</span>
                </label>
              </div>
            </details>

            <div className="adm-form-actions">
              <Btn type="submit" variant="primary" disabled={saving}>
                {editingId ? "Update User" : "Create User"}
              </Btn>
              {editingId && (
                <Btn
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Btn>
              )}
            </div>

            {error && <div className="adm-alert-error">⚠ {error}</div>}
          </form>
        </div>
      )}

      {/* List card */}
      <div className="adm-card">
        <div className="adm-card-head">
          <h3>Employees</h3>
          <Badge tone="gray">{filtered.length} total</Badge>
        </div>

        {loading ? (
          <div className="um-skeleton">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="um-skel-row" />
            ))}
          </div>
        ) : (
          <>
            {/* Table (desktop) */}
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Salary</th>
                    <th>Address</th>
                    <th>Payout</th>
                    <th>Pay</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(filtered || []).map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="um-namecell">
                          <div className="um-avatar" aria-hidden />
                          <div>
                            <div className="um-empname">{u.name}</div>
                            <div className="muted-small">
                              ID: {u._id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="muted-small">{u.email}</td>
                      <td>
                        <div>{u.phone || "-"}</div>
                        <div>
                          {u.phoneVerified ? (
                            <Badge tone="green">Verified</Badge>
                          ) : (
                            <Badge>Unverified</Badge>
                          )}
                        </div>
                        {!u.phoneVerified && (
                          <div style={{ marginTop: 6 }}>
                            <Btn
                              className="adm-btn-sm"
                              onClick={() => {
                                setOtpEmployee(u);
                                setPostVerifyAction(null);
                                setOtpOpen(true);
                              }}
                            >
                              Verify phone
                            </Btn>
                          </div>
                        )}
                      </td>
                      <td>{u.department || "-"}</td>
                      <td>{u.position || "-"}</td>
                      <td>{typeof u.salary === "number" ? u.salary : 0}</td>
                      <td className="muted-small">{u.address || "-"}</td>
                      <td className="muted-small">{payoutSummary(u)}</td>

                      <td>
                        {/* ✅ SINGLE PAY BUTTON */}
                        <Btn
                          className="adm-btn-sm"
                          variant="dark"
                          onClick={() => goToPayment(u)}
                          title={payButtonLabel(u)}
                          aria-label={payButtonLabel(u)}
                        >
                          {payButtonLabel(u)}
                        </Btn>
                      </td>

                      <td>
                        <div className="adm-row-gap">
                          <Btn
                            className="adm-btn-sm"
                            onClick={() => goToSalaryEdit(u)}
                            title="Add allowances/deductions"
                          >
                            Salary/Edit
                          </Btn>
                          <Btn
                            className="adm-btn-sm"
                            onClick={() => handleEditUser(u)}
                          >
                            Edit
                          </Btn>
                          <Btn
                            className="adm-btn-sm adm-btn-danger"
                            onClick={() => handleDelete(u._id)}
                          >
                            Delete
                          </Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ textAlign: "center" }}>
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Cards (mobile) */}
            <div className="adm-cards-mobile">
              {(filtered || []).map((u) => (
                <div key={u._id} className="adm-card-row">
                  <div className="adm-card-row-head">
                    <div className="adm-title">{u.name}</div>
                    {u.phoneVerified ? (
                      <Badge tone="green">Verified</Badge>
                    ) : (
                      <Badge>Unverified</Badge>
                    )}
                  </div>
                  <div className="adm-row">
                    <div className="adm-label">Email</div>
                    <div className="adm-value">{u.email}</div>
                  </div>
                  <div className="adm-row">
                    <div className="adm-label">Phone</div>
                    <div className="adm-value">{u.phone || "-"}</div>
                  </div>
                  <div className="adm-row">
                    <div className="adm-label">Dept / Position</div>
                    <div className="adm-value">
                      {(u.department || "-") + " • " + (u.position || "-")}
                    </div>
                  </div>
                  <div className="adm-row">
                    <div className="adm-label">Salary</div>
                    <div className="adm-value">
                      {typeof u.salary === "number" ? u.salary : 0}
                    </div>
                  </div>
                  <div className="adm-row">
                    <div className="adm-label">Payout</div>
                    <div className="adm-value">{payoutSummary(u)}</div>
                  </div>

                  {!u.phoneVerified && (
                    <div className="adm-row-gap" style={{ marginTop: 8 }}>
                      <Btn
                        className="adm-btn-sm"
                        onClick={() => {
                          setOtpEmployee(u);
                          setPostVerifyAction(null);
                          setOtpOpen(true);
                        }}
                      >
                        Verify phone
                      </Btn>
                    </div>
                  )}

                  {/* ✅ SINGLE PAY BUTTON (mobile) */}
                  <div className="adm-row-gap" style={{ marginTop: 10 }}>
                    <Btn
                      className="adm-btn-sm"
                      variant="dark"
                      onClick={() => goToPayment(u)}
                      title={payButtonLabel(u)}
                      aria-label={payButtonLabel(u)}
                    >
                      {payButtonLabel(u)}
                    </Btn>
                  </div>

                  <div className="adm-row-gap" style={{ marginTop: 8 }}>
                    <Btn
                      className="adm-btn-sm"
                      onClick={() => goToSalaryEdit(u)}
                    >
                      Salary/Edit
                    </Btn>
                    <Btn
                      className="adm-btn-sm"
                      onClick={() => handleEditUser(u)}
                    >
                      Edit
                    </Btn>
                    <Btn
                      className="adm-btn-sm adm-btn-danger"
                      onClick={() => handleDelete(u._id)}
                    >
                      Delete
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* OTP Modal */}
      <OtpModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        employee={otpEmployee}
        onVerified={onOtpVerified}
      />

      {/* local styles */}
      <style>{`
        .um-wrap{display:flex;flex-direction:column;gap:14px}
        .um-pagehead{position:sticky;top:0;background:linear-gradient(180deg,#ffffff,rgba(255,255,255,.92));backdrop-filter:saturate(180%) blur(6px);z-index:20;border-bottom:1px solid #eee;padding:12px 10px}
        .um-breadcrumbs{font-size:12px;color:#6b7280;margin-bottom:4px}
        .um-title-row{display:flex;align-items:center;justify-content:space-between;gap:12px}

        .adm-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.05)}
        .adm-card + .adm-card{margin-top:10px}
        .adm-card-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #f1f5f9}
        .adm-table-wrap{width:100%;overflow:auto}
        .adm-table{width:100%;border-collapse:separate;border-spacing:0}
        .adm-table thead th{position:sticky;top:0;background:#fafafa;text-align:left;font-weight:600;color:#374151;padding:12px;border-bottom:1px solid #e5e7eb}
        .adm-table tbody td{padding:12px;border-bottom:1px solid #f3f4f6;vertical-align:top}
        .muted{color:#6b7280}
        .muted-small{color:#6b7280;font-size:12px}

        .adm-input{border:1px solid #e5e7eb;border-radius:12px;padding:10px 12px;background:#fff;outline:none;width:100%}
        .adm-input:focus{border-color:#c7d2fe;box-shadow:0 0 0 3px rgba(59,130,246,.15)}
        .adm-input-lg{min-width:320px}
        .adm-label{display:block;font-size:12px;color:#6b7280;margin-bottom:6px}
        .adm-form-group{display:flex;flex-direction:column;gap:6px}
        .adm-grid-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
        .adm-col-span-2{grid-column:span 2}
        .adm-details summary{cursor:pointer;margin:8px 0;color:#374151;font-weight:600}
        .adm-check{display:flex;align-items:center;gap:8px}
        .adm-form-actions{display:flex;gap:8px;margin-top:12px}
        .adm-divider{height:1px;background:#f1f5f9;margin:12px 0}

        .adm-btn{border:1px solid #e5e7eb;background:#fff;border-radius:12px;padding:8px 12px;cursor:pointer;transition:.2s;white-space:nowrap}
        .adm-btn:hover{box-shadow:0 4px 12px rgba(0,0,0,.06)}
        .adm-btn:disabled{opacity:.6;cursor:not-allowed}
        .adm-btn-primary{background:#111827;color:#fff;border-color:#111827}
        .adm-btn-danger{border-color:#fee2e2;background:#fff;color:#b91c1c}
        .adm-btn-sm{padding:6px 10px;border-radius:10px;font-size:13px}

        /* ✅ Dark variant for the single Pay button */
        .adm-btn-dark{background:#000;color:#fff;border-color:#000}
        .adm-btn-dark:hover{filter:brightness(0.92)}
        .adm-btn-dark:active{filter:brightness(0.85)}
        .adm-btn-dark:disabled{opacity:.65}

        .adm-badge{display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;border:1px solid #e5e7eb;color:#374151;background:#f9fafb}
        .adm-badge-green{background:#ecfdf5;border-color:#a7f3d0;color:#065f46}
        .adm-badge-blue{background:#eff6ff;border-color:#bfdbfe;color:#1e40af}

        .adm-cards-mobile{display:none;padding:10px}
        .adm-card-row{border:1px solid #e5e7eb;border-radius:14px;padding:12px;margin-bottom:10px}
        .adm-card-row-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
        .adm-title{font-weight:700}
        .adm-row{display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-top:1px dashed #f1f5f9}
        .adm-row:first-of-type{border-top:0}
        .adm-label{font-size:12px;color:#6b7280}
        .adm-value{font-size:14px}

        .um-namecell{display:flex;align-items:center;gap:10px}
        .um-avatar{width:32px;height:32px;border-radius:999px;background:linear-gradient(135deg,#e5e7eb,#f3f4f6);box-shadow:inset 0 0 0 1px #e5e7eb}
        .um-empname{font-weight:600}

        .um-skeleton{padding:12px}
        .um-skel-row{height:44px;border-radius:10px;background:linear-gradient(90deg,#f3f4f6,#eef2ff,#f3f4f6);background-size:200% 100%;animation:skel 1.4s ease-in-out infinite;margin-bottom:8px}
        @keyframes skel{0%{background-position:0 0}100%{background-position:200% 0}}

        @media(max-width: 980px){
          .adm-grid-2{grid-template-columns:1fr}
          .adm-col-span-2{grid-column:span 1}
          .adm-input-lg{min-width:0;width:100%}
        }
        @media(max-width: 820px){
          .adm-table-wrap{display:none}
          .adm-cards-mobile{display:block}
        }
      `}</style>

      {/* === your extra Admin Dashboard Styles injected inline === */}
      <style>{`
/*  Admin Dashboard Styles - Separate from website styles */
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap");

:root {
    --admin-primary: #4e54c8;
    --admin-primary-light: #8f94fb;
    --admin-secondary: #34AF6D;
    --admin-dark: #333;
    --admin-light: #f9f9f9;
    --admin-gray: #e0e0e0;
    --admin-danger: #ff4d4d;
    --admin-warning: #ffcc00;
    --admin-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* Admin Container */
.admin-container {
    display: flex;
    min-height: 100vh;
    font-family: "Poppins", sans-serif;
    background: var(--admin-light);
    color: var(--admin-dark);
}

/* Admin Navigation */
.admin-nav {
    position: fixed;
    top: 0;
    bottom: 0;
    height: 100vh;
    left: 0;
    width: 80px;
    background: #fff;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: var(--admin-shadow);
    z-index: 100;
}

.admin-nav:hover {
    width: 250px;
}

.admin-logo {
    text-align: center;
    display: flex;
    margin: 20px 0 0 20px;
    padding-bottom: 2rem;
}

.admin-logo img {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
}

.admin-logo span {
    font-weight: bold;
    padding-left: 15px;
    font-size: 18px;
    text-transform: uppercase;
    color: var(--admin-primary);
}

.admin-nav a {
    position: relative;
    width: 100%;
    font-size: 14px;
    color: var(--admin-dark);
    display: table;
    padding: 15px 20px;
    transition: all 0.3s ease;
    text-decoration: none;
}

.admin-nav .fas {
    position: relative;
    width: 70px;
    height: 40px;
    top: 10px;
    font-size: 20px;
    text-align: center;
    color: var(--admin-primary);
}

.admin-nav-item {
    position: relative;
    top: 10px;
    margin-left: 10px;
}

.admin-nav a:hover {
    background: var(--admin-gray);
    color: var(--admin-primary);
}

.admin-nav a:hover i {
    color: var(--admin-primary);
}

.admin-nav a.active {
    background: var(--admin-primary);
    color: white;
}

.admin-nav a.active i {
    color: white;
}

/* Sidebar list reset */
.admin-nav ul,
.admin-nav li {
    list-style: none;
    margin: 0;
    padding: 0;
}

/* Logout pinned to bottom */
.admin-nav .admin-logout {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
}


/* Admin Main Section */
.admin-main {
    position: relative;
    padding: 20px;
    width: calc(100% - 80px);
    left: 80px;
    transition: all 0.3s ease;
}

.admin-main-expanded {
    width: calc(100% - 250px);
    left: 250px;
}

.admin-main-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.admin-main-top h1 {
    color: var(--admin-primary);
    font-size: 24px;
}

.admin-user-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.admin-user-info img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.admin-notification {
    position: relative;
}

.admin-notification-count {
    position: absolute;
    top: -5px;
    right: -5px;
    background: var(--admin-danger);
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.admin-main-top i {
    color: var(--admin-primary);
    cursor: pointer;
    font-size: 20px;
}

/* Admin Stats Cards */
.admin-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.admin-stat-card {
    background: #fff;
    border-radius: 10px;
    padding: 20px;
    box-shadow: var(--admin-shadow);
    display: flex;
    align-items: center;
    gap: 15px;
}

.admin-stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
}

.admin-icon-present {
    background: var(--admin-secondary);
}

.admin-icon-late {
    background: var(--admin-warning);
}

.admin-icon-absent {
    background: var(--admin-danger);
}

.admin-icon-total {
    background: var(--admin-primary);
}

.admin-stat-info h3 {
    font-size: 24px;
    margin-bottom: 5px;
}

.admin-stat-info p {
    color: #777;
    font-size: 14px;
}

/* Admin Users Cards */
.admin-users {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.admin-card {
    background: #fff;
    border-radius: 10px;
    padding: 20px;
    box-shadow: var(--admin-shadow);
    text-align: center;
    transition: transform 0.3s ease;
}

.admin-card:hover {
    transform: translateY(-5px);
}

.admin-card img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 15px;
    border: 3px solid var(--admin-primary-light);
}

.admin-card h4 {
    text-transform: uppercase;
    margin-bottom: 5px;
    color: var(--admin-dark);
}

.admin-card p {
    font-size: 12px;
    margin-bottom: 15px;
    text-transform: uppercase;
    color: #777;
}

.admin-per {
    margin: 15px 0;
}

.admin-per table {
    margin: 0 auto;
    width: 100%;
}

.admin-per span {
    font-weight: bold;
    color: var(--admin-primary);
}

.admin-per td {
    font-size: 14px;
    padding: 5px;
}

.admin-card button {
    width: 100%;
    margin-top: 15px;
    padding: 10px;
    cursor: pointer;
    border-radius: 5px;
    background: var(--admin-primary);
    color: white;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
}

.admin-card button:hover {
    background: var(--admin-primary-light);
}

/* Admin Attendance List */
.admin-attendance {
    margin-top: 20px;
    text-transform: capitalize;
}

.admin-attendance-list {
    width: 100%;
    padding: 20px;
    margin-top: 10px;
    background: #fff;
    border-radius: 10px;
    box-shadow: var(--admin-shadow);
    overflow-x: auto;
}

.admin-attendance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.admin-attendance-header h1 {
    color: var(--admin-primary);
    font-size: 20px;
}

.admin-search-box {
    display: flex;
    align-items: center;
    background: var(--admin-light);
    border-radius: 5px;
    padding: 5px 15px;
}

.admin-search-box input {
    background: transparent;
    padding: 8px;
    width: 200px;
    border: none;
    outline: none;
}

.admin-search-box i {
    color: #777;
}

.admin-table {
    border-collapse: collapse;
    width: 100%;
    min-width: 800px;
    font-size: 14px;
}

.admin-table thead tr {
    color: #fff;
    background: var(--admin-primary);
    text-align: left;
    font-weight: bold;
}

.admin-table th,
.admin-table td {
    padding: 12px 15px;
}

.admin-table tbody tr {
    border-bottom: 1px solid #ddd;
}

.admin-table tbody tr:nth-of-type(even) {
    background: #f9f9f9;
}

.admin-table tbody tr.active {
    font-weight: bold;
    color: var(--admin-secondary);
}

.admin-table tbody tr:last-of-type {
    border-bottom: 2px solid var(--admin-primary);
}

.admin-status {
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
}

.admin-present {
    background: rgba(52, 175, 109, 0.2);
    color: var(--admin-secondary);
}

.admin-late {
    background: rgba(255, 204, 0, 0.2);
    color: var(--admin-warning);
}

.admin-absent {
    background: rgba(255, 77, 77, 0.2);
    color: var(--admin-danger);
}

.admin-table button {
    padding: 6px 15px;
    border-radius: 5px;
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--admin-primary);
    color: var(--admin-primary);
    transition: all 0.3s ease;
}

.admin-table button:hover {
    background: var(--admin-primary);
    color: #fff;
}

/* Admin Form Styles */
.admin-user-form, .admin-mark-attendance-form {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: var(--admin-shadow);
}

.admin-form-group {
  margin-bottom: 15px;
}

.admin-form-group input, .admin-form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.admin-btn {
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
}

.admin-btn-primary {
  background: var(--admin-primary);
  color: white;
}

.admin-btn-primary:hover {
  background: var(--admin-primary-light);
}

.admin-btn-danger {
  background: var(--admin-danger);
  color: white;
}

.admin-btn-danger:hover {
  background: #ff6b6b;
}

.admin-mark-attendance-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  align-items: end;
}

.admin-mark-attendance-form h3 {
  grid-column: 1 / -1;
  margin-bottom: 10px;
  color: var(--admin-primary);
}

/* Toggle button for mobile */
.admin-toggle-btn {
    display: none;
    position: fixed;
    top: 15px;
    left: 15px;
    z-index: 1000;
    background: var(--admin-primary);
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--admin-shadow);
}

/* Responsive */
@media (max-width: 1024px) {
    .admin-users {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .admin-toggle-btn {
        display: flex;
    }
    
    .admin-nav {
        left: -80px;
        width: 80px;
    }
    
    .admin-nav.active {
        left: 0;
    }
    
    .admin-nav:hover.active {
        width: 200px;
    }
    
    .admin-main {
        width: 100%;
        left: 0;
    }
    
    .admin-main.active {
        width: calc(100% - 80px);
        left: 80px;
    }
    
    .admin-users {
        grid-template-columns: 1fr;
    }
    
    .admin-stats {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 576px) {
    .admin-main-top {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    
    .admin-user-info {
        align-self: flex-end;
    }
    
    .admin-stats {
        grid-template-columns: 1fr;
    }
    
    .admin-search-box input {
        width: 150px;
    }
}

/* ======================================================================
   Minimal color overrides (title + buttons only) to match the screenshot
   ====================================================================== */
:root{
  --cb-orange:#ff6f61;
  --cb-orange-dark:#e55a4f;
}

/* Page title recolor */
.main h1,
.admin-main-top h1{
  color:var(--cb-orange) !important;
}

/* Buttons recolor (generic + named) */
.btn,
.admin-btn,
.admin-table button,
.admin-card button,
button.btn,
a.btn,
.btn-add,
.btn-edit,
.btn-delete,
a.btn-add,
button.btn-add,
button.btn-edit,
button.btn-delete{
  background:var(--cb-orange) !important;
  border-color:var(--cb-orange) !important;
  color:#fff !important;
}

/* Hover/active states */
.btn:hover,
.admin-btn:hover,
.admin-table button:hover,
.admin-card button:hover,
a.btn:hover,
.btn-add:hover,
.btn-edit:hover,
.btn-delete:hover{
  background:var(--cb-orange-dark) !important;
  border-color:var(--cb-orange-dark) !important;
  color:#fff !important;
}
.btn:active,
.admin-btn:active,
.admin-table button:active,
.admin-card button:active,
a.btn:active{
  transform:translateY(1px);
}

/* Keep icons white on colored buttons */
.btn i, .btn svg,
.admin-table button i, .admin-table button svg,
a.btn i, a.btn svg{
  color:#fff !important;
  fill:#fff !important;
}
      `}</style>
    </div>
  );
}
