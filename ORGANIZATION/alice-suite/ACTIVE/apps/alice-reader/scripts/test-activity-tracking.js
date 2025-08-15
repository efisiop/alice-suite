// Test script for activity tracking
// This script tests the activity tracking functionality

const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testActivityTracking() {
  console.log('🧪 Testing Activity Tracking Service...\n');

  try {
    // Test 1: Check if interactions table exists
    console.log('1. Checking if interactions table exists...');
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'interactions');

    if (tableError) {
      console.error('❌ Error checking table:', tableError);
      return;
    }

    if (tables && tables.length > 0) {
      console.log('✅ Interactions table exists');
    } else {
      console.log('❌ Interactions table does not exist');
      return;
    }

    // Test 2: Insert a test login event
    console.log('\n2. Testing login event insertion...');
    const testUserId = 'test-user-' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('interactions')
      .insert({
        user_id: testUserId,
        event_type: 'LOGIN',
        created_at: new Date().toISOString()
      })
      .select();

    if (insertError) {
      console.error('❌ Error inserting test event:', insertError);
      return;
    }

    console.log('✅ Test login event inserted:', insertData[0]);

    // Test 3: Query for currently logged in users
    console.log('\n3. Testing currently logged in users query...');
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    const { data: loggedInUsers, error: queryError } = await supabase
      .from('interactions')
      .select('*')
      .eq('event_type', 'LOGIN')
      .gte('created_at', thirtyMinutesAgo)
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error('❌ Error querying logged in users:', queryError);
      return;
    }

    console.log('✅ Found', loggedInUsers.length, 'login events in the last 30 minutes');
    loggedInUsers.forEach((event, index) => {
      console.log(`   ${index + 1}. User: ${event.user_id}, Time: ${event.created_at}`);
    });

    // Test 4: Clean up test data
    console.log('\n4. Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('interactions')
      .delete()
      .eq('user_id', testUserId);

    if (deleteError) {
      console.error('❌ Error cleaning up test data:', deleteError);
    } else {
      console.log('✅ Test data cleaned up');
    }

    console.log('\n🎉 All tests passed! Activity tracking is working correctly.');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testActivityTracking(); 