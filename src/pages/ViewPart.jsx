// src/pages/ViewPart.js - Component for viewing part details with fixed formatting
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'react-toastify';
import './ViewParts.css';

const ViewPart = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPart = async () => {
      try {
        setLoading(true);
        const data = await api.parts.getPartById(id);
        setPart(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load part: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };
    
    fetchPart();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this part?')) {
      try {
        await api.parts.deletePart(id);
        toast.success('Part deleted successfully');
        navigate('/parts');
      } catch (err) {
        toast.error('Failed to delete part: ' + (err.message || 'Unknown error'));
      }
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('si-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
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
        <button 
          onClick={() => navigate('/parts')}
          className="back-button error-back"
        >
          Back to Parts List
        </button>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="not-found-container">
        <p className="not-found-text">Part not found</p>
        <button 
          onClick={() => navigate('/parts')}
          className="back-button primary-back"
        >
          Back to Parts List
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <button
            onClick={() => navigate('/parts')}
            className="back-icon"
          >
            <FaArrowLeft />
          </button>
          <h1 className="page-title">Part Details</h1>
        </div>
        <div className="action-buttons">
          <Link
            to={`/parts/edit/${id}`}
            className="edit-button"
          >
            <FaEdit className="button-icon" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="delete-button"
          >
            <FaTrash className="button-icon" />
            Delete
          </button>
        </div>
      </div>

      <div className="details-container">
        {/* Basic Information */}
        <div className="section basic-info">
          <h2 className="section-title">Basic Information</h2>
          <div className="basic-info-grid">
            <div className="info-item">
              <p className="label">Part Name</p>
              <p className="value">{part.partName}</p>
            </div>
            <div className="info-item">
              <p className="label">Part Number</p>
              <p className="value">{part.partNumber}</p>
            </div>
            <div className="info-item">
              <p className="label">Model Name</p>
              <p className="value">{part.modelName}</p>
            </div>
          </div>
        </div>

        <div className="details-grid">
          {/* Location Details */}
          <div className="section location-section">
            <h2 className="section-title">Location</h2>
            <div className="location-info">
              <div className="box-info">
                <div 
                  className="color-indicator"
                  style={{ backgroundColor: part.location.boxColor.toLowerCase() }}
                ></div>
                <div>
                  <p className="label">Box Color & Number</p>
                  <p className="value">{part.location.boxColor} - {part.location.boxNumber}</p>
                </div>
              </div>
              
              {/* Complete Location Display */}
              <div className="full-location">
                <p className="label">Complete Location</p>
                <p className="value location-format">
                  F{part.location.floor}-RK{part.location.rack}-RO{part.location.row}-CL{part.location.column}-BX{part.location.boxNumber}
                </p>
              </div>
              
              <div className="location-grid">
                <div className="info-item">
                  <p className="label">Floor</p>
                  <p className="value">{part.location.floor}</p>
                </div>
                <div className="info-item">
                  <p className="label">Rack</p>
                  <p className="value">{part.location.rack}</p>
                </div>
                <div className="info-item">
                  <p className="label">Row</p>
                  <p className="value">{part.location.row}</p>
                </div>
                <div className="info-item">
                  <p className="label">Column</p>
                  <p className="value">{part.location.column}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price and Stock Details */}
          <div className="section price-section">
            <h2 className="section-title">Price & Stock</h2>
            <div className="price-info">
              <div className="info-item">
                <p className="label">Landing Price</p>
                <p className="value">{formatCurrency(part.price.landingPrice)}</p>
              </div>
              <div className="info-item">
                <p className="label">Retail Price</p>
                <p className="value">{formatCurrency(part.price.retailPrice)}</p>
              </div>
              <div className="info-item">
                <p className="label">Profit Margin</p>
                <p className="value">
                  {(((part.price.retailPrice - part.price.landingPrice) / part.price.landingPrice) * 100).toFixed(2)}%
                </p>
              </div>
              <div className="info-item">
                <p className="label">Quantity in Stock</p>
                <p className="value">{part.quantity}</p>
              </div>
              <div className="info-item">
                <p className="label">Total Stock Value (Landing)</p>
                <p className="value">{formatCurrency(part.price.landingPrice * part.quantity)}</p>
              </div>
              <div className="info-item">
                <p className="label">Total Stock Value (Retail)</p>
                <p className="value">{formatCurrency(part.price.retailPrice * part.quantity)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="section metadata-section">
          <div className="metadata-grid">
            <div className="info-item">
              <p className="label">Created At</p>
              <p className="value">
                {new Date(part.createdAt).toLocaleDateString('en-LK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="info-item">
              <p className="label">Last Updated</p>
              <p className="value">
                {new Date(part.updatedAt).toLocaleDateString('en-LK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPart;