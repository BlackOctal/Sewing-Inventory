// server.js - Main Express server file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Routes
const partRoutes = require('./routes/partRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sewingPartsInventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connection established'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/parts', partRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Sewing Machine Parts Inventory API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});