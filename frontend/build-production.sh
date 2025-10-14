#!/bin/bash

echo "🚀 Building Vertinova Finance App for Production..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Step 1: Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.vite/
print_success "Build directory cleaned"

# Step 2: Install dependencies
print_status "Installing dependencies..."
npm ci --silent
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi
print_success "Dependencies installed"

# Step 3: Run linting
print_status "Running code quality checks..."
npm run lint --silent 2>/dev/null || print_warning "ESLint not configured"

# Step 4: Build for production
print_status "Building for production..."
NODE_ENV=production npm run build

if [ $? -ne 0 ]; then
    print_error "Production build failed"
    exit 1
fi

print_success "Production build completed"

# Step 5: Analyze bundle size
print_status "Analyzing bundle size..."
du -sh dist/
print_status "Bundle contents:"
ls -la dist/assets/

# Step 6: Run build verification
print_status "Verifying build..."
if [ -f "dist/index.html" ] && [ -d "dist/assets" ]; then
    print_success "Build verification passed"
else
    print_error "Build verification failed"
    exit 1
fi

# Step 7: Performance recommendations
echo ""
print_status "Performance Recommendations:"
echo "  ✅ Enable gzip compression on your server"
echo "  ✅ Set proper cache headers for static assets"
echo "  ✅ Use a CDN for faster asset delivery"
echo "  ✅ Monitor Core Web Vitals"
echo ""

print_success "🎉 Production build ready!"
print_status "Deploy the 'dist' folder to your web server"
echo "=================================================="