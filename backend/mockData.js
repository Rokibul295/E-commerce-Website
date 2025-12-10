// Mock users database
let users = [
  {
    id: '1',
    name: 'John Seller',
    email: 'john@example.com',
    role: 'seller',
    status: 'pending',
    createdAt: new Date('2024-11-01'),
    phone: '123-456-7890'
  },
  {
    id: '2',
    name: 'Jane Seller',
    email: 'jane@example.com',
    role: 'seller',
    status: 'active',
    createdAt: new Date('2024-11-15'),
    phone: '098-765-4321'
  },
  {
    id: '3',
    name: 'Bob Seller',
    email: 'bob@example.com',
    role: 'seller',
    status: 'active',
    createdAt: new Date('2024-10-20'),
    phone: '555-123-4567'
  },
  {
    id: '4',
    name: 'Alice Seller',
    email: 'alice@example.com',
    role: 'seller',
    status: 'deactivated',
    createdAt: new Date('2024-09-15'),
    phone: '555-987-6543'
  }
];

// Mock transactions database
let transactions = [
  {
    id: 'txn1',
    sellerId: '2',
    sellerName: 'Jane Seller',
    buyerName: 'Customer A',
    amount: 150.00,
    type: 'sale',
    status: 'completed',
    timestamp: new Date('2024-12-08T10:30:00'),
    productName: 'Laptop'
  },
  {
    id: 'txn2',
    sellerId: '2',
    sellerName: 'Jane Seller',
    buyerName: 'Customer B',
    amount: 250.00,
    type: 'sale',
    status: 'completed',
    timestamp: new Date('2024-12-09T14:20:00'),
    productName: 'Monitor'
  },
  {
    id: 'txn3',
    sellerId: '3',
    sellerName: 'Bob Seller',
    buyerName: 'Customer C',
    amount: 75.00,
    type: 'sale',
    status: 'pending',
    timestamp: new Date('2024-12-09T16:45:00'),
    productName: 'Keyboard'
  },
  {
    id: 'txn4',
    sellerId: '2',
    sellerName: 'Jane Seller',
    buyerName: 'Customer D',
    amount: 50.00,
    type: 'refund',
    status: 'completed',
    timestamp: new Date('2024-12-10T09:15:00'),
    productName: 'Mouse'
  }
];

// Mock activity logs
let activityLogs = [
  {
    id: 'log1',
    userId: '2',
    userName: 'Jane Seller',
    action: 'login',
    timestamp: new Date('2024-12-10T09:00:00'),
    ipAddress: '192.168.1.1',
    details: 'User logged in successfully'
  },
  {
    id: 'log2',
    userId: '2',
    userName: 'Jane Seller',
    action: 'created_product',
    timestamp: new Date('2024-12-09T09:15:00'),
    details: 'Created Product: Monitor'
  },
  {
    id: 'log3',
    userId: '3',
    userName: 'Admin User',
    action: 'approved_seller',
    timestamp: new Date('2024-12-08T11:00:00'),
    details: 'Approved seller: Jane Seller'
  },
  {
    id: 'log4',
    userId: '3',
    userName: 'Admin User',
    action: 'deactivated_seller',
    timestamp: new Date('2024-12-07T15:30:00'),
    details: 'Deactivated seller: Alice Seller - Reason: Policy violation'
  }
];

module.exports = { users, transactions, activityLogs };