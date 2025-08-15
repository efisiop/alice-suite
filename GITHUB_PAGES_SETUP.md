# 🚀 GitHub Pages Deployment Guide

## 📋 **Overview**
This guide will help you deploy both Alice Reader and Consultant Dashboard apps to GitHub Pages for free hosting.

## ⚙️ **Setup Steps**

### **1. Enable GitHub Pages**
1. Go to your repository: https://github.com/efisiop/alice-suite
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. Click **Save**

### **2. Automatic Deployment**
The GitHub Actions workflows will automatically:
- Build both apps when you push to main branch
- Deploy to GitHub Pages
- Provide live URLs for both applications

## 🌐 **Live URLs (After Deployment)**

### **Alice Reader App**
- **URL**: `https://efisiop.github.io/alice-suite/alice-reader/`
- **Status**: Will be available after first deployment

### **Consultant Dashboard**
- **URL**: `https://efisiop.github.io/alice-suite/consultant-dashboard/`
- **Status**: Will be available after first deployment

## 🔄 **Manual Deployment**

If you want to deploy manually:

1. **Build Alice Reader:**
   ```bash
   cd APPS/alice-reader
   npm run build
   ```

2. **Build Consultant Dashboard:**
   ```bash
   cd APPS/alice-consultant-dashboard
   npm run build
   ```

3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Update Vite configs for GitHub Pages"
   git push origin main
   ```

## 📱 **What You'll Get**

✅ **Live websites** accessible from anywhere
✅ **Automatic updates** when you push code
✅ **Free hosting** with GitHub Pages
✅ **Custom URLs** for each app
✅ **Professional deployment** setup

## 🚨 **Important Notes**

- **First deployment** may take 5-10 minutes
- **Check Actions tab** to monitor deployment progress
- **Apps will be accessible** at the URLs above after successful deployment
- **No more local development server needed** for testing production builds

## 🎯 **Next Steps**

1. **Enable GitHub Pages** in repository settings
2. **Push the updated configs** to trigger deployment
3. **Wait for deployment** to complete
4. **Access your live apps** at the URLs above

Your Alice Suite will then be accessible as live websites from anywhere in the world! 🌍
