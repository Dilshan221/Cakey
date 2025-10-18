// src/components/admin/Header.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Just navigate to home (or login) when logging out
    navigate("/");
  };

  return (
    <div className="admin-main-top">
      <h1>Finacial Dashobord</h1>
      <div className="admin-user-info">
        <div className="admin-notification">
          <i className="fas fa-bell"></i>
          <span className="admin-notification-count">3</span>
        </div>
        <span style={{ marginRight: "10px", fontSize: "14px" }}>
          Welcome, Admin
        </span>
        <img
          src="https://ui-avatars.com/api/?name=Admin&background=4e54c8&color=fff"
          alt="Admin"
          onClick={handleLogout}
          style={{ cursor: "pointer" }}
          title="Click to logout"
        />
      </div>
    </div>
  );
};

export default Header;
