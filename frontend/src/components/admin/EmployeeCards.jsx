// src/components/admin/EmployeeCards.jsx
import React, { useEffect, useMemo, useState } from "react";
import { apiService } from "../../services/api";

function getAvatar(user) {
  return (
    user?.avatar ||
    user?.photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "User"
    )}&background=4e54c8&color=fff&bold=true`
  );
}

function payoutSummary(u) {
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
}

const EmployeeCards = () => {
  const [employees, setEmployees] = useState([]);
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

  const cards = useMemo(() => employees, [employees]);

  return (
    <section>
      {loading && <div>Loading employees…</div>}
      {error && <div className="adm-alert-error">Error: {error}</div>}

      {!loading && !error && (
        <div className="admin-users">
          {cards.map((u) => (
            <div className="admin-card" key={u._id || u.email || u.name}>
              <img src={getAvatar(u)} alt={u.name || "Employee"} />
              <h4>{u.name || "Unnamed"}</h4>
              <p>{u.position || "—"}</p>

              {/* small info row instead of month/year */}
              <div className="emp-mini">
                <div>
                  <span className="label">Dept</span>
                  <span className="value">{u.department || "—"}</span>
                </div>
                <div>
                  <span className="label">Salary</span>
                  <span className="value">
                    {typeof u.salary === "number" ? u.salary : 0}
                  </span>
                </div>
              </div>

              <button onClick={() => setProfileUser(u)}>Profile</button>
            </div>
          ))}

          {cards.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center" }}>
              No employees found.
            </div>
          )}
        </div>
      )}

      {/* Profile Modal */}
      {profileUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setProfileUser(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              minWidth: 320,
              maxWidth: 520,
              width: "92%",
              padding: 20,
              boxShadow: "0 14px 40px rgba(0,0,0,0.16)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <img
                src={getAvatar(profileUser)}
                alt={profileUser.name}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #8f94fb",
                }}
              />
              <div>
                <h3 style={{ margin: 0 }}>{profileUser.name}</h3>
                <div className="muted-small">
                  {profileUser.position || "—"}{" "}
                  {profileUser.department ? `• ${profileUser.department}` : ""}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, fontSize: 14 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr",
                  gap: 6,
                  padding: "4px 0",
                }}
              >
                <div style={{ color: "#666" }}>Email</div>
                <div>{profileUser.email || "—"}</div>

                <div style={{ color: "#666" }}>Phone</div>
                <div>
                  {profileUser.phone || "—"}{" "}
                  {profileUser.phoneVerified ? (
                    <span style={{ color: "#16a34a" }}>(verified)</span>
                  ) : (
                    <span style={{ color: "#6b7280" }}>(unverified)</span>
                  )}
                </div>

                <div style={{ color: "#666" }}>Address</div>
                <div>{profileUser.address || "—"}</div>

                <div style={{ color: "#666" }}>Salary</div>
                <div>
                  {typeof profileUser.salary === "number"
                    ? profileUser.salary
                    : 0}
                </div>

                <div style={{ color: "#666" }}>Payout</div>
                <div>{payoutSummary(profileUser)}</div>
              </div>
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

      {/* styles */}
      <style>{`
        .muted-small{color:#6b7280;font-size:12px}
        .adm-alert-error{background:#fee2e2;border:1px solid #fecaca;color:#7f1d1d;padding:10px;border-radius:8px}

        /* --- Fixed-size employee cards grid --- */
        .admin-users{
          display: grid;
          grid-template-columns: repeat(auto-fill, 280px);
          gap: 20px;
          justify-content: center; /* use flex-start for left alignment */
        }

        .admin-card{
          width: 280px;
          min-height: 300px;
          background: #fff;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          transition: transform 0.3s ease;
        }

        .admin-card:hover{ transform: translateY(-5px); }

        .admin-card img{
          width: 80px; height: 80px; border-radius: 50%;
          object-fit: cover; margin-bottom: 6px; border: 3px solid #8f94fb;
        }

        .admin-card h4{
          text-transform: uppercase; margin: 0; color: #333;
          max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        .admin-card p{ font-size: 12px; text-transform: uppercase; color: #777; margin: 0; }

        /* compact info row (replaces month/year) */
        .emp-mini{
          width: 100%;
          border: 1px solid #eef;
          background: #fafafa;
          border-radius: 8px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 8px;
          font-size: 12px;
        }
        .emp-mini .label{ color:#6b7280; display:block; }
        .emp-mini .value{ font-weight:600; color:#111827; }

        .admin-card button{
          width: 100%;
          margin-top: 6px;
          padding: 10px;
          cursor: pointer;
          border-radius: 5px;
          background: #4e54c8;
          color: white;
          font-weight: 500;
          transition: all 0.3s ease;
          border: none;
        }
        .admin-card button:hover{ background: #8f94fb; }
      `}</style>
    </section>
  );
};

export default EmployeeCards;
