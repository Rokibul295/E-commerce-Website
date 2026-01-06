// Helper to ensure products always have images
// Maps product names/categories to image URLs

const imageMap = {
  // Electronics - Phones
  'iphone': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
  'samsung': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop',
  'oneplus': 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500&h=500&fit=crop',
  'xiaomi': 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&h=500&fit=crop',
  'google pixel': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
  'oppo': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop',
  
  // Electronics - Laptops
  'macbook': 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop',
  'dell': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop',
  'hp': 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&h=500&fit=crop',
  'asus': 'https://images.unsplash.com/photo-1603302576837-3756b7d7d176?w=500&h=500&fit=crop',
  'lenovo': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop',
  'acer': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop',
  'microsoft surface': 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&h=500&fit=crop',
  
  // Electronics - Other
  'headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
  'charger': 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&h=500&fit=crop',
  'watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
  'speaker': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
  'tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop',
  'camera': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop',
  'mouse': 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop',
  'keyboard': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop',
  'ssd': 'https://images.unsplash.com/photo-1591488320449-11f0a6c16f43?w=500&h=500&fit=crop',
  
  // Clothing
  'dress': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
  't-shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
  'jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
  'jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
  'hoodie': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
  'sweatshirt': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
  'polo': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
  'sweater': 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=500&fit=crop',
  'blazer': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
  
  // Accessories
  'case': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop',
  'cover': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop',
  'backpack': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
  'sunglasses': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop',
  'wallet': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&h=500&fit=crop',
  'belt': 'https://images.unsplash.com/photo-1624228478915-88485860f5eb?w=500&h=500&fit=crop&auto=format',
  'handbag': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
  'cap': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop',
  'scarf': 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500&h=500&fit=crop',
  
  // Footwear
  'shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
  'sneakers': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
  'boots': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
  'sandals': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
  
  // Home
  'mug': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=500&fit=crop',
  'pillow': 'https://images.unsplash.com/photo-1584100936595-c0652b56f5d2?w=500&h=500&fit=crop',
  'lamp': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop',
  'clock': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&h=500&fit=crop',
  'yoga mat': 'https://images.unsplash.com/photo-1601925260368-ae2f83d8b207?w=500&h=500&fit=crop',
  'water bottle': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
  'wall art': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop',
  'desk chair': 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=500&fit=crop',
  'chair': 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=500&fit=crop',
};

const categoryDefaults = {
  'Electronics': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop',
  'Clothing': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
  'Accessories': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
  'Footwear': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
  'Home': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=500&fit=crop',
};

/**
 * Ensures a product has a valid image URL
 * @param {Object} product - Product object
 * @returns {string} - Valid image URL
 */
export function ensureProductImage(product) {
  // If product already has a valid image URL, use it
  if (product.img && 
      !product.img.includes('placeholder') && 
      !product.img.includes('.svg') &&
      product.img.startsWith('http')) {
    return product.img;
  }

  // Try to match by product name
  const nameLower = product.name.toLowerCase();
  for (const [key, url] of Object.entries(imageMap)) {
    if (nameLower.includes(key)) {
      return url;
    }
  }

  // Fallback to category default
  if (product.category && categoryDefaults[product.category]) {
    return categoryDefaults[product.category];
  }

  // Final fallback - generic product image
  return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop';
}

/**
 * Ensures all products in an array have valid images
 * @param {Array} products - Array of product objects
 * @returns {Array} - Array of products with ensured images
 */
export function ensureProductsImages(products) {
  return products.map(product => ({
    ...product,
    img: ensureProductImage(product)
  }));
}
