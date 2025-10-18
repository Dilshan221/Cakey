// src/components/user/Admindashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { userMgmtAPI } from "../../services/api";

export default function AdminDashboard()
{
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Hide the global admin header ONLY while this page is mounted
  useEffect(() =>
  {
    const style = document.createElement("style");
    style.id = "ua-hide-admin-header";
    style.textContent = `.admin-header{display:none!important;}`;
    document.head.appendChild(style);
    return () =>
    {
      const el = document.getElementById("ua-hide-admin-header");
      if (el) el.remove();
    };
  }, []);

  //  Inline Styles (scoped) 
  const sx = {
    container: {
      display: "flex",
      margin: 0,
      fontFamily: "Arial, sans-serif",
      background: "#f9f9f9",
      color: "#333",
      minHeight: "100vh",
    },
    sidebar: {
      width: 250,
      background: "#ffe9dc",
      minHeight: "100vh",
      padding: 20,
      boxSizing: "border-box",
      position: "fixed",
      top: 0,
      left: 0,
      borderRight: "1px solid #f0d8cd",
    },
    logoWrap: { textAlign: "center", marginBottom: 30 },
    logoH2: {
      fontFamily: '"Brush Script MT", cursive',
      color: "#e74c3c",
      margin: 0,
      fontSize: 28,
      letterSpacing: 0.5,
    },
    nav: { marginTop: 10 },
    linkBase: {
      display: "block",
      textDecoration: "none",
      padding: "12px 10px",
      color: "#333",
      margin: "6px 0",
      borderRadius: 8,
      transition: "background .2s, color .2s",
      fontWeight: 600,
      fontSize: 14,
    },
    linkActive: { background: "#ff6f61", color: "#fff" },
    main: {
      marginLeft: 250,
      padding: 30,
      width: "100%",
      boxSizing: "border-box",
    },
    title: { fontSize: 24, marginBottom: 18, color: "#e74c3c" },

    // Cards
    cardRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 16,
      marginBottom: 24,
    },
    card: {
      background: "#fff",
      padding: 18,
      borderRadius: 12,
      boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
    },
    cardLabel: { fontSize: 13, color: "#666", margin: 0 },
    cardVal: { fontSize: 28, color: "#ff6f61", margin: "4px 0 0" },

    // Panels
    panel: {
      background: "#fff",
      padding: 18,
      borderRadius: 12,
      boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
      marginBottom: 20,
    },
    panelHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    panelTitle: { margin: 0, fontSize: 16, color: "#333" },
    search: {
      border: "1px solid #ddd",
      borderRadius: 8,
      padding: "8px 10px",
      fontSize: 14,
      outline: "none",
    },

    // Table
    tableWrap: { overflowX: "auto" },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: 900,
    },
    th: {
      textAlign: "left",
      padding: "12px 12px",
      background: "#ff6f61",
      color: "#fff",
      fontWeight: 600,
      fontSize: 14,
      whiteSpace: "nowrap",
    },
    td: {
      padding: "12px 12px",
      borderBottom: "1px solid #eee",
      fontSize: 14,
      whiteSpace: "nowrap",
    },

    // Pills + Buttons
    badge: (bg, color = "#fff") => ({
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 999,
      fontSize: 12,
      background: bg,
      color,
    }),
    btn: {
      padding: "8px 12px",
      fontSize: 13,
      border: "1px solid #ddd",
      borderRadius: 8,
      background: "#fff",
      cursor: "pointer",
      transition: ".2s",
    },
    btnPrimary: { borderColor: "#ff6f61", color: "#ff6f61" },
    btnDanger: { borderColor: "#e74c3c", color: "#e74c3c" },
    btnSolid: { background: "#ff6f61", color: "#fff", borderColor: "#ff6f61" },

    // Modal
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 16,
    },
    modal: {
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 10px 30px rgba(0,0,0,.2)",
      width: "min(800px, 100%)",
      maxHeight: "85vh",
      overflow: "auto",
    },
    modalHeader: {
      padding: "16px 18px",
      borderBottom: "1px solid #eee",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    modalTitle: { margin: 0, fontSize: 18 },
    modalBody: { padding: 18 },

    // Form
    row: { display: "flex", gap: 16 },
    col: { flex: 1 },
    label: { display: "block", fontSize: 13, color: "#666", marginBottom: 6 },
    input: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #ddd",
      borderRadius: 8,
      fontSize: 14,
      outline: "none",
    },
    select: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #ddd",
      borderRadius: 8,
      fontSize: 14,
      outline: "none",
      background: "#fff",
    },
    formActions: {
      display: "flex",
      gap: 10,
      marginTop: 16,
      justifyContent: "flex-end",
    },

    // Alerts
    alert: (bg, color = "#333") => ({
      padding: "10px 12px",
      borderRadius: 8,
      background: bg,
      color,
      marginBottom: 10,
      fontSize: 14,
    }),
  };

  //  Demo stats (optional) 
  const [stats, setStats] = useState([
    { label: "Total Users", value: 0 },
    { label: "Admins", value: 0 },
    { label: "Active", value: 0 },
    { label: "Newsletter", value: 0 },
  ]);

  //  CRUD state 
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null); // null = closed; {} = create

  const filtered = useMemo(() =>
  {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.firstname?.toLowerCase().includes(term) ||
        u.lastname?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term)
    );
  }, [q, users]);

  //  Data load 
  const refresh = async () =>
  {
    setLoading(true);
    setErrorMsg("");
    try
    {
      const list = await userMgmtAPI.list();
      setUsers(list || []);
      // quick stats
      const admins = (list || []).filter((u) => u.role === "admin").length;
      const active = (list || []).filter((u) => u.isActive !== false).length;
      const newsletter = (list || []).filter((u) => u.newsletter).length;
      setStats([
        { label: "Total Users", value: list?.length || 0 },
        { label: "Admins", value: admins },
        { label: "Active", value: active },
        { label: "Newsletter", value: newsletter },
      ]);
    } catch (e)
    {
      setErrorMsg(e.message || "Failed to load users");
    } finally
    {
      setLoading(false);
    }
  };

  useEffect(() =>
  {
    refresh();
  }, []);

  //  Actions 
  const onDelete = async (u) =>
  {
    if (!window.confirm(`Delete user "${u.firstname} ${u.lastname}"?`)) return;
    try
    {
      await userMgmtAPI.remove(u._id);
      setUsers((prev) => prev.filter((x) => x._id !== u._id));
    } catch (e)
    {
      alert(e.message || "Delete failed");
    }
  };

  //  Form component 
  const UserForm = ({ initial, onClose, onSaved }) =>
  {
    const isEdit = !!initial?._id;
    const [form, setForm] = useState({
      firstname: initial?.firstname || "",
      lastname: initial?.lastname || "",
      email: initial?.email || "",
      password: "",
      birthday: initial?.birthday ? initial.birthday.slice(0, 10) : "",
      newsletter: !!initial?.newsletter,
      role: initial?.role || "customer",
      isActive: initial?.isActive !== false,
    });
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState("");

    const setVal = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const save = async (e) =>
    {
      e.preventDefault();
      setSubmitting(true);
      setMsg("");

      try
      {
        const payload = {
          firstname: form.firstname,
          lastname: form.lastname,
          email: form.email,
          birthday: form.birthday || null,
          newsletter: !!form.newsletter,
          role: form.role,
          isActive: !!form.isActive,
        };
        if (!isEdit || form.password) payload.password = form.password;

        let saved;
        if (isEdit)
        {
          saved = await userMgmtAPI.update(initial._id, payload);
        } else
        {
          saved = await userMgmtAPI.create(payload);
        }
        onSaved && onSaved(saved);
      } catch (e)
      {
        setMsg(e.message || "Save failed");
      } finally
      {
        setSubmitting(false);
      }
    };

    return (
      <div style={sx.overlay}>
        <div style={sx.modal}>
          <div style={sx.modalHeader}>
            <h3 style={sx.modalTitle}>{isEdit ? "Edit User" : "Add User"}</h3>
            <button
              onClick={onClose}
              style={{ ...sx.btn, ...sx.btnDanger, borderColor: "#ddd" }}
            >
              ✕
            </button>
          </div>
          <div style={sx.modalBody}>
            {msg && <div style={sx.alert("#fdecea", "#c0392b")}>{msg}</div>}

            <form onSubmit={save}>
              <div style={{ ...sx.row, marginBottom: 12 }}>
                <div style={sx.col}>
                  <label style={sx.label}>First name</label>
                  <input
                    style={sx.input}
                    value={form.firstname}
                    onChange={(e) => setVal("firstname", e.target.value)}
                    required
                  />
                </div>
                <div style={sx.col}>
                  <label style={sx.label}>Last name</label>
                  <input
                    style={sx.input}
                    value={form.lastname}
                    onChange={(e) => setVal("lastname", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ ...sx.row, marginBottom: 12 }}>
                <div style={sx.col}>
                  <label style={sx.label}>Email</label>
                  <input
                    type="email"
                    style={sx.input}
                    value={form.email}
                    onChange={(e) => setVal("email", e.target.value)}
                    required
                  />
                </div>
                <div style={sx.col}>
                  <label style={sx.label}>
                    {isEdit ? "New Password (optional)" : "Password"}
                  </label>
                  <input
                    type="password"
                    style={sx.input}
                    value={form.password}
                    onChange={(e) => setVal("password", e.target.value)}
                    placeholder={isEdit ? "Leave blank to keep current" : ""}
                    {...(isEdit ? {} : { required: true })}
                  />
                </div>
              </div>

              <div style={{ ...sx.row, marginBottom: 12 }}>
                <div style={sx.col}>
                  <label style={sx.label}>Birthday</label>
                  <input
                    type="date"
                    style={sx.input}
                    value={form.birthday || ""}
                    onChange={(e) => setVal("birthday", e.target.value)}
                  />
                </div>
                <div style={sx.col}>
                  <label style={sx.label}>Role</label>
                  <select
                    style={sx.select}
                    value={form.role}
                    onChange={(e) => setVal("role", e.target.value)}
                  >
                    <option value="customer">customer</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>

              <div style={{ ...sx.row, marginBottom: 12 }}>
                <label
                  style={{
                    ...sx.label,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.newsletter}
                    onChange={(e) => setVal("newsletter", e.target.checked)}
                  />
                  Subscribe to newsletter
                </label>

                <label
                  style={{
                    ...sx.label,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setVal("isActive", e.target.checked)}
                  />
                  Active
                </label>
              </div>

              <div style={sx.formActions}>
                <button type="button" style={sx.btn} onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...sx.btn,
                    ...sx.btnSolid,
                    opacity: submitting ? 0.7 : 1,
                  }}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : isEdit ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  //  View component 
  const UserView = ({ user, onClose }) =>
  {
    if (!user) return null;
    return (
      <div style={sx.overlay}>
        <div style={sx.modal}>
          <div style={sx.modalHeader}>
            <h3 style={sx.modalTitle}>User Details</h3>
            <button
              onClick={onClose}
              style={{ ...sx.btn, ...sx.btnDanger, borderColor: "#ddd" }}
            >
              ✕
            </button>
          </div>
          <div style={sx.modalBody}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Detail
                label="Name"
                value={`${user.firstname} ${user.lastname}`}
              />
              <Detail label="Email" value={user.email} />
              <Detail label="Role" value={user.role} />
              <Detail label="Active" value={user.isActive ? "Yes" : "No"} />
              <Detail
                label="Birthday"
                value={
                  user.birthday
                    ? new Date(user.birthday).toLocaleDateString()
                    : "—"
                }
              />
              <Detail
                label="Newsletter"
                value={user.newsletter ? "Yes" : "No"}
              />
              <Detail
                label="Created"
                value={new Date(user.createdAt).toLocaleString()}
              />
              <Detail
                label="Updated"
                value={new Date(user.updatedAt).toLocaleString()}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Detail = ({ label, value }) => (
    <div>
      <div style={{ fontSize: 12, color: "#777" }}>{label}</div>
      <div style={{ fontSize: 15, color: "#333" }}>{value}</div>
    </div>
  );

  //  Render UI 
  return (
    <div style={sx.container}>
      {/* Inline-styled sidebar */}
      <aside style={sx.sidebar}>
        <div style={sx.logoWrap}>
          <h2 style={sx.logoH2}>Cake &amp; Bake</h2>
        </div>

        <nav style={sx.nav}>
          <NavLink
            to="/useradmin"
            end
            style={({ isActive }) => ({
              ...sx.linkBase,
              ...(isActive ? sx.linkActive : {}),
            })}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/adminmanager"
            style={({ isActive }) => ({
              ...sx.linkBase,
              ...(isActive ? sx.linkActive : {}),
            })}
          >
            Administration
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main style={sx.main}>
        <h2 style={sx.title}>Admin Dashboard</h2>

        {/* Stats */}
        <section style={sx.cardRow}>
          {stats.map((c) => (
            <div key={c.label} style={sx.card}>
              <p style={sx.cardLabel}>{c.label}</p>
              <p style={sx.cardVal}>{c.value}</p>
            </div>
          ))}
        </section>

        {/* Users Panel */}
        <section style={sx.panel}>
          <div style={sx.panelHeader}>
            <h3 style={sx.panelTitle}>Users</h3>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                style={sx.search}
                placeholder="Search users…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button
                style={{ ...sx.btn, ...sx.btnSolid }}
                onClick={() => setEditUser({})}
              >
                + Add User
              </button>
            </div>
            <div style={{ marginBottom: 20 }}>
              <button
                style={{ ...sx.btn, ...sx.btnSolid }}
                onClick={() => navigate("/adminmanager")}
              >
                Go to Admin Manager
              </button>
            </div>
          </div>

          {errorMsg && (
            <div style={sx.alert("#fdecea", "#c0392b")}>{errorMsg}</div>
          )}
          {loading && (
            <div style={sx.alert("#fff3cd", "#7a5c00")}>Loading…</div>
          )}

          <div style={sx.tableWrap}>
            <table style={sx.table}>
              <thead>
                <tr>
                  <th style={sx.th}>Name</th>
                  <th style={sx.th}>Email</th>
                  <th style={sx.th}>Role</th>
                  <th style={sx.th}>Active</th>
                  <th style={sx.th}>Newsletter</th>
                  <th style={sx.th}>Created</th>
                  <th style={sx.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td style={sx.td}>
                      {u.firstname} {u.lastname}
                    </td>
                    <td style={sx.td}>{u.email}</td>
                    <td style={sx.td}>
                      <span style={sx.badge("#e3e7ff", "#4e54c8")}>
                        {u.role}
                      </span>
                    </td>
                    <td style={sx.td}>
                      <span
                        style={sx.badge(
                          u.isActive ? "rgba(52,175,109,.85)" : "#eee",
                          u.isActive ? "#fff" : "#333"
                        )}
                      >
                        {u.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                    <td style={sx.td}>{u.newsletter ? "Yes" : "No"}</td>
                    <td style={sx.td}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={sx.td}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          style={{ ...sx.btn, ...sx.btnPrimary }}
                          onClick={() => setViewUser(u)}
                        >
                          View
                        </button>
                        <button
                          style={{ ...sx.btn, ...sx.btnPrimary }}
                          onClick={() => setEditUser(u)}
                        >
                          Edit
                        </button>
                        <button
                          style={{ ...sx.btn, ...sx.btnDanger }}
                          onClick={() => onDelete(u)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td style={sx.td} colSpan={7}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modals */}
      {viewUser && (
        <UserView user={viewUser} onClose={() => setViewUser(null)} />
      )}
      {editUser !== null && (
        <UserForm
          initial={editUser && editUser._id ? editUser : null}
          onClose={() => setEditUser(null)}
          onSaved={() =>
          {
            setEditUser(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
