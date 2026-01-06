const mongoose = require("mongoose");

// Unified database configuration - single database for entire website
// All services use this same database
// You can set MONGODB_URI in .env file, or it will use the default below
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

const connectDB = async () => {
  try {
    // Try localhost first, if it fails try 127.0.0.1
    let connectionUri = MONGODB_URI;
    console.log(`🔄 Connecting to MongoDB: ${connectionUri.replace(/\/\/.*@/, '//***:***@')}...`);
    
    try {
      await mongoose.connect(connectionUri, {
        serverSelectionTimeoutMS: 10000, // Increased timeout to 10 seconds
        socketTimeoutMS: 45000,
      });
    } catch (firstError) {
      // If localhost fails, try 127.0.0.1
      if (connectionUri.includes('localhost') && !connectionUri.includes('127.0.0.1')) {
        console.log(`⚠️  localhost failed, trying 127.0.0.1...`);
        connectionUri = connectionUri.replace('localhost', '127.0.0.1');
        await mongoose.connect(connectionUri, {
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        });
      } else {
        throw firstError;
      }
    }
    
    console.log(`✅ MongoDB Connected successfully!`);
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB connection failed!");
    console.error("Error details:", error.message);
    console.error("\n💡 Troubleshooting tips:");
    console.error("   1. Make sure MongoDB is running: brew services start mongodb-community");
    console.error("   2. Or start MongoDB manually: mongod");
    console.error("   3. Check if MongoDB is accessible: mongosh mongodb://127.0.0.1:27017");
    console.error(`   4. Verify connection string: ${MONGODB_URI}`);
    process.exit(1);
  }
};

module.exports = connectDB;
