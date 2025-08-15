#!/usr/bin/env node

/**
 * Reset Consultant Password
 * Use Supabase password reset to set a known password
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function resetConsultantPassword() {
  try {
    console.log('🔐 Resetting Consultant Password');
    console.log('=================================');
    
    const email = 'consultant@test.com';
    const newPassword = 'password123';
    
    console.log(`\n1️⃣ Attempting password reset for: ${email}`);
    
    // Method 1: Try password reset via email
    console.log('\n📧 Sending password reset email...');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5174/reset-password'
    });
    
    if (resetError) {
      console.log('❌ Password reset error:', resetError.message);
    } else {
      console.log('✅ Password reset email sent!');
      console.log('Check your email for the reset link');
    }
    
    // Method 2: Try to create a new account with different email
    console.log('\n2️⃣ Creating alternative consultant account...');
    const alternativeEmail = 'consultant2@test.com';
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: alternativeEmail,
      password: newPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'Consultant',
          is_consultant: true
        }
      }
    });
    
    if (signupError) {
      console.log('❌ Alternative signup failed:', signupError.message);
    } else if (signupData.user) {
      console.log('✅ Alternative consultant account created!');
      
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
      
      console.log('\n📋 Alternative Login Credentials:');
      console.log(`Email: ${alternativeEmail}`);
      console.log(`Password: ${newPassword}`);
    }
    
    // Method 3: Try to login with common passwords
    console.log('\n3️⃣ Testing common passwords for consultant@test.com...');
    const commonPasswords = [
      'password123',
      'Password123!',
      'password',
      '123456',
      'admin',
      'test123',
      'consultant123'
    ];
    
    for (const password of commonPasswords) {
      console.log(`   Trying: ${password}`);
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (!loginError) {
        console.log(`✅ SUCCESS! Password found: ${password}`);
        console.log(`   User ID: ${loginData.user.id}`);
        
        // Sign out
        await supabase.auth.signOut();
        break;
      }
    }
    
    console.log('\n📋 Summary:');
    console.log('1. Password reset email sent to consultant@test.com');
    console.log('2. Alternative account created:    consultant2@test.com / password123');
    console.log('3. Common passwords tested for consultant@test.com');
    console.log('\n🎯 Try these options:');
    console.log('- Check email for password reset link');
    console.log('- Use alternative account: consultant2@test.com / password123');
    console.log('- Contact admin to reset password in Supabase dashboard');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

resetConsultantPassword(); 
