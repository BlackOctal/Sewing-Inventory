// src/pages/AddEditPart.js - Component for adding/editing parts with improved styling
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'react-toastify';
import './AddEditsPart.css';

const AddEditPart = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(isEditing);
  const [formData, setFormData] = useState({
    partName: '',
    partNumber: '',
    modelName: '',
    location: {
      floor: '',
      rack: '',
      row: '',
      column: '',
      boxNumber: '',
      boxColor: ''
    },
    price: {
      landingPrice: '',
      retailPrice: ''
    },
    quantity: 0
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      const fetchPart = async () => {
        try {
          setLoading(true);
          const part = await api.parts.getPartById(id);
          setFormData(part);
          setLoading(false);
        } catch (err) {
          toast.error('Failed to load part data: ' + (err.message || 'Unknown error'));
          navigate('/parts');
        }
      };
      
      fetchPart();
    }
  }, [id, navigate, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear errors for the field being changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.partName.trim()) newErrors.partName = 'Part name is required';
    if (!formData.partNumber.trim()) newErrors.partNumber = 'Part number is required';
    if (!formData.modelName.trim()) newErrors.modelName = 'Model name is required';
    
    // Location fields validation
    if (!formData.location.floor) newErrors['location.floor'] = 'Floor is required';
    if (!formData.location.rack) newErrors['location.rack'] = 'Rack is required';
    if (!formData.location.row) newErrors['location.row'] = 'Row is required';
    if (!formData.location.column) newErrors['location.column'] = 'Column is required';
    if (!formData.location.boxNumber.trim()) newErrors['location.boxNumber'] = 'Box number is required';
    if (!formData.location.boxColor.trim()) newErrors['location.boxColor'] = 'Box color is required';
    
    // Price fields validation
    if (!formData.price.landingPrice) newErrors['price.landingPrice'] = 'Landing price is required';
    if (!formData.price.retailPrice) newErrors['price.retailPrice'] = 'Retail price is required';
    
    // Price logic validation
    if (parseFloat(formData.price.retailPrice) < parseFloat(formData.price.landingPrice)) {
      newErrors['price.retailPrice'] = 'Retail price should be greater than landing price';
    }
    
    // Quantity validation
    if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    try {
      setLoading(true);
      
      // Format numeric values
      const formattedData = {
        ...formData,
        location: {
          ...formData.location,
          floor: parseInt(formData.location.floor),
          rack: parseInt(formData.location.rack),
          row: parseInt(formData.location.row),
          column: parseInt(formData.location.column)
        },
        price: {
          ...formData.price,
          landingPrice: parseFloat(formData.price.landingPrice),
          retailPrice: parseFloat(formData.price.retailPrice)
        },
        quantity: parseInt(formData.quantity)
      };
      
      if (isEditing) {
        await api.parts.updatePart(id, formattedData);
        toast.success('Part updated successfully');
      } else {
        await api.parts.createPart(formattedData);
        toast.success('Part added successfully');
      }
      
      navigate('/parts');
    } catch (err) {
      toast.error((err.message && err.message.includes('already exists'))
        ? 'Part number already exists'
        : 'Failed to save part: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  // Get location preview string
  const getLocationPreview = () => {
    const { floor, rack, row, column, boxNumber } = formData.location;
    
    if (!floor && !rack && !row && !column && !boxNumber) {
      return "Complete the location fields to see preview";
    }
    
    return `F${floor || '?'}-RK${rack || '?'}-RO${row || '?'}-CL${column || '?'}-BX${boxNumber || '?'}`;
  };

  const boxColors = [
    'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 
    'Black', 'White', 'Brown', 'Grey', 'Pink'
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">{isEditing ? 'Edit Part' : 'Add New Part'}</h1>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Basic Information */}
            <div className="section-full-width">
              <h2 className="section-title">Basic Information</h2>
              <div className="basic-info-grid">
                <div>
                  <label className="form-label">
                    Part Name *
                  </label>
                  <input
                    type="text"
                    name="partName"
                    value={formData.partName}
                    onChange={handleChange}
                    className={`form-input ${errors.partName ? 'input-error' : ''}`}
                  />
                  {errors.partName && (
                    <p className="error-message">{errors.partName}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">
                    Part Number *
                  </label>
                  <input
                    type="text"
                    name="partNumber"
                    value={formData.partNumber}
                    onChange={handleChange}
                    className={`form-input ${errors.partNumber ? 'input-error' : ''}`}
                  />
                  {errors.partNumber && (
                    <p className="error-message">{errors.partNumber}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    name="modelName"
                    value={formData.modelName}
                    onChange={handleChange}
                    className={`form-input ${errors.modelName ? 'input-error' : ''}`}
                  />
                  {errors.modelName && (
                    <p className="error-message">{errors.modelName}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Location Section */}
            <div className="section-card">
              <h2 className="subsection-title">Location Details</h2>
              
              {/* Location preview */}
              <div className="location-preview">
                <div className="location-preview-title">Location Preview:</div>
                <span className="location-format">{getLocationPreview()}</span>
              </div>
              
              <div className="location-grid">
                <div>
                  <label className="form-label">
                    Floor *
                  </label>
                  <input
                    type="number"
                    name="location.floor"
                    value={formData.location.floor}
                    onChange={handleChange}
                    className={`form-input ${errors['location.floor'] ? 'input-error' : ''}`}
                  />
                  {errors['location.floor'] && (
                    <p className="error-message">{errors['location.floor']}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">
                    Rack *
                  </label>
                  <input
                    type="number"
                    name="location.rack"
                    value={formData.location.rack}
                    onChange={handleChange}
                    className={`form-input ${errors['location.rack'] ? 'input-error' : ''}`}
                  />
                  {errors['location.rack'] && (
                    <p className="error-message">{errors['location.rack']}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">
                    Row *
                  </label>
                  <input
                    type="number"
                    name="location.row"
                    value={formData.location.row}
                    onChange={handleChange}
                    className={`form-input ${errors['location.row'] ? 'input-error' : ''}`}
                  />
                  {errors['location.row'] && (
                    <p className="error-message">{errors['location.row']}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">
                    Column *
                  </label>
                  <input
                    type="number"
                    name="location.column"
                    value={formData.location.column}
                    onChange={handleChange}
                    className={`form-input ${errors['location.column'] ? 'input-error' : ''}`}
                  />
                  {errors['location.column'] && (
                    <p className="error-message">{errors['location.column']}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">
                    Box Number *
                  </label>
                  <input
                    type="text"
                    name="location.boxNumber"
                    value={formData.location.boxNumber}
                    onChange={handleChange}
                    className={`form-input ${errors['location.boxNumber'] ? 'input-error' : ''}`}
                  />
                  {errors['location.boxNumber'] && (
                    <p className="error-message">{errors['location.boxNumber']}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">
                    Box Color *
                  </label>
                  <select
                    name="location.boxColor"
                    value={formData.location.boxColor}
                    onChange={handleChange}
                    className={`form-input ${errors['location.boxColor'] ? 'input-error' : ''}`}
                  >
                    <option value="">Select a color</option>
                    {boxColors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                  {errors['location.boxColor'] && (
                    <p className="error-message">{errors['location.boxColor']}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Price and Quantity Section */}
            <div className="section-card">
              <h2 className="subsection-title">Price & Quantity</h2>
              <div className="price-grid">
                <div>
                  <label className="form-label">
                    Landing Price (LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price.landingPrice"
                    value={formData.price.landingPrice}
                    onChange={handleChange}
                    className={`form-input ${errors['price.landingPrice'] ? 'input-error' : ''}`}
                  />
                  {errors['price.landingPrice'] && (
                    <p className="error-message">{errors['price.landingPrice']}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">
                    Retail Price (LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price.retailPrice"
                    value={formData.price.retailPrice}
                    onChange={handleChange}
                    className={`form-input ${errors['price.retailPrice'] ? 'input-error' : ''}`}
                  />
                  {errors['price.retailPrice'] && (
                    <p className="error-message">{errors['price.retailPrice']}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className={`form-input ${errors.quantity ? 'input-error' : ''}`}
                  />
                  {errors.quantity && (
                    <p className="error-message">{errors.quantity}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/parts')}
              className="cancel-button"
            >
              <FaTimes className="button-icon" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              <FaSave className="button-icon" />
              {loading ? 'Saving...' : isEditing ? 'Update Part' : 'Add Part'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditPart;