require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Product = require('./models/Product');

// Image mapping for different product categories
const imageMap = {
  // Electronics - Phones
  'iPhone': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
  'Samsung Galaxy': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop',
  'OnePlus': 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500&h=500&fit=crop',
  'Xiaomi': 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&h=500&fit=crop',
  
  // Electronics - Laptops
  'MacBook': 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop',
  'Dell': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop',
  'HP': 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&h=500&fit=crop',
  'ASUS': 'https://images.unsplash.com/photo-1603302576837-3756b7d7d176?w=500&h=500&fit=crop',
  'Lenovo': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop',
  
  // Accessories - Phone Cases
  'Case': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop',
  'Cover': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop',
  'Wallet': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
  
  // Clothing - Dresses
  'Dress': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
  'Cocktail': 'https://images.unsplash.com/photo-1566479179817-3cf8fed5d5e9?w=500&h=500&fit=crop',
  'Party': 'https://images.unsplash.com/photo-1566479179817-3cf8fed5d5e9?w=500&h=500&fit=crop',
  'Wedding': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
  'Anarkali': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
  'Kurta': 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500&h=500&fit=crop',
  'Ethnic': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop',
  
  // Clothing - Other
  'T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
  'Jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
  'Jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
  'Hoodie': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
  'Sweatshirt': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
  'Polo': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
  'Sweater': 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=500&fit=crop',
  'Blazer': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
  
  // Electronics - Other
  'Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
  'Charger': 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&h=500&fit=crop',
  'Watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
  'Speaker': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
  'Tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop',
  'Camera': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop',
  'Mouse': 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop',
  'Keyboard': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop',
  
  // Accessories
  'Backpack': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
  'Sunglasses': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop',
  'Wallet': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&h=500&fit=crop',
  'Belt': 'https://images.unsplash.com/photo-1624228478915-88485860f5eb?w=500&h=500&fit=crop',
  'Handbag': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
  'Cap': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop',
  'Scarf': 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500&h=500&fit=crop',
  
  // Footwear
  'Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
  'Sneakers': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
  'Formal': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
  'Boots': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
  'Sandals': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
  
  // Home
  'Mug': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=500&fit=crop',
  'Pillow': 'https://images.unsplash.com/photo-1584100936595-c0652b56f5d2?w=500&h=500&fit=crop',
  'Lamp': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop',
  'Clock': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&h=500&fit=crop',
  'Organizer': 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=500&fit=crop',
  'Frame': 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=500&fit=crop',
  'Candle': 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=500&h=500&fit=crop',
};

// Get image URL based on product name and category
function getImageUrl(product) {
  const name = product.name.toLowerCase();
  const category = product.category;
  
  // Check for specific product name matches first
  for (const [key, url] of Object.entries(imageMap)) {
    if (name.includes(key.toLowerCase())) {
      return url;
    }
  }
  
  // Fallback to category-based images
  const categoryImages = {
    'Electronics': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop',
    'Clothing': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
    'Accessories': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    'Footwear': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    'Home': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=500&fit=crop',
  };
  
  return categoryImages[category] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop';
}

async function updateProductImages() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to update`);

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      // Skip if already has a real image URL (not placeholder)
      if (product.img && !product.img.includes('placeholder') && !product.img.includes('.svg')) {
        skipped++;
        continue;
      }

      const newImageUrl = getImageUrl(product);
      await Product.findByIdAndUpdate(product._id, { img: newImageUrl });
      updated++;
      console.log(`✅ Updated: ${product.name} -> ${newImageUrl.substring(0, 50)}...`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Update Summary:');
    console.log(`   ✅ Updated: ${updated} products`);
    console.log(`   ⏭️  Skipped: ${skipped} products (already have real images)`);
    console.log('='.repeat(50));
    console.log('🎉 Product images updated successfully!');
    console.log('   Refresh your frontend to see the new images.');
    console.log('='.repeat(50) + '\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating product images:', error);
    process.exit(1);
  }
}

updateProductImages();
