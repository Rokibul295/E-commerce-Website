# E-commerce Website - MERN Stack

A full-stack e-commerce application built with MongoDB, Express, React, and Node.js.

## Features

- 🔐 User Authentication (Register/Login)
- 🛍️ Product Catalog with Filtering (Search, Category, Price Range)
- 🛒 Shopping Cart with Persistent Storage
- 📦 Order Management
- 💳 Checkout System
- 📱 Responsive Design

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express (MVC Architecture)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## Architecture

This project follows the **MVC (Model-View-Controller)** pattern:

- **Models**: Define data structures and database schemas (`backend/models/`)
- **Controllers**: Handle business logic and request processing (`backend/controllers/`)
- **Routes**: Define API endpoints and connect them to controllers (`backend/routes/`)
- **Views**: React components handle the presentation layer (`frontend/src/components/`)

## Project Structure (MVC Architecture)

```
E-commerce-Website/
├── frontend/              # React frontend (View Layer)
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Context API (Auth)
│   │   └── App.js
│   └── package.json
├── backend/               # Express backend (MVC)
│   ├── models/            # Models (Data Layer)
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── controllers/       # Controllers (Business Logic Layer)
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   └── orderController.js
│   ├── routes/            # Routes (API Endpoints)
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   └── orders.js
│   ├── middleware/        # Middleware
│   │   └── auth.js
│   ├── server.js          # Entry point
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd E-commerce-Website
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables**

   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system. If using MongoDB Atlas, update the `MONGODB_URI` in `.env`.

6. **Seed the Database** (Optional)
   ```bash
   cd backend
   node seed.js
   ```

7. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The server will run on `http://localhost:5002`

8. **Start the Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm start
   ```
   The React app will open in your browser at `http://localhost:3000`

### Quick Start (Alternative)

**For macOS/Linux:**
```bash
./start.sh
```

**For Windows:**
```bash
start.bat
```

**Or open manually from terminal:**
```bash
# macOS
open http://localhost:3000

# Linux
xdg-open http://localhost:3000

# Windows
start http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products (supports query params: category, search, maxPrice, minPrice)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create a product (Admin)

### Cart (Requires Authentication)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

### Orders (Requires Authentication)
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create a new order from cart

## Usage

1. **Register/Login**: Create an account or login to access cart and orders
2. **Browse Products**: View products, filter by category, search, and price range
3. **Add to Cart**: Click "Add to Cart" on any product (requires login)
4. **Manage Cart**: View cart, update quantities, or remove items
5. **Checkout**: Place an order from your cart
6. **View Orders**: Check your order history

## Development

- Backend runs on port 5000
- Frontend runs on port 3000 (proxy configured to backend)
- Hot reload enabled for both frontend and backend (using nodemon)

## Production Build

### Build Frontend
```bash
cd frontend
npm run build
```

### Deploy
- Deploy backend to services like Heroku, Railway, or Render
- Deploy frontend build to Netlify, Vercel, or similar
- Update API URLs in production environment

## License

ISC

