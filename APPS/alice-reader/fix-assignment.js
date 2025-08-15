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

async function fixAssignment() {
  console.log('🔧 FIXING CONSULTANT ASSIGNMENT');
  console.log('================================');
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}`);
  console.log('');

  try {
    // 1. Get the correct consultant (Efisio)
    console.log('👨‍💼 STEP 1: GETTING CORRECT CONSULTANT');
    console.log('----------------------------------------');
    const { data: consultants, error: consultantsError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, is_consultant')
      .eq('is_consultant', true);

    if (consultantsError) {
      console.error('❌ Error fetching consultants:', consultantsError);
      return;
    }

    if (!consultants || consultants.length === 0) {
      console.error('❌ No consultants found');
      return;
    }

    const consultant = consultants[0];
    console.log(`✅ Found consultant: ${consultant.first_name} ${consultant.last_name} (${consultant.email})`);
    console.log(`   ID: ${consultant.id}`);
    console.log('');

    // 2. Get a reader to assign
    console.log('👥 STEP 2: GETTING A READER TO ASSIGN');
    console.log('--------------------------------------');
    const { data: readers, error: readersError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, is_consultant')
      .eq('is_consultant', false)
      .limit(1);

    if (readersError) {
      console.error('❌ Error fetching readers:', readersError);
      return;
    }

    if (!readers || readers.length === 0) {
      console.error('❌ No readers found');
      return;
    }

    const reader = readers[0];
    console.log(`✅ Found reader: ${reader.first_name} ${reader.last_name} (${reader.email})`);
    console.log(`   ID: ${reader.id}`);
    console.log('');

    // 3. Delete the old assignment
    console.log('🗑️  STEP 3: DELETING OLD ASSIGNMENT');
    console.log('-----------------------------------');
    const { error: deleteError } = await supabase
      .from('consultant_assignments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('❌ Error deleting old assignments:', deleteError);
    } else {
      console.log('✅ Old assignments deleted');
    }
    console.log('');

    // 4. Create new assignment
    console.log('📋 STEP 4: CREATING NEW ASSIGNMENT');
    console.log('-----------------------------------');
    const { data: newAssignment, error: assignmentError } = await supabase
      .from('consultant_assignments')
      .insert({
        consultant_id: consultant.id,
        user_id: reader.id,
        book_id: '550e8400-e29b-41d4-a716-446655440000' // Alice book
      })
      .select()
      .single();

    if (assignmentError) {
      console.error('❌ Error creating assignment:', assignmentError);
      return;
    }

    console.log('✅ New assignment created:');
    console.log(`   Assignment ID: ${newAssignment.id}`);
    console.log(`   Consultant: ${consultant.first_name} ${consultant.last_name}`);
    console.log(`   Reader: ${reader.first_name} ${reader.last_name}`);
    console.log(`   Book ID: ${newAssignment.book_id}`);
    console.log('');

    // 5. Create test help request for the correct reader
    console.log('❓ STEP 5: CREATING TEST HELP REQUEST');
    console.log('-------------------------------------');
    const { data: helpRequest, error: helpRequestError } = await supabase
      .from('help_requests')
      .insert({
        user_id: reader.id,
        content: 'Test help request for the correct assignment - I need help understanding this chapter!',
        status: 'PENDING'
      })
      .select()
      .single();

    if (helpRequestError) {
      console.error('❌ Error creating help request:', helpRequestError);
    } else {
      console.log('✅ Test help request created:');
      console.log(`   Help Request ID: ${helpRequest.id}`);
      console.log(`   User: ${reader.first_name} ${reader.last_name}`);
      console.log(`   Content: ${helpRequest.content.substring(0, 50)}...`);
      console.log('');
    }

    // 6. Create test feedback for the correct reader
    console.log('💬 STEP 6: CREATING TEST FEEDBACK');
    console.log('----------------------------------');
    const { data: feedback, error: feedbackError } = await supabase
      .from('user_feedback')
      .insert({
        user_id: reader.id,
        feedback_type: 'GENERAL',
        content: 'Test feedback for the correct assignment - The reading experience is great!',
        rating: 5
      })
      .select()
      .single();

    if (feedbackError) {
      console.error('❌ Error creating feedback:', feedbackError);
    } else {
      console.log('✅ Test feedback created:');
      console.log(`   Feedback ID: ${feedback.id}`);
      console.log(`   User: ${reader.first_name} ${reader.last_name}`);
      console.log(`   Type: ${feedback.feedback_type}`);
      console.log(`   Rating: ${feedback.rating}`);
      console.log('');
    }

    // 7. Test dashboard stats
    console.log('📊 STEP 7: TESTING DASHBOARD STATS');
    console.log('----------------------------------');
    const { data: stats, error: statsError } = await supabase
      .rpc('get_consultant_dashboard_stats', { p_consultant_id: consultant.id });

    if (statsError) {
      console.error('❌ Error getting stats:', statsError);
    } else {
      console.log('✅ Dashboard Stats:');
      console.log(`   Total Readers: ${stats.totalReaders}`);
      console.log(`   Active Readers: ${stats.activeReaders}`);
      console.log(`   Pending Help Requests: ${stats.pendingHelpRequests}`);
      console.log(`   Resolved Help Requests: ${stats.resolvedHelpRequests}`);
      console.log(`   Feedback Count: ${stats.feedbackCount}`);
      console.log(`   Prompts Sent: ${stats.promptsSent}`);
      console.log(`   Recent Activity: ${stats.recentActivity?.length || 0} items`);
      console.log(`   Top Books: ${stats.topBooks?.length || 0} books`);
    }
    console.log('');

    console.log('🎉 ASSIGNMENT FIX COMPLETE!');
    console.log('===========================');
    console.log('💡 Now test the dashboard:');
    console.log('   1. Go to http://localhost:5174');
    console.log(`   2. Login with: ${consultant.email}`);
    console.log('   3. You should now see:');
    console.log(`      - Total Readers: ${stats?.totalReaders || 0}`);
    console.log(`      - Pending Help Requests: ${stats?.pendingHelpRequests || 0}`);
    console.log(`      - Feedback Count: ${stats?.feedbackCount || 0}`);

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixAssignment(); 