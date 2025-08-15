#!/usr/bin/env node

/**
 * Create Test Consultant Account
 * Creates a simple test consultant account with known credentials
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createTestConsultant() {
  try {
    console.log('👨‍💼 Creating Test Consultant Account');
    console.log('====================================');
    
    const testEmail = 'test-consultant@example.com';
    const testPassword = 'password123';
    
    console.log(`\n1️⃣ Creating consultant account: ${testEmail}`);
    
    // Create the user account
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'Consultant',
          is_consultant: true
        }
      }
    });
    
    if (error) {
      console.log('❌ Error creating account:', error.message);
      return;
    }
    
    if (data.user) {
      console.log('✅ Account created successfully!');
      console.log(`   User ID: ${data.user.id}`);
      
      // Update the profile to mark as consultant
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_consultant: true })
        .eq('id', data.user.id);
      
      if (updateError) {
        console.log('⚠️  Warning: Could not update consultant flag:', updateError.message);
      } else {
        console.log('✅ Marked as consultant');
      }
      
      console.log('\n📋 Login Credentials:');
      console.log(`Email: ${testEmail}`);
      console.log(`Password: ${testPassword}`);
      console.log('\n🎯 You can now login to the consultant dashboard at:');
      console.log('http://localhost:5174');
      
    } else {
      console.log('❌ No user data returned');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

createTestConsultant(); 