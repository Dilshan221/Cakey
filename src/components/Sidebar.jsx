import React from "react";

const Sidebar = ({ isActive, toggleSidebar, activeView, setActiveView }) => {
  const menuItems = [
    { icon: "fas fa-menorah", label: "Dashboard", view: "dashboard" },
    { icon: "fas fa-users", label: "User Management", view: "users" },
    { icon: "fas fa-chart-bar", label: "Attendance", view: "attendance" },
    { icon: "fas fa-money-bill-wave", label: "Salary Management", view: "salary" },
    { icon: "fas fa-calculator", label: "Finance Management", view: "finance" },
    { icon: "fas fa-tags", label: "Discount Management", view: "discount" },
    { icon: "fas fa-database", label: "Report", view: "report" },
    { icon: "fas fa-cog", label: "Setting", view: "setting" },
  ];

  return (
    <>
      <div className={`toggle-btn`} onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </div>
      <nav className={isActive ? "active" : ""}>
        <ul>
          <li>
            <a href="#" className="logo">
              <img
                src="https://ui-avatars.com/api/?name=Admin&background=4e54c8&color=fff"
                alt="Admin"
              />
              <span className="nav-item">Admin</span>
            </a>
          </li>
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className={activeView === item.view ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView(item.view);
                }}
              >
                <i className={item.icon}></i>
                <span className="nav-item">{item.label}</span>
              </a>
            </li>
          ))}
          <li>
            <a href="#" className="logout">
              <i className="fas fa-sign-out-alt"></i>
              <span className="nav-item">Log out</span>
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;
