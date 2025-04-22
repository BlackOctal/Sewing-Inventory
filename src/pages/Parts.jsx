// src/pages/Parts.js - Fixed location display
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Parts.css';

const Parts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialSearchTerm = queryParams.get('search') || '';

  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'partNumber',
    direction: 'asc'
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('si-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    if (initialSearchTerm) {
      handleSearch();
    } else {
      fetchParts();
    }
  }, [pagination.currentPage, initialSearchTerm]);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const response = await api.parts.getParts(pagination.currentPage);
      setParts(response.parts);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        total: response.total
      });
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch parts');
      setLoading(false);
      toast.error('Failed to load parts data');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchParts();
      navigate('/parts');
      return;
    }

    try {
      setLoading(true);
      const results = await api.parts.searchParts(searchTerm);
      setParts(results);
      setPagination({
        ...pagination,
        total: results.length
      });
      navigate(`/parts?search=${encodeURIComponent(searchTerm)}`);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to search parts');
      setLoading(false);
      toast.error('Search failed. Please try again.');
    }
  };

  const handleDeletePart = async (id) => {
    if (window.confirm('Are you sure you want to delete this part?')) {
      try {
        await api.parts.deletePart(id);
        setParts(parts.filter(part => part._id !== id));
        toast.success('Part deleted successfully');
      } catch (err) {
        toast.error('Failed to delete part: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({
        ...pagination,
        currentPage: newPage
      });
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sortedParts = [...parts].sort((a, b) => {
      // Handle nested properties
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        if (a[parent][child] < b[parent][child]) {
          return direction === 'asc' ? -1 : 1;
        }
        if (a[parent][child] > b[parent][child]) {
          return direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Handle direct properties
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setParts(sortedParts);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <FaSortAmountDown /> : <FaSortAmountUp />;
    }
    return null;
  };

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

  if (loading && parts.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Parts Inventory</h1>
        <Link
          to="/parts/add"
          className="add-button"
        >
          <FaPlus className="button-icon" />
          Add New Part
        </Link>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-wrapper">
          <div className="search-input-wrapper">
            <div className="search-icon-wrapper">
              <FaSearch className="search-icon" />
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search by part name, number or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            className="search-button"
          >
            Search
          </button>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                navigate('/parts');
                fetchParts();
              }}
              className="clear-button"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Parts Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="parts-table">
            <thead className="table-header">
              <tr>
                <th className="sortable-header" onClick={() => requestSort('partNumber')}>
                  <div className="header-content">
                    <span>Part Number</span>
                    {getSortIcon('partNumber')}
                  </div>
                </th>
                <th className="sortable-header" onClick={() => requestSort('partName')}>
                  <div className="header-content">
                    <span>Part Name</span>
                    {getSortIcon('partName')}
                  </div>
                </th>
                <th className="sortable-header" onClick={() => requestSort('modelName')}>
                  <div className="header-content">
                    <span>Model</span>
                    {getSortIcon('modelName')}
                  </div>
                </th>
                <th className="table-cell">Location</th>
                <th className="sortable-header" onClick={() => requestSort('price.retailPrice')}>
                  <div className="header-content">
                    <span>Retail Price</span>
                    {getSortIcon('price.retailPrice')}
                  </div>
                </th>
                <th className="sortable-header" onClick={() => requestSort('quantity')}>
                  <div className="header-content">
                    <span>Qty</span>
                    {getSortIcon('quantity')}
                  </div>
                </th>
                <th className="table-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {parts.length > 0 ? (
                parts.map((part) => (
                  <tr key={part._id} className="table-row">
                    <td className="part-number">
                      {part.partNumber}
                    </td>
                    <td className="table-cell">{part.partName}</td>
                    <td className="table-cell">{part.modelName}</td>
                    <td className="table-cell">
                      {formatLocation(part.location)}
                    </td>
                    <td className="table-cell">
                      {formatCurrency(part.price.retailPrice)}
                    </td>
                    <td className="table-cell">
                      {part.quantity}
                    </td>
                    <td className="actions-cell">
                      <div className="actions-container">
                        <Link
                          to={`/parts/view/${part._id}`}
                          className="view-link"
                          title="View"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          to={`/parts/edit/${part._id}`}
                          className="edit-link"
                          title="Edit"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDeletePart(part._id)}
                          className="delete-button"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-message">
                    No parts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!searchTerm && pagination.totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info">
              <p className="pagination-text">
                Showing <span className="pagination-number">{(pagination.currentPage - 1) * 20 + 1}</span> to{' '}
                <span className="pagination-number">
                  {Math.min(pagination.currentPage * 20, pagination.total)}
                </span>{' '}
                of <span className="pagination-number">{pagination.total}</span> results
              </p>
            </div>
            <div className="pagination-buttons">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`pagination-button ${
                  pagination.currentPage === 1 ? 'button-disabled' : ''
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`pagination-button ${
                  pagination.currentPage === pagination.totalPages ? 'button-disabled' : ''
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Parts;