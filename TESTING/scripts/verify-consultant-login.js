#!/usr/bin/env node

/**
 * Verify Consultant Login
 * Checks existing consultant accounts and creates a working one
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verifyConsultantLogin() {
  try {
    console.log('🔍 Verifying Consultant Login');
    console.log('=============================');
    
    // Check existing consultant accounts
    console.log('\n1️⃣ Checking existing consultant accounts...');
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, is_consultant')
      .eq('is_consultant', true);
    
    if (error) {
      console.log('❌ Error checking profiles:', error.message);
      return;
    }
    
    console.log(`Found ${profiles?.length || 0} consultant accounts:`);
    if (profiles && profiles.length > 0) {
      profiles.forEach(p => {
        console.log(`  - ${p.email} (${p.first_name} ${p.last_name})`);
      });
    } else {
      console.log('  No consultant accounts found');
    }
    
    // Try to login with consultant@test.com
    console.log('\n2️⃣ Testing login with consultant@test.com...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'consultant@test.com',
      password: 'password123'
    });
    
    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
      
      // Try to create a new consultant account
      console.log('\n3️⃣ Creating new consultant account...');
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: 'consultant@test.com',
        password: 'password123',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'Consultant',
            is_consultant: true
          }
        }
      });
      
      if (signupError) {
        console.log('❌ Signup failed:', signupError.message);
      } else if (signupData.user) {
        console.log('✅ Created consultant account');
        
        // Update profile to mark as consultant
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_consultant: true })
          .eq('id', signupData.user.id);
        
        if (updateError) {
          console.log('⚠️  Warning: Could not update consultant flag:', updateError.message);
        } else {
          console.log('✅ Marked as consultant');
        }
      }
    } else {
      console.log('✅ Login successful!');
      console.log(`   User ID: ${loginData.user.id}`);
    }
    
    // Test the dashboard stats
    console.log('\n4️⃣ Testing dashboard access...');
    const { data: stats, error: statsError } = await supabase.rpc('get_consultant_dashboard_stats', { 
      p_consultant_id: '326b4447-6abc-4838-898d-9b39550b3575' // consultant@test.com ID
    });
    
    if (statsError) {
      console.log('❌ Dashboard stats error:', statsError.message);
    } else {
      console.log('✅ Dashboard stats accessible:', stats);
    }
    
    console.log('\n📋 Working Login Credentials:');
    console.log('Email: consultant@test.com');
    console.log('Password: password123');
    console.log('URL: http://localhost:5174');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

verifyConsultantLogin(); 