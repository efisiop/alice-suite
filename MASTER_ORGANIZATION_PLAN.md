# Master Organization Plan for Project_1/alice-suite

## 🎯 **Goal**
Organize the entire `Project_1/alice-suite` repository to create a clean, professional structure that separates:
- **Active Applications** (currently functional apps)
- **Testing & Debugging** (test scripts and utilities)
- **Documentation & Reference** (guides and documentation)
- **Development Tools** (utilities and configurations)
- **Deployment & Infrastructure** (production setup)
- **Archive** (outdated and unused files)

## 📁 **Proposed Master Structure**

```
Project_1/alice-suite/
├── 📱 APPS/                        # Main applications
│   ├── alice-reader/               # Reader application
│   ├── alice-consultant-dashboard/ # Consultant dashboard
│   └── alice-suite-monorepo/       # Monorepo structure
│
├── 🧪 TESTING/                     # Testing and debugging
│   ├── scripts/                    # Test scripts
│   │   ├── test-*.js              # All test scripts
│   │   ├── check-*.js             # Check scripts
│   │   ├── create-*.js            # Creation scripts
│   │   └── verify-*.js            # Verification scripts
│   ├── database/                   # Database testing
│   │   ├── *.sql                  # SQL scripts
│   │   ├── database-*.js          # Database utilities
│   │   └── apply-*.js             # Database application scripts
│   └── html/                       # HTML test files
│
├── 📚 DOCS/                        # Documentation
│   ├── guides/                     # How-to guides
│   │   ├── DASHBOARD_TESTING_GUIDE.md
│   │   ├── DASHBOARD_STATE_DOCUMENTATION.md
│   │   ├── AUTH_EVENTS_IMPLEMENTATION.md
│   │   └── CONSULTANT_CONNECTIVITY_FIX.md
│   ├── plans/                      # Planning documents
│   │   ├── ALICE_READER_ADVANCEMENT_PLAN.md
│   │   ├── KEMI_REAL_TIME_DASHBOARD_IMPLEMENTATION_PLAN.md
│   │   ├── tasks.md
│   │   └── planning.md
│   ├── kimi/                       # Kimi integration docs
│   │   ├── KIMI-CLAUDE-*.md        # All Kimi Claude docs
│   │   ├── KIMI-K2-*.md           # All Kimi K2 docs
│   │   └── KIMI_*.md              # Other Kimi docs
│   └── general/                    # General documentation
│       ├── README.md
│       ├── AI_FEATURES_README.md
│       └── ALICE_SCRIPTS_README.md
│
├── 🔧 TOOLS/                       # Development tools
│   ├── scripts/                    # Utility scripts
│   │   ├── start-*.sh             # Start scripts
│   │   ├── setup-*.sh             # Setup scripts
│   │   ├── check-*.sh             # Check scripts
│   │   ├── kill-*.sh              # Kill scripts
│   │   └── kemi-*.sh              # Kemi scripts
│   ├── config/                     # Configuration files
│   │   ├── .cursorrules*
│   │   ├── .gitignore
│   │   └── package.json
│   ├── python/                     # Python tools
│   │   ├── test_kimi_k2.py
│   │   └── test_moonshot.py
│   └── environments/               # Environment files
│       └── litellm-env/
│
├── 🚀 DEPLOYMENT/                  # Production deployment
│   ├── supabase/                   # Supabase configuration
│   ├── server/                     # Server configuration
│   ├── packages/                   # Shared packages
│   └── scripts/                    # Deployment scripts
│
├── 🗂️ ARCHIVE/                     # Outdated and unused
│   ├── old-scripts/                # Old script versions
│   ├── deprecated/                 # Deprecated features
│   └── backups/                    # Backup files
│
└── 📋 ORGANIZATION/                # Organization tools
    ├── alice-suite/                # Previous organization attempt
    └── scripts/                    # Organization scripts
```

## 🔄 **File Classification**

### **📱 APPS/** - Main Applications
- `alice-reader/` - Reader application
- `alice-consultant-dashboard/` - Consultant dashboard
- `alice-suite-monorepo/` - Monorepo structure

