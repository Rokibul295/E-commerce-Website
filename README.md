# MERN Stack Admin Dashboard

A full-stack admin dashboard application built with MongoDB, Express.js, React, and Node.js (MERN stack).

## Features

- **User Management**: View, approve, and manage seller accounts
- **Transaction Management**: Track and monitor all transactions
- **Activity Logs**: View system activity and user actions
- **Reports**: Generate sales, activity, and comprehensive reports
- **Data Export**: Export data in JSON or CSV format
- **System Backup**: Create full system backups

## Tech Stack

- **Frontend**: React 18, React Router, Axios, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Styling**: CSS3 with modern design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd cse470
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Set up Environment Variables

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/cse470
PORT=5000
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cse470
PORT=5000
```

### 5. Seed the Database

```bash
cd backend
npm run seed
```

This will populate the database with sample data.

## Running the Application

### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start the Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
cse470/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── userController.js   # User management logic
│   │   ├── transactionController.js
│   │   ├── reportController.js
│   │   └── exportController.js
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Transaction.js      # Transaction schema
│   │   └── ActivityLog.js       # Activity log schema
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── reportRoutes.js
│   │   └── exportRoutes.js
│   ├── scripts/
│   │   └── seed.js              # Database seeding script
│   └── server.js                # Express server
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Main dashboard page
│   │   │   └── Reports.jsx      # Reports page
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── index.html
│   └── vite.config.js
│
└── README.md
```

## API Endpoints

### Users
- `GET /api/users/sellers` - Get all sellers
- `GET /api/users/sellers/pending` - Get pending sellers
- `GET /api/users/stats` - Get user statistics
- `PUT /api/users/sellers/:id/approve` - Approve seller
- `PUT /api/users/sellers/:id/deactivate` - Deactivate seller

### Transactions
- `GET /api/transactions` - Get all transactions (with pagination)
- `GET /api/transactions/:id` - Get transaction by ID
- `GET /api/transactions/stats` - Get transaction statistics
- `GET /api/transactions/logs` - Get activity logs

### Reports
- `GET /api/reports/sales` - Generate sales report
- `GET /api/reports/user-activity` - Generate activity report
- `GET /api/reports/comprehensive` - Generate comprehensive report

### Export
- `GET /api/export/users` - Export users data
- `GET /api/export/transactions` - Export transactions
- `GET /api/export/logs` - Export activity logs
- `GET /api/export/backup` - Create system backup

## Development

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed the database with sample data

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Notes

- Make sure MongoDB is running before starting the backend server
- The frontend proxy is configured to forward `/api` requests to the backend
- All dates in the database are stored in UTC format
- The seed script will clear existing data before seeding

## License

ISC

