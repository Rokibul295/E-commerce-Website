require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function createAdminUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get email and role from command line arguments
    const email = process.argv[2] || 'mrx@gmail.com';
    const password = process.argv[3] || 'admin123';
    const role = process.argv[4] || 'admin'; // admin or seller

    console.log(`\n📝 Creating ${role} user:`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: ${role}`);

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      console.log('⚠️  User already exists, updating...');
      user.password = await bcrypt.hash(password, 10);
      user.role = role;
      await user.save();
      console.log(`✅ User updated to ${role}`);
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        name: email.split('@')[0],
        email: email,
        password: hashedPassword,
        role: role
      });
      console.log(`✅ ${role} user created successfully`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📝 USER CREDENTIALS');
    console.log('='.repeat(50));
    console.log(`\n👤 ${role.toUpperCase()} USER:`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role:     ${role}`);
    console.log('\n✅ You can now login with these credentials!');
    console.log('='.repeat(50) + '\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdminUser();
