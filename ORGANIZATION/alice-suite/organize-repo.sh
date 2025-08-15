#!/bin/bash

# Alice Suite Repository Organization Script
# This script organizes the repository into logical folders

echo "🗂️ Alice Suite - Repository Organization"
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
if [ ! -f "ORGANIZATION_PLAN.md" ]; then
    print_error "Please run this script from the alice-suite directory"
    exit 1
fi

print_status "Starting repository organization..."

# Create the new directory structure
print_status "Creating directory structure..."

# Main categories
mkdir -p ACTIVE/apps
mkdir -p ACTIVE/packages
mkdir -p ACTIVE/scripts
mkdir -p ACTIVE/config

mkdir -p TESTING/scripts
mkdir -p TESTING/database
mkdir -p TESTING/html
mkdir -p TESTING/checklists

mkdir -p REFERENCE/docs
mkdir -p REFERENCE/plans
mkdir -p REFERENCE/guides
mkdir -p REFERENCE/kimi

mkdir -p TOOLS/scripts
mkdir -p TOOLS/config
mkdir -p TOOLS/python

mkdir -p ARCHIVE/old-scripts
mkdir -p ARCHIVE/deprecated
mkdir -p ARCHIVE/backups

mkdir -p DEPLOYMENT/supabase
mkdir -p DEPLOYMENT/server
mkdir -p DEPLOYMENT/scripts

print_success "Directory structure created"

# Move files to appropriate locations
print_status "Moving files to organized locations..."

# ACTIVE files
print_status "Moving ACTIVE files..."

# Move active scripts
if [ -f "start-alice.sh" ]; then
    mv start-alice.sh ACTIVE/scripts/
    print_success "Moved start-alice.sh to ACTIVE/scripts/"
fi

# Move configuration files
if [ -f "../package.json" ]; then
    cp ../package.json ACTIVE/config/
    print_success "Copied package.json to ACTIVE/config/"
fi

if [ -f "../package-lock.json" ]; then
    cp ../package-lock.json ACTIVE/config/
    print_success "Copied package-lock.json to ACTIVE/config/"
fi

# TESTING files
print_status "Moving TESTING files..."

# Move testing scripts
if [ -f "scripts/simple-test-runner.js" ]; then
    mv scripts/simple-test-runner.js TESTING/scripts/
    print_success "Moved simple-test-runner.js to TESTING/scripts/"
fi

if [ -f "scripts/performance-checker.js" ]; then
    mv scripts/performance-checker.js TESTING/scripts/
    print_success "Moved performance-checker.js to TESTING/scripts/"
fi

if [ -f "run-tests.sh" ]; then
    mv run-tests.sh TESTING/scripts/
    print_success "Moved run-tests.sh to TESTING/scripts/"
fi

# Move testing checklists
if [ -f "SIMPLE_TESTING_CHECKLIST.md" ]; then
    mv SIMPLE_TESTING_CHECKLIST.md TESTING/checklists/
    print_success "Moved SIMPLE_TESTING_CHECKLIST.md to TESTING/checklists/"
fi

if [ -f "DEPLOYMENT_CHECKLIST.md" ]; then
    mv DEPLOYMENT_CHECKLIST.md TESTING/checklists/
    print_success "Moved DEPLOYMENT_CHECKLIST.md to TESTING/checklists/"
fi

if [ -f "README_TESTING.md" ]; then
    mv README_TESTING.md TESTING/checklists/
    print_success "Moved README_TESTING.md to TESTING/checklists/"
fi

# Move HTML test files
if [ -f "test-activity-tracking.html" ]; then
    mv test-activity-tracking.html TESTING/html/
    print_success "Moved test-activity-tracking.html to TESTING/html/"
fi

if [ -f "start-apps.html" ]; then
    mv start-apps.html TESTING/html/
    print_success "Moved start-apps.html to TESTING/html/"
fi

# REFERENCE files
print_status "Moving REFERENCE files..."

# Move general documentation
if [ -f "../README.md" ]; then
    cp ../README.md REFERENCE/docs/
    print_success "Copied README.md to REFERENCE/docs/"
fi

