const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
  {
    name: "T-Shirt",
    category: "Clothing",
    price: 500,
    img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=1f3a5b0a6d9b7d3b1f7a8f4b9a6c7d8e",
    description: "Comfortable cotton t-shirt",
    stock: 50
  },
  {
    name: "Jeans",
    category: "Clothing",
    price: 1200,
    img: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=ea7bd8b2b5b3b3f4d1f9383d2f6a2d9e",
    description: "Classic blue jeans",
    stock: 30
  },
  {
    name: "Headphones",
    category: "Electronics",
    price: 2500,
    img: "https://images.unsplash.com/photo-1518441900110-0f8efc2b7f4e?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=07f2fc6a9c5177b28f5b7d4f7b3c1a0d",
    description: "High-quality wireless headphones",
    stock: 25
  },
  {
    name: "Smart Watch",
    category: "Electronics",
    price: 3500,
    img: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=6a2e0a5f7a3f4b8f2d9c7e1c5b4a3f2d",
    description: "Feature-rich smartwatch",
    stock: 20
  },
  {
    name: "Shoes",
    category: "Footwear",
    price: 1800,
    img: "https://images.unsplash.com/photo-1519741497135-7fddf6b412d8?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=b6a7db7a8f9d4b7c8a6d3e9f2b1a8f6c",
    description: "Comfortable running shoes",
    stock: 40
  },
  {
    name: "Leather Jacket",
    category: "Clothing",
    price: 4500,
    img: "https://images.unsplash.com/photo-1542579157-3e3913a21b10?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=d3b4a0b5a9f4e3d1c2b6f8a9e5d4c3b2",
    description: "Premium leather jacket with a modern cut",
    stock: 12
  },
  {
    name: "Sunglasses",
    category: "Accessories",
    price: 900,
    img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=4c9b5c9c6a6e4f1a2b3c5d6e7f8a9b0c",
    description: "Stylish polarized sunglasses",
    stock: 70
  },
  {
    name: "Leather Backpack",
    category: "Accessories",
    price: 3200,
    img: "https://images.unsplash.com/photo-1520962910803-0b4a1c3bb0b5?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=a7d8b6c3d4e5f6a1b2c3d4e5f6a7b8c9",
    description: "Durable leather backpack for everyday carry",
    stock: 25
  },
  {
    name: "Wireless Charger",
    category: "Electronics",
    price: 800,
    img: "https://images.unsplash.com/photo-1564866657316-3b2e9c7b6d0e?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=9c7a4b2d1e3f5b6a7c8d9e0f1a2b3c4d",
    description: "Fast wireless charging pad",
    stock: 80
  },
  {
    name: "Ceramic Coffee Mug",
    category: "Home",
    price: 450,
    img: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=2a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
    description: "Handmade ceramic coffee mug",
    stock: 100
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert products
    await Product.insertMany(products);
    console.log('Seeded products successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();