### **🧪 TESTING/** - Testing and Debugging
- **`scripts/`** - Test scripts
  - `test-auth-events.js`
  - `test-dashboard-flow.js`
  - `test-specific-action.js`
  - `test-cloud-connectivity.js`
  - `test-connectivity.js`
  - `check-role.js`
  - `check-consultant-role.js`
  - `create-consultant.js`
  - `create-test-consultant.js`
  - `verify-consultant-login.js`
  - `reset-consultant-password.js`
- **`database/`** - Database testing
  - `*.sql` files
  - `database-fix.js`
  - `database-verification.js`
  - `apply-*.js` files
- **`html/`** - HTML test files

### **📚 DOCS/** - Documentation
- **`guides/`** - How-to guides
  - `DASHBOARD_TESTING_GUIDE.md`
  - `DASHBOARD_STATE_DOCUMENTATION.md`
  - `AUTH_EVENTS_IMPLEMENTATION.md`
  - `CONSULTANT_CONNECTIVITY_FIX.md`
- **`plans/`** - Planning documents
  - `ALICE_READER_ADVANCEMENT_PLAN.md`
  - `KEMI_REAL_TIME_DASHBOARD_IMPLEMENTATION_PLAN.md`
  - `tasks.md`
  - `planning.md`
- **`kimi/`** - Kimi integration docs
  - All `KIMI-*.md` files
  - All `KIMI_K2-*.md` files
- **`general/`** - General documentation
  - `README.md`
  - `AI_FEATURES_README.md`
  - `ALICE_SCRIPTS_README.md`

### **🔧 TOOLS/** - Development Tools
- **`scripts/`** - Utility scripts
  - `start-*.sh` files
  - `setup-*.sh` files
  - `check-*.sh` files
  - `kill-*.sh` files
  - `kemi-*.sh` files
- **`config/`** - Configuration files
  - `.cursorrules*`
  - `.gitignore`
  - `package.json`
  - `package-lock.json`
- **`python/`** - Python tools
  - `test_kimi_k2.py`
  - `test_moonshot.py`
- **`environments/`** - Environment files
  - `litellm-env/`

### **🚀 DEPLOYMENT/** - Production Deployment
- **`supabase/`** - Supabase configuration
- **`server/`** - Server configuration
- **`packages/`** - Shared packages
- **`scripts/`** - Deployment scripts

### **🗂️ ARCHIVE/** - Outdated and Unused
- **`old-scripts/`** - Old script versions
- **`deprecated/`** - Deprecated features
- **`backups/`** - Backup files

### **📋 ORGANIZATION/** - Organization Tools
- **`alice-suite/`** - Previous organization attempt
- **`scripts/`** - Organization scripts

## 🚀 **Migration Strategy**

### **Phase 1: Create Structure (5 minutes)**
1. Create all new directories
2. Move files to appropriate locations
3. Preserve original structure

### **Phase 2: Update References (10 minutes)**
1. Update import paths in code
2. Update script references
3. Update documentation links

### **Phase 3: Test Everything (15 minutes)**
1. Verify all apps still work
2. Test all scripts
3. Check all documentation links

## ✅ **Benefits of This Organization**

1. **Clear Separation**: Active apps separate from testing and tools
2. **Easy Navigation**: Logical folder structure
3. **Better Maintenance**: Related files grouped together
4. **Professional Appearance**: Clean repository structure
5. **Reduced Confusion**: Clear purpose for each file
6. **Scalable**: Easy to add new files in appropriate locations

## 🎯 **Success Criteria**

Organization is successful when:
- ✅ All files are in appropriate categories
- ✅ All apps work from their new locations
- ✅ All scripts work with updated paths
- ✅ Documentation is easy to find
- ✅ Repository looks professional and organized

## 📋 **Next Steps**

1. **Review the plan** - Make sure this organization makes sense
2. **Create the structure** - Set up all the directories
3. **Move files** - Organize everything according to the plan
4. **Test everything** - Make sure nothing breaks
5. **Update documentation** - Reflect the new structure

Would you like me to proceed with implementing this master organization plan?

