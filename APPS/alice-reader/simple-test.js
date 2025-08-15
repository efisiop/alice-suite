// Simple Test - Check What's Working
// This script tests the current functionality without complex setup

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

async function simpleTest() {
  try {
    console.log('🧪 Simple Test - What\'s Currently Working');
    console.log('==========================================');
    
    // Test 1: Check existing tables
    console.log('\n1️⃣ Checking existing tables...');
    
    const tables = ['user_feedback', 'help_requests', 'interactions', 'profiles', 'books'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: Exists`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    
    // Test 2: Check existing data
    console.log('\n2️⃣ Checking existing data...');
    
    const { data: feedback, error: feedbackError } = await supabase
      .from('user_feedback')
      .select('*')
      .limit(5);
    
    if (feedbackError) {
      console.log(`❌ Feedback data: ${feedbackError.message}`);
    } else {
      console.log(`✅ Feedback data: ${feedback?.length || 0} records found`);
    }
    
    const { data: helpRequests, error: helpError } = await supabase
      .from('help_requests')
      .select('*')
      .limit(5);
    
    if (helpError) {
      console.log(`❌ Help requests: ${helpError.message}`);
    } else {
      console.log(`✅ Help requests: ${helpRequests?.length || 0} records found`);
    }
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profileError) {
      console.log(`❌ Profiles: ${profileError.message}`);
    } else {
      console.log(`✅ Profiles: ${profiles?.length || 0} records found`);
    }
    
    // Test 3: Test feedback insertion with existing user
    console.log('\n3️⃣ Testing feedback insertion...');
    if (profiles && profiles.length > 0) {
      const testUser = profiles[0];
      console.log(`Using existing user: ${testUser.first_name} ${testUser.last_name} (${testUser.id})`);
      
      try {
        const { data, error } = await supabase
          .from('user_feedback')
          .insert({
            user_id: testUser.id,
            book_id: '550e8400-e29b-41d4-a716-446655440000',
            feedback_type: 'TEST_FEEDBACK',
            content: 'This is a test feedback from the script!',
            is_public: true
          })
          .select()
          .single();
        
        if (error) {
          console.log(`❌ Feedback insertion: ${error.message}`);
        } else {
          console.log(`✅ Feedback insertion: Success (ID: ${data.id})`);
        }
      } catch (err) {
        console.log(`❌ Feedback insertion: ${err.message}`);
      }
    } else {
      console.log('⚠️  No existing users found for testing');
    }
    
    // Test 4: Test help request insertion
    console.log('\n4️⃣ Testing help request insertion...');
    if (profiles && profiles.length > 0) {
      const testUser = profiles[0];
      
      try {
        const { data, error } = await supabase
          .from('help_requests')
          .insert({
            user_id: testUser.id,
            book_id: '550e8400-e29b-41d4-a716-446655440000',
            content: 'This is a test help request from the script!',
            status: 'PENDING'
          })
          .select()
          .single();
        
        if (error) {
          console.log(`❌ Help request insertion: ${error.message}`);
        } else {
          console.log(`✅ Help request insertion: Success (ID: ${data.id})`);
        }
      } catch (err) {
        console.log(`❌ Help request insertion: ${err.message}`);
      }
    }
    
    console.log('\n🎉 Simple test completed!');
    console.log('\n📋 Summary:');
    console.log('- If feedback/help request insertion worked, the core functionality is ready');
    console.log('- The apps should be able to submit feedback and help requests');
    console.log('- The consultant dashboard may show limited data until assignments are set up');
    
  } catch (err) {
    console.error('❌ Simple test failed:', err);
  }
}

simpleTest(); 