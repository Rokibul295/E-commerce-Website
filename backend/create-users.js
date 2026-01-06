const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createUsers() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Create regular user
    const userEmail = 'user@test.com';
    const userPassword = 'user123456';
    
    // Check if user exists
    let user = await User.findOne({ email: userEmail });
    if (user) {
      console.log('⚠️  Regular user already exists, updating password...');
      user.password = await bcrypt.hash(userPassword, 10);
      user.name = 'Test User';
      user.role = 'user';
      await user.save();
    } else {
      const hashedUserPassword = await bcrypt.hash(userPassword, 10);
      user = await User.create({
        name: 'Test User',
        email: userEmail,
        password: hashedUserPassword,
        role: 'user'
      });
      console.log('✅ Regular user created');
    }
    
    // Create admin user
    const adminEmail = 'admin@test.com';
    const adminPassword = 'admin123456';
    
    // Check if admin exists
    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      console.log('⚠️  Admin user already exists, updating password and role...');
      admin.password = await bcrypt.hash(adminPassword, 10);
      admin.role = 'admin';
      admin.name = 'Admin User';
      await admin.save();
    } else {
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
      admin = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: hashedAdminPassword,
        role: 'admin'
      });
      console.log('✅ Admin user created');
    }
    
    // Create seller user
    const sellerEmail = 'seller@test.com';
    const sellerPassword = 'seller123456';
    
    // Check if seller exists
    let seller = await User.findOne({ email: sellerEmail });
    if (seller) {
      console.log('⚠️  Seller user already exists, updating password and role...');
      seller.password = await bcrypt.hash(sellerPassword, 10);
      seller.role = 'seller';
      seller.name = 'Seller User';
      await seller.save();
    } else {
      const hashedSellerPassword = await bcrypt.hash(sellerPassword, 10);
      seller = await User.create({
        name: 'Seller User',
        email: sellerEmail,
        password: hashedSellerPassword,
        role: 'seller'
      });
      console.log('✅ Seller user created');
    }

    console.log('\n' + '='.repeat(50));
    console.log('📝 USER CREDENTIALS');
    console.log('='.repeat(50));
    console.log('\n👤 REGULAR USER:');
    console.log('   Email:    ' + userEmail);
    console.log('   Password: ' + userPassword);
    console.log('   Role:     user');
    console.log('\n👑 ADMIN USER:');
    console.log('   Email:    ' + adminEmail);
    console.log('   Password: ' + adminPassword);
    console.log('   Role:     admin');
    console.log('\n🏪 SELLER USER:');
    console.log('   Email:    ' + sellerEmail);
    console.log('   Password: ' + sellerPassword);
    console.log('   Role:     seller');
    console.log('\n' + '='.repeat(50));
    console.log('✅ Users are ready to use!');
    console.log('   You can now login at: http://localhost:5173/login');
    console.log('='.repeat(50) + '\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('connect')) {
      console.error('\n💡 Make sure MongoDB is running:');
      console.error('   brew services start mongodb-community');
      console.error('   or');
      console.error('   mongod');
    }
    process.exit(1);
  }
}

createUsers();
