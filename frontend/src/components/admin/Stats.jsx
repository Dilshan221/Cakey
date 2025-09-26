import React from "react";

const Stats = () => {
  const statsData = [
    {
      icon: "fas fa-check-circle",
      value: "85%",
      label: "Present Employees",
      className: "admin-icon-present",
    },
    {
      icon: "fas fa-clock",
      value: "8%",
      label: "Late Arrivals",
      className: "admin-icon-late",
    },
    {
      icon: "fas fa-times-circle",
      value: "7%",
      label: "Absent Today",
      className: "admin-icon-absent",
    },
    {
      icon: "fas fa-users",
      value: "42",
      label: "Total Employees",
      className: "admin-icon-total",
    },
  ];

  return (
    <div className="admin-stats">
      {statsData.map((stat, index) => (
        <div className="admin-stat-card" key={index}>
          <div className={`admin-stat-icon ${stat.className}`}>
            <i className={stat.icon}></i>
          </div>
          <div className="admin-stat-info">
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;