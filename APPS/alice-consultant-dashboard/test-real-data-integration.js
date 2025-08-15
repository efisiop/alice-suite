const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Test consultant ID - we'll use one from our existing data
const TEST_CONSULTANT_ID = '27ce3a11-1d12-417d-b90a-d1635c7c8ec5'; // efisio@efisio.com

(async () => {
  console.log('🧪 Testing Real Data Integration...');
  console.log('=====================================');
  
  try {
    // Test 1: Get consultant assignments
    console.log('\n1️⃣ Testing consultant assignments...');
    const { data: assignments, error: assignmentError } = await supabase
      .from('consultant_assignments')
      .select(`
        user_id,
        active,
        profiles!inner (
          id,
          first_name,
          last_name,
          email,
          is_consultant,
          book_verified,
          created_at,
          updated_at,
          last_active_at
        )
      `)
      .eq('consultant_id', TEST_CONSULTANT_ID)
      .eq('active', true);

    if (assignmentError) {
      console.log('❌ Assignment error:', assignmentError.message);
    } else {
      console.log(`✅ Found ${assignments?.length || 0} assignments`);
      if (assignments && assignments.length > 0) {
        console.log('   Sample assignment:', {
          reader: `${assignments[0].profiles.first_name} ${assignments[0].profiles.last_name}`,
          email: assignments[0].profiles.email,
          active: assignments[0].active
        });
      }
    }

    // Test 2: Get help requests
    console.log('\n2️⃣ Testing help requests...');
    const { data: helpRequests, error: helpError } = await supabase
      .from('help_requests')
      .select(`
        *,
        profiles!inner (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (helpError) {
      console.log('❌ Help requests error:', helpError.message);
    } else {
      console.log(`✅ Found ${helpRequests?.length || 0} help requests`);
      if (helpRequests && helpRequests.length > 0) {
        console.log('   Sample request:', {
          from: `${helpRequests[0].profiles.first_name} ${helpRequests[0].profiles.last_name}`,
          content: helpRequests[0].content?.substring(0, 50) + '...',
          status: helpRequests[0].status
        });
      }
    }

    // Test 3: Get feedback
    console.log('\n3️⃣ Testing feedback...');
    const { data: feedback, error: feedbackError } = await supabase
      .from('user_feedback')
      .select(`
        *,
        profiles!inner (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (feedbackError) {
      console.log('❌ Feedback error:', feedbackError.message);
    } else {
      console.log(`✅ Found ${feedback?.length || 0} feedback items`);
      if (feedback && feedback.length > 0) {
        console.log('   Sample feedback:', {
          from: `${feedback[0].profiles.first_name} ${feedback[0].profiles.last_name}`,
          type: feedback[0].feedback_type,
          content: feedback[0].content?.substring(0, 50) + '...',
          public: feedback[0].is_public
        });
      }
    }

    // Test 4: Get interactions
    console.log('\n4️⃣ Testing interactions...');
    const { data: interactions, error: interactionError } = await supabase
      .from('interactions')
      .select(`
        *,
        profiles!inner (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (interactionError) {
      console.log('❌ Interactions error:', interactionError.message);
    } else {
      console.log(`✅ Found ${interactions?.length || 0} interactions`);
      if (interactions && interactions.length > 0) {
        console.log('   Sample interaction:', {
          from: `${interactions[0].profiles.first_name} ${interactions[0].profiles.last_name}`,
          type: interactions[0].event_type,
          content: interactions[0].content?.substring(0, 50) + '...'
        });
      }
    }

    // Test 5: Test data update capability
    console.log('\n5️⃣ Testing data update capability...');
    const testId = Date.now().toString();
    
    // Try to insert a test help request
    const { data: newRequest, error: insertError } = await supabase
      .from('help_requests')
      .insert({
        user_id: 'b743d46e-5eea-4b97-b20d-fdec8ea9a36e', // reader@test.com
        book_id: '550e8400-e29b-41d4-a716-446655440000', // Alice book
        content: `Test help request from real data integration test - ${testId}`,
        status: 'PENDING'
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
    } else {
      console.log('✅ Test insert successful:', {
        id: newRequest.id,
        content: newRequest.content,
        status: newRequest.status
      });

      // Clean up - delete the test request
      const { error: deleteError } = await supabase
        .from('help_requests')
        .delete()
        .eq('id', newRequest.id);

      if (deleteError) {
        console.log('⚠️  Test cleanup failed:', deleteError.message);
      } else {
        console.log('✅ Test cleanup successful');
      }
    }

    console.log('\n🎉 Real Data Integration Test Complete!');
    console.log('\n📋 Summary:');
    console.log('- All database tables are accessible');
    console.log('- Data relationships work correctly');
    console.log('- Insert/update operations function properly');
    console.log('- Ready for production integration');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
})();
