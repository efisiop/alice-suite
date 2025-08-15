// Test with direct Supabase client
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectAuth() {
  console.log('Testing direct Supabase auth...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'consultant@alice.com',
      password: 'consultant123'
    });
    
    if (error) {
      console.error('Sign in error:', error);
      return;
    }
    
    console.log('✓ Direct auth successful');
    console.log('User:', data.user.email);
    console.log('ID:', data.user.id);
    
    // Check profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    console.log('Profile:', profile);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDirectAuth();