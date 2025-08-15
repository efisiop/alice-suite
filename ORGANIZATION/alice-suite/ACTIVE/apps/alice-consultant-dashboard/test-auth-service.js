// Test the auth service directly using the shared client
require('dotenv').config();

// Import the shared auth client directly
const { authClient } = require('./node_modules/@alice-suite/api-client/dist/index.js');

async function testAuthService() {
  console.log('Testing auth service...');
  
  try {
    console.log('1. Testing authClient.signIn directly...');
    
    // Test with the fixed parameter structure
    const result = await authClient.signIn({
      email: 'consultant@alice.com',
      password: 'consultant123'
    });
    
    if (result.error) {
      console.error('Auth client error:', result.error);
      return;
    }
    
    console.log('✓ Auth client signIn successful');
    console.log('User:', result.user);
    
  } catch (error) {
    console.error('Auth service test failed:', error);
    console.error('Error details:', error.message);
  }
}

testAuthService();