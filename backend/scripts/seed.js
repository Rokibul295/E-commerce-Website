require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await ActivityLog.deleteMany({});
    
    console.log('🗑️  Cleared existing data');
    
    // Create users
    const users = await User.insertMany([
      {
        name: 'John Seller',
        email: 'john@example.com',
        role: 'seller',
        status: 'pending',
        phone: '123-456-7890'
      },
      {
        name: 'Jane Seller',
        email: 'jane@example.com',
        role: 'seller',
        status: 'active',
        phone: '098-765-4321'
      },
      {
        name: 'Bob Seller',
        email: 'bob@example.com',
        role: 'seller',
        status: 'active',
        phone: '555-123-4567'
      },
      {
        name: 'Alice Seller',
        email: 'alice@example.com',
        role: 'seller',
        status: 'deactivated',
        phone: '555-987-6543'
      }
    ]);
    
    console.log(`✅ Created ${users.length} users`);
    
    // Create transactions
    const transactions = await Transaction.insertMany([
      {
        sellerId: users[1]._id,
        sellerName: 'Jane Seller',
        buyerName: 'Customer A',
        amount: 150.00,
        type: 'sale',
        status: 'completed',
        timestamp: new Date('2024-12-08T10:30:00'),
        productName: 'Laptop'
      },
      {
        sellerId: users[1]._id,
        sellerName: 'Jane Seller',
        buyerName: 'Customer B',
        amount: 250.00,
        type: 'sale',
        status: 'completed',
        timestamp: new Date('2024-12-09T14:20:00'),
        productName: 'Monitor'
      },
      {
        sellerId: users[2]._id,
        sellerName: 'Bob Seller',
        buyerName: 'Customer C',
        amount: 75.00,
        type: 'sale',
        status: 'pending',
        timestamp: new Date('2024-12-09T16:45:00'),
        productName: 'Keyboard'
      },
      {
        sellerId: users[1]._id,
        sellerName: 'Jane Seller',
        buyerName: 'Customer D',
        amount: 50.00,
        type: 'refund',
        status: 'completed',
        timestamp: new Date('2024-12-10T09:15:00'),
        productName: 'Mouse'
      }
    ]);
    
    console.log(`✅ Created ${transactions.length} transactions`);
    
    // Create activity logs
    const logs = await ActivityLog.insertMany([
      {
        userId: users[1]._id,
        userName: 'Jane Seller',
        action: 'login',
        timestamp: new Date('2024-12-10T09:00:00'),
        ipAddress: '192.168.1.1',
        details: 'User logged in successfully'
      },
      {
        userId: users[1]._id,
        userName: 'Jane Seller',
        action: 'created_product',
        timestamp: new Date('2024-12-09T09:15:00'),
        details: 'Created Product: Monitor'
      },
      {
        userId: users[2]._id,
        userName: 'Admin User',
        action: 'approved_seller',
        timestamp: new Date('2024-12-08T11:00:00'),
        details: 'Approved seller: Jane Seller'
      },
      {
        userId: users[2]._id,
        userName: 'Admin User',
        action: 'deactivated_seller',
        timestamp: new Date('2024-12-07T15:30:00'),
        details: 'Deactivated seller: Alice Seller - Reason: Policy violation'
      }
    ]);
    
    console.log(`✅ Created ${logs.length} activity logs`);
    console.log('🎉 Database seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();

