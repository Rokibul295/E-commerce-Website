const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

// Serve frontend build (static files) and images when present
const path = require('path');
const buildPath = path.join(__dirname, '..', 'frontend', 'build');
const publicImages = path.join(__dirname, '..', 'frontend', 'public', 'images');

// Serve built frontend static files
app.use(express.static(buildPath));

// Serve images from frontend/public/images at /images/* so absolute paths work
app.use('/images', express.static(publicImages));

// For any other route not starting with /api, return the frontend index.html (single page app)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the process using that port or change PORT in server/.env`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

