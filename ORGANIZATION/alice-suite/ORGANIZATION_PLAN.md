# Alice Suite Repository Organization Plan

## 🎯 **Goal**
Organize the alice-suite repository to separate:
- **Active/Functional** files (currently in use)
- **Testing** files (for testing and debugging)
- **Reference** files (documentation and guides)
- **Outdated** files (old versions and unused code)

## 📁 **Proposed Folder Structure**

```
alice-suite/
├── 📱 ACTIVE/                    # Currently functional files
│   ├── apps/                     # Main applications
│   │   ├── alice-reader/         # Reader app (symlink or copy)
│   │   └── alice-consultant-dashboard/  # Dashboard app (symlink or copy)
│   ├── packages/                 # Shared packages
│   ├── scripts/                  # Active scripts
│   │   ├── start-alice.sh
│   │   ├── start-both-apps.sh
│   │   └── start-dashboard-with-realtime.sh
│   └── config/                   # Configuration files
│       ├── package.json
│       ├── package-lock.json
│       └── .env files
│
├── 🧪 TESTING/                   # Testing and debugging tools
│   ├── scripts/                  # Testing scripts
│   │   ├── simple-test-runner.js
│   │   ├── performance-checker.js
│   │   ├── test-connectivity.js
│   │   ├── test-dashboard-flow.js
│   │   ├── test-auth-events.js
│   │   └── run-tests.sh
│   ├── database/                 # Database testing files
│   │   ├── database-fix.js
│   │   ├── database-verification.js
│   │   ├── create-consultant.js
│   │   └── *.sql files
│   ├── html/                     # HTML test files
│   │   ├── test-activity-tracking.html
│   │   └── start-apps.html
│   └── checklists/               # Testing documentation
│       ├── SIMPLE_TESTING_CHECKLIST.md
│       ├── DEPLOYMENT_CHECKLIST.md
│       └── README_TESTING.md
│
├── 📚 REFERENCE/                 # Documentation and guides
│   ├── docs/                     # General documentation
│   │   ├── README.md
│   │   ├── AI_FEATURES_README.md
│   │   ├── ACTIVITY_TRACKING_README.md
│   │   └── ALICE_SCRIPTS_README.md
│   ├── plans/                    # Planning documents
│   │   ├── ALICE_READER_ADVANCEMENT_PLAN.md
│   │   ├── KEMI_REAL_TIME_DASHBOARD_IMPLEMENTATION_PLAN.md
│   │   ├── tasks.md
│   │   └── planning.md
│   ├── guides/                   # How-to guides
│   │   ├── DASHBOARD_TESTING_GUIDE.md
│   │   ├── DASHBOARD_STATE_DOCUMENTATION.md
│   │   └── AUTH_EVENTS_IMPLEMENTATION.md
│   └── kimi/                     # Kimi integration docs
│       ├── KIMI-CLAUDE-INTEGRATION.md
│       ├── KIMI-CLAUDE-QUICK-START.md
│       ├── KIMI-SETUP-STATUS.md
│       └── *.md files
│
├── 🔧 TOOLS/                     # Development tools and utilities
│   ├── scripts/                  # Utility scripts
│   │   ├── kemi-claude-cli.sh
│   │   ├── setup-aliases.sh
│   │   ├── check-status.sh
│   │   └── kill-all.sh
│   ├── config/                   # Tool configurations
│   │   ├── .cursorrules
│   │   ├── .cursorrules-KIMI-INTEGRATION.md
│   │   └── .gitignore
│   └── python/                   # Python tools
│       ├── test_kimi_k2.py
│       └── test_moonshot.py
│
├── 🗂️ ARCHIVE/                   # Outdated and unused files
│   ├── old-scripts/              # Old script versions
│   ├── deprecated/               # Deprecated features
│   └── backups/                  # Backup files
│
└── 🚀 DEPLOYMENT/                # Production deployment files
    ├── supabase/                 # Supabase configuration
    ├── server/                   # Server configuration
    └── scripts/                  # Deployment scripts
```

## 🔄 **Migration Strategy**

### **Phase 1: Create New Structure (5 minutes)**
1. Create all new directories
2. Move files to appropriate locations
3. Update any hardcoded paths

### **Phase 2: Update References (10 minutes)**
1. Update import paths in code
2. Update script references
3. Update documentation links

### **Phase 3: Test Everything (15 minutes)**
1. Verify all apps still work
2. Test all scripts
3. Check all documentation links

## 📋 **File Classification**

### **ACTIVE Files** (Currently in use)
- Main application code
- Active configuration files
- Currently used scripts
- Live environment files

### **TESTING Files** (For testing and debugging)
- Test scripts and utilities
- Database testing files
- HTML test pages
- Testing documentation

### **REFERENCE Files** (Documentation and guides)
- README files
- Planning documents
- How-to guides
- Integration documentation

### **TOOLS Files** (Development utilities)
- Development scripts
- Configuration files
- Python utilities
- Setup scripts

### **ARCHIVE Files** (Outdated/unused)
- Old versions of files
- Deprecated features
- Backup files
- Unused code

### **DEPLOYMENT Files** (Production setup)
- Supabase configuration
- Server setup
- Deployment scripts

## ✅ **Benefits of This Organization**

1. **Clear Separation**: Easy to find what you need
2. **Reduced Confusion**: No more wondering if a file is active or outdated
3. **Better Maintenance**: Easier to update and maintain
4. **Cleaner Repository**: More professional appearance
5. **Faster Development**: Less time searching for files

## 🚀 **Next Steps**

1. **Review the plan** - Make sure this organization makes sense
2. **Create the structure** - Set up all the directories
3. **Move files** - Organize everything according to the plan
4. **Test everything** - Make sure nothing breaks
5. **Update documentation** - Reflect the new structure

Would you like me to proceed with implementing this organization plan?
