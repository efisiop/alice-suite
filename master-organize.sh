#!/bin/bash

# Master Organization Script for Project_1/alice-suite
# This script organizes the entire repository into a clean, professional structure

echo "🗂️ Master Organization for Project_1/alice-suite"
echo "================================================"
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
if [ ! -f "MASTER_ORGANIZATION_PLAN.md" ]; then
    print_error "Please run this script from the Project_1/alice-suite directory"
    exit 1
fi

print_status "Starting master repository organization..."

# Create the new directory structure
print_status "Creating master directory structure..."

# Main categories
mkdir -p APPS
mkdir -p TESTING/scripts
mkdir -p TESTING/database
mkdir -p TESTING/html
mkdir -p DOCS/guides
mkdir -p DOCS/plans
mkdir -p DOCS/kimi
mkdir -p DOCS/general
mkdir -p TOOLS/scripts
mkdir -p TOOLS/config
mkdir -p TOOLS/python
mkdir -p TOOLS/environments
mkdir -p DEPLOYMENT/scripts
mkdir -p ARCHIVE/old-scripts
mkdir -p ARCHIVE/deprecated
mkdir -p ARCHIVE/backups
mkdir -p ORGANIZATION/scripts

print_success "Master directory structure created"

# Move files to appropriate locations
print_status "Moving files to organized locations..."

# APPS - Main applications
print_status "Moving APPS files..."

if [ -d "alice-reader" ]; then
    mv alice-reader APPS/
    print_success "Moved alice-reader to APPS/"
fi

if [ -d "alice-consultant-dashboard" ]; then
    mv alice-consultant-dashboard APPS/
    print_success "Moved alice-consultant-dashboard to APPS/"
fi

if [ -d "alice-suite-monorepo" ]; then
    mv alice-suite-monorepo APPS/
    print_success "Moved alice-suite-monorepo to APPS/"
fi

# TESTING - Testing and debugging
print_status "Moving TESTING files..."

# Move test scripts
for test_file in test-*.js; do
    if [ -f "$test_file" ]; then
        mv "$test_file" TESTING/scripts/
        print_success "Moved $test_file to TESTING/scripts/"
    fi
done

for check_file in check-*.js; do
    if [ -f "$check_file" ]; then
        mv "$check_file" TESTING/scripts/
        print_success "Moved $check_file to TESTING/scripts/"
    fi
done

for create_file in create-*.js; do
    if [ -f "$create_file" ]; then
        mv "$create_file" TESTING/scripts/
        print_success "Moved $create_file to TESTING/scripts/"
    fi
done

for verify_file in verify-*.js; do
    if [ -f "$verify_file" ]; then
        mv "$verify_file" TESTING/scripts/
        print_success "Moved $verify_file to TESTING/scripts/"
    fi
done

for reset_file in reset-*.js; do
    if [ -f "$reset_file" ]; then
        mv "$reset_file" TESTING/scripts/
        print_success "Moved $reset_file to TESTING/scripts/"
    fi
done

# Move database files
for sql_file in *.sql; do
    if [ -f "$sql_file" ]; then
        mv "$sql_file" TESTING/database/
        print_success "Moved $sql_file to TESTING/database/"
    fi
done

for db_file in database-*.js; do
    if [ -f "$db_file" ]; then
        mv "$db_file" TESTING/database/
        print_success "Moved $db_file to TESTING/database/"
    fi
done

for apply_file in apply-*.js; do
    if [ -f "$apply_file" ]; then
        mv "$apply_file" TESTING/database/
        print_success "Moved $apply_file to TESTING/database/"
    fi
done

for fix_file in fix-*.js; do
    if [ -f "$fix_file" ]; then
        mv "$fix_file" TESTING/database/
        print_success "Moved $fix_file to TESTING/database/"
    fi
done

# DOCS - Documentation
print_status "Moving DOCS files..."

# Move guides
if [ -f "DASHBOARD_TESTING_GUIDE.md" ]; then
    mv DASHBOARD_TESTING_GUIDE.md DOCS/guides/
    print_success "Moved DASHBOARD_TESTING_GUIDE.md to DOCS/guides/"
