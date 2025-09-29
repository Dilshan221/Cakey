import React from "react";

const Header = () => {
  return (
    <div className="main-top">
      <h1>Attendance Dashboard</h1>
      <div className="user-info">
        <div className="notification">
          <i className="fas fa-bell"></i>
          <span className="notification-count">3</span>
        </div>
        <img
          src="https://ui-avatars.com/api/?name=Admin&background=4e54c8&color=fff"
          alt="Admin"
        />
      </div>
    </div>
  );
};

export default Header;
