import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";

const FinanceManagement = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [activeTab, setActiveTab] = useState("records");
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [formData, setFormData] = useState({
    type: "sale",
    category: "",
    description: "",
    amount: "",
    reference: "",
    userId: "",
    status: "completed",
    paymentMethod: "cash",
    invoiceNumber: "",
  });

  const categories = {
    sale: ["Product Sales", "Service Sales", "Consultation", "Other Sales"],
    expense: ["Office Supplies", "Utilities", "Marketing", "Travel", "Equipment", "Other Expenses"],
    salary: ["Basic Salary", "Overtime", "Bonus", "Allowances"],
    refund: ["Product Refund", "Service Refund", "Cancellation", "Other Refunds"]
  };

  useEffect(() => {
    fetchRecords();
    fetchSummary();
    fetchUsers();
  }, [filters]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await apiService.getFinanceRecords(filters);
      setRecords(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch finance records");
      console.error("Error fetching records:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await apiService.getFinanceSummary(filters);
      setSummary(data);
    } catch (err) {
      console.error("Error fetching summary:", err);
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      if (editingRecord) {
        await apiService.updateFinanceRecord(editingRecord._id, formData);
      } else {
        await apiService.createFinanceRecord(formData);
      }
      resetForm();
      fetchRecords();
      fetchSummary();
    } catch (err) {
      setError("Failed to save finance record");
      console.error("Error saving record:", err);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      category: record.category,
      description: record.description,
      amount: record.amount,
      reference: record.reference || "",
      userId: record.userId?._id || "",
      status: record.status,
      paymentMethod: record.paymentMethod,
      invoiceNumber: record.invoiceNumber || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await apiService.deleteFinanceRecord(id);
        fetchRecords();
        fetchSummary();
      } catch (err) {
        setError("Failed to delete record");
        console.error("Error deleting record:", err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: "sale",
      category: "",
      description: "",
      amount: "",
      reference: "",
      userId: "",
      status: "completed",
      paymentMethod: "cash",
      invoiceNumber: "",
    });
    setShowForm(false);
    setEditingRecord(null);
  };

  const getTypeClass = (type) => {
    switch (type) {
      case "sale":
        return "status present";
      case "expense":
        return "status absent";
      case "salary":
        return "status late";
      case "refund":
        return "status absent";
      default:
        return "status";
    }
  };

  const generateInvoice = (record) => {
    // Simple PDF generation simulation
    const invoiceContent = `
      INVOICE #${record.invoiceNumber || record._id}
      
      Date: ${new Date(record.date).toLocaleDateString()}
      Type: ${record.type.toUpperCase()}
      Category: ${record.category}
      Description: ${record.description}
      Amount: $${record.amount.toLocaleString()}
      Payment Method: ${record.paymentMethod}
      Status: ${record.status}
      
      ${record.userId ? `Employee: ${record.userId.name}` : ''}
      ${record.reference ? `Reference: ${record.reference}` : ''}
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${record.invoiceNumber || record._id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="attendance-list">Loading finance data...</div>;

  return (
    <div className="attendance-list">
      <div className="attendance-header">
        <h1>Finance Management</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className={`btn ${activeTab === "records" ? "btn-primary" : ""}`}
            style={{ 
              backgroundColor: activeTab === "records" ? "var(--primary)" : "#f8f9fa",
              color: activeTab === "records" ? "white" : "var(--dark)",
              border: "1px solid var(--primary)"
            }}
            onClick={() => setActiveTab("records")}
          >
            Records
          </button>
          <button
            className={`btn ${activeTab === "summary" ? "btn-primary" : ""}`}
            style={{ 
              backgroundColor: activeTab === "summary" ? "var(--primary)" : "#f8f9fa",
              color: activeTab === "summary" ? "white" : "var(--dark)",
              border: "1px solid var(--primary)"
            }}
            onClick={() => setActiveTab("summary")}
          >
            Summary
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Add Record"}
          </button>
        </div>
      </div>

      {activeTab === "summary" && summary && (
        <div className="stats" style={{ marginBottom: "20px" }}>
          <div className="stat-card">
            <div className="stat-icon icon-present">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="stat-info">
              <h3>${summary.sales.total.toLocaleString()}</h3>
              <p>Total Sales ({summary.sales.count})</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon icon-absent">
              <i className="fas fa-credit-card"></i>
            </div>
            <div className="stat-info">
              <h3>${summary.expenses.total.toLocaleString()}</h3>
              <p>Total Expenses ({summary.expenses.count})</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon icon-late">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <h3>${summary.salaries.total.toLocaleString()}</h3>
              <p>Total Salaries ({summary.salaries.count})</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon icon-total">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-info">
              <h3>${summary.netIncome.toLocaleString()}</h3>
              <p>Net Income</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "records" && (
        <>
          {/* Filters */}
          <div className="salary-filters" style={{ marginBottom: "20px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="sale">Sales</option>
              <option value="expense">Expenses</option>
              <option value="salary">Salaries</option>
              <option value="refund">Refunds</option>
            </select>
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={filters.category}
              onChange={handleFilterChange}
            />
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>

          {showForm && (
            <div className="user-form">
              <h3>{editingRecord ? "Edit Finance Record" : "Add New Finance Record"}</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                  <div className="form-group">
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="sale">Sale</option>
                      <option value="expense">Expense</option>
                      <option value="salary">Salary</option>
                      <option value="refund">Refund</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories[formData.type]?.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="description"
                      placeholder="Description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="number"
                      name="amount"
                      placeholder="Amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="reference"
                      placeholder="Reference (Optional)"
                      value={formData.reference}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <select
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Employee (Optional)</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} - {user.department}
                        </option>
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
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="card">Card</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="invoiceNumber"
                      placeholder="Invoice Number (Optional)"
                      value={formData.invoiceNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div style={{ marginTop: "15px" }}>
                  <button type="submit" className="btn btn-primary" style={{ marginRight: "10px" }}>
                    {editingRecord ? "Update" : "Create"} Record
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
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Employee</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>
                    <span className={getTypeClass(record.type)}>
                      {record.type}
                    </span>
                  </td>
                  <td>{record.category}</td>
                  <td>{record.description}</td>
                  <td><strong>${record.amount.toLocaleString()}</strong></td>
                  <td>{record.userId?.name || "--"}</td>
                  <td>{record.paymentMethod}</td>
                  <td>{record.status}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEdit(record)}
                      style={{ marginRight: "5px", fontSize: "12px", padding: "5px 10px" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => generateInvoice(record)}
                      style={{ marginRight: "5px", fontSize: "12px", padding: "5px 10px" }}
                    >
                      Invoice
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(record._id)}
                      style={{ fontSize: "12px", padding: "5px 10px" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default FinanceManagement;