// src/components/admin/AttendanceList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { apiService } from "../../services/api";

const AttendanceList = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiService.getEmployees();
        setEmployees(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError("Failed to fetch employee data");
      } finally {
        setLoading(false);
      }
    })();

    const onKey = (e) => e.key === "Escape" && setProfileUser(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const stats = useMemo(() => {
    const total = employees.length;
    const salaries = employees
      .map((e) => (typeof e.salary === "number" ? e.salary : 0))
      .filter((n) => Number.isFinite(n));
    const sum = salaries.reduce((a, b) => a + b, 0);
    const avg = salaries.length ? sum / salaries.length : 0;
    const verified = employees.filter((e) => e.phoneVerified).length;
    const verifiedPct = total ? Math.round((verified / total) * 100) : 0;
    return { total, avg, sum, verified, verifiedPct };
  }, [employees]);

  const filtered = useMemo(() => {
    const needle = searchTerm.toLowerCase().trim();
    if (!needle) return employees;
    return employees.filter((u) =>
      [u.name, u.department, u.position, u.email, u.address, u.phone]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
        .some((s) => s.includes(needle))
    );
  }, [employees, searchTerm]);

  const payoutSummary = (u) => {
    const p = u?.payout || {};
    if (p.methodPreferred === "bank") {
      return p.bank?.bankName
        ? `Bank ${p.bank.bankName} ••••${p.bank?.accountNumberLast4 || ""}`
        : "Bank";
    }
    if (p.methodPreferred === "card") {
      return `${p.card?.brand || "Card"} ••••${p.card?.last4 || ""}`;
    }
    if (p.methodPreferred === "finance_manager") return "Finance Manager";
    return "—";
  };

  const modal = {
    backdrop: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.25)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    panel: {
      background: "#fff",
      borderRadius: 12,
      minWidth: 320,
      maxWidth: 500,
      width: "92%",
      padding: 20,
      boxShadow: "0 14px 40px rgba(0,0,0,0.16)",
    },
    row: {
      display: "grid",
      gridTemplateColumns: "160px 1fr",
      gap: 8,
      padding: "6px 0",
      fontSize: 14,
    },
    label: { color: "#666" },
  };

  return (
    <section className="admin-scope admin-attendance">
      <div className="admin-attendance-list">
        <div className="admin-attendance-header" style={{ marginBottom: 10 }}>
          <h1>Employees</h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="admin-search-box">
              <i className="fas fa-search" />
              <input
                type="text"
                placeholder="Search name, dept, position, email…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div
          className="um-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div className="um-stat">
            <div className="um-stat-icon" style={{ background: "#eef2ff" }}>
              <i className="fas fa-users" style={{ color: "#4f46e5" }} />
            </div>
            <div className="um-stat-right">
              <div className="um-stat-value">{stats.total}</div>
              <div className="um-stat-label">Total Employees</div>
            </div>
          </div>

          <div className="um-stat">
            <div className="um-stat-icon" style={{ background: "#ecfeff" }}>
              <i
                className="fas fa-money-bill-wave"
                style={{ color: "#0891b2" }}
              />
            </div>
            <div className="um-stat-right">
              <div className="um-stat-value">
                {stats.avg.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className="um-stat-label">Average Salary</div>
            </div>
          </div>

          <div className="um-stat">
            <div className="um-stat-icon" style={{ background: "#f0fdf4" }}>
              <i className="fas fa-sack-dollar" style={{ color: "#16a34a" }} />
            </div>
            <div className="um-stat-right">
              <div className="um-stat-value">
                {stats.sum.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className="um-stat-label">Total Monthly Payroll</div>
            </div>
          </div>

          <div className="um-stat">
            <div className="um-stat-icon" style={{ background: "#f5f3ff" }}>
              <i className="fas fa-check-circle" style={{ color: "#7c3aed" }} />
            </div>
            <div className="um-stat-right">
              <div className="um-stat-value">{stats.verifiedPct}%</div>
              <div className="um-stat-label">
                Phone Verified ({stats.verified}/{stats.total})
              </div>
            </div>
          </div>
        </div>

        {loading && <div>Loading employees…</div>}
        {error && <div className="adm-alert-error">Error: {error}</div>}

        {!loading && !error && (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: 220 }}>Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th style={{ textAlign: "right" }}>Salary</th>
                  <th>Payout</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th style={{ width: 110 }}>Profile</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div className="muted-small">ID: {u._id.slice(-6)}</div>
                    </td>
                    <td>{u.department || "—"}</td>
                    <td>{u.position || "—"}</td>
                    <td style={{ textAlign: "right" }}>
                      {typeof u.salary === "number" ? u.salary : 0}
                    </td>
                    <td className="muted-small">{payoutSummary(u)}</td>
                    <td className="muted-small">{u.email || "—"}</td>
                    <td className="muted-small">
                      {u.phone || "—"}{" "}
                      {u.phoneVerified ? (
                        <span style={{ color: "#16a34a" }}>• verified</span>
                      ) : (
                        <span style={{ color: "#6b7280" }}>• unverified</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => setProfileUser(u)}
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center" }}>
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {profileUser && (
        <div
          style={modal.backdrop}
          onClick={() => setProfileUser(null)}
          role="dialog"
          aria-modal="true"
        >
          <div style={modal.panel} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 12 }}>{profileUser.name}</h3>

            <div style={modal.row}>
              <div style={modal.label}>Department</div>
              <div>{profileUser.department || "—"}</div>
            </div>
            <div style={modal.row}>
              <div style={modal.label}>Position</div>
              <div>{profileUser.position || "—"}</div>
            </div>
            <div style={modal.row}>
              <div style={modal.label}>Email</div>
              <div>{profileUser.email || "—"}</div>
            </div>
            <div style={modal.row}>
              <div style={modal.label}>Phone</div>
              <div>
                {profileUser.phone || "—"}{" "}
                {profileUser.phoneVerified ? (
                  <span style={{ color: "#16a34a" }}>(verified)</span>
                ) : (
                  <span style={{ color: "#6b7280" }}>(unverified)</span>
                )}
              </div>
            </div>
            <div style={modal.row}>
              <div style={modal.label}>Address</div>
              <div>{profileUser.address || "—"}</div>
            </div>
            <div style={modal.row}>
              <div style={modal.label}>Salary</div>
              <div>
                {typeof profileUser.salary === "number"
                  ? profileUser.salary
                  : 0}
              </div>
            </div>
            <div style={modal.row}>
              <div style={modal.label}>Payout</div>
              <div>{payoutSummary(profileUser)}</div>
            </div>

            <div style={{ marginTop: 12, textAlign: "right" }}>
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => setProfileUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INLINE, NAMESPACED ADMIN CSS */}
      <style>{`
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap");

/* Put variables on the scope root instead of :root */
.admin-scope{
  --admin-primary:#4e54c8;
  --admin-primary-light:#8f94fb;
  --admin-secondary:#34AF6D;
  --admin-dark:#333;
  --admin-light:#f9f9f9;
  --admin-gray:#e0e0e0;
  --admin-danger:#ff4d4d;
  --admin-warning:#ffcc00;
  --admin-shadow:0 4px 20px rgba(0,0,0,0.08);
  font-family:"Poppins",sans-serif;
  color:var(--admin-dark);
}

/* ====== Admin Container / Nav / Main (scoped) ====== */
.admin-scope .admin-container{display:flex;min-height:100vh;background:var(--admin-light)}
.admin-scope .admin-nav{position:fixed;top:0;bottom:0;height:100vh;left:0;width:80px;background:#fff;overflow:hidden;transition:all .3s ease;box-shadow:var(--admin-shadow);z-index:100}
.admin-scope .admin-nav:hover{width:250px}
.admin-scope .admin-logo{display:flex;margin:20px 0 0 20px;padding-bottom:2rem}
.admin-scope .admin-logo img{width:45px;height:45px;border-radius:50%;object-fit:cover}
.admin-scope .admin-logo span{font-weight:bold;padding-left:15px;font-size:18px;text-transform:uppercase;color:var(--admin-primary)}
.admin-scope .admin-nav a{position:relative;width:100%;font-size:14px;color:var(--admin-dark);display:table;padding:15px 20px;transition:all .3s ease;text-decoration:none}
.admin-scope .admin-nav .fas{position:relative;width:70px;height:40px;top:10px;font-size:20px;text-align:center;color:var(--admin-primary)}
.admin-scope .admin-nav-item{position:relative;top:10px;margin-left:10px}
.admin-scope .admin-nav a:hover{background:var(--admin-gray);color:var(--admin-primary)}
.admin-scope .admin-nav a:hover i{color:var(--admin-primary)}
.admin-scope .admin-nav a.active{background:var(--admin-primary);color:#fff}
.admin-scope .admin-nav a.active i{color:#fff}
.admin-scope .admin-nav ul,.admin-scope .admin-nav li{list-style:none;margin:0;padding:0}
.admin-scope .admin-nav .admin-logout{position:absolute;bottom:20px;left:0;right:0}

.admin-scope .admin-main{position:relative;padding:20px;width:calc(100% - 80px);left:80px;transition:all .3s ease}
.admin-scope .admin-main-expanded{width:calc(100% - 250px);left:250px}
.admin-scope .admin-main-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.admin-scope .admin-main-top h1{color:var(--admin-primary);font-size:24px}
.admin-scope .admin-user-info{display:flex;align-items:center;gap:15px}
.admin-scope .admin-user-info img{width:40px;height:40px;border-radius:50%;object-fit:cover}
.admin-scope .admin-notification{position:relative}
.admin-scope .admin-notification-count{position:absolute;top:-5px;right:-5px;background:var(--admin-danger);color:#fff;border-radius:50%;width:18px;height:18px;font-size:12px;display:flex;align-items:center;justify-content:center}
.admin-scope .admin-main-top i{color:var(--admin-primary);cursor:pointer;font-size:20px}

/* ====== Stats / Cards ====== */
.admin-scope .admin-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-bottom:30px}
.admin-scope .admin-stat-card{background:#fff;border-radius:10px;padding:20px;box-shadow:var(--admin-shadow);display:flex;align-items:center;gap:15px}
.admin-scope .admin-stat-icon{width:60px;height:60px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff}
.admin-scope .admin-icon-present{background:var(--admin-secondary)}
.admin-scope .admin-icon-late{background:var(--admin-warning)}
.admin-scope .admin-icon-absent{background:var(--admin-danger)}
.admin-scope .admin-icon-total{background:var(--admin-primary)}
.admin-scope .admin-stat-info h3{font-size:24px;margin-bottom:5px}
.admin-scope .admin-stat-info p{color:#777;font-size:14px}

/* ====== Users cards (kept for reuse) ====== */
.admin-scope .admin-users{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-bottom:30px}
.admin-scope .admin-card{background:#fff;border-radius:10px;padding:20px;box-shadow:var(--admin-shadow);text-align:center;transition:transform .3s ease}
.admin-scope .admin-card:hover{transform:translateY(-5px)}
.admin-scope .admin-card img{width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:15px;border:3px solid var(--admin-primary-light)}
.admin-scope .admin-card h4{text-transform:uppercase;margin-bottom:5px;color:var(--admin-dark)}
.admin-scope .admin-card p{font-size:12px;margin-bottom:15px;text-transform:uppercase;color:#777}
.admin-scope .admin-per{margin:15px 0}
.admin-scope .admin-per table{margin:0 auto;width:100%}
.admin-scope .admin-per span{font-weight:bold;color:var(--admin-primary)}
.admin-scope .admin-per td{font-size:14px;padding:5px}
.admin-scope .admin-card button{width:100%;margin-top:15px;padding:10px;cursor:pointer;border-radius:5px;background:var(--admin-primary);color:#fff;font-weight:500;transition:all .3s ease;border:none}
.admin-scope .admin-card button:hover{background:var(--admin-primary-light)}

/* ====== Attendance list / table ====== */
.admin-scope .admin-attendance{margin-top:20px;text-transform:capitalize}
.admin-scope .admin-attendance-list{width:100%;padding:20px;margin-top:10px;background:#fff;border-radius:10px;box-shadow:var(--admin-shadow);overflow-x:auto}
.admin-scope .admin-attendance-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.admin-scope .admin-attendance-header h1{color:var(--admin-primary);font-size:20px}
.admin-scope .admin-search-box{display:flex;align-items:center;background:var(--admin-light);border-radius:5px;padding:5px 15px}
.admin-scope .admin-search-box input{background:transparent;padding:8px;width:200px;border:none;outline:none}
.admin-scope .admin-search-box i{color:#777}

.admin-scope .admin-table{border-collapse:collapse;width:100%;min-width:800px;font-size:14px}
.admin-scope .admin-table thead tr{color:#fff;background:var(--admin-primary);text-align:left;font-weight:bold}
.admin-scope .admin-table th,.admin-scope .admin-table td{padding:12px 15px}
.admin-scope .admin-table tbody tr{border-bottom:1px solid #ddd}
.admin-scope .admin-table tbody tr:nth-of-type(even){background:#f9f9f9}
.admin-scope .admin-table tbody tr.active{font-weight:bold;color:var(--admin-secondary)}
.admin-scope .admin-table tbody tr:last-of-type{border-bottom:2px solid var(--admin-primary)}
.admin-scope .admin-status{padding:5px 10px;border-radius:20px;font-size:12px;font-weight:500}
.admin-scope .admin-present{background:rgba(52,175,109,.2);color:var(--admin-secondary)}
.admin-scope .admin-late{background:rgba(255,204,0,.2);color:var(--admin-warning)}
.admin-scope .admin-absent{background:rgba(255,77,77,.2);color:var(--admin-danger)}
.admin-scope .admin-table button{padding:6px 15px;border-radius:5px;cursor:pointer;background:transparent;border:1px solid var(--admin-primary);color:var(--admin-primary);transition:all .3s ease}
.admin-scope .admin-table button:hover{background:var(--admin-primary);color:#fff}

/* ====== Forms / Buttons ====== */
.admin-scope .admin-user-form,.admin-scope .admin-mark-attendance-form{background:#fff;padding:20px;border-radius:10px;margin-bottom:20px;box-shadow:var(--admin-shadow)}
.admin-scope .admin-form-group{margin-bottom:15px}
.admin-scope .admin-form-group input,.admin-scope .admin-form-group select{width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;font-size:14px}
.admin-scope .admin-btn{padding:10px 15px;border-radius:5px;cursor:pointer;font-weight:500;transition:all .3s ease;border:none}
.admin-scope .admin-btn-primary{background:var(--admin-primary);color:#fff}
.admin-scope .admin-btn-primary:hover{background:var(--admin-primary-light)}
.admin-scope .admin-btn-danger{background:var(--admin-danger);color:#fff}
.admin-scope .admin-btn-danger:hover{background:#ff6b6b}
.admin-scope .admin-mark-attendance-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;align-items:end}
.admin-scope .admin-mark-attendance-form h3{grid-column:1/-1;margin-bottom:10px;color:var(--admin-primary)}

/* ====== Toggle / Responsive ====== */
.admin-scope .admin-toggle-btn{display:none;position:fixed;top:15px;left:15px;z-index:1000;background:var(--admin-primary);color:#fff;width:40px;height:40px;border-radius:5px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--admin-shadow)}
@media (max-width:1024px){.admin-scope .admin-users{grid-template-columns:repeat(2,1fr)}}
@media (max-width:768px){
  .admin-scope .admin-toggle-btn{display:flex}
  .admin-scope .admin-nav{left:-80px;width:80px}
  .admin-scope .admin-nav.active{left:0}
  .admin-scope .admin-nav:hover.active{width:200px}
  .admin-scope .admin-main{width:100%;left:0}
  .admin-scope .admin-main.active{width:calc(100% - 80px);left:80px}
  .admin-scope .admin-users{grid-template-columns:1fr}
  .admin-scope .admin-stats{grid-template-columns:1fr 1fr}
}
@media (max-width:576px){
  .admin-scope .admin-main-top{flex-direction:column;align-items:flex-start;gap:10px}
  .admin-scope .admin-user-info{align-self:flex-end}
  .admin-scope .admin-stats{grid-template-columns:1fr}
  .admin-scope .admin-search-box input{width:150px}
}

/* --- Local helpers used by this page --- */
.admin-scope .muted-small{color:#6b7280;font-size:12px}
.admin-scope .adm-table-wrap{width:100%;overflow:auto}
.admin-scope .adm-table{width:100%;border-collapse:separate;border-spacing:0}
.admin-scope .adm-table thead th{position:sticky;top:0;background:#fafafa;text-align:left;font-weight:600;color:#374151;padding:12px;border-bottom:1px solid #e5e7eb}
.admin-scope .adm-table tbody td{padding:12px;border-bottom:1px solid #f3f4f6;vertical-align:top}
.admin-scope .um-stat{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #eef;border-radius:14px;padding:12px 14px;box-shadow:0 6px 18px rgba(0,0,0,.04)}
.admin-scope .um-stat-icon{width:44px;height:44px;border-radius:12px;display:grid;place-items:center}
.admin-scope .um-stat-right{display:flex;flex-direction:column}
.admin-scope .um-stat-value{font-size:20px;font-weight:700;line-height:1}
.admin-scope .um-stat-label{font-size:12px;color:#6b7280;margin-top:3px}
.admin-scope .admin-btn{border:1px solid #e5e7eb;background:#fff;border-radius:12px;padding:8px 12px;cursor:pointer}
.admin-scope .admin-btn-primary{background:#111827;color:#fff;border-color:#111827}
      `}</style>
    </section>
  );
};

export default AttendanceList;
