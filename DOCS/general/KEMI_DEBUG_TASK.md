# 🔧 Kemi Debug Task: Fix Alice Suite Apps & Supabase Connection

## 🎯 **Primary Objective**
Debug and fix all Supabase connection issues to get both Alice Reader and Alice Consultant Dashboard running normally with proper database connectivity.

## 🚨 **Current Issues Identified**

### **1. Supabase Client Not Initialized**
```
Error: Supabase client not initialized. Call initializeSupabase() first with your environment variables.
getSupabaseClient (index.mjs:23:122)
```

### **2. Rate Limiting (429 Error)**
```
Failed to load resource: the server responded with a status of 429
```

### **3. Port Conflicts**
- Alice Reader trying to use port 5173 but getting "Port 5173 is in use"
- Alice Consultant Dashboard trying to use port 5174 but getting "Port 5174 is in use"
- Apps falling back to ports 5174 and 5175 respectively

### **4. Suspended Processes**
- Apps running but suspended in background (TN status)
- Browser very slow due to suspended processes

## 🔍 **Debug Steps Required**

### **Step 1: Clean Environment**
```bash
# Kill all existing processes
pkill -f "vite"
pkill -f "node.*alice"
pkill -f "npm.*dev"

# Clear port usage
lsof -ti:5173 | xargs kill -9
lsof -ti:5174 | xargs kill -9
lsof -ti:5175 | xargs kill -9
```

### **Step 2: Verify Environment Variables**
```bash
# Check if .env files exist and have correct content
ls -la alice-reader/.env
ls -la alice-consultant-dashboard/.env

# Verify Supabase configuration
grep "VITE_SUPABASE" alice-reader/.env
grep "VITE_SUPABASE" alice-consultant-dashboard/.env
```

### **Step 3: Test Supabase Connection**
```bash
# Test direct Supabase connection
curl -X GET "https://blwypdcobizmpidmuhvq.supabase.co/rest/v1/" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsd3lwZGNvYml6bXBpZG11aHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDgzNDcsImV4cCI6MjA1OTc4NDM0N30.YP2r-CnSaM4rKclXBivanAMBQh9sMsI95F2p87zIuWM" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsd3lwZGNvYml6bXBpZG11aHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDgzNDcsImV4cCI6MjA1OTc4NDM0N30.YP2r-CnSaM4rKclXBivanAMBQh9sMsI95F2p87zIuWM"
```

### **Step 4: Check Supabase Client Initialization**
```bash
# Examine the supabaseClient.ts files
cat alice-reader/src/services/supabaseClient.ts
cat alice-consultant-dashboard/src/services/supabaseClient.ts

# Look for initializeSupabase() function calls
grep -r "initializeSupabase" alice-reader/src/
grep -r "initializeSupabase" alice-consultant-dashboard/src/
```

### **Step 5: Fix Supabase Client Issues**
1. **Find where `initializeSupabase()` should be called**
2. **Ensure environment variables are loaded before Supabase initialization**
3. **Add proper error handling for Supabase connection failures**
4. **Fix any missing imports or configuration**

### **Step 6: Start Apps Properly**
```bash
# Start Alice Reader
cd alice-reader
npm run dev

# In new terminal, start Alice Consultant Dashboard
cd alice-consultant-dashboard
npm run dev
```

### **Step 7: Verify Apps are Working**
```bash
# Test both apps respond quickly
curl -w "Alice Reader: %{http_code} - %{time_total}s\n" -o /dev/null -s http://localhost:5173
curl -w "Alice Dashboard: %{http_code} - %{time_total}s\n" -o /dev/null -s http://localhost:5174

# Check for Supabase errors in browser console
open http://localhost:5173
open http://localhost:5174
```

## 🎯 **Expected Outcomes**

### **Success Criteria**
1. ✅ Both apps start on correct ports (5173 and 5174)
2. ✅ No Supabase initialization errors in browser console
3. ✅ No 429 rate limiting errors
4. ✅ Apps respond quickly (< 2 seconds)
5. ✅ Database connectivity working (can login, see data)
6. ✅ Activity tracking between apps functional

### **Files to Check/Fix**
- `alice-reader/src/services/supabaseClient.ts`
- `alice-consultant-dashboard/src/services/supabaseClient.ts`
- `alice-reader/src/main.tsx` (or App.tsx)
- `alice-consultant-dashboard/src/main.tsx` (or App.tsx)
- Environment variable loading in both apps
- Any initialization code that calls Supabase functions

## 🚀 **Use Kemi Integration**

Use the Kimi K2 integration to help debug:

```bash
./kemi-claude-cli.sh "Help me debug the Supabase connection issues in the Alice Suite apps. The error is 'Supabase client not initialized. Call initializeSupabase() first with your environment variables.'"
```

## 📋 **Debug Checklist**

- [ ] Kill all existing processes
- [ ] Verify .env files exist and have correct Supabase config
- [ ] Test direct Supabase API connection
- [ ] Find and fix Supabase client initialization
- [ ] Start apps individually (not in background)
- [ ] Verify no console errors
- [ ] Test database connectivity
- [ ] Confirm activity tracking works between apps

## 🎯 **Priority**
**HIGH** - This is blocking the entire Alice Suite functionality. Both apps need to be running with proper Supabase connectivity for the activity tracking system to work. 