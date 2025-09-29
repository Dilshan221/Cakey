import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";

const SalaryManagement = () => {
  const [salaries, setSalaries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: "",
    userId: "",
  });
  const [formData, setFormData] = useState({
    userId: "",
    basicSalary: "",
    allowances: "",
    deductions: "",
    overtime: "",
    bonus: "",
    payPeriod: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
    status: "pending",
  });

  useEffect(() => {
    fetchSalaries();
    fetchUsers();
  }, [filters]);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSalaries(filters);
      setSalaries(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch salary data");
      console.error("Error fetching salaries:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("payPeriod.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        payPeriod: {
          ...prev.payPeriod,
          [field]: parseInt(value),
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSalary) {
        await apiService.updateSalary(editingSalary._id, formData);
      } else {
        await apiService.createSalary(formData);
      }
      resetForm();
      fetchSalaries();
    } catch (err) {
      setError("Failed to save salary record");
      console.error("Error saving salary:", err);
    }
  };

  const handleEdit = (salary) => {
    setEditingSalary(salary);
    setFormData({
      userId: salary.userId._id,
      basicSalary: salary.basicSalary,
      allowances: salary.allowances,
      deductions: salary.deductions,
      overtime: salary.overtime,
      bonus: salary.bonus,
      payPeriod: salary.payPeriod,
      status: salary.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this salary record?")) {
      try {
        await apiService.deleteSalary(id);
        fetchSalaries();
      } catch (err) {
        setError("Failed to delete salary record");
        console.error("Error deleting salary:", err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      basicSalary: "",
      allowances: "",
      deductions: "",
      overtime: "",
      bonus: "",
      payPeriod: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      },
      status: "pending",
    });
    setShowForm(false);
    setEditingSalary(null);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "status present";
      case "pending":
        return "status late";
      case "cancelled":
        return "status absent";
      default:
        return "status";
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (loading) return <div className="attendance-list">Loading salary data...</div>;

  return (
    <div className="attendance-list">
      <div className="attendance-header">
        <h1>Salary Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Add Salary Record"}
        </button>
      </div>

      {/* Filters */}
      <div className="salary-filters" style={{ marginBottom: "20px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
        <select name="month" value={filters.month} onChange={handleFilterChange}>
          {months.map((month, index) => (
            <option key={index} value={index + 1}>{month}</option>
          ))}
        </select>
        <select name="year" value={filters.year} onChange={handleFilterChange}>
          {[2023, 2024, 2025].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select name="userId" value={filters.userId} onChange={handleFilterChange}>
          <option value="">All Employees</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>{user.name}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="user-form">
          <h3>{editingSalary ? "Edit Salary Record" : "Add New Salary Record"}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
              <div className="form-group">
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Employee</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} - {user.department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="basicSalary"
                  placeholder="Basic Salary"
                  value={formData.basicSalary}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="allowances"
                  placeholder="Allowances"
                  value={formData.allowances}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="deductions"
                  placeholder="Deductions"
                  value={formData.deductions}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="overtime"
                  placeholder="Overtime Pay"
                  value={formData.overtime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="bonus"
                  placeholder="Bonus"
                  value={formData.bonus}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <select
                  name="payPeriod.month"
                  value={formData.payPeriod.month}
                  onChange={handleInputChange}
                  required
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <select
                  name="payPeriod.year"
                  value={formData.payPeriod.year}
                  onChange={handleInputChange}
                  required
                >
                  {[2023, 2024, 2025].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: "15px" }}>
              <button type="submit" className="btn btn-primary" style={{ marginRight: "10px" }}>
                {editingSalary ? "Update" : "Create"} Salary Record
              </button>
              <button type="button" className="btn btn-danger" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div style={{ color: "red", margin: "10px 0" }}>{error}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Period</th>
            <th>Basic Salary</th>
            <th>Allowances</th>
            <th>Deductions</th>
            <th>Overtime</th>
            <th>Bonus</th>
            <th>Total Salary</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {salaries.map((salary) => (
            <tr key={salary._id}>
              <td>{salary.userId.name}</td>
              <td>{salary.userId.department}</td>
              <td>{months[salary.payPeriod.month - 1]} {salary.payPeriod.year}</td>
              <td>${salary.basicSalary.toLocaleString()}</td>
              <td>${salary.allowances.toLocaleString()}</td>
              <td>${salary.deductions.toLocaleString()}</td>
              <td>${salary.overtime.toLocaleString()}</td>
              <td>${salary.bonus.toLocaleString()}</td>
              <td><strong>${salary.totalSalary.toLocaleString()}</strong></td>
              <td>
                <span className={getStatusClass(salary.status)}>
                  {salary.status}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-primary"
                  onClick={() => handleEdit(salary)}
                  style={{ marginRight: "5px", fontSize: "12px", padding: "5px 10px" }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(salary._id)}
                  style={{ fontSize: "12px", padding: "5px 10px" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalaryManagement;