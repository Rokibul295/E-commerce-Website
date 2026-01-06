const mongoose = require('mongoose');
require('dotenv').config();

// Use your MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function resetDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get database name
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Current database: ${dbName}`);
    
    // Drop the entire database
    console.log('\n🗑️  Dropping existing database...');
    await mongoose.connection.db.dropDatabase();
    console.log(`✅ Dropped database: ${dbName}`);
    
    // Create fresh database by creating a collection
    console.log('\n🆕 Creating fresh database...');
    await mongoose.connection.db.createCollection('_init');
    await mongoose.connection.db.collection('_init').drop(); // Remove init collection
    console.log(`✅ Created fresh database: ${dbName}`);
    
    // Verify database is empty
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📋 Collections in database: ${collections.length}`);
    
    if (collections.length === 0) {
      console.log('✅ Database is completely fresh and empty');
    } else {
      console.log('⚠️  Some collections remain:', collections.map(c => c.name).join(', '));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ DATABASE RESET COMPLETE!');
    console.log('='.repeat(50));
    console.log(`\n📊 Database Name: ${dbName}`);
    console.log(`🌐 Connection: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
    console.log('\n💡 Next steps:');
    console.log('   1. All models will use this database automatically');
    console.log('   2. Run: node create-users.js (to create users)');
    console.log('   3. Run: node seedProducts.js (to seed products)');
    console.log('   4. Start your server: npm start');
    console.log('');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    if (error.message.includes('connect')) {
      console.error('\n💡 Make sure MongoDB is running:');
      console.error('   brew services start mongodb-community');
      console.error('   or');
      console.error('   mongod');
    }
    process.exit(1);
  }
}

resetDatabase();
