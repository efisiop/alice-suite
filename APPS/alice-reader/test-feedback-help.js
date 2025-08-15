// Test Feedback and Help Request Functionality
// This script tests the feedback and help request submission

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

// Correct UUIDs
const ALICE_BOOK_UUID = '550e8400-e29b-41d4-a716-446655440000';
const TEST_READER_ID = 'b743d46e-5eea-4b97-b20d-fdec8ea9a36e'; // reader@test.com
const TEST_CONSULTANT_ID = '326b4447-6abc-4838-898d-9b39550b3575'; // consultant@test.com

async function testFeedbackAndHelp() {
  try {
    console.log('🧪 Testing Feedback and Help Request Functionality...');
    console.log('==================================================');
    
    // Test 1: Check if tables exist
    console.log('\n1️⃣ Checking if required tables exist...');
    
    const tables = ['user_feedback', 'help_requests', 'consultant_assignments', 'interactions'];
    
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
    
    // Test 2: Check if function exists
    console.log('\n2️⃣ Checking if stats function exists...');
    try {
      const { data, error } = await supabase.rpc('get_consultant_dashboard_stats', { 
        p_consultant_id: '11111111-1111-1111-1111-111111111111' 
      });
      
      if (error) {
        console.log(`❌ Stats function: ${error.message}`);
      } else {
        console.log(`✅ Stats function: Working`);
        console.log(`   Result:`, data);
      }
    } catch (err) {
      console.log(`❌ Stats function: ${err.message}`);
    }
    
    // Test 3: Check existing data
    console.log('\n3️⃣ Checking existing data...');
    
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
    
    const { data: assignments, error: assignmentError } = await supabase
      .from('consultant_assignments')
      .select('*')
      .limit(5);
    
    if (assignmentError) {
      console.log(`❌ Assignments: ${assignmentError.message}`);
    } else {
      console.log(`✅ Assignments: ${assignments?.length || 0} records found`);
    }
    
    // Test 4: Test inserting new feedback
    console.log('\n4️⃣ Testing feedback insertion...');
    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: TEST_READER_ID,
          book_id: ALICE_BOOK_UUID,
          feedback_type: 'TEST_FEEDBACK',
          content: 'This is a test feedback from the script!',
          is_public: true
        })
        .select()
        .single();
      
      if (error) {
        console.log(`❌ Feedback insertion: ${error.message}`);
      } else {
        console.log(`✅ Feedback insertion: Success`);
        console.log(`   ID: ${data.id}`);
      }
    } catch (err) {
      console.log(`❌ Feedback insertion: ${err.message}`);
    }
    
    // Test 5: Test inserting new help request
    console.log('\n5️⃣ Testing help request insertion...');
    try {
      const { data, error } = await supabase
        .from('help_requests')
        .insert({
          user_id: TEST_READER_ID,
          book_id: ALICE_BOOK_UUID,
          content: 'This is a test help request from the script!',
          status: 'PENDING'
        })
        .select()
        .single();
      
      if (error) {
        console.log(`❌ Help request insertion: ${error.message}`);
      } else {
        console.log(`✅ Help request insertion: Success`);
        console.log(`   ID: ${data.id}`);
      }
    } catch (err) {
      console.log(`❌ Help request insertion: ${err.message}`);
    }
    
    console.log('\n🎉 Testing completed!');
    console.log('\n📋 Summary:');
    console.log('- If all tests passed, the database is ready');
    console.log('- You can now test feedback/help submission in the apps');
    console.log('- The consultant dashboard should show data');
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testFeedbackAndHelp(); 