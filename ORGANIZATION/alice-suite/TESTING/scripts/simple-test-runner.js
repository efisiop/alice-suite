#!/usr/bin/env node

/**
 * Simple Test Runner for Alice Suite
 * This script helps check basic functionality of both apps
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Alice Suite - Simple Test Runner');
console.log('=====================================\n');

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to log test results
function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}`);
    if (details) {
      console.log(`   Details: ${details}`);
    }
  }
  testResults.details.push({ name: testName, passed, details });
}

// Test 1: Check if both apps exist
console.log('📁 Checking app directories...');
const readerPath = path.join(__dirname, '../../ACTIVE/apps/alice-reader');
const dashboardPath = path.join(__dirname, '../../ACTIVE/apps/alice-consultant-dashboard');

logTest('Reader app directory exists', fs.existsSync(readerPath));
logTest('Consultant dashboard directory exists', fs.existsSync(dashboardPath));

// Test 2: Check for essential files
console.log('\n📄 Checking essential files...');

if (fs.existsSync(readerPath)) {
  const readerFiles = [
    'package.json',
    'src/App.tsx',
    'index.html',
    'vite.config.ts'
  ];
  
  readerFiles.forEach(file => {
    const filePath = path.join(readerPath, file);
    logTest(`Reader ${file} exists`, fs.existsSync(filePath));
  });
}

if (fs.existsSync(dashboardPath)) {
  const dashboardFiles = [
    'package.json',
    'src/App.tsx',
    'index.html',
    'vite.config.ts'
  ];
  
  dashboardFiles.forEach(file => {
    const filePath = path.join(dashboardPath, file);
    logTest(`Dashboard ${file} exists`, fs.existsSync(filePath));
  });
}

// Test 3: Check package.json files
console.log('\n📦 Checking package.json files...');

function checkPackageJson(appPath, appName) {
  try {
    const packagePath = path.join(appPath, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      logTest(`${appName} has name field`, !!packageJson.name);
      logTest(`${appName} has version field`, !!packageJson.version);
      logTest(`${appName} has dependencies`, !!packageJson.dependencies);
      logTest(`${appName} has devDependencies`, !!packageJson.devDependencies);
      logTest(`${appName} has scripts`, !!packageJson.scripts);
      
      // Check for essential scripts
      if (packageJson.scripts) {
        logTest(`${appName} has dev script`, !!packageJson.scripts.dev);
        logTest(`${appName} has build script`, !!packageJson.scripts.build);
      }
    }
  } catch (error) {
    logTest(`${appName} package.json is valid JSON`, false, error.message);
  }
}

checkPackageJson(readerPath, 'Reader');
checkPackageJson(dashboardPath, 'Dashboard');

// Test 4: Check environment configuration
console.log('\n⚙️ Checking environment configuration...');

function checkEnvFiles(appPath, appName) {
  const envFiles = ['.env', '.env.example', '.env.production'];
  
  envFiles.forEach(envFile => {
    const envPath = path.join(appPath, envFile);
    logTest(`${appName} has ${envFile}`, fs.existsSync(envPath));
  });
  
  // Check if .env.example exists and has content
  const examplePath = path.join(appPath, '.env.example');
  if (fs.existsSync(examplePath)) {
    const content = fs.readFileSync(examplePath, 'utf8');
    logTest(`${appName} .env.example has content`, content.length > 0);
  }
}

checkEnvFiles(readerPath, 'Reader');
checkEnvFiles(dashboardPath, 'Dashboard');

// Test 5: Check for TypeScript configuration
console.log('\n🔧 Checking TypeScript configuration...');

function checkTypeScriptConfig(appPath, appName) {
  const tsConfigPath = path.join(appPath, 'tsconfig.json');
  const tsConfigNodePath = path.join(appPath, 'tsconfig.node.json');
  
  logTest(`${appName} has tsconfig.json`, fs.existsSync(tsConfigPath));
  logTest(`${appName} has tsconfig.node.json`, fs.existsSync(tsConfigNodePath));
  
  if (fs.existsSync(tsConfigPath)) {
    try {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      logTest(`${appName} tsconfig.json is valid JSON`, true);
    } catch (error) {
      logTest(`${appName} tsconfig.json is valid JSON`, false, error.message);
    }
  }
}

checkTypeScriptConfig(readerPath, 'Reader');
checkTypeScriptConfig(dashboardPath, 'Dashboard');

// Test 6: Check for essential source files
console.log('\n📝 Checking source files...');

function checkSourceFiles(appPath, appName) {
  const sourceFiles = [
    'src/components',
    'src/pages',
    'src/services',
    'src/hooks',
    'src/utils'
  ];
  
  sourceFiles.forEach(dir => {
    const dirPath = path.join(appPath, dir);
    logTest(`${appName} has ${dir} directory`, fs.existsSync(dirPath));
  });
}

checkSourceFiles(readerPath, 'Reader');
checkSourceFiles(dashboardPath, 'Dashboard');

// Summary
console.log('\n📊 Test Summary');
console.log('===============');
console.log(`Total Tests: ${testResults.total}`);
console.log(`Passed: ${testResults.passed} ✅`);
console.log(`Failed: ${testResults.failed} ❌`);
console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

if (testResults.failed > 0) {
  console.log('\n❌ Failed Tests:');
  testResults.details
    .filter(test => !test.passed)
    .forEach(test => {
      console.log(`   - ${test.name}`);
      if (test.details) {
        console.log(`     ${test.details}`);
      }
    });
}

console.log('\n🎯 Next Steps:');
if (testResults.failed === 0) {
  console.log('✅ All basic tests passed! You can now run the manual testing checklist.');
  console.log('📋 Open SIMPLE_TESTING_CHECKLIST.md and follow the steps.');
} else {
  console.log('⚠️ Some tests failed. Please fix the issues before proceeding with manual testing.');
  console.log('🔧 Check the failed tests above and ensure all required files exist.');
}

console.log('\n🚀 To run manual testing:');
console.log('1. Open both apps in your browser');
console.log('2. Follow the SIMPLE_TESTING_CHECKLIST.md');
console.log('3. Report any issues you find');

console.log('\n✨ Happy testing!');