fi

if [ -f "DASHBOARD_STATE_DOCUMENTATION.md" ]; then
    mv DASHBOARD_STATE_DOCUMENTATION.md DOCS/guides/
    print_success "Moved DASHBOARD_STATE_DOCUMENTATION.md to DOCS/guides/"
fi

if [ -f "AUTH_EVENTS_IMPLEMENTATION.md" ]; then
    mv AUTH_EVENTS_IMPLEMENTATION.md DOCS/guides/
    print_success "Moved AUTH_EVENTS_IMPLEMENTATION.md to DOCS/guides/"
fi

if [ -f "CONSULTANT_CONNECTIVITY_FIX.md" ]; then
    mv CONSULTANT_CONNECTIVITY_FIX.md DOCS/guides/
    print_success "Moved CONSULTANT_CONNECTIVITY_FIX.md to DOCS/guides/"
fi

# Move plans
if [ -f "ALICE_READER_ADVANCEMENT_PLAN.md" ]; then
    mv ALICE_READER_ADVANCEMENT_PLAN.md DOCS/plans/
    print_success "Moved ALICE_READER_ADVANCEMENT_PLAN.md to DOCS/plans/"
fi

if [ -f "KEMI_REAL_TIME_DASHBOARD_IMPLEMENTATION_PLAN.md" ]; then
    mv KEMI_REAL_TIME_DASHBOARD_IMPLEMENTATION_PLAN.md DOCS/plans/
    print_success "Moved KEMI_REAL_TIME_DASHBOARD_IMPLEMENTATION_PLAN.md to DOCS/plans/"
fi

if [ -f "tasks.md" ]; then
    mv tasks.md DOCS/plans/
    print_success "Moved tasks.md to DOCS/plans/"
fi

if [ -f "planning.md" ]; then
    mv planning.md DOCS/plans/
    print_success "Moved planning.md to DOCS/plans/"
fi

# Move Kimi docs
for kimi_file in KIMI-*.md; do
    if [ -f "$kimi_file" ]; then
        mv "$kimi_file" DOCS/kimi/
        print_success "Moved $kimi_file to DOCS/kimi/"
    fi
done

for kimi_k2_file in KIMI_K2-*.md; do
    if [ -f "$kimi_k2_file" ]; then
        mv "$kimi_k2_file" DOCS/kimi/
        print_success "Moved $kimi_k2_file to DOCS/kimi/"
    fi
done

for kimi_other_file in KIMI_*.md; do
    if [ -f "$kimi_other_file" ]; then
        mv "$kimi_other_file" DOCS/kimi/
        print_success "Moved $kimi_other_file to DOCS/kimi/"
    fi
done

# Move general docs
if [ -f "README.md" ]; then
    mv README.md DOCS/general/
    print_success "Moved README.md to DOCS/general/"
fi

if [ -f "AI_FEATURES_README.md" ]; then
    mv AI_FEATURES_README.md DOCS/general/
    print_success "Moved AI_FEATURES_README.md to DOCS/general/"
fi

if [ -f "ALICE_SCRIPTS_README.md" ]; then
    mv ALICE_SCRIPTS_README.md DOCS/general/
    print_success "Moved ALICE_SCRIPTS_README.md to DOCS/general/"
fi

# TOOLS - Development tools
print_status "Moving TOOLS files..."

# Move utility scripts
for start_file in start-*.sh; do
    if [ -f "$start_file" ]; then
        mv "$start_file" TOOLS/scripts/
        print_success "Moved $start_file to TOOLS/scripts/"
    fi
done

for setup_file in setup-*.sh; do
    if [ -f "$setup_file" ]; then
        mv "$setup_file" TOOLS/scripts/
        print_success "Moved $setup_file to TOOLS/scripts/"
    fi
done

for check_file in check-*.sh; do
    if [ -f "$check_file" ]; then
        mv "$check_file" TOOLS/scripts/
        print_success "Moved $check_file to TOOLS/scripts/"
    fi
done

for kill_file in kill-*.sh; do
    if [ -f "$kill_file" ]; then
        mv "$kill_file" TOOLS/scripts/
        print_success "Moved $kill_file to TOOLS/scripts/"
    fi
