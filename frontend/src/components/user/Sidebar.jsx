import React from 'react';

const Sidebar = ({ activeTab, onTabChange }) => {
  const sidebarStyle = {
    width: '250px',
    background: '#ffe9dc',
    minHeight: '100vh',
    padding: '20px',
    boxSizing: 'border-box',
    position: 'fixed',
    top: 0,
    left: 0,
  };

  const logoStyle = {
    textAlign: 'center',
    marginBottom: '30px',
  };

  const logoH2Style = {
    fontFamily: '"Brush Script MT", cursive',
    color: '#e74c3c',
    margin: 0,
  };

  const linkStyle = {
    display: 'block',
    textDecoration: 'none',
    padding: '12px 10px',
    color: '#333',
    margin: '5px 0',
    borderRadius: '6px',
    transition: '0.3s',
    fontWeight: '500',
    cursor: 'pointer',
  };

  const activeLinkStyle = {
    ...linkStyle,
    background: '#ff6f61',
    color: 'white',
  };

  return (
    <aside style={sidebarStyle}>
      <div style={logoStyle}>
        <h2 style={logoH2Style}>Cake & Bake</h2>
      </div>
      <nav>
        <a href="#" style={linkStyle} onClick={() => onTabChange('dashboard')}>Dashboard</a>
        <a href="#" style={linkStyle} onClick={() => onTabChange('orders')}>Orders</a>
        <a href="#" style={linkStyle} onClick={() => onTabChange('customers')}>Customers</a>
        <a href="#" style={linkStyle} onClick={() => onTabChange('menu')}>Menu</a>
        <a href="#" style={linkStyle} onClick={() => onTabChange('reports')}>Reports</a>
        <a 
          href="#" 
          style={activeTab === 'users' ? activeLinkStyle : linkStyle}
          onClick={() => onTabChange('users')}
        >
          User Management
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;