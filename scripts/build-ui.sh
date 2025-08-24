#!/bin/bash

# Build UI Integration Script for TeachGate VPN
# This script builds the React UI and prepares it for Cordova integration

set -e

echo "🚀 Building TeachGate VPN UI for Cordova integration..."

# Ensure we're in the project root
cd "$(dirname "$0")/.."

# Check if ui directory exists
if [ ! -d "ui" ]; then
    echo "❌ Error: ui directory not found"
    exit 1
fi

# Install UI dependencies if needed
echo "📦 Checking UI dependencies..."
cd ui
if [ ! -d "node_modules" ]; then
    echo "Installing UI dependencies..."
    npm install
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf ../www/assets/
rm -f ../www/index.html
rm -f ../www/manifest.json

# Build the React app
echo "🔨 Building React UI..."
npm run build

# Verify build output
cd ..
if [ ! -f "www/index.html" ]; then
    echo "❌ Error: Build failed - index.html not found in www/"
    exit 1
fi

echo "✅ UI build complete!"
echo "📁 Build output is in: www/"
echo ""
echo "Next steps:"
echo "1. Open Xcode project: open Outline.xcodeproj"
echo "2. Build and run the macOS app"
echo "3. The React UI will be served from the www/ directory"

# Optional: Show build size
if command -v du >/dev/null 2>&1; then
    echo ""
    echo "📊 Build size:"
    du -sh www/
fi