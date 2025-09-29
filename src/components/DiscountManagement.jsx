import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [validationForm, setValidationForm] = useState({
    code: "",
    amount: "",
  });
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "percentage",
    value: "",
    minAmount: "",
    maxDiscount: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    usageLimit: "",
    isActive: true,
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDiscounts();
      setDiscounts(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch discount codes");
      console.error("Error fetching discounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleValidationInputChange = (e) => {
    const { name, value } = e.target;
    setValidationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDiscount) {
        await apiService.updateDiscount(editingDiscount._id, formData);
      } else {
        await apiService.createDiscount(formData);
      }
      resetForm();
      fetchDiscounts();
    } catch (err) {
      setError("Failed to save discount code");
      console.error("Error saving discount:", err);
    }
  };

  const handleValidateDiscount = async (e) => {
    e.preventDefault();
    try {
      const result = await apiService.validateDiscount(validationForm.code, parseFloat(validationForm.amount));
      setValidationResult(result);
    } catch (err) {
      setValidationResult({ valid: false, message: err.message });
    }
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      description: discount.description,
      type: discount.type,
      value: discount.value,
      minAmount: discount.minAmount,
      maxDiscount: discount.maxDiscount || "",
      startDate: new Date(discount.startDate).toISOString().split('T')[0],
      endDate: new Date(discount.endDate).toISOString().split('T')[0],
      usageLimit: discount.usageLimit || "",
      isActive: discount.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this discount code?")) {
      try {
        await apiService.deleteDiscount(id);
        fetchDiscounts();
      } catch (err) {
        setError("Failed to delete discount code");
        console.error("Error deleting discount:", err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      type: "percentage",
      value: "",
      minAmount: "",
      maxDiscount: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      usageLimit: "",
      isActive: true,
    });
    setShowForm(false);
    setEditingDiscount(null);
  };

  const getStatusClass = (isActive, endDate) => {
    if (!isActive) return "status absent";
    if (new Date(endDate) < new Date()) return "status late";
    return "status present";
  };

  const getStatusText = (isActive, endDate) => {
    if (!isActive) return "Inactive";
    if (new Date(endDate) < new Date()) return "Expired";
    return "Active";
  };

  if (loading) return <div className="attendance-list">Loading discount codes...</div>;

  return (
    <div className="attendance-list">
      <div className="attendance-header">
        <h1>Discount Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Add Discount Code"}
        </button>
      </div>

      {/* Discount Validation Section */}
      <div className="user-form" style={{ marginBottom: "20px" }}>
        <h3>Validate Discount Code</h3>
        <form onSubmit={handleValidateDiscount}>
          <div style={{ display: "flex", gap: "15px", alignItems: "end" }}>
            <div className="form-group">
              <input
                type="text"
                name="code"
                placeholder="Discount Code"
                value={validationForm.code}
                onChange={handleValidationInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                name="amount"
                placeholder="Order Amount"
                value={validationForm.amount}
                onChange={handleValidationInputChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Validate
            </button>
          </div>
        </form>
        {validationResult && (
          <div style={{ 
            marginTop: "10px", 
            padding: "10px", 
            backgroundColor: validationResult.valid ? "#d4edda" : "#f8d7da",
            border: `1px solid ${validationResult.valid ? "#c3e6cb" : "#f5c6cb"}`,
            borderRadius: "5px",
            color: validationResult.valid ? "#155724" : "#721c24"
          }}>
            {validationResult.valid ? (
              <div>
                <strong>Valid Discount!</strong><br />
                Discount Amount: ${validationResult.discountAmount.toFixed(2)}<br />
                Final Amount: ${validationResult.finalAmount.toFixed(2)}
              </div>
            ) : (
              <div>
                <strong>Invalid Discount:</strong> {validationResult.message}
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="user-form">
          <h3>{editingDiscount ? "Edit Discount Code" : "Add New Discount Code"}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
              <div className="form-group">
                <input
                  type="text"
                  name="code"
                  placeholder="Discount Code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                />
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
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="value"
                  placeholder={formData.type === "percentage" ? "Percentage (%)" : "Fixed Amount ($)"}
                  value={formData.value}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="minAmount"
                  placeholder="Minimum Order Amount"
                  value={formData.minAmount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="maxDiscount"
                  placeholder="Maximum Discount (Optional)"
                  value={formData.maxDiscount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="usageLimit"
                  placeholder="Usage Limit (Optional)"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <label>Active</label>
              </div>
            </div>
            <div style={{ marginTop: "15px" }}>
              <button type="submit" className="btn btn-primary" style={{ marginRight: "10px" }}>
                {editingDiscount ? "Update" : "Create"} Discount Code
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
            <th>Code</th>
            <th>Description</th>
            <th>Type</th>
            <th>Value</th>
            <th>Min Amount</th>
            <th>Valid Period</th>
            <th>Usage</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {discounts.map((discount) => (
            <tr key={discount._id}>
              <td><strong>{discount.code}</strong></td>
              <td>{discount.description}</td>
              <td>{discount.type}</td>
              <td>
                {discount.type === "percentage" 
                  ? `${discount.value}%` 
                  : `$${discount.value}`}
              </td>
              <td>${discount.minAmount}</td>
              <td>
                {new Date(discount.startDate).toLocaleDateString()} - {new Date(discount.endDate).toLocaleDateString()}
              </td>
              <td>
                {discount.usedCount} / {discount.usageLimit || "∞"}
              </td>
              <td>
                <span className={getStatusClass(discount.isActive, discount.endDate)}>
                  {getStatusText(discount.isActive, discount.endDate)}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-primary"
                  onClick={() => handleEdit(discount)}
                  style={{ marginRight: "5px", fontSize: "12px", padding: "5px 10px" }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(discount._id)}
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

export default DiscountManagement;