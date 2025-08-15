# Simple Deployment Checklist for Alice Suite

## 🚀 **Pre-Deployment Checklist**

### **Step 1: Environment Setup (15 minutes)**
- [ ] **Supabase Production Project**
  - [ ] Create production Supabase project
  - [ ] Copy database schema from development
  - [ ] Set up production environment variables
  - [ ] Test database connection

- [ ] **Environment Variables**
  - [ ] `VITE_SUPABASE_URL` - Production Supabase URL
  - [ ] `VITE_SUPABASE_ANON_KEY` - Production Supabase anon key
  - [ ] `VITE_APP_ENV=production`
  - [ ] `VITE_ENABLE_ANALYTICS=true`

### **Step 2: Build Testing (10 minutes)**
- [ ] **Reader App Build**
  - [ ] Run `npm run build` in alice-reader
  - [ ] Check that build completes without errors
  - [ ] Verify dist folder is created
  - [ ] Test build locally with `npm run preview`

- [ ] **Dashboard App Build**
  - [ ] Run `npm run build` in alice-consultant-dashboard
  - [ ] Check that build completes without errors
  - [ ] Verify dist folder is created
  - [ ] Test build locally with `npm run preview`

### **Step 3: Production Testing (20 minutes)**
- [ ] **Test with Production Environment**
  - [ ] Update .env files with production values
  - [ ] Test both apps with production Supabase
  - [ ] Verify all features work in production mode
  - [ ] Check that no development features are exposed

## 🌐 **Deployment Options**

### **Option A: GitHub Pages (Recommended for Start)**
- [ ] **Setup GitHub Pages**
  - [ ] Enable GitHub Pages in repository settings
  - [ ] Set source to "GitHub Actions"
  - [ ] Configure custom domain (optional)

- [ ] **Configure GitHub Secrets**
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`

- [ ] **Deploy**
  - [ ] Push to main branch
  - [ ] Check GitHub Actions deployment
  - [ ] Verify apps are accessible

### **Option B: Vercel (Alternative)**
- [ ] **Setup Vercel**
  - [ ] Connect GitHub repository to Vercel
  - [ ] Configure build settings
  - [ ] Set environment variables

- [ ] **Deploy**
  - [ ] Push to main branch
  - [ ] Check Vercel deployment
  - [ ] Verify apps are accessible

### **Option C: Netlify (Alternative)**
- [ ] **Setup Netlify**
  - [ ] Connect GitHub repository to Netlify
  - [ ] Configure build settings
  - [ ] Set environment variables

- [ ] **Deploy**
  - [ ] Push to main branch
  - [ ] Check Netlify deployment
  - [ ] Verify apps are accessible

## ✅ **Post-Deployment Verification**

### **Step 1: Basic Functionality (15 minutes)**
- [ ] **Reader App**
  - [ ] Loads without errors
  - [ ] User registration works
  - [ ] User login works
  - [ ] Book verification works
  - [ ] Reading interface works
  - [ ] AI assistant works

- [ ] **Dashboard App**
  - [ ] Loads without errors
  - [ ] Consultant login works
  - [ ] Can view reader list
  - [ ] Can view reader details
  - [ ] Can send messages

### **Step 2: Cross-Browser Testing (20 minutes)**
- [ ] **Chrome** - Should work perfectly
- [ ] **Firefox** - Check for any issues
- [ ] **Safari** - Check for any issues
- [ ] **Edge** - Check for any issues
- [ ] **Mobile Safari** - Check mobile experience
- [ ] **Mobile Chrome** - Check mobile experience

### **Step 3: Performance Check (10 minutes)**
- [ ] **Load Times**
  - [ ] Initial load < 3 seconds
  - [ ] Navigation between pages < 1 second
  - [ ] API responses < 2 seconds

- [ ] **Error Monitoring**
  - [ ] Check browser console for errors
  - [ ] Monitor network requests
  - [ ] Check for 404 errors

## 🔧 **Monitoring Setup**

### **Step 1: Error Tracking (Optional)**
- [ ] **Sentry Setup** (if using)
  - [ ] Create Sentry project
  - [ ] Add Sentry SDK to apps
  - [ ] Configure error reporting

### **Step 2: Analytics Setup (Optional)**
- [ ] **Google Analytics** (if using)
  - [ ] Create GA4 property
  - [ ] Add tracking code to apps
  - [ ] Test tracking

### **Step 3: Uptime Monitoring (Optional)**
- [ ] **Uptime Robot** or similar
  - [ ] Set up monitoring for both app URLs
  - [ ] Configure alert notifications

## 📋 **Deployment Commands**

### **Manual Deployment Commands**
```bash
# Build both apps
cd alice-reader && npm run build
cd ../alice-consultant-dashboard && npm run build

# Test builds locally
cd alice-reader && npm run preview
cd ../alice-consultant-dashboard && npm run preview
```

### **Environment File Template**
```bash
# .env.production
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
```

## 🚨 **Troubleshooting**

### **Common Issues**
- [ ] **Build Failures**
  - [ ] Check for TypeScript errors
  - [ ] Verify all dependencies are installed
  - [ ] Check environment variables

- [ ] **Runtime Errors**
  - [ ] Check browser console
  - [ ] Verify Supabase connection
  - [ ] Check environment variables

- [ ] **Deployment Issues**
  - [ ] Check GitHub Actions logs
  - [ ] Verify repository permissions
  - [ ] Check build configuration

## 🎯 **Success Criteria**

Deployment is successful when:
- [ ] Both apps are accessible via public URLs
- [ ] All core functionality works in production
- [ ] Apps work in multiple browsers
- [ ] Performance is acceptable
- [ ] No critical errors in console
- [ ] Environment variables are properly set

---

**Total Time Estimate**: 2-3 hours
**Difficulty**: Medium - requires attention to detail
**Tools Needed**: GitHub account, Supabase account, browser
