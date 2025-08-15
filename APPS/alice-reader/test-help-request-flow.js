import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testHelpRequestFlow() {
  console.log('🎯 TESTING HELP REQUEST FLOW');
  console.log('============================');
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}`);
  console.log('');

  try {
    // 1. Get the reader (Fausto)
    console.log('👥 STEP 1: GETTING READER');
    console.log('----------------------------');
    const { data: readers, error: readersError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('email', 'fausto@fausto.com')
      .limit(1);

    if (readersError) {
      console.error('❌ Error fetching reader:', readersError);
      return;
    }

    if (!readers || readers.length === 0) {
      console.error('❌ Reader not found');
      return;
    }

    const reader = readers[0];
    console.log(`✅ Found reader: ${reader.first_name} ${reader.last_name} (${reader.email})`);
    console.log(`   ID: ${reader.id}`);
    console.log('');

    // 2. Create a new help request (simulating the reader app)
    console.log('❓ STEP 2: CREATING HELP REQUEST');
    console.log('--------------------------------');
    const { data: helpRequest, error: helpRequestError } = await supabase
      .from('help_requests')
      .insert({
        user_id: reader.id,
        book_id: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Test help request from reader app - I need help understanding this chapter!',
        status: 'PENDING'
      })
      .select()
      .single();

    if (helpRequestError) {
      console.error('❌ Error creating help request:', helpRequestError);
      return;
    }

    console.log('✅ Help request created:');
    console.log(`   ID: ${helpRequest.id}`);
    console.log(`   User: ${reader.first_name} ${reader.last_name}`);
    console.log(`   Content: ${helpRequest.content.substring(0, 50)}...`);
    console.log(`   Status: ${helpRequest.status}`);
    console.log('');

    // 3. Create feedback (simulating user interaction)
    console.log('💬 STEP 3: CREATING FEEDBACK');
    console.log('-----------------------------');
    const { data: feedback, error: feedbackError } = await supabase
      .from('user_feedback')
      .insert({
        user_id: reader.id,
        book_id: '550e8400-e29b-41d4-a716-446655440000',
        feedback_type: 'WORD_LOOKUP',
        content: 'The word lookup feature is very helpful for understanding difficult words!'
      })
      .select()
      .single();

    if (feedbackError) {
      console.error('❌ Error creating feedback:', feedbackError);
      return;
    }

    console.log('✅ Feedback created:');
    console.log(`   ID: ${feedback.id}`);
    console.log(`   User: ${reader.first_name} ${reader.last_name}`);
    console.log(`   Type: ${feedback.feedback_type}`);
    console.log(`   Content: ${feedback.content.substring(0, 50)}...`);
    console.log('');

    // 4. Test the dashboard function
    console.log('📊 STEP 4: TESTING DASHBOARD FUNCTION');
    console.log('--------------------------------------');
    
    // Get the consultant (Efisio)
    const { data: consultants, error: consultantsError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('email', 'efisio@efisio.com')
      .limit(1);

    if (consultantsError) {
      console.error('❌ Error fetching consultant:', consultantsError);
      return;
    }

    if (!consultants || consultants.length === 0) {
      console.error('❌ Consultant not found');
      return;
    }

    const consultant = consultants[0];
    console.log(`✅ Found consultant: ${consultant.first_name} ${consultant.last_name} (${consultant.email})`);
    console.log(`   ID: ${consultant.id}`);
    console.log('');

    // Test the dashboard stats function
    const { data: stats, error: statsError } = await supabase
      .rpc('get_consultant_dashboard_stats', { p_consultant_id: consultant.id });

    if (statsError) {
      console.error('❌ Error getting dashboard stats:', statsError);
      return;
    }

    console.log('📈 Dashboard Stats:');
    console.log(`   Total Readers: ${stats.totalReaders}`);
    console.log(`   Active Readers: ${stats.activeReaders}`);
    console.log(`   Pending Help Requests: ${stats.pendingHelpRequests}`);
    console.log(`   Resolved Help Requests: ${stats.resolvedHelpRequests}`);
    console.log(`   Feedback Count: ${stats.feedbackCount}`);
    console.log(`   Prompts Sent: ${stats.promptsSent}`);
    console.log(`   Recent Activity: ${stats.recentActivity?.length || 0} items`);
    console.log(`   Top Books: ${stats.topBooks?.length || 0} books`);
    console.log('');

    // 5. Summary
    console.log('🎯 HELP REQUEST FLOW TEST COMPLETE');
    console.log('==================================');
    console.log('✅ What should happen:');
    console.log('   1. Help request created successfully');
    console.log('   2. Feedback created successfully');
    console.log('   3. Dashboard should show:');
    console.log(`      - Total Readers: ${stats.totalReaders}`);
    console.log(`      - Pending Help Requests: ${stats.pendingHelpRequests}`);
    console.log(`      - Feedback Count: ${stats.feedbackCount}`);
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Go to http://localhost:5174 (Consultant Dashboard)');
    console.log('   2. Login with: efisio@efisio.com');
    console.log('   3. You should see the same numbers as above');
    console.log('');
    console.log('🔧 If dashboard shows different numbers:');
    console.log('   1. Apply the SQL fix to update the dashboard function');
    console.log('   2. Refresh the dashboard page');
    console.log('   3. Check browser console for errors');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testHelpRequestFlow(); 