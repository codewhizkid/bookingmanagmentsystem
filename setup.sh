#!/bin/bash

echo "🚀 Setting up SalonBook - Salon Management System"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your Supabase credentials!"
else
    echo "✅ Environment file already exists"
fi

# Run type checking
echo "🔍 Running type checks..."
npm run typecheck

# Run linting
echo "🧹 Running linter..."
npm run lint

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env with your Supabase credentials"
echo "2. Run database migrations in Supabase SQL Editor"
echo "3. Start development server: npm run dev"
echo ""
echo "🌐 The app will be available at: http://localhost:5173"
echo ""
echo "📚 Demo accounts:"
echo "  Salon Owner: owner@salonbook.com / password123"
echo "  Stylist: stylist@salonbook.com / password123"
echo "  Customer: customer@example.com / password123"