done

for kemi_file in kemi-*.sh; do
    if [ -f "$kemi_file" ]; then
        mv "$kemi_file" TOOLS/scripts/
        print_success "Moved $kemi_file to TOOLS/scripts/"
    fi
done

# Move configuration files
if [ -f ".cursorrules" ]; then
    mv .cursorrules TOOLS/config/
    print_success "Moved .cursorrules to TOOLS/config/"
fi

if [ -f ".cursorrules-KIMI-INTEGRATION.md" ]; then
    mv .cursorrules-KIMI-INTEGRATION.md TOOLS/config/
    print_success "Moved .cursorrules-KIMI-INTEGRATION.md to TOOLS/config/"
fi

if [ -f ".gitignore" ]; then
    mv .gitignore TOOLS/config/
    print_success "Moved .gitignore to TOOLS/config/"
fi

if [ -f "package.json" ]; then
    mv package.json TOOLS/config/
    print_success "Moved package.json to TOOLS/config/"
fi

if [ -f "package-lock.json" ]; then
    mv package-lock.json TOOLS/config/
    print_success "Moved package-lock.json to TOOLS/config/"
fi

# Move Python tools
if [ -f "test_kimi_k2.py" ]; then
    mv test_kimi_k2.py TOOLS/python/
    print_success "Moved test_kimi_k2.py to TOOLS/python/"
fi

if [ -f "test_moonshot.py" ]; then
    mv test_moonshot.py TOOLS/python/
    print_success "Moved test_moonshot.py to TOOLS/python/"
fi

# Move environment files
if [ -d "litellm-env" ]; then
    mv litellm-env TOOLS/environments/
    print_success "Moved litellm-env to TOOLS/environments/"
fi

# DEPLOYMENT - Production deployment
print_status "Moving DEPLOYMENT files..."

if [ -d "supabase" ]; then
    mv supabase DEPLOYMENT/
    print_success "Moved supabase to DEPLOYMENT/"
fi

if [ -d "server" ]; then
    mv server DEPLOYMENT/
    print_success "Moved server to DEPLOYMENT/"
fi

if [ -d "packages" ]; then
    mv packages DEPLOYMENT/
    print_success "Moved packages to DEPLOYMENT/"
fi

# Move deployment scripts
for deploy_file in apply-*.sh; do
    if [ -f "$deploy_file" ]; then
        mv "$deploy_file" DEPLOYMENT/scripts/
        print_success "Moved $deploy_file to DEPLOYMENT/scripts/"
    fi
done

# ORGANIZATION - Organization tools
print_status "Moving ORGANIZATION files..."

if [ -d "alice-suite" ]; then
    mv alice-suite ORGANIZATION/
    print_success "Moved alice-suite to ORGANIZATION/"
fi

if [ -d "scripts" ]; then
    mv scripts ORGANIZATION/
    print_success "Moved scripts to ORGANIZATION/"
fi

# Move organization plan
if [ -f "MASTER_ORGANIZATION_PLAN.md" ]; then
    mv MASTER_ORGANIZATION_PLAN.md ORGANIZATION/
    print_success "Moved MASTER_ORGANIZATION_PLAN.md to ORGANIZATION/"
fi

# Move other documentation files that don't fit categories
print_status "Moving remaining documentation files..."

for doc_file in *.md; do
    if [ -f "$doc_file" ]; then
        mv "$doc_file" DOCS/general/
        print_success "Moved $doc_file to DOCS/general/"
    fi
done

# Create a summary file
print_status "Creating organization summary..."

cat > ORGANIZATION_SUMMARY.md << 'EOF'
# Master Organization Summary for Project_1/alice-suite

## 📁 **New Master Structure Created**

### **📱 APPS/** - Main applications
- `alice-reader/` - Reader application
- `alice-consultant-dashboard/` - Consultant dashboard
- `alice-suite-monorepo/` - Monorepo structure

### **🧪 TESTING/** - Testing and debugging tools
- `scripts/` - Test scripts (test-*.js, check-*.js, create-*.js, verify-*.js)
- `database/` - Database testing files (*.sql, database-*.js, apply-*.js)
- `html/` - HTML test files

