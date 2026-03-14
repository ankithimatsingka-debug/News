#!/bin/bash

echo "🚀 News Aggregator - Quick Deploy Script"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Ask for deployment option
echo "Choose deployment option:"
echo "1. Run locally (localhost:3000)"
echo "2. Deploy to Vercel (FREE, recommended)"
echo "3. Deploy to Netlify (FREE)"
echo "4. Deploy to Render (FREE)"
echo ""
read -p "Enter option (1-4): " option

case $option in
    1)
        echo ""
        echo "🚀 Starting local server..."
        echo "📍 Server will be available at: http://localhost:3000"
        echo "Press Ctrl+C to stop"
        echo ""
        npm start
        ;;
    2)
        echo ""
        echo "🚀 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null
        then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        vercel
        ;;
    3)
        echo ""
        echo "🚀 Deploying to Netlify..."
        if ! command -v netlify &> /dev/null
        then
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        netlify deploy --prod
        ;;
    4)
        echo ""
        echo "🚀 Deploying to Render..."
        echo "Please visit: https://render.com"
        echo "1. Create a new Web Service"
        echo "2. Connect your Git repository"
        echo "3. Render will auto-deploy"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac
