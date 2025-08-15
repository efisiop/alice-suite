#!/bin/bash

# Fix Dependencies Script
# This script fixes dependency issues after repository organization

echo "🔧 Fixing Dependencies After Repository Organization"
echo "=================================================="
echo ""

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
if [ ! -d "APPS/alice-reader" ] || [ ! -d "APPS/alice-consultant-dashboard" ]; then
    print_error "Please run this script from the Project_1/alice-suite root directory"
    exit 1
fi

print_status "Starting dependency fix process..."

# Step 1: Build the api-client package
print_status "Step 1: Building api-client package..."

if [ -d "APPS/alice-suite-monorepo/packages/api-client" ]; then
    cd APPS/alice-suite-monorepo/packages/api-client
    
    if [ -f "package.json" ]; then
        print_status "Building @alice-suite/api-client..."
        npm run build
        
        if [ $? -eq 0 ]; then
            print_success "✅ api-client package built successfully"
        else
            print_error "❌ Failed to build api-client package"
            exit 1
        fi
    else
        print_error "❌ api-client package.json not found"
        exit 1
    fi
    
    cd ../../../..
else
    print_error "❌ api-client package directory not found"
    exit 1
fi

echo ""

# Step 2: Reinstall dependencies in alice-reader
print_status "Step 2: Reinstalling dependencies in alice-reader..."

cd APPS/alice-reader

if [ -f "package.json" ]; then
    print_status "Installing dependencies for alice-reader..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "✅ alice-reader dependencies installed successfully"
    else
        print_error "❌ Failed to install alice-reader dependencies"
        exit 1
    fi
else
    print_error "❌ alice-reader package.json not found"
    exit 1
fi

cd ../..

echo ""

# Step 3: Reinstall dependencies in alice-consultant-dashboard
print_status "Step 3: Reinstalling dependencies in alice-consultant-dashboard..."

cd APPS/alice-consultant-dashboard

if [ -f "package.json" ]; then
    print_status "Installing dependencies for alice-consultant-dashboard..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "✅ alice-consultant-dashboard dependencies installed successfully"
    else
        print_error "❌ Failed to install alice-consultant-dashboard dependencies"
        exit 1
    fi
else
    print_error "❌ alice-consultant-dashboard package.json not found"
    exit 1
fi

cd ../..

echo ""

# Step 4: Verify the fix
print_status "Step 4: Verifying the fix..."

# Check if the built package exists
if [ -f "APPS/alice-suite-monorepo/packages/api-client/dist/index.js" ]; then
    print_success "✅ api-client built package found"
else
    print_error "❌ api-client built package not found"
fi

if [ -f "APPS/alice-suite-monorepo/packages/api-client/dist/index.d.ts" ]; then
    print_success "✅ api-client TypeScript definitions found"
else
    print_error "❌ api-client TypeScript definitions not found"
fi

# Check if node_modules exist
if [ -d "APPS/alice-reader/node_modules" ]; then
    print_success "✅ alice-reader node_modules found"
else
    print_error "❌ alice-reader node_modules not found"
fi

if [ -d "APPS/alice-consultant-dashboard/node_modules" ]; then
    print_success "✅ alice-consultant-dashboard node_modules found"
else
    print_error "❌ alice-consultant-dashboard node_modules not found"
fi

echo ""

print_success "🎉 Dependency fix completed!"
echo ""
print_status "Summary:"
echo "✅ Built @alice-suite/api-client package"
echo "✅ Reinstalled alice-reader dependencies"
echo "✅ Reinstalled alice-consultant-dashboard dependencies"
echo "✅ Verified all packages and dependencies"
echo ""
print_status "You can now start your apps:"
echo "  ./TOOLS/scripts/start-both-apps.sh"
echo "  ./TOOLS/scripts/start-dashboard-with-realtime.sh"
echo "  cd APPS/alice-reader && npm run dev"
echo "  cd APPS/alice-consultant-dashboard && npm run dev"
echo ""
print_status "If you still encounter issues, try:"
echo "  rm -rf APPS/*/node_modules && ./TOOLS/scripts/fix-dependencies.sh"

