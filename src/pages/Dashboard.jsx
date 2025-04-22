// src/pages/Dashboard.js - Dashboard page component with fixed location display
import React, { useState, useEffect } from 'react';
import { FaBoxOpen, FaDollarSign, FaSearch, FaPlus, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        {icon}
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    financialSummary: {
      totalLandingValue: 0,
      totalRetailValue: 0,
      totalQuantity: 0
    },
    floorDistribution: [],
    topModels: []
  });
  
  const [recentParts, setRecentParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch statistics
        const statsData = await api.parts.getStats();
        setStats(statsData);
        
        // Fetch recent parts
        const partsData = await api.parts.getParts(1, 5);
        setRecentParts(partsData.parts);
        
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format the location with all details
  const formatLocation = (location) => {
    return (
      <div className="location-display">
        <div
          className="color-indicator"
          style={{ backgroundColor: location.boxColor.toLowerCase() }}
        ></div>
        <span className="location-format">
          F{location.floor}-RK{location.rack}-RO{location.row}-CL{location.column}-BX{location.boxNumber}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message-box">
        <p>{error}</p>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('si-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Inventory Items"
          value={stats.totalItems}
          icon={<FaBoxOpen size={24} />}
          color="icon-blue"
        />
        <StatCard
          title="Total Inventory Quantity"
          value={stats.financialSummary.totalQuantity}
          icon={<FaBoxOpen size={24} />}
          color="icon-green"
        />
        <StatCard
          title="Total Landing Value"
          value={formatCurrency(stats.financialSummary.totalLandingValue)}
          icon={<FaDollarSign size={24} />}
          color="icon-purple"
        />
        <StatCard
          title="Total Retail Value"
          value={formatCurrency(stats.financialSummary.totalRetailValue)}
          icon={<FaDollarSign size={24} />}
          color="icon-red"
        />
      </div>
      
      {/* Actions & Recent Parts */}
      <div className="dashboard-content">
        <div className="recent-parts-container">
          <div className="card">
            <div className="card-header">
              <h2 className="section-title">Recent Parts</h2>
              <Link to="/parts" className="view-all-link">
                View All <span className="arrow-right">→</span>
              </Link>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead className="table-header">
                  <tr>
                    <th>Part Number</th>
                    <th>Name</th>
                    <th>Model</th>
                    <th>Location</th>
                    <th>Retail Price</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {recentParts.length > 0 ? (
                    recentParts.map((part) => (
                      <tr key={part._id} className="table-row">
                        <td>
                          <Link to={`/parts/view/${part._id}`} className="table-link">
                            {part.partNumber}
                          </Link>
                        </td>
                        <td>{part.partName}</td>
                        <td>{part.modelName}</td>
                        <td>
                          {formatLocation(part.location)}
                        </td>
                        <td>{formatCurrency(part.price.retailPrice)}</td>
                        <td>{part.quantity}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-table-message">No parts found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="sidebar-container">
          <div className="card quick-actions">
            <h2 className="section-title">Quick Actions</h2>
            <div className="action-links">
              <Link
                to="/parts/add"
                className="action-link blue-action"
              >
                <div className="action-icon icon-blue">
                  <FaPlus />
                </div>
                <span>Add New Part</span>
              </Link>
              <Link
                to="/parts"
                className="action-link green-action"
              >
                <div className="action-icon icon-green">
                  <FaSearch />
                </div>
                <span>Search Inventory</span>
              </Link>
              <Link
                to="/stats"
                className="action-link purple-action"
              >
                <div className="action-icon icon-purple">
                  <FaChartLine />
                </div>
                <span>View Reports</span>
              </Link>
            </div>
          </div>
          
          <div className="card">
            <h2 className="section-title">Top Models</h2>
            <div className="top-models">
              {stats.topModels.map((model, index) => (
                <div key={index} className="model-item">
                  <span>{model._id}</span>
                  <span className="model-count">
                    {model.count} parts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;