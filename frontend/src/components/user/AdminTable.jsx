import React, { useState, useEffect } from 'react';
import { apiService } from "../../services/api";
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './Admindashboard';


const AdminTable = ({ onEdit, refreshTrigger }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
   const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    productManagers: 0,
    orderManagers: 0,
    financeManagers: 0,
    serviceManagers: 0
  });

  const mainStyle = {
    marginLeft: '250px',
    padding: '30px',
    width: 'calc(100% - 250px)',
    boxSizing: 'border-box',
      height: '100vh',         // fix height
  overflowY: 'auto',       // enable scrolling
  background: '#f9f9f9'
  };

  const h1Style = {
    fontSize: '28px',
    marginBottom: '20px',
    color: '#e74c3c',
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#666',
  };

  const statsStyle = {
    display: 'flex',
    gap: '20px',
    marginBottom: '25px',
    flexWrap: 'wrap',
  };

  const statCardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
    flex: 1,
    minWidth: '180px',
    textAlign: 'center',
  };

  const statCardH2Style = {
    fontSize: '32px',
    color: '#ff6f61',
    margin: 0,
  };

  const statCardPStyle = {
    fontSize: '16px',
    color: '#555',
    margin: '5px 0 0',
  };

  const tableHeaderStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px',
  };

  const btnAddStyle = {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background 0.3s',
    fontWeight: '600',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
    marginBottom: '20px',
  };

  const theadStyle = {
    background: '#ff6f61',
    color: 'white',
  };

  const thTdStyle = {
    padding: '14px 16px',
    textAlign: 'left',
    borderBottom: '1px solid #eee',
  };

  const btnStyle = {
    padding: '8px 14px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: 'white',
    transition: '0.3s',
    marginRight: '8px',
  };

  const btnEditStyle = {
    ...btnStyle,
    background: '#3498db',
  };

  const btnDeleteStyle = {
    ...btnStyle,
    background: '#e74c3c',
    marginRight: 0,
  };

  const roleBadgeStyle = {
    display: 'inline-block',
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '12px',
    fontWeight: '600',
  };

  const roleStyles = {
    'Product & Inventory Manager': {
      backgroundColor: '#ffe9dc',
      color: '#e67e22',
    },
    'Order & Delivery Manager': {
      backgroundColor: '#dcf0ff',
      color: '#3498db',
    },
    'Finance Manager': {
      backgroundColor: '#e0f8e9',
      color: '#27ae60',
    },
    'Service & Complaint Manager': {
      backgroundColor: '#f9e6ff',
      color: '#9b59b6',
    },
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '8px',
  };

  useEffect(() => {
    loadAdmins();
  }, [refreshTrigger]);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const adminsList = await adminService.getAllAdmins();
      setAdmins(adminsList);
      calculateStats(adminsList);
    } catch (error) {
      console.error('Error loading admins:', error);
      alert('Error loading admin data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (adminsList) => {
    const stats = {
      total: adminsList.length,
      productManagers: adminsList.filter(admin => admin.role === 'Product & Inventory Manager').length,
      orderManagers: adminsList.filter(admin => admin.role === 'Order & Delivery Manager').length,
      financeManagers: adminsList.filter(admin => admin.role === 'Finance Manager').length,
      serviceManagers: adminsList.filter(admin => admin.role === 'Service & Complaint Manager').length
    };
    setStats(stats);
  };

  const handleDelete = async (admin) => {
    if (window.confirm(`Are you sure you want to delete ${admin.fullName}?`)) {
      try {
        await adminService.deleteAdmin(admin._id);
        alert(`${admin.fullName} has been deleted.`);
        loadAdmins();
      } catch (error) {
        alert('Error deleting admin: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div style={mainStyle}>
        <h1 style={h1Style}>Role Based User Management</h1>
        <div style={loadingStyle}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={mainStyle}>
      <AdminDashboard />
      <h1 style={h1Style}>Role Based User Management</h1>

      {/* Stats Cards */}
      <div style={statsStyle}>
        <div style={statCardStyle}>
          <h2 style={statCardH2Style}>{stats.total}</h2>
          <p style={statCardPStyle}>Total Users</p>
        </div>
        <div style={statCardStyle}>
          <h2 style={statCardH2Style}>{stats.productManagers}</h2>
          <p style={statCardPStyle}>Product Managers</p>
        </div>
        <div style={statCardStyle}>
          <h2 style={statCardH2Style}>{stats.orderManagers}</h2>
          <p style={statCardPStyle}>Order Managers</p>
        </div>
        <div style={statCardStyle}>
          <h2 style={statCardH2Style}>{stats.financeManagers}</h2>
          <p style={statCardPStyle}>Finance Managers</p>
        </div>
        <div style={statCardStyle}>
          <h2 style={statCardH2Style}>{stats.serviceManagers}</h2>
          <p style={statCardPStyle}>Service Managers</p>
        </div>
      </div>

      {/* Add User Button */}
      <div style={tableHeaderStyle}>
      <button style={btnAddStyle} onClick={() => navigate('/addadmin')}>
  Add New User
</button>

      </div>

      {/* Users Table */}
      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
            <th style={thTdStyle}>Name</th>
            <th style={thTdStyle}>Email</th>
            <th style={thTdStyle}>Contact Number</th>
            <th style={thTdStyle}>Role</th>
            <th style={thTdStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.length > 0 ? (
            admins.map((admin, index) => (
              <tr 
                key={admin._id} 
                style={{
                  background: index % 2 === 0 ? 'white' : '#f9f9f9',
                }}
                onMouseEnter={(e) => e.target.parentElement.style.background = '#f9f9f9'}
                onMouseLeave={(e) => e.target.parentElement.style.background = index % 2 === 0 ? 'white' : '#f9f9f9'}
              >
                <td style={thTdStyle}>{admin.fullName}</td>
                <td style={thTdStyle}>{admin.email}</td>
                <td style={thTdStyle}>{admin.contactNumber}</td>
                <td style={thTdStyle}>
                  <span style={{
                    ...roleBadgeStyle,
                    ...roleStyles[admin.role]
                  }}>
                    {admin.role}
                  </span>
                </td>
                <td style={{ ...thTdStyle, ...actionButtonsStyle }}>
                 <button
  style={btnEditStyle}
  onClick={() => navigate(`/editadmin/${admin._id}`)}
  onMouseEnter={(e) => e.target.style.background = '#2980b9'}
  onMouseLeave={(e) => e.target.style.background = '#3498db'}
>
  Edit
</button>
                  <button 
                    style={btnDeleteStyle}
                    onClick={() => handleDelete(admin)}
                    onMouseEnter={(e) => e.target.style.background = '#c0392b'}
                    onMouseLeave={(e) => e.target.style.background = '#e74c3c'}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ ...thTdStyle, textAlign: 'center', padding: '40px' }}>
                No admins found. Click "Add New User" to create the first admin.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;