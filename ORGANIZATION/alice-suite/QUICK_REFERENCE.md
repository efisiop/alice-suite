# Alice Suite - Quick Reference Guide

## 🗂️ **New Organized Structure**

Your alice-suite repository is now organized into logical categories:

```
alice-suite/
├── 📱 ACTIVE/           # Currently functional files
├── 🧪 TESTING/          # Testing and debugging tools  
├── 📚 REFERENCE/        # Documentation and guides
├── 🔧 TOOLS/            # Development tools and utilities
├── 🗂️ ARCHIVE/          # Outdated and unused files
└── 🚀 DEPLOYMENT/       # Production deployment files
```

## 🚀 **Quick Start Commands**

### **Run Your Apps**
```bash
# Reader App
cd ACTIVE/apps/alice-reader && npm run dev

# Dashboard App  
cd ACTIVE/apps/alice-consultant-dashboard && npm run dev
```

### **Run Tests**
```bash
# Run all tests
cd TESTING/scripts && ./run-tests.sh

# Run individual test tools
cd TESTING/scripts && node simple-test-runner.js
cd TESTING/scripts && node performance-checker.js
```

### **Find Documentation**
```bash
# General docs
ls REFERENCE/docs/

# How-to guides
ls REFERENCE/guides/

# Planning docs
ls REFERENCE/plans/

# Kimi integration docs
ls REFERENCE/kimi/
```

### **Use Development Tools**
```bash
# Utility scripts
ls TOOLS/scripts/

# Configuration files
ls TOOLS/config/

# Python tools
ls TOOLS/python/
```

## 📁 **What's Where**

### **📱 ACTIVE/** - Currently functional files
- **`apps/`** - Your main applications
  - `alice-reader/` - Reader application
  - `alice-consultant-dashboard/` - Consultant dashboard
- **`packages/`** - Shared packages
- **`scripts/`** - Active scripts (start-alice.sh)
- **`config/`** - Configuration files (package.json, etc.)

### **🧪 TESTING/** - Testing and debugging tools
- **`scripts/`** - Testing scripts
  - `simple-test-runner.js` - Basic structure tests
  - `performance-checker.js` - Performance metrics
  - `run-tests.sh` - Complete test runner
  - `test-*.js` - Various test scripts
- **`database/`** - Database testing files
  - `*.sql` - SQL scripts
  - `database-*.js` - Database utilities
  - `create-*.js` - Database creation scripts
- **`html/`** - HTML test files
  - `test-activity-tracking.html`
  - `start-apps.html`
- **`checklists/`** - Testing documentation
  - `SIMPLE_TESTING_CHECKLIST.md`
  - `DEPLOYMENT_CHECKLIST.md`
  - `README_TESTING.md`

### **📚 REFERENCE/** - Documentation and guides
- **`docs/`** - General documentation
  - `README.md`
  - `AI_FEATURES_README.md`
  - `ACTIVITY_TRACKING_README.md`
- **`plans/`** - Planning documents
  - `ALICE_READER_ADVANCEMENT_PLAN.md`
  - `KEMI_REAL_TIME_DASHBOARD_IMPLEMENTATION_PLAN.md`
  - `tasks.md`
  - `planning.md`
- **`guides/`** - How-to guides
  - `DASHBOARD_TESTING_GUIDE.md`
  - `DASHBOARD_STATE_DOCUMENTATION.md`
  - `AUTH_EVENTS_IMPLEMENTATION.md`
- **`kimi/`** - Kimi integration docs
  - `KIMI-CLAUDE-INTEGRATION.md`
  - `KIMI-CLAUDE-QUICK-START.md`
  - `KIMI-SETUP-STATUS.md`

### **🔧 TOOLS/** - Development tools and utilities
- **`scripts/`** - Utility scripts
  - `kemi-claude-cli.sh`
  - `setup-aliases.sh`
  - `check-status.sh`
  - `kill-all.sh`
- **`config/`** - Tool configurations
  - `.cursorrules`
  - `.cursorrules-KIMI-INTEGRATION.md`
  - `.gitignore`
- **`python/`** - Python tools
  - `test_kimi_k2.py`
  - `test_moonshot.py`

### **🚀 DEPLOYMENT/** - Production deployment files
- **`supabase/`** - Supabase configuration
- **`server/`** - Server configuration
- **`scripts/`** - Deployment scripts
  - `start-both-apps.sh`
  - `start-dashboard-with-realtime.sh`

### **🗂️ ARCHIVE/** - Outdated and unused files
- **`old-scripts/`** - Old script versions
- **`deprecated/`** - Deprecated features
- **`backups/`** - Backup files

## 🎯 **Common Tasks**

### **I want to...**

**Run the apps:**
```bash
cd ACTIVE/apps/alice-reader && npm run dev
cd ACTIVE/apps/alice-consultant-dashboard && npm run dev
```

**Test everything:**
```bash
cd TESTING/scripts && ./run-tests.sh
```

**Find documentation:**
```bash
ls REFERENCE/docs/     # General docs
ls REFERENCE/guides/   # How-to guides
ls REFERENCE/plans/    # Planning docs
```

**Use development tools:**
```bash
ls TOOLS/scripts/      # Utility scripts
ls TOOLS/config/       # Configuration files
```

**Deploy to production:**
```bash
ls DEPLOYMENT/scripts/ # Deployment scripts
ls DEPLOYMENT/supabase/ # Supabase config
```

**Fix database issues:**
```bash
ls TESTING/database/   # Database scripts
```

## ✅ **Benefits of This Organization**

1. **Clear Separation**: Active files are separate from testing and reference materials
2. **Easy Navigation**: Logical folder structure makes finding files simple
3. **Better Maintenance**: Related files are grouped together
4. **Professional Appearance**: Clean, organized repository structure
5. **Reduced Confusion**: No more wondering if a file is active or outdated

## 🔄 **What Changed**

- **Original files preserved**: All original files are still in their original locations
- **Copied to new structure**: Files were copied (not moved) to maintain safety
- **Organized by purpose**: Files are now grouped by their function
- **Easy to find**: Clear categories make navigation simple

## 🚨 **Important Notes**

- **Original files still exist**: The organization script copied files, so your original structure is preserved
- **Test the new structure**: Make sure apps work from their new locations
- **Update paths if needed**: Some scripts might need path updates
- **Consider cleanup**: You can now safely remove truly outdated files from the root

---

**Need help?** Check `ORGANIZATION_SUMMARY.md` for detailed information about the new structure.
