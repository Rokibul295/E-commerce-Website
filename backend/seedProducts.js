require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Product = require('./models/Product');

const products = [
  // Mobile Phones
  {
    name: "iPhone 15 Pro",
    category: "Electronics",
    price: 99999,
    img: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop",
    description: "Latest iPhone with A17 Pro chip, 6.1-inch display, 128GB storage",
    stock: 25
  },
  {
    name: "Samsung Galaxy S24",
    category: "Electronics",
    price: 89999,
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
    description: "Premium Android smartphone with 8GB RAM, 256GB storage",
    stock: 30
  },
  {
    name: "OnePlus 12",
    category: "Electronics",
    price: 64999,
    img: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500&h=500&fit=crop",
    description: "Flagship killer with Snapdragon 8 Gen 3, 16GB RAM",
    stock: 20
  },
  {
    name: "Xiaomi Redmi Note 13",
    category: "Electronics",
    price: 18999,
    img: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&h=500&fit=crop",
    description: "Budget-friendly smartphone with 108MP camera",
    stock: 50
  },

  // Laptops
  {
    name: "MacBook Pro 14-inch",
    category: "Electronics",
    price: 199999,
    img: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop",
    description: "M3 chip, 16GB RAM, 512GB SSD - Perfect for professionals",
    stock: 15
  },
  {
    name: "Dell XPS 15",
    category: "Electronics",
    price: 149999,
    img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop",
    description: "Intel i7, 32GB RAM, 1TB SSD, NVIDIA RTX 4050",
    stock: 18
  },
  {
    name: "HP Pavilion 15",
    category: "Electronics",
    price: 54999,
    img: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&h=500&fit=crop",
    description: "AMD Ryzen 7, 16GB RAM, 512GB SSD - Great for students",
    stock: 35
  },
  {
    name: "ASUS ROG Strix G16",
    category: "Electronics",
    price: 129999,
    img: "https://images.unsplash.com/photo-1603302576837-3756b7d7d176?w=500&h=500&fit=crop",
    description: "Gaming laptop with RTX 4060, 16GB RAM, 1TB SSD",
    stock: 12
  },
  {
    name: "Lenovo ThinkPad X1 Carbon",
    category: "Electronics",
    price: 169999,
    img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop",
    description: "Ultra-light business laptop, Intel i7, 16GB RAM",
    stock: 10
  },

  // Mobile Covers
  {
    name: "Silicone iPhone Case",
    category: "Accessories",
    price: 900,
    img: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop",
    description: "Soft silicone protective case for iPhone 15 series",
    stock: 100
  },
  {
    name: "Clear Transparent Phone Case",
    category: "Accessories",
    price: 599,
    img: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop",
    description: "Crystal clear case showing your phone's original design",
    stock: 150
  },
  {
    name: "Leather Wallet Phone Case",
    category: "Accessories",
    price: 1299,
    img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
    description: "Premium leather case with card slots and money pocket",
    stock: 60
  },
  {
    name: "Rugged Armor Case",
    category: "Accessories",
    price: 1499,
    img: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop",
    description: "Military-grade protection with shock absorption",
    stock: 80
  },
  {
    name: "Samsung Galaxy Case",
    category: "Accessories",
    price: 799,
    img: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop",
    description: "Protective case for Samsung Galaxy S24 series",
    stock: 120
  },
  {
    name: "Patterned Phone Cover",
    category: "Accessories",
    price: 699,
    img: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop",
    description: "Stylish floral pattern case for all smartphones",
    stock: 90
  },

  // Dresses - Casual
  {
    name: "Casual Summer Dress",
    category: "Clothing",
    price: 2499,
    img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop",
    description: "Lightweight floral print dress, perfect for summer days",
    stock: 45
  },
  {
    name: "Cotton Midi Dress",
    category: "Clothing",
    price: 1899,
    img: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500&h=500&fit=crop",
    description: "Comfortable knee-length dress in various colors",
    stock: 55
  },
  {
    name: "Denim Dress",
    category: "Clothing",
    price: 3299,
    img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop",
    description: "Classic denim dress with button front",
    stock: 30
  },
  {
    name: "Striped T-Shirt Dress",
    category: "Clothing",
    price: 1599,
    img: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500&h=500&fit=crop",
    description: "Casual striped dress, perfect for everyday wear",
    stock: 60
  },

  // Dresses - Formal
  {
    name: "Elegant Black Cocktail Dress",
    category: "Clothing",
    price: 5499,
    img: "https://images.unsplash.com/photo-1566479179817-3cf8fed5d5e9?w=500&h=500&fit=crop",
    description: "Classic black dress for formal occasions and parties",
    stock: 25
  },
  {
    name: "Office Professional Dress",
    category: "Clothing",
    price: 3999,
    img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop",
    description: "Formal dress suitable for office and business meetings",
    stock: 35
  },
  {
    name: "A-Line Formal Dress",
    category: "Clothing",
    price: 4499,
    img: "https://images.unsplash.com/photo-1566479179817-3cf8fed5d5e9?w=500&h=500&fit=crop",
    description: "Elegant A-line dress in navy blue, perfect for events",
    stock: 20
  },
  {
    name: "Wrap Dress",
    category: "Clothing",
    price: 3799,
    img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop",
    description: "Flattering wrap dress suitable for formal occasions",
    stock: 28
  },

  // Dresses - Party/Wedding
  {
    name: "Evening Party Dress",
    category: "Clothing",
    price: 6999,
    img: "https://images.unsplash.com/photo-1566479179817-3cf8fed5d5e9?w=500&h=500&fit=crop",
    description: "Glamorous sequin dress for evening parties and events",
    stock: 15
  },
  {
    name: "Wedding Guest Dress",
    category: "Clothing",
    price: 5999,
    img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop",
    description: "Elegant pastel dress perfect for weddings",
    stock: 18
  },
  {
    name: "Cocktail Party Dress",
    category: "Clothing",
    price: 6499,
    img: "https://images.unsplash.com/photo-1566479179817-3cf8fed5d5e9?w=500&h=500&fit=crop",
    description: "Stylish dress with floral pattern for cocktail parties",
    stock: 22
  },
  {
    name: "Maxi Evening Dress",
    category: "Clothing",
    price: 7499,
    img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop",
    description: "Long flowing dress perfect for formal evening events",
    stock: 12
  },

  // Dresses - Traditional
  {
    name: "Ethnic Embroidered Dress",
    category: "Clothing",
    price: 4999,
    img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop",
    description: "Traditional dress with beautiful embroidery work",
    stock: 30
  },
  {
    name: "Anarkali Dress",
    category: "Clothing",
    price: 4499,
    img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop",
    description: "Elegant traditional Anarkali style dress",
    stock: 25
  },
  {
    name: "Kurta Dress",
    category: "Clothing",
    price: 1999,
    img: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500&h=500&fit=crop",
    description: "Comfortable traditional kurta style dress",
    stock: 50
  },

  // Existing products (keep some original ones)
  {
    name: "Ceramic Coffee Mug",
    category: "Home",
    price: 450,
    img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=500&fit=crop",
    description: "Handmade ceramic coffee mug",
    stock: 100
  },
  {
    name: "Classic T-Shirt",
    category: "Clothing",
    price: 500,
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
    description: "Comfortable cotton t-shirt",
    stock: 80
  },
  {
    name: "Wireless Headphones",
    category: "Electronics",
    price: 2500,
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    description: "High-quality wireless headphones",
    stock: 40
  },
  {
    name: "Leather Backpack",
    category: "Accessories",
    price: 3200,
    img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
    description: "Durable leather backpack for everyday carry",
    stock: 35
  },
  {
    name: "Running Shoes",
    category: "Footwear",
    price: 1800,
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
    description: "Comfortable running shoes",
    stock: 60
  },
  {
    name: "Leather Jacket",
    category: "Clothing",
    price: 4500,
    img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop",
    description: "Premium leather jacket with a modern cut",
    stock: 20
  },
  {
    name: "Sunglasses",
    category: "Accessories",
    price: 900,
    img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop",
    description: "Stylish polarized sunglasses",
    stock: 70
  },
  {
    name: "Wireless Charger",
    category: "Electronics",
    price: 800,
    img: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&h=500&fit=crop",
    description: "Fast wireless charging pad",
    stock: 90
  },
  {
    name: "Smart Watch",
    category: "Electronics",
    price: 3500,
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
    description: "Feature-rich smartwatch",
    stock: 45
  },
  {
    name: "Jeans",
    category: "Clothing",
    price: 1200,
    img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
    description: "Classic blue jeans",
    stock: 65
  },

  // Additional Electronics
  {
    name: "AirPods Pro",
    category: "Electronics",
    price: 24999,
    img: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&h=500&fit=crop",
    description: "Active noise cancellation wireless earbuds",
    stock: 40
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    category: "Electronics",
    price: 34999,
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    description: "Premium noise-cancelling over-ear headphones",
    stock: 25
  },
  {
    name: "iPad Air",
    category: "Electronics",
    price: 79999,
    img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop",
    description: "10.9-inch tablet with M2 chip, 256GB storage",
    stock: 20
  },
  {
    name: "Nintendo Switch",
    category: "Electronics",
    price: 34999,
    img: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&h=500&fit=crop",
    description: "Gaming console with Joy-Con controllers",
    stock: 30
  },
  {
    name: "DJI Mini 3 Drone",
    category: "Electronics",
    price: 89999,
    img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&h=500&fit=crop",
    description: "Compact 4K camera drone with 3-axis gimbal",
    stock: 15
  },
  {
    name: "Logitech MX Master 3 Mouse",
    category: "Electronics",
    price: 8999,
    img: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop",
    description: "Ergonomic wireless mouse with precision tracking",
    stock: 50
  },
  {
    name: "Mechanical Keyboard RGB",
    category: "Electronics",
    price: 12999,
    img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop",
    description: "RGB backlit mechanical gaming keyboard",
    stock: 35
  },
  {
    name: "Portable SSD 1TB",
    category: "Electronics",
    price: 8999,
    img: "https://images.unsplash.com/photo-1591488320449-11f0a6c16f43?w=500&h=500&fit=crop",
    description: "Fast external SSD for data storage",
    stock: 60
  },

  // Additional Clothing
  {
    name: "Winter Coat",
    category: "Clothing",
    price: 5999,
    img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&h=500&fit=crop",
    description: "Warm winter coat with hood",
    stock: 30
  },
  {
    name: "Denim Jacket",
    category: "Clothing",
    price: 3499,
    img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop",
    description: "Classic blue denim jacket",
    stock: 40
  },
  {
    name: "Knit Sweater",
    category: "Clothing",
    price: 2799,
    img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=500&fit=crop",
    description: "Cozy knit sweater for winter",
    stock: 45
  },
  {
    name: "Cargo Pants",
    category: "Clothing",
    price: 2299,
    img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
    description: "Comfortable cargo pants with multiple pockets",
    stock: 50
  },
  {
    name: "Yoga Leggings",
    category: "Clothing",
    price: 1899,
    img: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500&h=500&fit=crop",
    description: "Stretchy yoga leggings for active wear",
    stock: 55
  },
  {
    name: "Formal Shirt",
    category: "Clothing",
    price: 1499,
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
    description: "Classic white formal shirt",
    stock: 70
  },
  {
    name: "Summer Shorts",
    category: "Clothing",
    price: 999,
    img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
    description: "Comfortable summer shorts",
    stock: 80
  },
  {
    name: "Wool Scarf",
    category: "Clothing",
    price: 1299,
    img: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500&h=500&fit=crop",
    description: "Warm woolen scarf for winter",
    stock: 60
  },

  // Additional Accessories
  {
    name: "Leather Belt",
    category: "Accessories",
    price: 1499,
    img: "https://images.unsplash.com/photo-1624228478915-88485860f5eb?w=500&h=500&fit=crop&auto=format",
    description: "Genuine leather belt with classic buckle",
    stock: 55
  },
  {
    name: "Leather Wallet",
    category: "Accessories",
    price: 1999,
    img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&h=500&fit=crop",
    description: "Premium leather wallet with card slots",
    stock: 40
  },
  {
    name: "Baseball Cap",
    category: "Accessories",
    price: 799,
    img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop",
    description: "Classic baseball cap with adjustable strap",
    stock: 65
  },
  {
    name: "Leather Handbag",
    category: "Accessories",
    price: 4499,
    img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
    description: "Stylish leather handbag for everyday use",
    stock: 30
  },
  {
    name: "Analog Watch",
    category: "Accessories",
    price: 8999,
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
    description: "Elegant analog wristwatch",
    stock: 25
  },
  {
    name: "Travel Backpack",
    category: "Accessories",
    price: 3999,
    img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
    description: "Durable travel backpack with laptop compartment",
    stock: 35
  },
  {
    name: "Aviator Sunglasses",
    category: "Accessories",
    price: 1299,
    img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop",
    description: "Classic aviator style sunglasses",
    stock: 50
  },
  {
    name: "Phone Stand",
    category: "Accessories",
    price: 499,
    img: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&h=500&fit=crop",
    description: "Adjustable phone stand for desk",
    stock: 100
  },

  // Additional Footwear
  {
    name: "Casual Sneakers",
    category: "Footwear",
    price: 4999,
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
    description: "Comfortable casual sneakers for everyday wear",
    stock: 40
  },
  {
    name: "Leather Dress Shoes",
    category: "Footwear",
    price: 6999,
    img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop",
    description: "Classic leather dress shoes for formal occasions",
    stock: 30
  },
  {
    name: "Hiking Boots",
    category: "Footwear",
    price: 8999,
    img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop",
    description: "Durable hiking boots with waterproof protection",
    stock: 25
  },
  {
    name: "Canvas Sneakers",
    category: "Footwear",
    price: 2999,
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
    description: "Lightweight canvas sneakers",
    stock: 50
  },
  {
    name: "Flip Flops",
    category: "Footwear",
    price: 499,
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
    description: "Comfortable flip flops for beach and casual wear",
    stock: 90
  },
  {
    name: "Ankle Boots",
    category: "Footwear",
    price: 5999,
    img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop",
    description: "Stylish ankle boots for women",
    stock: 35
  },

  // Additional Home Products
  {
    name: "Bed Sheets Set",
    category: "Home",
    price: 2499,
    img: "https://images.unsplash.com/photo-1584100936595-c0652b56f5d2?w=500&h=500&fit=crop",
    description: "Soft cotton bed sheets set",
    stock: 40
  },
  {
    name: "Desk Chair",
    category: "Home",
    price: 8999,
    img: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=500&fit=crop",
    description: "Ergonomic office desk chair",
    stock: 20
  },
  {
    name: "Bluetooth Speaker",
    category: "Home",
    price: 3499,
    img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
    description: "Portable Bluetooth speaker with great sound",
    stock: 30
  },
  {
    name: "Yoga Mat",
    category: "Home",
    price: 1299,
    img: "https://images.unsplash.com/photo-1601925260368-ae2f83d8b207?w=500&h=500&fit=crop",
    description: "Non-slip yoga mat for exercise",
    stock: 55
  },
  {
    name: "Water Bottle",
    category: "Home",
    price: 599,
    img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop",
    description: "Stainless steel insulated water bottle",
    stock: 75
  },
  {
    name: "Plant Pot",
    category: "Home",
    price: 399,
    img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=500&fit=crop",
    description: "Decorative ceramic plant pot",
    stock: 80
  },
  {
    name: "Wall Art",
    category: "Home",
    price: 1999,
    img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop",
    description: "Modern wall art print",
    stock: 25
  },
  {
    name: "Storage Basket",
    category: "Home",
    price: 899,
    img: "https://images.unsplash.com/photo-1584100936595-c0652b56f5d2?w=500&h=500&fit=crop",
    description: "Woven storage basket for organization",
    stock: 60
  }
];

async function seedProducts() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert products
    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ Seeded ${insertedProducts.length} products successfully`);
    console.log('🎉 Database seeded with products!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();