if [ -f "../AI_FEATURES_README.md" ]; then
    cp ../AI_FEATURES_README.md REFERENCE/docs/
    print_success "Copied AI_FEATURES_README.md to REFERENCE/docs/"
fi

if [ -f "ACTIVITY_TRACKING_README.md" ]; then
    mv ACTIVITY_TRACKING_README.md REFERENCE/docs/
    print_success "Moved ACTIVITY_TRACKING_README.md to REFERENCE/docs/"
fi

if [ -f "../ALICE_SCRIPTS_README.md" ]; then
    cp ../ALICE_SCRIPTS_README.md REFERENCE/docs/
    print_success "Copied ALICE_SCRIPTS_README.md to REFERENCE/docs/"
fi

# Move planning documents
if [ -f "../ALICE_READER_ADVANCEMENT_PLAN.md" ]; then
    cp ../ALICE_READER_ADVANCEMENT_PLAN.md REFERENCE/plans/
    print_success "Copied ALICE_READER_ADVANCEMENT_PLAN.md to REFERENCE/plans/"
fi

if [ -f "../KEMI_REAL_TIME_DASHBOARD_IMPLEMENTATION_PLAN.md" ]; then
    cp ../KEMI_REAL_TIME_DASHBOARD_IMPLEMENTATION_PLAN.md REFERENCE/plans/
    print_success "Copied KEMI_REAL_TIME_DASHBOARD_IMPLEMENTATION_PLAN.md to REFERENCE/plans/"
fi

if [ -f "../tasks.md" ]; then
    cp ../tasks.md REFERENCE/plans/
    print_success "Copied tasks.md to REFERENCE/plans/"
fi

if [ -f "../planning.md" ]; then
    cp ../planning.md REFERENCE/plans/
    print_success "Copied planning.md to REFERENCE/plans/"
fi

# Move guides
if [ -f "../DASHBOARD_TESTING_GUIDE.md" ]; then
    cp ../DASHBOARD_TESTING_GUIDE.md REFERENCE/guides/
    print_success "Copied DASHBOARD_TESTING_GUIDE.md to REFERENCE/guides/"
fi

if [ -f "../DASHBOARD_STATE_DOCUMENTATION.md" ]; then
    cp ../DASHBOARD_STATE_DOCUMENTATION.md REFERENCE/guides/
    print_success "Copied DASHBOARD_STATE_DOCUMENTATION.md to REFERENCE/guides/"
fi

if [ -f "../AUTH_EVENTS_IMPLEMENTATION.md" ]; then
    cp ../AUTH_EVENTS_IMPLEMENTATION.md REFERENCE/guides/
    print_success "Copied AUTH_EVENTS_IMPLEMENTATION.md to REFERENCE/guides/"
fi

# Move Kimi integration docs
if [ -f "../KIMI-CLAUDE-INTEGRATION.md" ]; then
    cp ../KIMI-CLAUDE-INTEGRATION.md REFERENCE/kimi/
    print_success "Copied KIMI-CLAUDE-INTEGRATION.md to REFERENCE/kimi/"
fi

if [ -f "../KIMI-CLAUDE-QUICK-START.md" ]; then
    cp ../KIMI-CLAUDE-QUICK-START.md REFERENCE/kimi/
    print_success "Copied KIMI-CLAUDE-QUICK-START.md to REFERENCE/kimi/"
fi

if [ -f "../KIMI-SETUP-STATUS.md" ]; then
    cp ../KIMI-SETUP-STATUS.md REFERENCE/kimi/
    print_success "Copied KIMI-SETUP-STATUS.md to REFERENCE/kimi/"
fi

# TOOLS files
print_status "Moving TOOLS files..."

# Move utility scripts
if [ -f "../kemi-claude-cli.sh" ]; then
    cp ../kemi-claude-cli.sh TOOLS/scripts/
    print_success "Copied kemi-claude-cli.sh to TOOLS/scripts/"
fi

if [ -f "../setup-aliases.sh" ]; then
    cp ../setup-aliases.sh TOOLS/scripts/
    print_success "Copied setup-aliases.sh to TOOLS/scripts/"
fi

