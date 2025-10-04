import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminServices';
import Adminmanagerdash from './Adminmanagerdash';

const AdminForm = ({ editingAdmin, onFormSubmit, onCancel }) =>
{
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
    password: '',
    reEnterPassword: '',
    role: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const roles = [
    'Product & Inventory Manager',
    'Order & Delivery Manager',
    'Finance Manager',
    'Service & Complaint Manager'
  ];

  const mainStyle = {
    marginLeft: '250px',
    padding: '20px',
    width: 'calc(100% - 250px)',
    boxSizing: 'border-box',
    height: '100vh',         // fix height
    overflowY: 'auto',       // enable scrolling
    background: '#f9f9f9'    // optional: light background
  };

  const h1Style = {
    fontSize: '28px',
    marginBottom: '2px',
    color: '#e74c3c',
  };

  const formContainerStyle = {
    background: 'white',
    padding: '25px',
    paddingBottom: '80px', // Add this for more space at bottom
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
    maxWidth: '700px',
    margin: '0 auto 50px',
  };

  const formGroupStyle = {
    marginBottom: '20px',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#555',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
  };

  const inputErrorStyle = {
    ...inputStyle,
    borderColor: '#e74c3c',
    boxShadow: '0 0 0 2px rgba(231, 76, 60, 0.2)',
  };

  const formRowStyle = {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
  };

  const formGroupFlexStyle = {
    flex: 1,
    marginBottom: 0,
  };

  const btnSubmitStyle = {
    background: '#ff6f61',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background 0.3s',
    width: '100%',
    fontWeight: '600',
    marginBottom: '10px',
  };

  const btnCancelStyle = {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background 0.3s',
    width: '100%',
    fontWeight: '600',
  };

  const passwordRequirementsStyle = {
    fontSize: '12px',
    color: '#777',
    marginTop: '5px',
  };

  const errorMessageStyle = {
    color: '#e74c3c',
    fontSize: '14px',
    marginTop: '5px',
    display: 'block',
  };

  const buttonGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  };

  useEffect(() =>
  {
    if (editingAdmin)
    {
      setFormData({
        fullName: editingAdmin.fullName || '',
        contactNumber: editingAdmin.contactNumber || '',
        email: editingAdmin.email || '',
        password: '',
        reEnterPassword: '',
        role: editingAdmin.role || ''
      });
    } else
    {
      resetForm();
    }
  }, [editingAdmin]);

  const resetForm = () =>
  {
    setFormData({
      fullName: '',
      contactNumber: '',
      email: '',
      password: '',
      reEnterPassword: '',
      role: ''
    });
    setErrors({});
  };

  const handleChange = (e) =>
  {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name])
    {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () =>
  {
    const newErrors = {};

    if (!formData.fullName.trim())
    {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.contactNumber.trim())
    {
      newErrors.contactNumber = 'Contact number is required';
    }

    if (!formData.email.trim())
    {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email))
    {
      newErrors.email = 'Email is invalid';
    }

    if (!editingAdmin)
    {
      if (!formData.password)
      {
        newErrors.password = 'Password is required';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password))
      {
        newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
      }

      if (!formData.reEnterPassword)
      {
        newErrors.reEnterPassword = 'Please confirm your password';
      } else if (formData.password !== formData.reEnterPassword)
      {
        newErrors.reEnterPassword = 'Passwords do not match';
      }
    } else if (formData.password && formData.password !== formData.reEnterPassword)
    {
      newErrors.reEnterPassword = 'Passwords do not match';
    }

    if (!formData.role)
    {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) =>
  {
    e.preventDefault();

    if (!validateForm())
    {
      return;
    }

    setLoading(true);

    try
    {
      let result;
      const submitData = {
        fullName: formData.fullName,
        contactNumber: formData.contactNumber,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        reEnterPassword: formData.reEnterPassword
      };

      if (editingAdmin)
      {
        if (!formData.password)
        {
          delete submitData.password;
          delete submitData.reEnterPassword;
        }
        result = await adminService.updateAdmin(editingAdmin._id, submitData);
        alert('Admin updated successfully!');
      } else
      {
        result = await adminService.createAdmin(submitData);
        alert('Admin created successfully!');
        resetForm();
      }

      if (onFormSubmit)
      {
        onFormSubmit(result);
      }
    } catch (error)
    {
      alert(error.message || 'An error occurred');
    } finally
    {
      setLoading(false);
    }
  };

  return (
    <div><Adminmanagerdash />
      <div style={mainStyle}>

        <h1 style={h1Style}>{editingAdmin ? 'Update User' : 'Add a role-based user'}</h1>

        <div style={formContainerStyle}>
          <form onSubmit={handleSubmit}>
            <div style={formRowStyle}>
              <div style={{ ...formGroupStyle, ...formGroupFlexStyle }}>
                <label htmlFor="fullName" style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  style={errors.fullName ? inputErrorStyle : inputStyle}
                />
                {errors.fullName && <span style={errorMessageStyle}>{errors.fullName}</span>}
              </div>
            </div>

            <div style={formRowStyle}>
              <div style={{ ...formGroupStyle, ...formGroupFlexStyle }}>
                <label htmlFor="contactNumber" style={labelStyle}>Contact Number</label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  style={errors.contactNumber ? inputErrorStyle : inputStyle}
                />
                {errors.contactNumber && <span style={errorMessageStyle}>{errors.contactNumber}</span>}
              </div>
              <div style={{ ...formGroupStyle, ...formGroupFlexStyle }}>
                <label htmlFor="email" style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  style={errors.email ? inputErrorStyle : inputStyle}
                />
                {errors.email && <span style={errorMessageStyle}>{errors.email}</span>}
              </div>
            </div>

            <div style={formRowStyle}>
              <div style={{ ...formGroupStyle, ...formGroupFlexStyle }}>
                <label htmlFor="password" style={labelStyle}>
                  {editingAdmin ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={editingAdmin ? 'Enter new password' : 'Create a password'}
                  style={errors.password ? inputErrorStyle : inputStyle}
                />
                <p style={passwordRequirementsStyle}>Must be at least 8 characters with uppercase, lowercase, and number</p>
                {errors.password && <span style={errorMessageStyle}>{errors.password}</span>}
              </div>
              <div style={{ ...formGroupStyle, ...formGroupFlexStyle }}>
                <label htmlFor="reEnterPassword" style={labelStyle}>Re-enter Password</label>
                <input
                  type="password"
                  id="reEnterPassword"
                  name="reEnterPassword"
                  value={formData.reEnterPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  style={errors.reEnterPassword ? inputErrorStyle : inputStyle}
                />
                {errors.reEnterPassword && <span style={errorMessageStyle}>{errors.reEnterPassword}</span>}
              </div>
            </div>

            <div style={formRowStyle}>
              <div style={{ ...formGroupStyle, ...formGroupFlexStyle }}>
                <label htmlFor="role" style={labelStyle}>User Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={errors.role ? inputErrorStyle : inputStyle}
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {errors.role && <span style={errorMessageStyle}>{errors.role}</span>}
              </div>
            </div>

            <div style={buttonGroupStyle}>
              <button
                type="submit"
                style={{
                  ...btnSubmitStyle,
                  background: loading ? '#bbb' : '#ff6f61',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                disabled={loading}
              >
                {loading ? 'Processing...' : (editingAdmin ? 'Update User' : 'Create User')}
              </button>

              {editingAdmin && (
                <button
                  type="button"
                  style={btnCancelStyle}
                  onClick={onCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminForm;