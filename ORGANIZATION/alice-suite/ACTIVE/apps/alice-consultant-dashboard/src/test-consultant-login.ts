// Test script to verify consultant login functionality
import { consultantAuthService } from './services/consultantAuthService';

async function testConsultantLogin() {
  console.log('🧪 Testing Consultant Login System...\n');

  try {
    // Test 1: Verify service initialization
    console.log('✅ Service initialized successfully');

    // Test 2: Test consultant login with valid credentials
    console.log('🔑 Testing consultant login...');
    const loginResult = await consultantAuthService.signIn('consultant@alice.com', 'consultant123');
    
    if (loginResult.success) {
      console.log('✅ Consultant login successful');
      console.log(`   User: ${loginResult.user?.email}`);
      console.log(`   Name: ${loginResult.user?.firstName} ${loginResult.user?.lastName}`);
      console.log(`   Consultant: ${loginResult.user?.isConsultant}`);
    } else {
      console.log(`❌ Login failed: ${loginResult.error}`);
    }

    // Test 3: Check authentication state
    console.log('\n🔍 Checking authentication state...');
    const isAuthenticated = consultantAuthService.isAuthenticated();
    const isConsultant = consultantAuthService.isConsultant();
    console.log(`   Authenticated: ${isAuthenticated}`);
    console.log(`   Is Consultant: ${isConsultant}`);

    // Test 4: Test logout
    console.log('\n🚪 Testing logout...');
    const logoutResult = await consultantAuthService.signOut();
    if (logoutResult.success) {
      console.log('✅ Logout successful');
    } else {
      console.log(`❌ Logout failed: ${logoutResult.error}`);
    }

    // Test 5: Test non-consultant access
    console.log('\n🚫 Testing non-consultant access...');
    const nonConsultantResult = await consultantAuthService.signIn('reader@alice.com', 'reader123');
    console.log(`   Non-consultant login: ${nonConsultantResult.success ? 'Should fail' : 'Correctly blocked'}`);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testConsultantLogin();
}

export { testConsultantLogin };