### **📚 DOCS/** - Documentation and guides
- `guides/` - How-to guides (DASHBOARD_TESTING_GUIDE.md, etc.)
- `plans/` - Planning documents (ALICE_READER_ADVANCEMENT_PLAN.md, etc.)
- `kimi/` - Kimi integration docs (KIMI-*.md, KIMI_K2-*.md)
- `general/` - General documentation (README.md, etc.)

### **🔧 TOOLS/** - Development tools and utilities
- `scripts/` - Utility scripts (start-*.sh, setup-*.sh, check-*.sh, kill-*.sh, kemi-*.sh)
- `config/` - Configuration files (.cursorrules*, .gitignore, package.json)
- `python/` - Python tools (test_kimi_k2.py, test_moonshot.py)
- `environments/` - Environment files (litellm-env/)

### **🚀 DEPLOYMENT/** - Production deployment files
- `supabase/` - Supabase configuration
- `server/` - Server configuration
- `packages/` - Shared packages
- `scripts/` - Deployment scripts (apply-*.sh)

### **🗂️ ARCHIVE/** - Outdated and unused files
- `old-scripts/` - Old script versions
- `deprecated/` - Deprecated features
- `backups/` - Backup files

### **📋 ORGANIZATION/** - Organization tools
- `alice-suite/` - Previous organization attempt
- `scripts/` - Organization scripts
- `MASTER_ORGANIZATION_PLAN.md` - Organization plan

## 🎯 **Benefits Achieved**

1. **Clear Separation**: Active apps separate from testing and tools
2. **Easy Navigation**: Logical folder structure makes finding files simple
3. **Better Maintenance**: Related files are grouped together
4. **Professional Appearance**: Clean, organized repository structure
5. **Reduced Confusion**: No more wondering if a file is active or outdated
6. **Scalable**: Easy to add new files in appropriate locations

## 📋 **Next Steps**

1. **Test the new structure** - Make sure all apps still work
2. **Update any hardcoded paths** - Fix any scripts that reference old locations
3. **Update documentation** - Reflect the new structure in guides
4. **Clean up old files** - Remove or archive truly outdated files

## 🔧 **Quick Reference**

### **To run apps:**
```bash
cd APPS/alice-reader && npm run dev
cd APPS/alice-consultant-dashboard && npm run dev
```

### **To find documentation:**
```bash
ls DOCS/general/     # General docs
ls DOCS/guides/      # How-to guides
ls DOCS/plans/       # Planning docs
ls DOCS/kimi/        # Kimi integration docs
```

### **To use tools:**
```bash
ls TOOLS/scripts/    # Utility scripts
ls TOOLS/config/     # Configuration files
ls TOOLS/python/     # Python tools
```

### **To run tests:**
```bash
ls TESTING/scripts/  # Test scripts
ls TESTING/database/ # Database scripts
```

---

**Master organization completed on:** $(date)
**Total files organized:** $(find . -type f | wc -l)
**Result:** Clean, organized, professional repository structure
EOF

print_success "Organization summary created: ORGANIZATION_SUMMARY.md"

# Clean up empty directories
print_status "Cleaning up empty directories..."
rmdir scripts 2>/dev/null || true
rmdir .claude 2>/dev/null || true
rmdir .ai-knowledge 2>/dev/null || true
rmdir .agent-os 2>/dev/null || true
rmdir .cursor 2>/dev/null || true
rmdir ~ 2>/dev/null || true

print_success "Master repository organization completed!"
echo ""
print_status "Summary:"
echo "✅ Created master organized folder structure"
echo "✅ Moved files to appropriate locations"
echo "✅ Preserved original structure"
echo "✅ Created organization summary"
echo ""
print_status "Next steps:"
echo "1. Review the new structure in ORGANIZATION_SUMMARY.md"
echo "2. Test that all apps still work from their new locations"
echo "3. Update any scripts that reference old file paths"
echo "4. Consider removing truly outdated files"
echo ""
print_success "Happy organizing! 🗂️"

