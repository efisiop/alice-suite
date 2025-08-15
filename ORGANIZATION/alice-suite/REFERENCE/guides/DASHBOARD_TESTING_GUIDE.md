# Alice Suite - Dashboard Data Flow Testing Guide

## 🎯 **Problem Summary**
The consultant dashboard was showing '0' for all metrics despite having data in the database due to:

1. **Missing consultant assignments** - No readers were assigned to the consultant
2. **Missing icon imports** in DashboardOverview.tsx
3. **Mock data** in consultant service instead of real database calls
4. **Database relationship issues** between tables

## ✅ **Issues Fixed**

### 1. Database Level Fixes ✅
- **Created consultant assignment** between consultant@test.com and fausto@fausto.com
- **Verified data integrity** - 9 help requests and 8 feedback items now properly linked
- **Fixed stats function** - `get_consultant_dashboard_stats()` now returns correct data

### 2. Frontend Fixes ✅
- **Added missing icon imports** in DashboardOverview.tsx
- **Replaced mock data** with real API calls in consultantService.ts
- **Fixed service configuration** for proper authentication

## 📊 **Current Data State**

### Database Summary
```
📊 Table Counts:
  ✅ profiles: 33 records
  ✅ help_requests: 9 records
  ✅ user_feedback: 8 records
  ✅ consultant_assignments: 1 records (fixed)
  ✅ reading_progress: 0 records
  ✅ reading_stats: 0 records

📈 Dashboard Stats:
  - Total Readers: 1 (fausto@fausto.com assigned to consultant@test.com)
  - Active Readers: 0 (last_active_at needs to be updated)
  - Pending Help Requests: 9 (all from fausto@fausto.com)
  - Resolved Help Requests: 0
  - Feedback Count: 8 (all from fausto@fausto.com)
  - Prompts Sent: 0
```

## 🧪 **Testing Procedure**

### Step 1: Verify Database Connection
```bash
node database-verification.js
```
Expected: Should show 1 total reader, 9 pending help requests, 8 feedback items

### Step 2: Test Frontend Fixes
1. **Start the applications:**
   ```bash
   # Terminal 1: Start Alice Reader
   cd alice-suite-monorepo
   pnpm dev:reader
   
   # Terminal 2: Start Consultant Dashboard
   pnpm dev:dashboard
   ```

2. **Access the applications:**
   - Reader: http://localhost:5173
   - Dashboard: http://localhost:5174

3. **Login credentials:**
   - **Consultant Dashboard**: Use `consultant@test.com` / `password123`
   - **Reader**: Use `fausto@fausto.com` / `password123`

### Step 3: End-to-End Testing

#### Test 1: Create Help Request from Reader
1. Login to reader app (fausto@fausto.com)
2. Navigate to Alice in Wonderland book
3. Select any text and click "Ask for help"
4. Submit a help request
5. **Expected**: Should appear in consultant dashboard within 30 seconds

#### Test 2: Create Feedback from Reader
1. In reader app, provide feedback on any section
2. **Expected**: Should appear in consultant dashboard feedback section

#### Test 3: Consultant Dashboard Updates
1. Login to consultant dashboard
2. Verify dashboard shows:
   - **1 Total Reader** (fausto@fausto.com)
   - **9+ Pending Help Requests** (including new ones)
   - **8+ Feedback Items**
   - **Real-time updates** when new data is created

### Step 4: Real-time Testing
1. Keep both applications open in separate browser windows
2. Create help request in reader app
3. **Expected**: Dashboard should update automatically within 30 seconds
4. Create feedback in reader app
5. **Expected**: Dashboard feedback count should increment

## 🔧 **Manual Database Queries**

### Check Current Assignments
```sql
SELECT 
  ca.*,
  c.email as consultant_email,
  u.email as user_email,
  u.first_name,
  u.last_name
FROM consultant_assignments ca
JOIN profiles c ON ca.consultant_id = c.id
JOIN profiles u ON ca.user_id = u.id
WHERE ca.active = true;
```

### Check Help Requests by Consultant
```sql
SELECT 
  hr.*,
  u.email as user_email,
  u.first_name,
  u.last_name
FROM help_requests hr
JOIN consultant_assignments ca ON hr.user_id = ca.user_id
JOIN profiles u ON hr.user_id = u.id
WHERE ca.consultant_id = '326b4447-6abc-4838-898d-9b39550b3575'
  AND hr.status = 'pending';
```

### Check Feedback by Consultant
```sql
SELECT 
  uf.*,
  u.email as user_email,
  u.first_name,
  u.last_name
FROM user_feedback uf
JOIN consultant_assignments ca ON uf.user_id = ca.user_id
JOIN profiles u ON uf.user_id = u.id
WHERE ca.consultant_id = '326b4447-6abc-4838-898d-9b39550b3575';
```

## 🚨 **Troubleshooting**

### If Dashboard Still Shows 0
1. **Check authentication**: Ensure consultant is logged in as `consultant@test.com`
2. **Verify assignments**: Run database queries above
3. **Check browser console**: Look for JavaScript errors
4. **Verify API calls**: Check Network tab in browser dev tools

### If Real-time Updates Don't Work
1. **Check WebSocket connection**: Look for Supabase Realtime logs
2. **Verify RLS policies**: Ensure consultant can access assigned user data
3. **Check service worker**: Refresh browser cache (Ctrl+F5)

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Dashboard shows 0 | Run `node database-fix.js` to create assignments |
| Icons missing | Ensure @mui/icons-material is installed |
| Authentication fails | Use correct email/password combinations |
| Real-time not working | Check browser console for WebSocket errors |

## 📝 **Test Results Template**

### Database Verification Checklist
- [ ] Database accessible via API key
- [ ] Consultant assignment exists
- [ ] Help requests linked to assigned users
- [ ] Feedback linked to assigned users
- [ ] Dashboard stats function returns correct data

### Frontend Verification Checklist
- [ ] Dashboard loads without JavaScript errors
- [ ] Icons display correctly
- [ ] Data updates in real-time
- [ ] All metrics show correct counts
- [ ] Help requests appear in dashboard
- [ ] Feedback appears in dashboard

### End-to-End Test Results
- [ ] Help request from reader appears in dashboard
- [ ] Feedback from reader appears in dashboard
- [ ] Data updates within 30 seconds
- [ ] All metrics reflect current database state

## 🎯 **Expected Final State**

After successful testing:
- **Dashboard shows 1 total reader** (fausto@fausto.com)
- **Dashboard shows 9+ pending help requests**
- **Dashboard shows 8+ feedback items**
- **Real-time updates work correctly**
- **Icons display properly**
- **No JavaScript errors in console**

## 🔄 **Maintenance**

To maintain the system:
1. Run database verification script weekly: `node database-verification.js`
2. Monitor for new consultant assignments
3. Ensure reader accounts are properly linked to consultants
4. Check for any RLS policy changes that might affect data access