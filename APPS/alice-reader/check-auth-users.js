// Check Auth Users
// This script checks what auth users exist and their IDs

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuthUsers() {
  try {
    console.log('🔍 Checking Auth Users...');
    console.log('========================');
    
    // Get all auth users
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log('❌ Error getting auth users:', error.message);
      return;
    }
    
    console.log(`✅ Found ${users.users.length} auth users:`);
    
    users.users.forEach((user, index) => {
      console.log(`\n${index + 1}. User ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Last Sign In: ${user.last_sign_in_at || 'Never'}`);
    });
    
    // Check profiles table
    console.log('\n📋 Checking profiles table...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profileError) {
      console.log('❌ Error getting profiles:', profileError.message);
    } else {
      console.log(`✅ Found ${profiles.length} profiles:`);
      profiles.forEach((profile, index) => {
        console.log(`\n${index + 1}. Profile ID: ${profile.id}`);
        console.log(`   Name: ${profile.first_name} ${profile.last_name}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Is Consultant: ${profile.is_consultant}`);
      });
    }
    
    // Check if there are any mismatches
    const authUserIds = users.users.map(u => u.id);
    const profileIds = profiles?.map(p => p.id) || [];
    
    console.log('\n🔍 Checking for mismatches...');
    const missingProfiles = authUserIds.filter(id => !profileIds.includes(id));
    const orphanedProfiles = profileIds.filter(id => !authUserIds.includes(id));
    
    if (missingProfiles.length > 0) {
      console.log('⚠️  Auth users without profiles:', missingProfiles);
    }
    
    if (orphanedProfiles.length > 0) {
      console.log('⚠️  Profiles without auth users:', orphanedProfiles);
    }
    
    if (missingProfiles.length === 0 && orphanedProfiles.length === 0) {
      console.log('✅ All auth users have matching profiles');
    }
    
  } catch (err) {
    console.error('❌ Check failed:', err);
  }
}

checkAuthUsers();


