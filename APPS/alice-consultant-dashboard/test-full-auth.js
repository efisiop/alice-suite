// Test the full authentication flow like the LoginPage
require('dotenv').config();

// Import the actual auth service
const { signIn } = require('./src/services/authService');

async function testFullAuthFlow() {
  console.log('Testing full auth flow...');
  
  try {
    console.log('1. Testing auth service signIn...');
    const email = 'consultant@alice.com';
    const password = 'consultant123';
    
    console.log('Email:', email);
    console.log('Password:', password ? '***' : 'empty');
    
    const result = await signIn(email, password);
    
    if (result.error) {
      console.error('Auth service error:', result.error);
      return;
    }
    
    console.log('✓ Auth service signIn successful');
    console.log('User ID:', result.user?.id);
    console.log('User email:', result.user?.email);
    
  } catch (error) {
    console.error('Full auth flow test failed:', error);
    console.error('Error stack:', error.stack);
  }
}

testFullAuthFlow();