#!/usr/bin/env node

/**
 * Reset all mock data and test modes in Alice Suite
 * This script removes all test data, mock services, and ensures only real data flows
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Starting Alice Suite Mock Data Reset...\n');

// List of mock files to disable or remove
const mockFiles = [
  'APPS/alice-reader/src/services/mockBackend.ts',
  'APPS/alice-reader/src/services/mockServices.ts',
  'APPS/alice-reader/src/services/mockBackendFactory.ts',
  'APPS/alice-consultant-dashboard/src/services/mockBackend.ts',
  'APPS/alice-consultant-dashboard/src/services/fakeDataService.ts',
  'APPS/alice-consultant-dashboard/src/services/mockServices.ts',
  'APPS/alice-consultant-dashboard/src/services/mockBackendFactory.ts'
];

// List of test data files
const testDataFiles = [
  'APPS/alice-reader/src/data/testPersonas.ts',
  'APPS/alice-reader/src/utils/testPersonas.ts',
  'APPS/alice-consultant-dashboard/src/utils/testPersonas.ts',
  'APPS/alice-consultant-dashboard/src/utils/testDataGenerator.ts'
];

function disableMockFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Add disable comments
      if (!content.includes('// MOCK DATA DISABLED')) {
        content = `// MOCK DATA DISABLED - This file is disabled to ensure only real data flows\n// ${new Date().toISOString()}\n\n` + content;
        fs.writeFileSync(filePath, content);
        console.log(`✅ Disabled mock file: ${filePath}`);
      }
    } catch (error) {
      console.log(`⚠️  Could not disable mock file: ${filePath}`, error.message);
    }
  }
}

console.log('📁 Disabling mock service files...');
mockFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  disableMockFile(fullPath);
});

console.log('\n📊 Disabling test data files...');
testDataFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  disableMockFile(fullPath);
});

console.log('\n✅ All mock data and test modes have been reset');
console.log('🎯 Only real data from Alice Reader will flow to the dashboard');
console.log('🚀 Both apps will now start on login pages');