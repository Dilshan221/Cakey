import React from "react";
import { useState, useEffect } from "react";
import { apiService } from "../services/api";

const Stats = () => {
  const [stats, setStats] = useState({
    totalEmployees: 42,
    presentPercentage: 85,
    latePercentage: 8,
    absentPercentage: 7,
    totalSalaryPaid: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch finance summary for current month
      const currentDate = new Date();
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const financeSummary = await apiService.getFinanceSummary({ startDate, endDate });
      
      setStats(prev => ({
        ...prev,
        totalSalaryPaid: financeSummary.salaries.total,
        monthlyRevenue: financeSummary.sales.total,
        monthlyExpenses: financeSummary.expenses.total,
      }));
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const statsData = [
    {
      icon: "fas fa-check-circle",
      value: `${stats.presentPercentage}%`,
      label: "Present Employees",
      className: "icon-present",
    },
    {
      icon: "fas fa-clock",
      value: `${stats.latePercentage}%`,
      label: "Late Arrivals",
      className: "icon-late",
    },
    {
      icon: "fas fa-times-circle",
      value: `${stats.absentPercentage}%`,
      label: "Absent Today",
      className: "icon-absent",
    },
    {
      icon: "fas fa-users",
      value: stats.totalEmployees.toString(),
      label: "Total Employees",
      className: "icon-total",
    },
    {
      icon: "fas fa-money-bill-wave",
      value: `$${stats.totalSalaryPaid.toLocaleString()}`,
      label: "Monthly Salaries",
      className: "icon-late",
    },
    {
      icon: "fas fa-chart-line",
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      label: "Monthly Revenue",
      className: "icon-present",
    },
    {
      icon: "fas fa-credit-card",
      value: `$${stats.monthlyExpenses.toLocaleString()}`,
      label: "Monthly Expenses",
      className: "icon-absent",
    },
    {
      icon: "fas fa-calculator",
      value: `$${(stats.monthlyRevenue - stats.monthlyExpenses - stats.totalSalaryPaid).toLocaleString()}`,
      label: "Net Profit",
      className: stats.monthlyRevenue - stats.monthlyExpenses - stats.totalSalaryPaid >= 0 ? "icon-present" : "icon-absent",
    },
  ];

  return (
    <div className="stats">
      {statsData.map((stat, index) => (
        <div className="stat-card" key={index}>
          <div className={`stat-icon ${stat.className}`}>
            <i className={stat.icon}></i>
          </div>
          <div className="stat-info">
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;