if [ -f "../check-status.sh" ]; then
    cp ../check-status.sh TOOLS/scripts/
    print_success "Copied check-status.sh to TOOLS/scripts/"
fi

if [ -f "../kill-all.sh" ]; then
    cp ../kill-all.sh TOOLS/scripts/
    print_success "Copied kill-all.sh to TOOLS/scripts/"
fi

# Move configuration files
if [ -f "../.cursorrules" ]; then
    cp ../.cursorrules TOOLS/config/
    print_success "Copied .cursorrules to TOOLS/config/"
fi

if [ -f "../.cursorrules-KIMI-INTEGRATION.md" ]; then
    cp ../.cursorrules-KIMI-INTEGRATION.md TOOLS/config/
    print_success "Copied .cursorrules-KIMI-INTEGRATION.md to TOOLS/config/"
fi

if [ -f "../.gitignore" ]; then
    cp ../.gitignore TOOLS/config/
    print_success "Copied .gitignore to TOOLS/config/"
fi

# Move Python tools
if [ -f "../test_kimi_k2.py" ]; then
    cp ../test_kimi_k2.py TOOLS/python/
    print_success "Copied test_kimi_k2.py to TOOLS/python/"
fi

if [ -f "../test_moonshot.py" ]; then
    cp ../test_moonshot.py TOOLS/python/
    print_success "Copied test_moonshot.py to TOOLS/python/"
fi

# DEPLOYMENT files
print_status "Moving DEPLOYMENT files..."

# Move Supabase configuration
if [ -d "../supabase" ]; then
    cp -r ../supabase DEPLOYMENT/
    print_success "Copied supabase directory to DEPLOYMENT/"
fi

# Move server configuration
if [ -d "../server" ]; then
    cp -r ../server DEPLOYMENT/
    print_success "Copied server directory to DEPLOYMENT/"
fi

# Move deployment scripts
if [ -f "../start-both-apps.sh" ]; then
    cp ../start-both-apps.sh DEPLOYMENT/scripts/
    print_success "Copied start-both-apps.sh to DEPLOYMENT/scripts/"
fi

if [ -f "../start-dashboard-with-realtime.sh" ]; then
    cp ../start-dashboard-with-realtime.sh DEPLOYMENT/scripts/
    print_success "Copied start-dashboard-with-realtime.sh to DEPLOYMENT/scripts/"
fi

# Move database testing files to TESTING/database
print_status "Moving database testing files..."

