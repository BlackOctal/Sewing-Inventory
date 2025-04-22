// src/components/Navbar.js - Navigation bar component
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaUser } from 'react-icons/fa';
import './Navbar.css'; // Import the CSS file

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/parts?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo-section">
          <div className="logo-container">
            {/* <img
              src="/logo.png"
              alt="Logo"
              className="logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/32';
              }}
            /> */}
            <span className="app-title">Sewing Machine Inventory</span>
          </div>
        </div>

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search parts by name, number or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="search-icon">
                <FaSearch className="icon-gray" />
              </div>
            </div>
          </form>
        </div>

        <div className="user-section">
          <button className="notification-button">
            <FaBell className="icon-gray" />
            <span className="notification-indicator"></span>
          </button>
          <div className="user-info">
            <div className="user-avatar">
              <FaUser />
            </div>
            <span className="username">Admin</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;