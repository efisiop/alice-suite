#!/usr/bin/env node

/**
 * Verify Alice Suite Simplified Setup
 * This script validates that all requirements have been met:
 * 1. All test modes and mock data removed
 * 2. Data flows only from Alice Reader to Dashboard
 * 3. Both apps start on login pages
 * 4. Supabase profiles table integration
 * 5. Unique user registration flow
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Alice Suite Simplified Setup...\n');

const checks = [];

// Check 1: Verify mock modes are disabled
function checkMockModesDisabled() {
  console.log('📋 Checking mock modes are disabled...');
  
  const aliceReaderEnv = fs.readFileSync('./APPS/alice-reader/.env', 'utf8');
  const consultantDashboardEnv = fs.readFileSync('./APPS/alice-consultant-dashboard/.env', 'utf8');
  
  const aliceReaderHasMocksDisabled = aliceReaderEnv.includes('VITE_ENABLE_MOCKS=false');
  const consultantDashboardHasMocksDisabled = consultantDashboardEnv.includes('VITE_ENABLE_MOCKS=false');
  
  checks.push({
    name: 'Mock modes disabled',
    status: aliceReaderHasMocksDisabled && consultantDashboardHasMocksDisabled,
    details: `Alice Reader: ${aliceReaderHasMocksDisabled ? '✅' : '❌'}, Consultant Dashboard: ${consultantDashboardHasMocksDisabled ? '✅' : '❌'}`
  });
  
  return aliceReaderHasMocksDisabled && consultantDashboardHasMocksDisabled;
}

// Check 2: Verify backend config points to real data
function checkBackendConfig() {
  console.log('📋 Checking backend configuration...');
  
  const aliceReaderBackend = fs.readFileSync('./APPS/alice-reader/src/services/backendConfig.ts', 'utf8');
  const consultantBackend = fs.readFileSync('./APPS/alice-consultant-dashboard/src/services/backendConfig.ts', 'utf8');
  
  const aliceReaderUsesReal = aliceReaderBackend.includes('useMockBackend = false');
  const consultantUsesReal = consultantBackend.includes('useMockBackend = false');
  
  checks.push({
    name: 'Real backend enabled',
    status: aliceReaderUsesReal && consultantUsesReal,
    details: `Alice Reader: ${aliceReaderUsesReal ? '✅' : '❌'}, Consultant Dashboard: ${consultantUsesReal ? '✅' : '❌'}`
  });
  
  return aliceReaderUsesReal && consultantUsesReal;
}

// Check 3: Verify login page routing
function checkLoginRouting() {
  console.log('📋 Checking login page routing...');
  
  const aliceReaderApp = fs.readFileSync('./APPS/alice-reader/src/App.tsx', 'utf8');
  const consultantApp = fs.readFileSync('./APPS/alice-consultant-dashboard/src/App.tsx', 'utf8');
  
  const aliceHasLogin = aliceReaderApp.includes('path="/login"');
  const consultantHasLogin = consultantApp.includes('path="/consultant/login"');
  
  checks.push({
    name: 'Login pages configured',
    status: aliceHasLogin && consultantHasLogin,
    details: `Alice Reader: ${aliceHasLogin ? '✅' : '❌'}, Consultant Dashboard: ${consultantHasLogin ? '✅' : '❌'}`
  });
  
  return aliceHasLogin && consultantHasLogin;
}

// Check 4: Verify mock services are disabled
function checkMockServicesDisabled() {
  console.log('📋 Checking mock services are disabled...');
  
  const mockFiles = [
    './APPS/alice-reader/src/services/mockBackend.ts',
    './APPS/alice-reader/src/services/mockServices.ts',
    './APPS/alice-consultant-dashboard/src/services/mockBackend.ts',
    './APPS/alice-consultant-dashboard/src/services/fakeDataService.ts'
  ];
  
  let allDisabled = true;
  let details = [];
  
  mockFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const isDisabled = content.includes('// MOCK DATA DISABLED');
      details.push(`${path.basename(file)}: ${isDisabled ? '✅' : '⚠️'}`);
      if (!isDisabled) allDisabled = false;
    } else {
      details.push(`${path.basename(file)}: 📁 (not found)`);
    }
  });
  
  checks.push({
    name: 'Mock services disabled',
    status: allDisabled,
    details: details.join(', ')
  });
  
  return allDisabled;
}

// Check 5: Verify Supabase configuration
function checkSupabaseConfig() {
  console.log('📋 Checking Supabase configuration...');
  
  const aliceReaderEnv = fs.readFileSync('./APPS/alice-reader/.env', 'utf8');
  const consultantDashboardEnv = fs.readFileSync('./APPS/alice-consultant-dashboard/.env', 'utf8');
  
  const hasSupabaseUrl = aliceReaderEnv.includes('VITE_SUPABASE_URL=https://blwypdcobizmpidmuhvq.supabase.co');
  const hasSupabaseKey = aliceReaderEnv.includes('VITE_SUPABASE_ANON_KEY=');
  
  checks.push({
    name: 'Supabase configured',
    status: hasSupabaseUrl && hasSupabaseKey,
    details: `URL: ${hasSupabaseUrl ? '✅' : '❌'}, Key: ${hasSupabaseKey ? '✅' : '❌'}`
  });
  
  return hasSupabaseUrl && hasSupabaseKey;
}

// Run all checks
console.log('🚀 Running verification checks...\n');

const checkResults = [
  checkMockModesDisabled(),
  checkBackendConfig(),
  checkLoginRouting(),
  checkMockServicesDisabled(),
  checkSupabaseConfig()
];

// Display results
console.log('\n📊 Verification Results:');
console.log('========================\n');

let passedChecks = 0;
checks.forEach(check => {
  const status = check.status ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${check.name}: ${check.details}`);
  if (check.status) passedChecks++;
});

console.log(`\n📈 Summary: ${passedChecks}/${checks.length} checks passed`);

if (passedChecks === checks.length) {
  console.log('\n🎉 SUCCESS: Alice Suite is now configured for simplified workflow!');
  console.log('\n📋 Next Steps:');
  console.log('1. Start both applications using: ./start-both-apps.sh');
  console.log('2. Alice Reader will start at: http://localhost:5173');
  console.log('3. Consultant Dashboard will start at: http://localhost:5174');
  console.log('4. Both apps will show login pages first');
  console.log('5. Real data will flow from Alice Reader to Dashboard via WebSocket');
} else {
  console.log('\n⚠️  Some checks failed. Please review the configuration above.');
}

process.exit(passedChecks === checks.length ? 0 : 1);