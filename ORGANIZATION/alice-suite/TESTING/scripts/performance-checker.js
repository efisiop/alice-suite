#!/usr/bin/env node

/**
 * Simple Performance Checker for Alice Suite
 * This script helps check basic performance metrics
 */

const fs = require('fs');
const path = require('path');

console.log('⚡ Alice Suite - Performance Checker');
console.log('====================================\n');

// Performance results storage
const perfResults = {
  reader: {},
  dashboard: {},
  recommendations: []
};

// Helper function to get file size in MB
function getFileSizeInMB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2);
  } catch (error) {
    return 0;
  }
}

// Helper function to count lines in a file
function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

// Helper function to count files in directory recursively
function countFiles(dirPath) {
  try {
    let count = 0;
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        count += countFiles(itemPath);
      } else {
        count++;
      }
    }
    
    return count;
  } catch (error) {
    return 0;
  }
}

// Check Reader App Performance
console.log('📚 Checking Reader App Performance...');
const readerPath = path.join(__dirname, '../../ACTIVE/apps/alice-reader');

if (fs.existsSync(readerPath)) {
  // Check build directory size
  const buildPath = path.join(readerPath, 'dist');
  if (fs.existsSync(buildPath)) {
    const buildSize = getFileSizeInMB(buildPath);
    perfResults.reader.buildSize = buildSize;
    console.log(`   Build size: ${buildSize} MB`);
    
    if (parseFloat(buildSize) > 5) {
      perfResults.recommendations.push('Reader app build size is large. Consider optimizing bundle size.');
    }
  }
  
  // Check source code size
  const srcPath = path.join(readerPath, 'src');
  if (fs.existsSync(srcPath)) {
    const srcFiles = countFiles(srcPath);
    const mainAppFile = path.join(srcPath, 'App.tsx');
    const appLines = countLines(mainAppFile);
    
    perfResults.reader.sourceFiles = srcFiles;
    perfResults.reader.appLines = appLines;
    
    console.log(`   Source files: ${srcFiles}`);
    console.log(`   App.tsx lines: ${appLines}`);
    
    if (appLines > 500) {
      perfResults.recommendations.push('Reader App.tsx is large. Consider breaking it into smaller components.');
    }
  }
  
  // Check for large dependencies
  const packagePath = path.join(readerPath, 'package.json');
  if (fs.existsSync(packagePath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const dependencies = Object.keys(packageJson.dependencies || {}).length;
      const devDependencies = Object.keys(packageJson.devDependencies || {}).length;
      
      perfResults.reader.dependencies = dependencies;
      perfResults.reader.devDependencies = devDependencies;
      
      console.log(`   Dependencies: ${dependencies}`);
      console.log(`   Dev Dependencies: ${devDependencies}`);
      
      if (dependencies > 20) {
        perfResults.recommendations.push('Reader app has many dependencies. Consider removing unused packages.');
      }
    } catch (error) {
      console.log('   Could not read package.json');
    }
  }
}

// Check Dashboard App Performance
console.log('\n📊 Checking Dashboard App Performance...');
const dashboardPath = path.join(__dirname, '../../ACTIVE/apps/alice-consultant-dashboard');

if (fs.existsSync(dashboardPath)) {
  // Check build directory size
  const buildPath = path.join(dashboardPath, 'dist');
  if (fs.existsSync(buildPath)) {
    const buildSize = getFileSizeInMB(buildPath);
    perfResults.dashboard.buildSize = buildSize;
    console.log(`   Build size: ${buildSize} MB`);
    
    if (parseFloat(buildSize) > 5) {
      perfResults.recommendations.push('Dashboard app build size is large. Consider optimizing bundle size.');
    }
  }
  
  // Check source code size
  const srcPath = path.join(dashboardPath, 'src');
  if (fs.existsSync(srcPath)) {
    const srcFiles = countFiles(srcPath);
    const mainAppFile = path.join(srcPath, 'App.tsx');
    const appLines = countLines(mainAppFile);
    
    perfResults.dashboard.sourceFiles = srcFiles;
    perfResults.dashboard.appLines = appLines;
    
    console.log(`   Source files: ${srcFiles}`);
    console.log(`   App.tsx lines: ${appLines}`);
    
    if (appLines > 500) {
      perfResults.recommendations.push('Dashboard App.tsx is large. Consider breaking it into smaller components.');
    }
  }
  
  // Check for large dependencies
  const packagePath = path.join(dashboardPath, 'package.json');
  if (fs.existsSync(packagePath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const dependencies = Object.keys(packageJson.dependencies || {}).length;
      const devDependencies = Object.keys(packageJson.devDependencies || {}).length;
      
      perfResults.dashboard.dependencies = dependencies;
      perfResults.dashboard.devDependencies = devDependencies;
      
      console.log(`   Dependencies: ${dependencies}`);
      console.log(`   Dev Dependencies: ${devDependencies}`);
      
      if (dependencies > 20) {
        perfResults.recommendations.push('Dashboard app has many dependencies. Consider removing unused packages.');
      }
    } catch (error) {
      console.log('   Could not read package.json');
    }
  }
}

// Check shared packages
console.log('\n📦 Checking Shared Packages...');
const packagesPath = path.join(__dirname, '../../ACTIVE/packages');
if (fs.existsSync(packagesPath)) {
  const apiClientPath = path.join(packagesPath, 'api-client');
  if (fs.existsSync(apiClientPath)) {
    const apiClientSize = getFileSizeInMB(apiClientPath);
    console.log(`   API Client package size: ${apiClientSize} MB`);
  }
}

// Performance Summary
console.log('\n📊 Performance Summary');
console.log('======================');

if (perfResults.reader.buildSize) {
  console.log(`Reader App Build Size: ${perfResults.reader.buildSize} MB`);
}
if (perfResults.dashboard.buildSize) {
  console.log(`Dashboard App Build Size: ${perfResults.dashboard.buildSize} MB`);
}

// Recommendations
if (perfResults.recommendations.length > 0) {
  console.log('\n💡 Performance Recommendations:');
  perfResults.recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec}`);
  });
} else {
  console.log('\n✅ No performance issues detected!');
}

// Performance Targets
console.log('\n🎯 Performance Targets:');
console.log('   • Build size: < 5 MB per app');
console.log('   • App.tsx: < 500 lines');
console.log('   • Dependencies: < 20 production dependencies');
console.log('   • Load time: < 2 seconds');

console.log('\n🚀 Next Steps:');
console.log('1. Run the manual testing checklist');
console.log('2. Test app loading times in browser');
console.log('3. Check performance in different browsers');
console.log('4. Test on mobile devices');

console.log('\n✨ Performance check complete!');
