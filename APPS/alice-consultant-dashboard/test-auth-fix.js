// Test script to verify the auth service fix
require('dotenv').config();

const { authClient } = require('@alice-suite/api-client');

// Test the auth service directly
async function testAuthServiceFix() {
  console.log('Testing auth service fix...');
  
  try {
    // Test the shared auth client directly
    console.log('1. Testing shared auth client...');
    const result = await authClient.signIn({
      email: 'consultant@alice.com',
      password: 'consultant123'
    });
    
    if (result.error) {
      console.error('Auth client error:', result.error);
      return;
    }
    
    console.log('✓ Shared auth client working correctly');
    console.log('User:', result.user?.email);
    console.log('Role:', result.user?.role);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAuthServiceFix();