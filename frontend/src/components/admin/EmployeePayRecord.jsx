import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiService } from "../../services/api";

// UI atoms
const Badge = ({ tone = "gray", children }) => (
  <span className={`adm-badge adm-badge-${tone}`}>{children}</span>
);
const Btn = ({ variant = "default", className = "", ...props }) => (
  <button className={`adm-btn adm-btn-${variant} ${className}`} {...props} />
);

function resolvePayMethod(emp) {
  const pref = emp?.payout?.methodPreferred;
  if (pref === "bank" || pref === "card") return pref;
  return "cash";
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

export default function EmployeePayRecord() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const preselectedEmployee = state?.employee || null;

  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState(preselectedEmployee?._id || "");
  const [period, setPeriod] = useState(""); // "YYYY-MM" (optional filter)
  const [status, setStatus] = useState(""); // "paid" | ...
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Prefetch employees
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const emps = await apiService.getEmployees();
        const list = Array.isArray(emps) ? emps : [];
        setEmployees(list);
      } catch (e) {
        setErr(e?.data?.message || e?.message || "Failed to load employees");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedEmp = useMemo(
    () =>
      employees.find((e) => e._id === employeeId) ||
      preselectedEmployee ||
      null,
    [employees, employeeId, preselectedEmployee]
  );

  const fetchRecords = async (page = 1) => {
    if (!employeeId) {
      setRecords([]);
      setMeta({ total: 0, page: 1, pages: 1 });
      return;
    }
    try {
      setLoading(true);
      setErr("");
      const query = { employeeId, page, limit: 20 };
      if (period) query.period = period;
      if (status) query.status = status;

      const resp = await apiService.listSalaryRecords(query);
      // Controller returns {items, total, page, pages}
      const items = Array.isArray(resp) ? resp : resp?.items || [];
      setRecords(items);
      setMeta({
        total: resp?.total ?? items.length,
        page: resp?.page ?? page,
        pages: resp?.pages ?? 1,
      });
    } catch (e) {
      setErr(e?.data?.message || e?.message || "Failed to load salary records");
    } finally {
      setLoading(false);
    }
  };

  // load when filters change
  useEffect(() => {
    fetchRecords(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, period, status]);

  const goToPayment = () => {
    if (!selectedEmp) return;
    navigate("/admin/payments/new", {
      state: {
        from: "pay-records",
        employee: selectedEmp,
        payoutMethod: resolvePayMethod(selectedEmp),
      },
    });
  };

  const totalPaid = useMemo(
    () => records.reduce((sum, r) => sum + (Number(r.paidAmount) || 0), 0),
    [records]
  );

  return (
    <div className="pr-wrap">
      <div className="um-pagehead">
        <div className="um-breadcrumbs">
          Financial Dashboard ▸ Admin ▸ Pay Records
        </div>
        <div className="um-title-row">
          <div>
            <h2>Employee Pay Records</h2>
            <div className="muted-small">
              View salary payouts by period. Filter by employee and status.
            </div>
          </div>
          <div className="adm-row-gap">
            <Btn onClick={() => navigate(-1)}>Back</Btn>
            {selectedEmp && (
              <Btn variant="primary" onClick={goToPayment}>
                Pay {selectedEmp.name}
              </Btn>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="adm-card" style={{ padding: 14 }}>
        <div className="adm-grid-2">
          <div className="adm-form-group">
            <label className="adm-label">Employee</label>
            <select
              className="adm-input"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">— Select employee —</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name} ({e.email})
                </option>
              ))}
            </select>
          </div>

          <div className="adm-form-group">
            <label className="adm-label">Period (YYYY-MM)</label>
            <input
              className="adm-input"
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-label">Status</label>
            <select
              className="adm-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Any</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="void">Void</option>
            </select>
          </div>

          {selectedEmp && (
            <div className="adm-form-group">
              <label className="adm-label">Saved Payout</label>
              <div
                className="adm-input"
                style={{ display: "flex", alignItems: "center" }}
              >
                {payoutSummary(selectedEmp)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {selectedEmp && (
        <div className="adm-card" style={{ padding: 14 }}>
          <div
            className="adm-card-head"
            style={{ padding: 0, borderBottom: 0 }}
          >
            <h3 style={{ margin: 0 }}>{selectedEmp.name}</h3>
            <Badge tone="gray">{records.length} records</Badge>
          </div>
          <div className="muted-small">
            Total paid (shown): <strong>LKR {totalPaid.toFixed(2)}</strong>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="adm-card">
        <div className="adm-card-head">
          <h3>Pay History</h3>
          <Badge tone="gray">
            Page {meta.page} / {meta.pages}
          </Badge>
        </div>

        {err && <div className="adm-alert-error">⚠ {err}</div>}

        {loading ? (
          <div className="um-skeleton">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="um-skel-row" />
            ))}
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Paid Amount</th>
                  <th>Base</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Reference</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {records.length ? (
                  records.map((r) => (
                    <tr key={r._id}>
                      <td className="muted-small">{r.period}</td>
                      <td>
                        <strong>
                          {r.currency || "LKR"}{" "}
                          {Number(r.paidAmount).toFixed(2)}
                        </strong>
                      </td>
                      <td className="muted-small">
                        {Number(r.baseSalary || 0).toFixed(2)}
                      </td>
                      <td className="muted-small">
                        {(r.method || "").toUpperCase()}
                      </td>
                      <td>
                        {r.status === "paid" ? (
                          <Badge tone="green">Paid</Badge>
                        ) : (
                          <Badge>{r.status || "—"}</Badge>
                        )}
                      </td>
                      <td className="muted-small">
                        {r.paymentReference || "—"}
                      </td>
                      <td className="muted-small">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      {employeeId
                        ? "No records for this employee"
                        : "Select an employee to view"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pager */}
        {meta.pages > 1 && (
          <div
            style={{
              padding: 12,
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
            }}
          >
            <Btn
              disabled={meta.page <= 1}
              onClick={() => fetchRecords(meta.page - 1)}
              className="adm-btn-sm"
            >
              Prev
            </Btn>
            <Btn
              disabled={meta.page >= meta.pages}
              onClick={() => fetchRecords(meta.page + 1)}
              className="adm-btn-sm"
            >
              Next
            </Btn>
          </div>
        )}
      </div>

      {/* local styles */}
      <style>{`
        .pr-wrap{display:flex;flex-direction:column;gap:14px}
        .um-pagehead{position:sticky;top:0;background:linear-gradient(180deg,#ffffff,rgba(255,255,255,.92));backdrop-filter:saturate(180%) blur(6px);z-index:20;border-bottom:1px solid #eee;padding:12px 10px}
        .um-breadcrumbs{font-size:12px;color:#6b7280;margin-bottom:4px}
        .um-title-row{display:flex;align-items:center;justify-content:space-between;gap:12px}

        .adm-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.05)}
        .adm-card-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #f1f5f9}
        .adm-table-wrap{width:100%;overflow:auto}
        .adm-table{width:100%;border-collapse:separate;border-spacing:0}
        .adm-table thead th{position:sticky;top:0;background:#fafafa;text-align:left;font-weight:600;color:#374151;padding:12px;border-bottom:1px solid #e5e7eb}
        .adm-table tbody td{padding:12px;border-bottom:1px solid #f3f4f6;vertical-align:top}

        .adm-input{border:1px solid #e5e7eb;border-radius:12px;padding:10px 12px;background:#fff;outline:none;width:100%}
        .adm-grid-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
        .adm-label{display:block;font-size:12px;color:#6b7280;margin-bottom:6px}

        .adm-btn{border:1px solid #e5e7eb;background:#fff;border-radius:12px;padding:8px 12px;cursor:pointer;transition:.2s;white-space:nowrap}
        .adm-btn:hover{box-shadow:0 4px 12px rgba(0,0,0,.06)}
        .adm-btn-sm{padding:6px 10px;border-radius:10px;font-size:13px}
        .adm-btn-dark{background:#000;color:#fff;border-color:#000}
        .adm-btn-dark:hover{filter:brightness(0.92)}

        .adm-badge{display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;border:1px solid #e5e7eb;color:#374151;background:#f9fafb}
        .adm-badge-green{background:#ecfdf5;border-color:#a7f3d0;color:#065f46}

        .um-skeleton{padding:12px}
        .um-skel-row{height:44px;border-radius:10px;background:linear-gradient(90deg,#f3f4f6,#eef2ff,#f3f4f6);background-size:200% 100%;animation:skel 1.4s ease-in-out infinite;margin-bottom:8px}
        @keyframes skel{0%{background-position:0 0}100%{background-position:200% 0}}

        @media(max-width:980px){
          .adm-grid-2{grid-template-columns:1fr}
        }
      `}</style>
    </div>
  );
}
