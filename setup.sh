#!/bin/bash

echo "🚀 Setting up Mines Predictor Backend Server"
echo "==========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your Firebase project ID"
fi

# Check if Firebase service account key exists
if [ ! -f "firebase-service-account.json" ]; then
    echo ""
    echo "🔑 Firebase service account key not found!"
    echo "   Please download from Firebase Console:"
    echo "   1. Go to Project Settings → Service Accounts"
    echo "   2. Generate new private key"
    echo "   3. Save as 'firebase-service-account.json' in this directory"
    echo ""
    echo "⚠️  Server will not start without the service account key"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the server:"
echo "  npm start"
echo ""
echo "Health check: http://localhost:3001/health"
echo "API Docs: Check README.md"