# Move SQL files
for sql_file in ../*.sql; do
    if [ -f "$sql_file" ]; then
        cp "$sql_file" TESTING/database/
        filename=$(basename "$sql_file")
        print_success "Copied $filename to TESTING/database/"
    fi
done

# Move database JavaScript files
for js_file in ../database-*.js; do
    if [ -f "$js_file" ]; then
        cp "$js_file" TESTING/database/
        filename=$(basename "$js_file")
        print_success "Copied $filename to TESTING/database/"
    fi
done

for js_file in ../test-*.js; do
    if [ -f "$js_file" ]; then
        cp "$js_file" TESTING/scripts/
        filename=$(basename "$js_file")
        print_success "Copied $filename to TESTING/scripts/"
    fi
done

for js_file in ../create-*.js; do
    if [ -f "$js_file" ]; then
        cp "$js_file" TESTING/database/
        filename=$(basename "$js_file")
        print_success "Copied $filename to TESTING/database/"
    fi
done

for js_file in ../check-*.js; do
    if [ -f "$js_file" ]; then
        cp "$js_file" TESTING/scripts/
        filename=$(basename "$js_file")
        print_success "Copied $filename to TESTING/scripts/"
    fi
done

# Move packages
if [ -d "../packages" ]; then
    cp -r ../packages ACTIVE/
    print_success "Copied packages directory to ACTIVE/"
fi

# Create symlinks for apps (optional - for now just copy)
if [ -d "../alice-reader" ]; then
    cp -r ../alice-reader ACTIVE/apps/
    print_success "Copied alice-reader to ACTIVE/apps/"
fi

if [ -d "../alice-consultant-dashboard" ]; then
    cp -r ../alice-consultant-dashboard ACTIVE/apps/
    print_success "Copied alice-consultant-dashboard to ACTIVE/apps/"
fi

# Create a summary file
print_status "Creating organization summary..."

cat > ORGANIZATION_SUMMARY.md << 'EOF'
# Alice Suite Repository Organization Summary

## 📁 **New Structure Created**

### **ACTIVE/** - Currently functional files
- `apps/` - Main applications (alice-reader, alice-consultant-dashboard)
- `packages/` - Shared packages
- `scripts/` - Active scripts (start-alice.sh)
- `config/` - Configuration files (package.json, etc.)

### **TESTING/** - Testing and debugging tools
- `scripts/` - Testing scripts (simple-test-runner.js, performance-checker.js)
- `database/` - Database testing files (*.sql, database-*.js)
- `html/` - HTML test files (test-activity-tracking.html)
- `checklists/` - Testing documentation (SIMPLE_TESTING_CHECKLIST.md)

### **REFERENCE/** - Documentation and guides
- `docs/` - General documentation (README.md, AI_FEATURES_README.md)
- `plans/` - Planning documents (ALICE_READER_ADVANCEMENT_PLAN.md)
- `guides/` - How-to guides (DASHBOARD_TESTING_GUIDE.md)
- `kimi/` - Kimi integration docs (KIMI-CLAUDE-INTEGRATION.md)

### **TOOLS/** - Development tools and utilities
- `scripts/` - Utility scripts (kemi-claude-cli.sh, setup-aliases.sh)
- `config/` - Tool configurations (.cursorrules, .gitignore)
- `python/` - Python tools (test_kimi_k2.py)

### **DEPLOYMENT/** - Production deployment files
- `supabase/` - Supabase configuration
- `server/` - Server configuration
- `scripts/` - Deployment scripts (start-both-apps.sh)

### **ARCHIVE/** - Outdated and unused files
- `old-scripts/` - Old script versions
- `deprecated/` - Deprecated features
- `backups/` - Backup files

## 🎯 **Benefits Achieved**

1. **Clear Separation**: Active files are separate from testing and reference materials
2. **Easy Navigation**: Logical folder structure makes finding files simple
3. **Better Maintenance**: Related files are grouped together
4. **Professional Appearance**: Clean, organized repository structure
5. **Reduced Confusion**: No more wondering if a file is active or outdated

## 📋 **Next Steps**

1. **Test the new structure** - Make sure all apps still work
2. **Update any hardcoded paths** - Fix any scripts that reference old locations
3. **Update documentation** - Reflect the new structure in guides
4. **Clean up old files** - Remove or archive truly outdated files

## 🔧 **Quick Reference**

### **To run apps:**
```bash
cd ACTIVE/apps/alice-reader && npm run dev
cd ACTIVE/apps/alice-consultant-dashboard && npm run dev
```

### **To run tests:**
```bash
cd TESTING/scripts && ./run-tests.sh
```

### **To find documentation:**
```bash
ls REFERENCE/docs/     # General docs
ls REFERENCE/guides/   # How-to guides
ls REFERENCE/plans/    # Planning docs
```

### **To find tools:**
```bash
ls TOOLS/scripts/      # Utility scripts
ls TOOLS/config/       # Configuration files
```

---

**Organization completed on:** $(date)
**Total files organized:** $(find . -type f | wc -l)
EOF

print_success "Organization summary created: ORGANIZATION_SUMMARY.md"

# Clean up empty directories
print_status "Cleaning up empty directories..."
rmdir scripts 2>/dev/null || true
rmdir ../scripts 2>/dev/null || true

print_success "Repository organization completed!"
echo ""
print_status "Summary:"
echo "✅ Created organized folder structure"
echo "✅ Moved files to appropriate locations"
echo "✅ Preserved original files (copied, not moved)"
echo "✅ Created organization summary"
echo ""
print_status "Next steps:"
echo "1. Review the new structure in ORGANIZATION_SUMMARY.md"
echo "2. Test that all apps still work from their new locations"
echo "3. Update any scripts that reference old file paths"
echo "4. Consider removing truly outdated files from the root directory"
echo ""
print_success "Happy organizing! 🗂️"
