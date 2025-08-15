# 🔄 Code Migration Plan - Alice Suite

## 🎯 **Objective**
Complete migration to shared package architecture by removing duplicate types and updating services to use shared clients.

## 📋 **Migration Tasks**

### **Phase 1: Type Consolidation** ✅ **COMPLETED**

#### **Task 1.1: Remove Duplicate ID Types**
- [x] **alice-reader/src/types/idTypes.ts** - Converted to re-export from shared package
- [x] **alice-consultant-dashboard/src/types/idTypes.ts** - Converted to re-export from shared package
- [x] Added ID utility functions to shared package (`@alice-suite/api-client`)

#### **Task 1.2: Remove Duplicate Database Types**
- [x] **alice-reader/src/types/supabase.ts** - Converted to re-export from shared package
- [x] **alice-consultant-dashboard/src/types/supabase.ts** - Converted to re-export from shared package
- [x] All database types now use `@alice-suite/api-client`

#### **Task 1.3: Remove Duplicate Custom Types**
- [x] **alice-reader/src/types/api-client.ts** - Converted to re-export from shared package
- [x] **alice-consultant-dashboard/src/types/helpRequest.ts** - Updated to use shared UserProfile
- [x] **alice-reader/src/types/helpRequest.ts** - Updated to use shared UserProfile
- [x] All custom types now use `@alice-suite/api-client`

### **Phase 2: Service Refactoring** 🔄 **IN PROGRESS**

#### **Task 2.1: Update Auth Services**
- [x] **alice-reader/src/services/supabaseClient.ts** - Converted to use shared client
- [x] **alice-consultant-dashboard/src/services/supabaseClient.ts** - Updated to use shared client
- [x] **alice-reader/src/services/authService.ts** - Simplified to use shared `authClient` and `dbClient`
- [ ] **alice-consultant-dashboard/src/services/authService.ts** - Update to use shared `authClient`
- [x] Removed duplicate Supabase client configurations

#### **Task 2.2: Update Database Services**
- [x] **alice-reader/src/services/supabaseClient.ts** - Updated to use shared `dbClient` for profile operations
- [ ] **alice-consultant-dashboard/src/services/** - Update to use shared `dbClient`
- [ ] Remove duplicate database logic

### **Phase 3: Component Updates** 🔄 **PENDING**

#### **Task 3.1: Update Auth Components**
- [ ] **alice-reader/src/components/** - Update to use shared auth types and clients
- [ ] **alice-consultant-dashboard/src/components/** - Update to use shared auth types and clients

#### **Task 3.2: Update Database Components**
- [ ] **alice-reader/src/components/** - Update to use shared database types and clients
- [ ] **alice-consultant-dashboard/src/components/** - Update to use shared database types and clients

### **Phase 4: Testing & Validation** 🔄 **PENDING**

#### **Task 4.1: Build Verification**
- [ ] Verify TypeScript compilation
- [ ] Test both applications build successfully
- [ ] Verify no type errors

#### **Task 4.2: Runtime Testing**
- [ ] Test both applications start correctly
- [ ] Verify all features work as expected
- [ ] Test authentication flows
- [ ] Test database operations

## 📊 **Progress Tracking**

### **Current Status:**
- **Phase 1**: ✅ Completed (Type Consolidation)
- **Phase 2**: 🔄 In Progress (Service Refactoring)
- **Phase 3**: ⏳ Pending (Component Updates)
- **Phase 4**: ⏳ Pending (Testing & Validation)

### **Files to Migrate:**
- **Total Files**: ~20 files
- **Completed**: 9 files (Type consolidation + Service refactoring)
- **Remaining**: ~11 files

## 🛠️ **Migration Strategy**

### **Step-by-Step Approach:**
1. **Start with Types** - Remove duplicates, update imports
2. **Update Services** - Use shared clients, remove duplicates
3. **Update Components** - Use shared types and clients
4. **Test Thoroughly** - Ensure everything works

### **Safety Measures:**
- **Backup**: Keep original files until migration is complete
- **Incremental**: Test after each major change
- **Rollback**: Ability to revert if issues arise

## 🎯 **Success Criteria**

### **Technical Criteria:**
- ✅ No duplicate types in individual apps
- ✅ All imports use `@alice-suite/api-client`
- ✅ Both apps build without errors
- ✅ Both apps run without issues
- ✅ All features work correctly

### **Code Quality Criteria:**
- ✅ Reduced code duplication
- ✅ Consistent type usage
- ✅ Centralized database logic
- ✅ Centralized authentication logic

---

**Migration started on:** $(date)
**Estimated completion:** 2-3 hours
**Status:** Phase 1 in progress
