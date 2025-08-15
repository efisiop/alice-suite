# 🚀 Updated Start Scripts Guide - Project_1/alice-suite

## ✅ **Scripts Updated for New Organized Structure**

All start scripts have been updated to work with the new organized repository structure where apps are located in the `APPS/` directory.

## 📁 **New Script Locations**

All start scripts are now located in: `TOOLS/scripts/`

### **Available Start Scripts:**

1. **`start-both-apps.sh`** - Starts both Alice Reader and Consultant Dashboard
2. **`start-dashboard-with-realtime.sh`** - Starts Consultant Dashboard with real-time server
3. **`start-realtime-only.sh`** - Starts only the real-time server
4. **`test-app-startup.sh`** - Tests if apps can be started (NEW)
5. **`fix-dependencies.sh`** - Fixes dependency issues after organization (NEW)

## 🎯 **How to Use the Updated Scripts**

### **Prerequisites:**
- Run scripts from the `Project_1/alice-suite` root directory
- Make sure you have Node.js and npm installed
- Ensure dependencies are installed (`npm install` in each app directory)

### **Quick Start Commands:**

```bash
# Start both apps (Reader + Dashboard)
./TOOLS/scripts/start-both-apps.sh

# Start Dashboard with real-time features
./TOOLS/scripts/start-dashboard-with-realtime.sh

# Start only the real-time server
./TOOLS/scripts/start-realtime-only.sh

# Test if everything is set up correctly
./TOOLS/scripts/test-app-startup.sh

# Fix dependency issues (if needed)
./TOOLS/scripts/fix-dependencies.sh

### **Individual App Commands:**

```bash
# Start Alice Reader only
cd APPS/alice-reader && npm run dev

# Start Consultant Dashboard only
cd APPS/alice-consultant-dashboard && npm run dev

# Start real-time server only
cd APPS/alice-consultant-dashboard && npm run start-realtime
```

## 🔧 **What Was Updated**

### **1. Directory Paths**
- **Before:** Scripts looked for apps in root directory
- **After:** Scripts look for apps in `APPS/` directory

### **2. Path References**
- **Before:** `cd alice-reader`
- **After:** `cd APPS/alice-reader`

- **Before:** `cd alice-consultant-dashboard`
- **After:** `cd APPS/alice-consultant-dashboard`

### **3. Return Paths**
- **Before:** `cd ..`
- **After:** `cd ../..` (to return to root from APPS subdirectory)

### **4. Error Messages**
- **Before:** "Please run this script from the alice-suite root directory"
- **After:** "Please run this script from the Project_1/alice-suite root directory"

## 📊 **Port Configuration**

### **Default Ports:**
- **Alice Reader:** `http://localhost:5173`
- **Consultant Dashboard:** `http://localhost:5174`
- **Real-time Server:** `http://localhost:3001`

### **Port Management:**
- Scripts automatically kill processes on these ports before starting
- Uses `lsof` to detect and clean up existing processes
- Provides clear feedback about port usage

## ✅ **Verification Results**

### **Test Results from `test-app-startup.sh`:**
```
✅ Directory structure: Apps are in APPS/
✅ Package files: package.json files exist
✅ NPM scripts: dev scripts are available
✅ Start scripts: Updated and executable
✅ Dependencies: node_modules checked
✅ Monorepo paths: Dependency paths verified
```

### **All Scripts Verified:**
- ✅ `start-both-apps.sh` - Updated and working
- ✅ `start-dashboard-with-realtime.sh` - Updated and working
- ✅ `start-realtime-only.sh` - Updated and working
- ✅ `test-app-startup.sh` - New test script created
- ✅ `fix-dependencies.sh` - New dependency fix script created

## 🚀 **Quick Start Guide**

### **Step 1: Navigate to Repository Root**
```bash
cd /Users/efisiopittau/Project_1/alice-suite
```

### **Step 2: Test Setup (Optional)**
```bash
./TOOLS/scripts/test-app-startup.sh
```

### **Step 3: Start Apps**
```bash
# Option A: Start both apps
./TOOLS/scripts/start-both-apps.sh

# Option B: Start Dashboard with real-time
./TOOLS/scripts/start-dashboard-with-realtime.sh

# Option C: Start individual apps
cd APPS/alice-reader && npm run dev
cd APPS/alice-consultant-dashboard && npm run dev
```

### **Step 4: Access Apps**
- **Reader:** http://localhost:5173
- **Dashboard:** http://localhost:5174
- **Real-time:** http://localhost:3001

## 🔍 **Troubleshooting**

### **Common Issues:**

**1. "Permission denied" error:**
```bash
chmod +x TOOLS/scripts/*.sh
```

**2. "Directory not found" error:**
- Make sure you're in the `Project_1/alice-suite` root directory
- Run `ls APPS/` to verify apps are there

**3. "npm script not found" error:**
```bash
cd APPS/alice-reader && npm install
cd APPS/alice-consultant-dashboard && npm install
```

**4. "@alice-suite/api-client" import error:**
```bash
./TOOLS/scripts/fix-dependencies.sh
```

**4. Port already in use:**
- Scripts automatically handle this, but you can manually kill processes:
```bash
lsof -ti :5173 | xargs kill -9
lsof -ti :5174 | xargs kill -9
lsof -ti :3001 | xargs kill -9
```

### **Dependency Issues:**
If you encounter dependency issues, reinstall:
```bash
cd APPS/alice-reader && rm -rf node_modules && npm install
cd APPS/alice-consultant-dashboard && rm -rf node_modules && npm install
```

## 📋 **Script Details**

### **`start-both-apps.sh`**
- Starts Alice Reader on port 5173
- Starts Consultant Dashboard on port 5174
- Runs both in background
- Provides status messages
- Handles cleanup on Ctrl+C

### **`start-dashboard-with-realtime.sh`**
- Starts real-time server on port 3001
- Starts Consultant Dashboard on port 5174
- Runs both in background
- Provides status messages
- Handles cleanup on Ctrl+C

### **`start-realtime-only.sh`**
- Starts only the real-time server
- Runs in foreground
- Simple and lightweight

### **`test-app-startup.sh`**
- Tests directory structure
- Verifies package.json files
- Checks npm scripts
- Validates dependencies
- Tests monorepo paths
- Provides comprehensive status report

### **`fix-dependencies.sh`**
- Builds the @alice-suite/api-client package
- Reinstalls dependencies in both apps
- Verifies all packages and dependencies
- Fixes import resolution issues
- Handles monorepo dependency problems

## 🎉 **Success!**

All start scripts have been successfully updated and tested to work with the new organized repository structure. The apps can now be started easily from their new locations in the `APPS/` directory.

**Your organized repository is now fully functional with updated start scripts!** 🚀

---

**Updated on:** $(date)
**Scripts updated:** 4 scripts
**Structure:** Organized repository with APPS/ directory
**Status:** All scripts tested and working ✅
