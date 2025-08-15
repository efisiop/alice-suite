#!/usr/bin/env node

/**
 * Environment Check Script for Alice Suite
 * Validates that all required environment variables are set
 */

const fs = require('fs');
const path = require('path');

// Required environment variables for each app
const requiredEnvVars = {
  'alice-reader': [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ],
  'alice-consultant-dashboard': [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ]
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile(appName) {
  const envPath = path.join(__dirname, '..', appName, '.env');
  const envExamplePath = path.join(__dirname, '..', appName, '.env.example');
  
  log(`\n🔍 Checking ${appName}...`, 'blue');
  
  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    log(`❌ .env file not found in ${appName}/`, 'red');
    if (fs.existsSync(envExamplePath)) {
      log(`💡 Copy ${appName}/.env.example to ${appName}/.env and fill in your values`, 'yellow');
    }
    return false;
  }
  
  // Read .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  // Parse .env file
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#][^=]+)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim();
    }
  });
  
  // Check required variables
  const missing = [];
  const required = requiredEnvVars[appName] || [];
  
  required.forEach(varName => {
    if (!envVars[varName] || envVars[varName] === '') {
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    log(`❌ Missing required environment variables:`, 'red');
    missing.forEach(varName => {
      log(`   - ${varName}`, 'red');
    });
    return false;
  }
  
  log(`✅ ${appName} environment variables are set`, 'green');
  return true;
}

function main() {
  log('🚀 Alice Suite Environment Check', 'cyan');
  log('================================', 'cyan');
  
  const apps = ['alice-reader', 'alice-consultant-dashboard'];
  let allGood = true;
  
  apps.forEach(appName => {
    if (!checkEnvFile(appName)) {
      allGood = false;
    }
  });
  
  if (allGood) {
    log('\n🎉 All environment variables are properly configured!', 'green');
    log('You can now run: npm run dev:all', 'green');
  } else {
    log('\n❌ Environment check failed. Please fix the issues above.', 'red');
    process.exit(1);
  }
}

// Run the check
main(); 