require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

const app = express();

// Middleware - CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Server is running",
    database: "ecommerce",
    timestamp: new Date().toISOString()
  });
});

// Routes - All routes registered here for unified database access
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/export", require("./routes/exportRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/recommendations", require("./routes/recommendations"));

// Check if port is available (simplified - no auto-kill needed since we're using 5001)
const checkPort = (port) => {
  return new Promise((resolve) => {
    const { execSync } = require('child_process');
    try {
      const pids = execSync(`lsof -ti:${port}`, { encoding: 'utf-8' }).trim();
      if (pids) {
        const pidList = pids.split('\n').filter(p => p).join(', ');
        console.error(`\n❌ Port ${port} is already in use by process(es): ${pidList}`);
        console.error(`\n🔍 Debug: Checking port ${port} (PORT variable: ${process.env.PORT || 'not set, using default 5001'})`);
        console.error(`\n💡 Solutions:`);
        console.error(`   1. Kill the process: lsof -ti:${port} | xargs kill -9`);
        console.error(`   2. Or use a different port: PORT=8000 npm start\n`);
        resolve(false);
      } else {
        resolve(true);
      }
    } catch (e) {
      // Port is free if lsof returns no results
      resolve(true);
    }
  });
};

// Start server
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 5001; // Changed from 5000 to avoid macOS Control Center conflict
    
    // Check if port is available BEFORE connecting to MongoDB
    const portAvailable = await checkPort(PORT);
    if (!portAvailable) {
      process.exit(1);
    }
    
    // Connect to MongoDB
    await connectDB();
    
    // Try to start server
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 ========================================`);
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`✅ All routes registered - using unified database`);
      console.log(`📊 Database: ecommerce`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`\n💡 Note: Using port ${PORT} to avoid macOS Control Center conflict on port 5000`);
      console.log(`🚀 ========================================\n`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use!`);
        console.error(`\n💡 Run: ./kill-port-5000.sh`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
