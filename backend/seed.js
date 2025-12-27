const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
  {
    name: "T-Shirt",
    category: "Clothing",
    price: 500,
    img: "/images/tshirt.svg",
    description: "Comfortable cotton t-shirt",
    stock: 50
  },
  {
    name: "Jeans",
    category: "Clothing",
    price: 1200,
    img: "/images/jeans.svg",
    description: "Classic blue jeans",
    stock: 30
  },
  {
    name: "Headphones",
    category: "Electronics",
    price: 2500,
    img: "/images/headphones.svg",
    description: "High-quality wireless headphones",
    stock: 25
  },
  {
    name: "Smart Watch",
    category: "Electronics",
    price: 3500,
    img: "/images/smartwatch.svg",
    description: "Feature-rich smartwatch",
    stock: 20
  },
  {
    name: "Shoes",
    category: "Footwear",
    price: 1800,
    img: "/images/shoes.svg",
    description: "Comfortable running shoes",
    stock: 40
  },
  {
    name: "Leather Jacket",
    category: "Clothing",
    price: 4500,
    img: "/images/jacket.svg",
    description: "Premium leather jacket with a modern cut",
    stock: 12
  },
  {
    name: "Sunglasses",
    category: "Accessories",
    price: 900,
    img: "/images/sunglasses.svg",
    description: "Stylish polarized sunglasses",
    stock: 70
  },
  {
    name: "Leather Backpack",
    category: "Accessories",
    price: 3200,
    img: "/images/backpack.svg",
    description: "Durable leather backpack for everyday carry",
    stock: 25
  },
  {
    name: "Wireless Charger",
    category: "Electronics",
    price: 800,
    img: "/images/charger.svg",
    description: "Fast wireless charging pad",
    stock: 80
  },
  {
    name: "Ceramic Coffee Mug",
    category: "Home",
    price: 450,
    img: "/images/mug.svg",
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

    // Optionally create an admin user if env vars are provided
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const User = require('./models/User');
      let admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
      if (!admin) {
        admin = new User({
          name: process.env.ADMIN_NAME || 'Admin',
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          isAdmin: true
        });
        await admin.save();
        console.log('Created admin user from env vars');
      } else if (!admin.isAdmin) {
        admin.isAdmin = true;
        await admin.save();
        console.log('Upgraded existing user to admin');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();

