const { RealDataService } = require('./src/services/realDataService.js');

// Test consultant ID (efisio@efisio.com)
const TEST_CONSULTANT_ID = '27ce3a11-1d12-417d-b90a-d1635c7c8ec5';

(async () => {
  console.log('🔍 Verifying Real-Time Tracking Setup...');
  console.log('=====================================');
  
  try {
    const realDataService = RealDataService.getInstance();

    // Test 1: Get assigned readers
    console.log('\n1️⃣ Checking assigned readers...');
    const readers = await realDataService.getAssignedReaders(TEST_CONSULTANT_ID);
    console.log(`✅ Found ${readers.length} assigned readers`);
    
    const fausto = readers.find(r => r.first_name.toLowerCase().includes('fausto'));
    if (fausto) {
      console.log(`✅ Fausto found in assigned readers:`);
      console.log(`   - Name: ${fausto.first_name} ${fausto.last_name}`);
      console.log(`   - Status: ${fausto.status}`);
      console.log(`   - Last Update: ${fausto.updated_at}`);
      console.log(`   - Activity: ${fausto.last_active_at}`);
    } else {
      console.log('❌ Fausto not found in assigned readers');
    }

    // Test 2: Get recent interactions
    console.log('\n2️⃣ Checking recent interactions...');
    const interactions = await realDataService.getReaderInteractions(TEST_CONSULTANT_ID);
    console.log(`✅ Found ${interactions.length} interactions`);
    
    const faustoInteractions = interactions.filter(i => 
      i.user_name && i.user_name.toLowerCase().includes('fausto')
    );
    console.log(`✅ Fausto interactions: ${faustoInteractions.length}`);
    
    if (faustoInteractions.length > 0) {
      console.log('   Recent Fausto activities:');
      faustoInteractions.slice(0, 3).forEach((interaction, index) => {
        console.log(`   ${index + 1}. ${interaction.interaction_type} - ${interaction.created_at}`);
      });
    }

    // Test 3: Dashboard data summary
    console.log('\n3️⃣ Dashboard summary...');
    const dashboardData = await realDataService.getDashboardData(TEST_CONSULTANT_ID);
    console.log(`✅ Analytics:`);
    console.log(`   - Total Readers: ${dashboardData.analytics.totalReaders}`);
    console.log(`   - Active Readers: ${dashboardData.analytics.activeReaders}`);
    console.log(`   - Help Requests: ${dashboardData.analytics.pendingHelpRequests}`);
    console.log(`   - Recent Feedback: ${dashboardData.analytics.recentFeedback}`);

    console.log('\n🎉 Tracking Verification Complete!');
    console.log('\n📋 What should happen now:');
    console.log('1. Open Consultant Dashboard: http://localhost:5174');
    console.log('2. Toggle to "Real Database" mode');
    console.log('3. Fausto should appear as "active"');
    console.log('4. His login activity should be visible');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
})();

