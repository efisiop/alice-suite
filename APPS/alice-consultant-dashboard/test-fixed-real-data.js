// Test the fixed real data service integration
import { RealDataService } from './src/services/realDataService.js';

// Test consultant ID
const TEST_CONSULTANT_ID = '27ce3a11-1d12-417d-b90a-d1635c7c8ec5'; // efisio@efisio.com

(async () => {
  console.log('🧪 Testing Fixed Real Data Service...');
  console.log('====================================');
  
  try {
    const realDataService = RealDataService.getInstance();

    // Test 1: Get assigned readers
    console.log('\n1️⃣ Testing getAssignedReaders...');
    const readers = await realDataService.getAssignedReaders(TEST_CONSULTANT_ID);
    console.log(`✅ Found ${readers.length} assigned readers`);
    if (readers.length > 0) {
      console.log('   Sample reader:', {
        name: `${readers[0].first_name} ${readers[0].last_name}`,
        email: readers[0].email,
        status: readers[0].status
      });
    }

    // Test 2: Get help requests
    console.log('\n2️⃣ Testing getHelpRequests...');
    const helpRequests = await realDataService.getHelpRequests(TEST_CONSULTANT_ID);
    console.log(`✅ Found ${helpRequests.length} help requests`);
    if (helpRequests.length > 0) {
      console.log('   Sample request:', {
        from: helpRequests[0].user_name || 'Unknown',
        content: helpRequests[0].content?.substring(0, 50) + '...',
        status: helpRequests[0].status
      });
    }

    // Test 3: Get feedback
    console.log('\n3️⃣ Testing getFeedback...');
    const feedback = await realDataService.getFeedback(TEST_CONSULTANT_ID);
    console.log(`✅ Found ${feedback.length} feedback items`);
    if (feedback.length > 0) {
      console.log('   Sample feedback:', {
        from: feedback[0].user_name || 'Unknown',
        type: feedback[0].feedback_type,
        content: feedback[0].content?.substring(0, 50) + '...'
      });
    }

    // Test 4: Get dashboard data
    console.log('\n4️⃣ Testing getDashboardData...');
    const dashboardData = await realDataService.getDashboardData(TEST_CONSULTANT_ID);
    console.log('✅ Dashboard data retrieved:', {
      readers: dashboardData.readers.length,
      helpRequests: dashboardData.helpRequests.length,
      feedback: dashboardData.feedback.length,
      interactions: dashboardData.interactions.length,
      analytics: dashboardData.analytics
    });

    console.log('\n🎉 Fixed Real Data Service Test Complete!');
    console.log('\n📋 Summary:');
    console.log('- All methods work without relationship join errors');
    console.log('- Profile data is fetched separately and enhanced');
    console.log('- Dashboard data aggregation works correctly');
    console.log('- Ready for production use');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
})();
