#!/bin/bash

# Alice Suite - Complete Testing Runner
# This script runs all tests and checks for both apps

echo "🧪 Alice Suite - Complete Testing Runner"
echo "========================================"
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
if [ ! -f "SIMPLE_TESTING_CHECKLIST.md" ]; then
    print_error "Please run this script from the alice-suite directory"
    exit 1
fi

print_status "Starting comprehensive testing for Alice Suite..."

# Step 1: Run basic structure tests
echo ""
print_status "Step 1: Running basic structure tests..."
node scripts/simple-test-runner.js

if [ $? -eq 0 ]; then
    print_success "Basic structure tests completed"
else
    print_warning "Some basic tests failed - check the output above"
fi

# Step 2: Run performance checks
echo ""
print_status "Step 2: Running performance checks..."
node scripts/performance-checker.js

if [ $? -eq 0 ]; then
    print_success "Performance checks completed"
else
    print_warning "Some performance issues detected - check the output above"
fi

# Step 3: Check if apps are running
echo ""
print_status "Step 3: Checking if apps are running..."

# Check if reader app is running (common ports)
READER_RUNNING=false
for port in 3000 3001 5173 4173; do
    if curl -s http://localhost:$port > /dev/null 2>&1; then
        print_success "Reader app detected on port $port"
        READER_RUNNING=true
        break
    fi
done

if [ "$READER_RUNNING" = false ]; then
    print_warning "Reader app doesn't appear to be running"
    print_status "To start the reader app: cd alice-reader && npm run dev"
fi

# Check if dashboard app is running
DASHBOARD_RUNNING=false
for port in 3002 3003 5174 4174; do
    if curl -s http://localhost:$port > /dev/null 2>&1; then
        print_success "Dashboard app detected on port $port"
        DASHBOARD_RUNNING=true
        break
    fi
done

if [ "$DASHBOARD_RUNNING" = false ]; then
    print_warning "Dashboard app doesn't appear to be running"
    print_status "To start the dashboard app: cd alice-consultant-dashboard && npm run dev"
fi

# Step 4: Summary and next steps
echo ""
print_status "Step 4: Testing Summary and Next Steps"
echo "=============================================="

if [ "$READER_RUNNING" = true ] && [ "$DASHBOARD_RUNNING" = true ]; then
    print_success "Both apps are running! You can now proceed with manual testing."
    echo ""
    print_status "Next Steps:"
    echo "1. Open SIMPLE_TESTING_CHECKLIST.md"
    echo "2. Follow the manual testing steps"
    echo "3. Test both apps in your browser"
    echo "4. Report any issues you find"
else
    print_warning "One or both apps are not running."
    echo ""
    print_status "To start the apps:"
    echo "1. Start reader app: cd alice-reader && npm run dev"
    echo "2. Start dashboard app: cd alice-consultant-dashboard && npm run dev"
    echo "3. Run this script again to verify they're running"
fi

echo ""
print_status "Testing Resources:"
echo "- Manual Testing Checklist: SIMPLE_TESTING_CHECKLIST.md"
echo "- Deployment Checklist: DEPLOYMENT_CHECKLIST.md"
echo "- Performance Checker: scripts/performance-checker.js"
echo "- Test Runner: scripts/simple-test-runner.js"

echo ""
print_success "Testing runner completed!"
print_status "Happy testing! 🚀"
