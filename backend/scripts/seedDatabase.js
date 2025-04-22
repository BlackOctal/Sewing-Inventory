// scripts/seedDatabase.js - Script to seed the database with sample data
const mongoose = require('mongoose');
const Part = require('../models/Part');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Sample data generator function
const generateSampleParts = (count) => {
  const parts = [];
  const modelNames = ['Singer 1507', 'Juki DDL-8700', 'Brother CS6000i', 'Janome HD3000', 'Pfaff Quilt Expression 4.2'];
  const partCategories = [
    { prefix: 'TG', name: 'Thread Guide' },
    { prefix: 'NP', name: 'Needle Plate' },
    { prefix: 'BC', name: 'Bobbin Case' },
    { prefix: 'FD', name: 'Feed Dog' },
    { prefix: 'PF', name: 'Presser Foot' },
    { prefix: 'TP', name: 'Tension Pulley' },
    { prefix: 'NB', name: 'Needle Bar' },
    { prefix: 'SH', name: 'Shuttle Hook' },
    { prefix: 'MT', name: 'Motor' },
    { prefix: 'PD', name: 'Pedal' }
  ];
  const boxColors = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Orange', 'Purple'];
  
  for (let i = 1; i <= count; i++) {
    const category = partCategories[Math.floor(Math.random() * partCategories.length)];
    const modelName = modelNames[Math.floor(Math.random() * modelNames.length)];
    const boxColor = boxColors[Math.floor(Math.random() * boxColors.length)];
    
    const partNumber = `${category.prefix}-${String(i).padStart(3, '0')}`;
    const partName = `${category.name} ${Math.floor(Math.random() * 10) + 1}`;
    
    // Generate random landing price between 100 and 5000
    const landingPrice = Math.floor(Math.random() * 4900) + 100;
    // Retail price is landing price + random markup between 20% and 50%
    const retailPrice = landingPrice * (1 + (Math.random() * 0.3 + 0.2));
    
    parts.push({
      partName,
      partNumber,
      modelName,
      location: {
        floor: Math.floor(Math.random() * 3) + 1,
        rack: Math.floor(Math.random() * 10) + 1,
        row: Math.floor(Math.random() * 6) + 1,
        column: Math.floor(Math.random() * 4) + 1,
        boxNumber: `BX-${String(Math.floor(Math.random() * 100) + 1).padStart(2, '0')}`,
        boxColor
      },
      price: {
        landingPrice,
        retailPrice: Math.round(retailPrice * 100) / 100
      },
      quantity: Math.floor(Math.random() * 50) + 1
    });
  }
  
  return parts;
};

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sewingPartsInventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connection established for seeding');
  
  try {
    // Clear existing data
    await Part.deleteMany({});
    console.log('Cleared existing parts data');
    
    // Generate and insert sample data
    const sampleParts = generateSampleParts(100); // Generate 100 sample parts
    await Part.insertMany(sampleParts);
    console.log(`Added ${sampleParts.length} sample parts to the database`);
    
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.disconnect();
  }
})
.catch(err => console.error('MongoDB connection error:', err));