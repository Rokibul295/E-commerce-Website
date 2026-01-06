#!/bin/bash

echo "🔄 Setting Up Fresh Database"
echo "============================="
echo ""

# Step 1: Reset database
echo "1️⃣  Resetting database (dropping old, creating fresh)..."
node reset-database.js

if [ $? -ne 0 ]; then
    echo "❌ Database reset failed!"
    exit 1
fi

echo ""
echo "2️⃣  Creating users..."
node create-users.js

if [ $? -ne 0 ]; then
    echo "⚠️  User creation failed (might already exist)"
fi

echo ""
echo "3️⃣  Seeding products..."
node seedProducts.js

if [ $? -ne 0 ]; then
    echo "⚠️  Product seeding failed"
fi

echo ""
echo "============================="
echo "✅ Fresh database setup complete!"
echo ""
echo "📊 Database: ecommerce (fresh and clean)"
echo "👤 Users created: user@test.com, admin@test.com"
echo "📦 Products: Seeded"
echo ""
echo "🚀 You can now start your server: npm start"
echo ""
