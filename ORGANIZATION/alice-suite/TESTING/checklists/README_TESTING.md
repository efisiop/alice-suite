# Alice Suite - Testing Guide

## 🎯 **Quick Start**

You have both apps looking good! Now let's make sure they work perfectly. Here's how to test them:

### **Step 1: Run the Complete Test Suite**
```bash
# From the alice-suite directory
./run-tests.sh
```

This will:
- ✅ Check if all files are in place
- ⚡ Check performance metrics
- 🌐 Check if apps are running
- 📋 Give you next steps

### **Step 2: Manual Testing**
After running the test suite, follow the manual testing checklist:
```bash
# Open the checklist
open SIMPLE_TESTING_CHECKLIST.md
```

## 📋 **What Each Tool Does**

### **1. Simple Test Runner** (`scripts/simple-test-runner.js`)
- Checks if all required files exist
- Verifies package.json files are valid
- Checks environment configuration
- Tests TypeScript setup
- **Time**: 30 seconds

### **2. Performance Checker** (`scripts/performance-checker.js`)
- Measures build sizes
- Counts source files and lines
- Checks dependency counts
- Gives performance recommendations
- **Time**: 30 seconds

### **3. Manual Testing Checklist** (`SIMPLE_TESTING_CHECKLIST.md`)
- Step-by-step testing instructions
- Browser compatibility testing
- Mobile testing guide
- Error reporting format
- **Time**: 2-3 hours

### **4. Deployment Checklist** (`DEPLOYMENT_CHECKLIST.md`)
- Production environment setup
- Deployment options (GitHub Pages, Vercel, Netlify)
- Post-deployment verification
- Monitoring setup
- **Time**: 2-3 hours

## 🚀 **Testing Phases**

### **Phase 1: Automated Testing (5 minutes)**
```bash
./run-tests.sh
```

### **Phase 2: Manual Testing (2-3 hours)**
1. Open `SIMPLE_TESTING_CHECKLIST.md`
2. Follow each step carefully
3. Test both apps in different browsers
4. Test on mobile devices
5. Report any issues you find

### **Phase 3: Performance Optimization (1 hour)**
1. Review performance checker results
2. Optimize any issues found
3. Test loading speeds
4. Check bundle sizes

### **Phase 4: Production Deployment (2-3 hours)**
1. Follow `DEPLOYMENT_CHECKLIST.md`
2. Set up production environment
3. Deploy to chosen platform
4. Verify everything works

## 🛠️ **Individual Commands**

If you want to run tools individually:

```bash
# Run just the structure tests
node scripts/simple-test-runner.js

# Run just the performance checks
node scripts/performance-checker.js

# Check if apps are running
curl http://localhost:3000  # Reader app
curl http://localhost:3002  # Dashboard app
```

## 📱 **Testing on Mobile**

To test on your phone:
1. Find your computer's IP address:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
2. On your phone, go to: `http://YOUR_IP:3000` (reader app)
3. On your phone, go to: `http://YOUR_IP:3002` (dashboard app)

## 🎯 **Success Criteria**

Your apps are ready for production when:
- ✅ All automated tests pass
- ✅ All manual tests pass
- ✅ Apps work in Chrome, Firefox, Safari, Edge
- ✅ Apps work on mobile devices
- ✅ Performance is acceptable (< 3s load time)
- ✅ No critical errors in browser console

## 🚨 **Common Issues & Solutions**

### **Apps Not Running**
```bash
# Start reader app
cd alice-reader && npm run dev

# Start dashboard app (in another terminal)
cd alice-consultant-dashboard && npm run dev
```

### **Build Errors**
```bash
# Install dependencies
npm install

# Clear cache
npm run clean  # if available
rm -rf node_modules && npm install
```

### **Environment Issues**
- Check `.env` files exist
- Verify Supabase credentials
- Ensure all required variables are set

## 📞 **Getting Help**

If you encounter issues:
1. Check the browser console for errors
2. Look at the test output for specific failures
3. Verify all environment variables are set
4. Make sure both apps are running

## 🎉 **What's Next**

After testing is complete:
1. **Performance Optimization** - Improve loading speeds
2. **Production Deployment** - Deploy to live servers
3. **Monitoring Setup** - Track errors and performance
4. **User Feedback** - Get real user testing

---

**Total Time Investment**: 6-8 hours
**Difficulty**: Easy to Medium
**Tools Needed**: Browser, phone, terminal

Happy testing! 🚀
