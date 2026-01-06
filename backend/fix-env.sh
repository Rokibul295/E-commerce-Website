#!/bin/bash

echo "🔧 Fixing .env File"
echo "==================="
echo ""

ENV_FILE=".env"

# Check if .env exists
if [ -f "$ENV_FILE" ]; then
    echo "📝 Found .env file, updating PORT to 5001..."
    
    # Update PORT if it exists, or add it
    if grep -q "^PORT=" "$ENV_FILE"; then
        # Replace existing PORT line
        sed -i '' 's/^PORT=.*/PORT=5001/' "$ENV_FILE"
        echo "✅ Updated PORT to 5001"
    else
        # Add PORT line
        echo "PORT=5001" >> "$ENV_FILE"
        echo "✅ Added PORT=5001"
    fi
    
    # Ensure MONGODB_URI is set
    if ! grep -q "^MONGODB_URI=" "$ENV_FILE"; then
        echo "MONGODB_URI=mongodb://localhost:27017/ecommerce" >> "$ENV_FILE"
        echo "✅ Added MONGODB_URI"
    fi
    
    echo ""
    echo "📋 Current .env contents:"
    cat "$ENV_FILE"
    echo ""
    echo "✅ .env file fixed!"
else
    echo "📝 Creating new .env file..."
    cat > "$ENV_FILE" << EOF
# Backend Configuration
PORT=5001
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key-here-change-in-production
EOF
    echo "✅ Created .env file with PORT=5001"
    echo ""
    cat "$ENV_FILE"
fi

echo ""
echo "🚀 Now you can run: npm start"
