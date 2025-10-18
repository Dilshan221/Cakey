// src/components/admin/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./styles/admin.css"; // Ensure admin styles are imported

const Sidebar = ({ isActive, toggleSidebar }) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: "fas fa-menorah", label: "Dashboard", to: "/admin", exact: true },
    { icon: "fas fa-users", label: "Employee Salary", to: "/admin/users" },
    {
      icon: "fas fa-chart-bar",
      label: "Payment Record",
      to: "/admin/salaries/records",
    },
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    navigate("/"); // or navigate("/login")
  };

  const closeAfterClick = () => {
    if (typeof toggleSidebar === "function") toggleSidebar();
  };

  return (
    <>
      <div className="admin-toggle-btn" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </div>

      <nav className={`admin-nav ${isActive ? "active" : ""}`}>
        <ul>
          <li>
            <a
              href="#"
              className="admin-logo"
              onClick={(e) => e.preventDefault()}
            >
              <span className="admin-nav-item">ADMIN</span>
            </a>
          </li>

          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.exact === true}
                className={({ isActive }) => (isActive ? "active" : undefined)}
                onClick={closeAfterClick}
              >
                <i className={item.icon}></i>
                <span className="admin-nav-item">{item.label}</span>
              </NavLink>
            </li>
          ))}

          <li>
            <a href="#" className="admin-logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span className="admin-nav-item">Log out</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* 🔴 Inline style overrides for red theme */}
      <style>{`
        .admin-nav a.active {
          background: #e53935 !important; /* red active background */
          color: #fff !important;
        }
        .admin-nav a.active i {
          color: #fff !important;
        }
        .admin-nav a:hover {
          background: #ffcdd2 !important; /* light red hover */
          color: #e53935 !important;
        }
        .admin-nav a:hover i {
          color: #e53935 !important;
        }
        .admin-nav .fas {
          color: #e53935 !important; /* default red icons */
        }
        .admin-logo span {
          color: #e53935 !important; /* logo text red */
        }
      `}</style>
    </>
  );
};

export default Sidebar;
