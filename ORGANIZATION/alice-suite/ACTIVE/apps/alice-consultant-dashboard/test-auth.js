// Test script to verify authentication flow
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing authentication flow...');
console.log('Supabase URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
console.log('Supabase Key:', supabaseKey ? '✓ Set' : '✗ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  try {
    console.log('1. Testing connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Connection error:', error);
      return;
    }
    
    console.log('✓ Connection successful');
    
    console.log('2. Testing consultant user creation...');
    
    // Create a test consultant user
    const testEmail = 'consultant@alice.com';
    const testPassword = 'consultant123';
    
    // Try to sign in first
    console.log('3. Testing sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.log('Sign in failed:', signInError.message);
      
      // Try to sign up instead
      console.log('4. Creating consultant user...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });
      
      if (signUpError) {
        console.error('Sign up failed:', signUpError);
        return;
      }
      
      console.log('✓ User created:', signUpData.user?.id);
      
      // Create consultant profile
      if (signUpData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: signUpData.user.id,
            email: testEmail,
            first_name: 'Alice',
            last_name: 'Consultant',
            is_consultant: true,
            is_verified: true,
            book_verified: true
          });
        
        if (profileError) {
          console.error('Profile creation failed:', profileError);
          return;
        }
        
        console.log('✓ Consultant profile created');
      }
    } else {
      console.log('✓ Sign in successful:', signInData.user?.id);
      
      // Check if user has consultant profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signInData.user.id)
        .single();
      
      if (profileError) {
        console.error('Profile fetch failed:', profileError);
        return;
      }
      
      console.log('✓ Profile found:', {
        is_consultant: profile.is_consultant,
        is_verified: profile.is_verified,
        book_verified: profile.book_verified
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAuth();