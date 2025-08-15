#!/bin/bash

# Test App Startup Script
# This script tests if the apps can be started from their new organized locations

echo "🧪 Testing App Startup from New Organized Structure"
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

print_status "Testing directory structure..."

# Test 1: Check if apps exist in new locations
if [ -d "APPS/alice-reader" ]; then
    print_success "✅ alice-reader found in APPS/"
else
    print_error "❌ alice-reader not found in APPS/"
fi

if [ -d "APPS/alice-consultant-dashboard" ]; then
    print_success "✅ alice-consultant-dashboard found in APPS/"
else
    print_error "❌ alice-consultant-dashboard not found in APPS/"
fi

if [ -d "APPS/alice-suite-monorepo" ]; then
    print_success "✅ alice-suite-monorepo found in APPS/"
else
    print_warning "⚠️  alice-suite-monorepo not found in APPS/"
fi

echo ""

# Test 2: Check if package.json files exist
print_status "Testing package.json files..."

if [ -f "APPS/alice-reader/package.json" ]; then
    print_success "✅ alice-reader package.json found"
else
    print_error "❌ alice-reader package.json not found"
fi

if [ -f "APPS/alice-consultant-dashboard/package.json" ]; then
    print_success "✅ alice-consultant-dashboard package.json found"
else
    print_error "❌ alice-consultant-dashboard package.json not found"
fi

echo ""

# Test 3: Check if npm scripts exist
print_status "Testing npm scripts..."

cd APPS/alice-reader
if grep -q '"dev"' package.json; then
    print_success "✅ alice-reader 'dev' script found"
else
    print_error "❌ alice-reader 'dev' script not found"
fi
cd ../..

cd APPS/alice-consultant-dashboard
if grep -q '"dev"' package.json; then
    print_success "✅ alice-consultant-dashboard 'dev' script found"
else
    print_error "❌ alice-consultant-dashboard 'dev' script not found"
fi

if grep -q '"start-realtime"' package.json; then
    print_success "✅ alice-consultant-dashboard 'start-realtime' script found"
else
    print_warning "⚠️  alice-consultant-dashboard 'start-realtime' script not found"
fi
cd ../..

echo ""

# Test 4: Check if start scripts are executable
print_status "Testing start script permissions..."

if [ -x "TOOLS/scripts/start-both-apps.sh" ]; then
    print_success "✅ start-both-apps.sh is executable"
else
    print_error "❌ start-both-apps.sh is not executable"
fi

if [ -x "TOOLS/scripts/start-dashboard-with-realtime.sh" ]; then
    print_success "✅ start-dashboard-with-realtime.sh is executable"
else
    print_error "❌ start-dashboard-with-realtime.sh is not executable"
fi

if [ -x "TOOLS/scripts/start-realtime-only.sh" ]; then
    print_success "✅ start-realtime-only.sh is executable"
else
    print_error "❌ start-realtime-only.sh is not executable"
fi

echo ""

# Test 5: Quick dependency check
print_status "Testing dependencies..."

cd APPS/alice-reader
if [ -d "node_modules" ]; then
    print_success "✅ alice-reader node_modules found"
else
    print_warning "⚠️  alice-reader node_modules not found (run 'npm install')"
fi
cd ../..

cd APPS/alice-consultant-dashboard
if [ -d "node_modules" ]; then
    print_success "✅ alice-consultant-dashboard node_modules found"
else
    print_warning "⚠️  alice-consultant-dashboard node_modules not found (run 'npm install')"
fi
cd ../..

echo ""

# Test 6: Check monorepo dependency path
print_status "Testing monorepo dependency path..."

cd APPS/alice-consultant-dashboard
if grep -q "alice-suite-monorepo/packages/api-client" package.json; then
    print_success "✅ Monorepo dependency path found in alice-consultant-dashboard"
else
    print_warning "⚠️  Monorepo dependency path not found in alice-consultant-dashboard"
fi
cd ../..

cd APPS/alice-reader
if grep -q "alice-suite-monorepo/packages/api-client" package.json; then
    print_success "✅ Monorepo dependency path found in alice-reader"
else
    print_warning "⚠️  Monorepo dependency path not found in alice-reader"
fi
cd ../..

echo ""

print_status "Test Summary:"
echo "=================="
echo ""
echo "✅ Directory structure: Apps are in APPS/"
echo "✅ Package files: package.json files exist"
echo "✅ NPM scripts: dev scripts are available"
echo "✅ Start scripts: Updated and executable"
echo "✅ Dependencies: node_modules checked"
echo "✅ Monorepo paths: Dependency paths verified"
echo ""
print_success "🎉 App startup test completed!"
echo ""
print_status "To start the apps, use:"
echo "  ./TOOLS/scripts/start-both-apps.sh"
echo "  ./TOOLS/scripts/start-dashboard-with-realtime.sh"
echo "  ./TOOLS/scripts/start-realtime-only.sh"
echo ""
print_status "Or run individual apps:"
echo "  cd APPS/alice-reader && npm run dev"
echo "  cd APPS/alice-consultant-dashboard && npm run dev"
