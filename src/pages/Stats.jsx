// src/pages/Stats.js - Statistics and reports page
import React, { useState, useEffect } from 'react';
import { FaChartBar, FaChartLine, FaChartPie, FaTable } from 'react-icons/fa';
import api from '../services/api';
import './Stats.css';

const Stats = () => {
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
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allParts, setAllParts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch statistics
        const statsData = await api.parts.getStats();
        setStats(statsData);
        
        // Fetch all parts for detailed analysis
        const response = await api.parts.getParts(1, 1000); // Get a large batch for analysis
        setAllParts(response.parts);
        
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch statistics data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('si-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Calculate price range distribution
  const calculatePriceRanges = () => {
    const ranges = [
      { label: 'LKR 0-1,000', count: 0 },
      { label: 'LKR 1,001-5,000', count: 0 },
      { label: 'LKR 5,001-10,000', count: 0 },
      { label: 'LKR 10,001+', count: 0 }
    ];
    
    allParts.forEach(part => {
      const price = part.price.retailPrice;
      if (price <= 1000) {
        ranges[0].count++;
      } else if (price <= 5000) {
        ranges[1].count++;
      } else if (price <= 10000) {
        ranges[2].count++;
      } else {
        ranges[3].count++;
      }
    });
    
    return ranges;
  };

  // Calculate box color distribution
  const calculateBoxColors = () => {
    const colorCounts = {};
    
    allParts.forEach(part => {
      const color = part.location.boxColor;
      if (!colorCounts[color]) {
        colorCounts[color] = 0;
      }
      colorCounts[color]++;
    });
    
    return Object.entries(colorCounts).map(([color, count]) => ({
      color,
      count
    })).sort((a, b) => b.count - a.count);
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
      <div className="error-message">
        <p>{error}</p>
      </div>
    );
  }

  const priceRanges = calculatePriceRanges();
  const boxColors = calculateBoxColors();

  return (
    <div>
      <h1 className="page-title">Statistics and Reports</h1>
      
      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <p className="stat-label">Total Inventory Items</p>
              <p className="stat-value">{stats.totalItems}</p>
            </div>
            <div className="icon-container blue">
              <FaChartBar className="icon blue-icon" />
            </div>
          </div>
          <p className="stat-description">
            Unique sewing machine parts in inventory
          </p>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <p className="stat-label">Total Quantity</p>
              <p className="stat-value">{stats.financialSummary.totalQuantity}</p>
            </div>
            <div className="icon-container green">
              <FaTable className="icon green-icon" />
            </div>
          </div>
          <p className="stat-description">
            Total number of parts in stock
          </p>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <p className="stat-label">Total Landing Value</p>
              <p className="stat-value">{formatCurrency(stats.financialSummary.totalLandingValue)}</p>
            </div>
            <div className="icon-container purple">
              <FaChartLine className="icon purple-icon" />
            </div>
          </div>
          <p className="stat-description">
            Total landing cost of all inventory
          </p>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <p className="stat-label">Total Retail Value</p>
              <p className="stat-value">{formatCurrency(stats.financialSummary.totalRetailValue)}</p>
            </div>
            <div className="icon-container red">
              <FaChartPie className="icon red-icon" />
            </div>
          </div>
          <p className="profit-text">
            Potential profit: {formatCurrency(stats.financialSummary.totalRetailValue - stats.financialSummary.totalLandingValue)}
          </p>
        </div>
      </div>
      
      {/* Data Visualization Section */}
      <div className="data-grid">
        {/* Price Range Distribution */}
        <div className="data-card">
          <h2 className="section-title">Price Range Distribution</h2>
          <div className="chart-container">
            {priceRanges.map((range, index) => (
              <div key={index} className="chart-item">
                <div className="chart-header">
                  <span>{range.label}</span>
                  <span>{range.count} parts</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar"
                    style={{ width: `${(range.count / allParts.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Box Color Distribution */}
        <div className="data-card">
          <h2 className="section-title">Box Color Distribution</h2>
          <div className="chart-container">
            {boxColors.map((item, index) => (
              <div key={index} className="chart-item">
                <div className="chart-header">
                  <div className="color-label">
                    <div
                      className="color-dot"
                      style={{ backgroundColor: item.color.toLowerCase() }}
                    ></div>
                    <span>{item.color}</span>
                  </div>
                  <span>{item.count} parts</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar"
                    style={{ width: `${(item.count / allParts.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Floor Distribution Section */}
      <div className="floor-section">
        <h2 className="section-title">Floor Distribution</h2>
        <div className="floor-grid">
          {stats.floorDistribution.map((floor, index) => (
            <div key={index} className="floor-card">
              <h3 className="floor-title">Floor {floor._id}</h3>
              <p className="floor-count">{floor.count}</p>
              <p className="floor-percentage">
                {((floor.count / stats.totalItems) * 100).toFixed(1)}% of inventory
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Popular Models */}
      <div className="models-section">
        <h2 className="section-title">Popular Sewing Machine Models</h2>
        <div className="table-wrapper">
          <table className="models-table">
            <thead className="table-header">
              <tr>
                <th>Model Name</th>
                <th>Part Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {stats.topModels.map((model, index) => (
                <tr key={index} className="table-row">
                  <td className="model-name">{model._id}</td>
                  <td className="model-count">{model.count}</td>
                  <td className="model-percentage">
                    <div className="percentage-text">
                      {((model.count / stats.totalItems) * 100).toFixed(1)}%
                    </div>
                    <div className="mini-progress-bg">
                      <div
                        className="mini-progress-bar"
                        style={{ width: `${(model.count / stats.totalItems) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Stats;