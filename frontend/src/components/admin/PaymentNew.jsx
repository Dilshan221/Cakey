// src/components/admin/PaymentNew.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faUniversity,
  faCreditCard,
  faReceipt,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";

const Badge = ({ tone = "gray", children }) => (
  <span className={`adm-badge adm-badge-${tone}`}>{children}</span>
);
const Btn = ({ variant = "default", className = "", ...props }) => (
  <button className={`adm-btn adm-btn-${variant} ${className}`} {...props} />
);

function currentYYYYMM() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`; // HTML month input friendly
}

export default function PaymentNew() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const employee = state?.employee || null;
  const initialMethod = state?.payoutMethod || "cash"; // "cash" | "bank" | "card"

  const [method, setMethod] = useState(initialMethod);
  const [amount, setAmount] = useState(
    typeof employee?.salary === "number" ? employee.salary : ""
  );
  const [note, setNote] = useState("");
  // NEW: pay period (YYYY-MM)
  const [period, setPeriod] = useState(currentYYYYMM());

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null); // { paymentId, reference, email?, period }

  const savedPayoutSummary = useMemo(() => {
    const p = employee?.payout || {};
    if (method === "bank") {
      const bank = p.bank?.bankName ? ` ${p.bank.bankName}` : "";
      const last4 = p.bank?.accountNumberLast4
        ? ` ••••${p.bank.accountNumberLast4}`
        : "";
      return `Bank${bank}${last4}`;
    }
    if (method === "card") {
      const brand = p.card?.brand || "Card";
      const last4 = p.card?.last4 ? ` ••••${p.card.last4}` : "";
      return `${brand}${last4}`;
    }
    return "Cash";
  }, [employee, method]);

  const canSubmit = !!employee && Number(amount) > 0 && !saving && !!period;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError("");
    try {
      // 1) Create Payment
      const payload = {
        employeeId: employee._id,
        method,
        amount: Number(amount),
        currency: "LKR",
        note: note.trim(),
        meta:
          method === "bank"
            ? {
                bankName: employee?.payout?.bank?.bankName || "",
                accountLast4: employee?.payout?.bank?.accountNumberLast4 || "",
              }
            : method === "card"
            ? {
                brand: employee?.payout?.card?.brand || "",
                last4: employee?.payout?.card?.last4 || "",
                expMonth: employee?.payout?.card?.expMonth || null,
                expYear: employee?.payout?.card?.expYear || null,
              }
            : {},
      };
      const payment = await apiService.createPayment(payload);

      // 2) Record Salary/Payout for the selected period
      //    This creates a durable row you can show in history & "last paid".
      await apiService.createSalaryRecord({
        employeeId: employee._id,
        period, // "YYYY-MM"
        baseSalary: typeof employee?.salary === "number" ? employee.salary : 0,
        paidAmount: Number(amount),
        method,
        currency: "LKR",
        note: note.trim(),
        paymentId: payment?._id || null,
        paymentReference: payment?.reference || "",
        status: "paid", // for filtering later ("paid" | "pending" | etc.)
      });

      // (Optional) Update quick fields on employee (lastPaidPeriod/lastPaidAt)
      // await apiService.updateEmployee(employee._id, {
      //   lastPaidPeriod: period,
      //   lastPaidAt: new Date().toISOString(),
      // });

      setDone({
        paymentId: payment?._id,
        reference: payment?.reference || "",
        email: payment?.email || null,
        period,
      });
    } catch (e) {
      setError(e?.data?.message || e?.message || "Failed to create payment");
    } finally {
      setSaving(false);
    }
  };

  if (!employee) {
    return (
      <div className="adm-card" style={{ padding: 16 }}>
        <h3>New Payment</h3>
        <p className="muted">No employee was passed to this page.</p>
        <Btn onClick={() => navigate(-1)}>Go Back</Btn>
        <style>{baseStyles}</style>
      </div>
    );
  }

  if (done) {
    return (
      <div className="pn-wrap">
        <div className="um-pagehead">
          <div className="um-breadcrumbs">
            Financial Dashboard ▸ Admin ▸ Payments
          </div>
          <div className="um-title-row">
            <div>
              <h2 style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <FontAwesomeIcon icon={faReceipt} />
                Payment recorded
              </h2>
              <div className="muted-small">
                Reference {done.reference || done.paymentId}
              </div>
            </div>
            <div className="adm-row-gap">
              {done?.email?.previewUrl && (
                <a
                  className="adm-btn adm-btn-default"
                  href={done.email.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Open dev preview of the sent email"
                >
                  View email preview
                </a>
              )}
              <Btn onClick={() => navigate(-1)}>Back</Btn>
              <Btn
                variant="primary"
                onClick={() =>
                  navigate("/admin/salaries/new", {
                    state: { employee, from: "payment-success" },
                  })
                }
              >
                Add Salary Adjustment
              </Btn>
            </div>
          </div>
        </div>

        <div className="adm-card pn-receipt">
          <div className="adm-card-head">
            <h3>Receipt</h3>
            <Badge tone="green">Paid</Badge>
          </div>
          <div className="pn-receipt-body">
            <div className="pn-line">
              <span>Employee</span>
              <strong>{employee?.name}</strong>
            </div>
            <div className="pn-line">
              <span>Method</span>
              <strong>
                {method.toUpperCase()} — {savedPayoutSummary}
              </strong>
            </div>
            <div className="pn-line">
              <span>Amount</span>
              <strong>LKR {Number(amount).toFixed(2)}</strong>
            </div>
            <div className="pn-line">
              <span>Period</span>
              <strong>{done.period}</strong>
            </div>
            {note && (
              <div className="pn-line">
                <span>Note</span>
                <strong>{note}</strong>
              </div>
            )}
            <div className="pn-foot">
              Generated {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="pn-wrap">
      <div className="um-pagehead">
        <div className="um-breadcrumbs">
          Financial Dashboard ▸ Admin ▸ Payments
        </div>
        <div className="um-title-row">
          <div>
            <h2>New Payment</h2>
            <div className="muted-small">
              Paying: <strong>{employee?.name}</strong> ({employee?.email})
            </div>
          </div>
          <div className="adm-row-gap">
            <Btn onClick={() => navigate(-1)} aria-label="Cancel and go back">
              Cancel
            </Btn>
            <Btn
              variant="primary"
              onClick={() => document.getElementById("pn-form").requestSubmit()}
              disabled={!canSubmit}
              aria-disabled={!canSubmit}
            >
              {saving ? "Processing…" : "Pay Now"}
            </Btn>
          </div>
        </div>
      </div>

      <div className="adm-card" style={{ paddingBottom: 10 }}>
        <div className="pn-grid">
          {/* Employee summary */}
          <section className="pn-side" aria-label="Employee Summary">
            <div className="pn-emp">
              <div className="um-avatar" aria-hidden />
              <div>
                <div className="um-empname">{employee?.name}</div>
                <div className="muted-small">{employee?.email}</div>
                <div className="muted-small">
                  {employee?.department || "-"} • {employee?.position || "-"}
                </div>
              </div>
            </div>
            <div className="pn-card mini">
              <div className="pn-card-title">Saved payout (by method)</div>
              <div className="pn-card-body">{savedPayoutSummary}</div>
            </div>
          </section>

          {/* Form */}
          <section className="pn-main" aria-label="Payment Form">
            <form id="pn-form" onSubmit={handleSubmit}>
              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-label">Payout Method</label>
                  <div className="adm-row-gap">
                    {[
                      { key: "cash", icon: faMoneyBillWave, label: "Cash" },
                      { key: "bank", icon: faUniversity, label: "Bank" },
                      { key: "card", icon: faCreditCard, label: "Card" },
                    ].map((m) => (
                      <Btn
                        key={m.key}
                        className="adm-btn-sm"
                        variant={method === m.key ? "dark" : "default"}
                        type="button"
                        onClick={() => setMethod(m.key)}
                        aria-pressed={method === m.key}
                        aria-label={`Select ${m.label} method`}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <FontAwesomeIcon icon={m.icon} />
                          {m.label}
                        </span>
                      </Btn>
                    ))}
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label" htmlFor="pn-amount">
                    Amount (LKR)
                  </label>
                  <input
                    id="pn-amount"
                    className="adm-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    inputMode="decimal"
                    aria-describedby="pn-amount-help"
                  />
                  <div id="pn-amount-help" className="muted-small">
                    Enter the gross payout amount in LKR.
                  </div>
                </div>

                {/* NEW: Period (YYYY-MM) */}
                <div className="adm-form-group">
                  <label className="adm-label" htmlFor="pn-period">
                    Pay Period
                  </label>
                  <div className="adm-row-gap">
                    <input
                      id="pn-period"
                      className="adm-input"
                      type="month"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      required
                      aria-describedby="pn-period-help"
                    />
                    <span
                      className="muted-small"
                      title="Month for which this payment is recorded"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      e.g., 2025-09
                    </span>
                  </div>
                  <div id="pn-period-help" className="muted-small">
                    The salary period (YYYY-MM) this payment covers.
                  </div>
                </div>

                <div className="adm-form-group adm-col-span-2">
                  <label className="adm-label" htmlFor="pn-note">
                    Note (optional)
                  </label>
                  <input
                    id="pn-note"
                    className="adm-input"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g., September salary"
                  />
                </div>
              </div>

              {method === "bank" && (
                <div className="pn-hint">
                  Transfer to {employee?.payout?.bank?.bankName || "bank"}{" "}
                  {employee?.payout?.bank?.accountNumberLast4
                    ? `••••${employee.payout.bank.accountNumberLast4}`
                    : ""}
                  .
                </div>
              )}
              {method === "card" && (
                <div className="pn-hint">
                  Charge {employee?.payout?.card?.brand || "card"}{" "}
                  {employee?.payout?.card?.last4
                    ? `••••${employee.payout.card.last4}`
                    : ""}
                  .
                </div>
              )}

              {error && (
                <div className="adm-alert-error" style={{ marginTop: 10 }}>
                  ⚠ {error}
                </div>
              )}

              <div className="adm-form-actions" style={{ marginTop: 12 }}>
                <Btn onClick={() => navigate(-1)} type="button">
                  Back
                </Btn>
                <Btn variant="primary" type="submit" disabled={!canSubmit}>
                  {saving ? "Processing…" : "Pay Now"}
                </Btn>
              </div>
            </form>
          </section>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
}

/* --------------------------- Styles (scoped) --------------------------- */

const baseStyles = `
  .adm-card{border:1px solid #e5e7eb;border-radius:14px;background:#fff}
  .adm-btn{font-size:14px;border-radius:10px;padding:8px 16px;transition:all .2s}
  .adm-btn:hover{transform:translateY(-1px)}
  .adm-btn-dark{background:#111827;color:#fff;border:none}
  .adm-btn-primary{background:#2563eb;color:#fff;border:none}
  .adm-btn-default{background:#f3f4f6;border:1px solid #d1d5db;color:#374151}
  .adm-badge{padding:.25rem .5rem;border-radius:999px;font-size:12px;font-weight:600}
  .adm-badge-green{background:#ecfdf5;color:#065f46}
  .muted-small{color:#6b7280;font-size:12px}
`;

const styles =
  `
  :root{
    --card-bg:#ffffff;
    --card-bd:#e5e7eb;
    --muted:#6b7280;
    --text:#111827;
    --hover:rgba(17,24,39,.06);
  }

  .pn-wrap{display:flex;flex-direction:column;gap:18px}
  .um-pagehead{display:flex;flex-direction:column;gap:8px}
  .um-title-row{display:flex;justify-content:space-between;align-items:center}
  .um-breadcrumbs{color:var(--muted);font-size:13px}

  .pn-grid{display:grid;grid-template-columns:300px 1fr;gap:18px;padding:16px}
  .pn-side{display:flex;flex-direction:column;gap:16px}
  .pn-emp{display:flex;gap:12px;align-items:center;background:var(--card-bg);border:1px solid var(--card-bd);border-radius:16px;padding:14px;box-shadow:0 2px 6px rgba(0,0,0,.05)}
  .um-avatar{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#f3f4f6,#e5e7eb)}
  .um-empname{font-weight:700;color:var(--text)}

  .pn-card{border:1px solid var(--card-bd);border-radius:16px;background:var(--card-bg);box-shadow:0 2px 6px rgba(0,0,0,.05)}
  .pn-card.mini{padding:14px}
  .pn-card-title{font-size:13px;font-weight:500;color:var(--muted);margin-bottom:6px}
  .pn-card-body{font-weight:600;font-size:15px;color:var(--text)}
  .pn-main{min-width:0;background:var(--card-bg);border-radius:16px;padding:18px;box-shadow:0 2px 6px rgba(0,0,0,.05);border:1px solid var(--card-bd)}

  .adm-form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
  .adm-label{font-size:13px;color:#374151;font-weight:600}
  .adm-input{border:1px solid var(--card-bd);border-radius:10px;padding:10px 12px;font-size:14px;outline:none}
  .adm-input:focus{border-color:#9ca3af;box-shadow:0 0 0 4px rgba(156,163,175,.15)}
  .adm-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .adm-col-span-2{grid-column:span 2}
  .adm-row-gap{display:flex;gap:10px;align-items:center;flex-wrap:wrap}

  .adm-btn{font-size:14px;border-radius:10px;padding:8px 16px;transition:all .2s}
  .adm-btn:hover{transform:translateY(-1px);background:var(--hover)}
  .adm-btn-dark{background:#111827;color:#fff;border:none}
  .adm-btn-dark:hover{filter:brightness(.95)}
  .adm-btn-primary{background:#2563eb;color:#fff;border:none}
  .adm-btn-primary:hover{background:#1e40af}
  .adm-btn-default{background:#f3f4f6;border:1px solid #d1d5db;color:#374151}
  .adm-btn-default:hover{background:#e5e7eb}

  .adm-alert-error{background:#fef2f2;border:1px solid #fca5a5;color:#991b1b;border-radius:10px;padding:10px 14px;font-size:14px}

  .pn-hint{margin-top:10px;color:var(--muted);font-size:13px;font-style:italic}

  .pn-receipt{border-radius:16px;background:var(--card-bg);box-shadow:0 3px 8px rgba(0,0,0,.08);border:1px solid var(--card-bd)}
  .pn-receipt .adm-card-head{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--card-bd)}
  .pn-receipt-body{padding:16px 18px}
  .pn-line{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px dashed var(--card-bd);font-size:15px}
  .pn-line span{color:var(--muted)}
  .pn-foot{padding-top:12px;color:var(--muted);font-size:13px;text-align:right}

  @media(max-width:980px){
    .pn-grid{grid-template-columns:1fr}
    .adm-grid-2{grid-template-columns:1fr}
    .adm-col-span-2{grid-column:auto}
  }
` + baseStyles;
