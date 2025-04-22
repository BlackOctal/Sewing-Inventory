// src/services/api.js - API service for frontend
import axios from 'axios';

// For Vite, use import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// The rest of your code remains the same
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Parts API and other code...

// Parts API
const partsApi = {
  // Get all parts with pagination
  getParts: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get(`/parts?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Search parts
  searchParts: async (searchTerm) => {
    try {
      const response = await apiClient.get(`/parts/search?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Get part by ID
  getPartById: async (id) => {
    try {
      const response = await apiClient.get(`/parts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Create new part
  createPart: async (partData) => {
    try {
      const response = await apiClient.post('/parts', partData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Update part
  updatePart: async (id, partData) => {
    try {
      const response = await apiClient.put(`/parts/${id}`, partData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Delete part
  deletePart: async (id) => {
    try {
      const response = await apiClient.delete(`/parts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Get inventory statistics
  getStats: async () => {
    try {
      const response = await apiClient.get('/parts/stats/summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Bulk import parts
  bulkImport: async (partsData) => {
    try {
      const response = await apiClient.post('/parts/bulk-import', partsData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default {
  parts: partsApi
};