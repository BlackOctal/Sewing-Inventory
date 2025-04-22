// routes/partRoutes.js - API routes for parts
const express = require('express');
const router = express.Router();
const Part = require('../models/Parts');

// Get all parts with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const parts = await Part.find()
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Part.countDocuments();
    
    res.json({
      parts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search parts
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.q;
    
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    
    // If search term looks like a part number (exact match)
    if (searchTerm.match(/^[A-Za-z0-9-]+$/)) {
      const partByNumber = await Part.find({ 
        $or: [
          { partNumber: { $regex: searchTerm, $options: 'i' } },
          { partName: { $regex: searchTerm, $options: 'i' } },
          { modelName: { $regex: searchTerm, $options: 'i' } }
        ]
      });
      
      if (partByNumber.length > 0) {
        return res.json(partByNumber);
      }
    }
    
    // Text search for more general queries
    const parts = await Part.find(
      { $text: { $search: searchTerm } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });
    
    res.json(parts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get part by ID
router.get('/:id', async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }
    res.json(part);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new part
router.post('/', async (req, res) => {
  try {
    // Check if part number already exists
    const existingPart = await Part.findOne({ partNumber: req.body.partNumber });
    if (existingPart) {
      return res.status(400).json({ message: 'Part number already exists' });
    }
    
    const newPart = new Part(req.body);
    const savedPart = await newPart.save();
    res.status(201).json(savedPart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update part
router.put('/:id', async (req, res) => {
  try {
    // Check if changing to a part number that already exists
    if (req.body.partNumber) {
      const existingPart = await Part.findOne({ 
        partNumber: req.body.partNumber,
        _id: { $ne: req.params.id }
      });
      
      if (existingPart) {
        return res.status(400).json({ message: 'Part number already exists' });
      }
    }
    
    const updatedPart = await Part.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!updatedPart) {
      return res.status(404).json({ message: 'Part not found' });
    }
    
    res.json(updatedPart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete part
router.delete('/:id', async (req, res) => {
  try {
    const deletedPart = await Part.findByIdAndDelete(req.params.id);
    
    if (!deletedPart) {
      return res.status(404).json({ message: 'Part not found' });
    }
    
    res.json({ message: 'Part deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get inventory statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalItems = await Part.countDocuments();
    
    const priceStats = await Part.aggregate([
      {
        $group: {
          _id: null,
          totalLandingValue: { $sum: { $multiply: ["$price.landingPrice", "$quantity"] } },
          totalRetailValue: { $sum: { $multiply: ["$price.retailPrice", "$quantity"] } },
          totalQuantity: { $sum: "$quantity" },
        }
      }
    ]);
    
    const locationStats = await Part.aggregate([
      {
        $group: {
          _id: "$location.floor",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const modelStats = await Part.aggregate([
      {
        $group: {
          _id: "$modelName",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      totalItems,
      financialSummary: priceStats[0] || {
        totalLandingValue: 0,
        totalRetailValue: 0,
        totalQuantity: 0
      },
      floorDistribution: locationStats,
      topModels: modelStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bulk import parts
router.post('/bulk-import', async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ message: 'Invalid import data format' });
    }
    
    const results = {
      success: 0,
      failures: 0,
      errors: []
    };
    
    for (const part of req.body) {
      try {
        const existingPart = await Part.findOne({ partNumber: part.partNumber });
        
        if (existingPart) {
          // Update existing part
          await Part.findByIdAndUpdate(
            existingPart._id,
            { ...part, updatedAt: Date.now() }
          );
        } else {
          // Create new part
          const newPart = new Part(part);
          await newPart.save();
        }
        
        results.success++;
      } catch (error) {
        results.failures++;
        results.errors.push({
          partNumber: part.partNumber || 'Unknown',
          error: error.message
        });
      }
    }
    
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;