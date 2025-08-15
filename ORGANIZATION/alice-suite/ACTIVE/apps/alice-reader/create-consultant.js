// Create a Consultant
// This script will make an existing user a consultant

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createConsultant() {
  try {
    console.log('👨‍💼 Creating a Consultant');
    console.log('========================');
    
    // Get existing users
    console.log('\n1️⃣ Getting existing users...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);
    
    if (profileError) {
      console.log('❌ Error getting profiles:', profileError.message);
      return;
    }
    
    console.log(`Found ${profiles.length} profiles:`);
    profiles.forEach(p => {
      console.log(`  - ${p.first_name} ${p.last_name} (${p.email}) - Consultant: ${p.is_consultant}`);
    });
    
    // Find a user to make consultant (first one)
    const userToMakeConsultant = profiles[0];
    
    if (!userToMakeConsultant) {
      console.log('❌ No users found');
      return;
    }
    
    console.log(`\n2️⃣ Making ${userToMakeConsultant.first_name} ${userToMakeConsultant.last_name} a consultant...`);
    
    // Update the user to be a consultant
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_consultant: true })
      .eq('id', userToMakeConsultant.id);
    
    if (updateError) {
      console.log('❌ Error updating user:', updateError.message);
      return;
    }
    
    console.log('✅ User is now a consultant!');
    
    // Create consultant assignment with another user
    const reader = profiles.find(p => p.id !== userToMakeConsultant.id);
    
    if (reader) {
      console.log(`\n3️⃣ Creating assignment between consultant and ${reader.first_name} ${reader.last_name}...`);
      
      const { error: assignmentError } = await supabase
        .from('consultant_assignments')
        .insert({
          consultant_id: userToMakeConsultant.id,
          user_id: reader.id,
          book_id: '550e8400-e29b-41d4-a716-446655440000', // Alice book UUID
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (assignmentError) {
        console.log('⚠️  Assignment error (might already exist):', assignmentError.message);
      } else {
        console.log('✅ Consultant assignment created');
      }
    }
    
    // Test the dashboard stats
    console.log('\n4️⃣ Testing dashboard stats...');
    const { data: stats, error: statsError } = await supabase.rpc('get_consultant_dashboard_stats', { 
      p_consultant_id: userToMakeConsultant.id 
    });
    
    if (statsError) {
      console.log('❌ Stats error:', statsError.message);
    } else {
      console.log('✅ Dashboard stats:', stats);
    }
    
    console.log('\n🎉 Consultant creation completed!');
    console.log('\n📋 Login credentials for consultant dashboard:');
    console.log(`Email: ${userToMakeConsultant.email}`);
    console.log('Password: (use the password you set when registering)');
    console.log('\n📋 What to check:');
    console.log('1. Go to http://localhost:5174 (Consultant Dashboard)');
    console.log('2. Login with the consultant credentials above');
    console.log('3. You should now see data in the dashboard!');
    
  } catch (err) {
    console.error('❌ Consultant creation failed:', err);
  }
}

createConsultant();




