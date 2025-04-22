// src/components/Sidebar.js - Sidebar navigation component
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaCogs, 
  FaChartBar, 
  FaFileImport, 
  FaBoxOpen, 
  FaPlus
} from 'react-icons/fa';
import './Sidebar.css'; // Import the CSS file

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: <FaHome />, label: 'Dashboard' },
    { path: '/parts', icon: <FaBoxOpen />, label: 'Parts Inventory' },
    { path: '/parts/add', icon: <FaPlus />, label: 'Add New Part' },
    { path: '/stats', icon: <FaChartBar />, label: 'Statistics' },
    { path: '/import', icon: <FaFileImport />, label: 'Import/Export' },
    // { path: '/settings', icon: <FaCogs />, label: 'Settings' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-title">
        <span className="title-text">SewInv Manager</span>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* <div className="help-container">
        <div className="help-box">
          <h3 className="help-title">Need Help?</h3>
          <p className="help-text">
            Check the user manual or contact support for assistance
          </p>
          <a href="#" className="help-button">
            View Manual
          </a>
        </div>
      </div> */}
    </div>
  );
};

export default Sidebar;