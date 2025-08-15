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

async function testDashboardLogin() {
  console.log('🔍 TESTING DASHBOARD LOGIN AND DATA');
  console.log('====================================');
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}`);
  console.log('');

  try {
    // 1. Get the consultant (Efisio)
    console.log('👨‍💼 STEP 1: GETTING CONSULTANT');
    console.log('--------------------------------');
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

    // 2. Test dashboard stats function directly
    console.log('📊 STEP 2: TESTING DASHBOARD STATS FUNCTION');
    console.log('--------------------------------------------');
    const { data: stats, error: statsError } = await supabase
      .rpc('get_consultant_dashboard_stats', { p_consultant_id: consultant.id });

    if (statsError) {
      console.error('❌ Error getting dashboard stats:', statsError);
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

    // 3. Test consultant readers function
    console.log('👥 STEP 3: TESTING CONSULTANT READERS FUNCTION');
    console.log('-----------------------------------------------');
    const { data: readers, error: readersError } = await supabase
      .rpc('get_consultant_readers', { p_consultant_id: consultant.id });

    if (readersError) {
      console.error('❌ Error getting consultant readers:', readersError);
    } else {
      console.log(`✅ Consultant Readers: ${readers?.length || 0}`);
      if (readers && readers.length > 0) {
        readers.forEach(reader => {
          console.log(`   - ${reader.full_name} (${reader.email}) - Book: ${reader.book_title}`);
        });
      }
    }
    console.log('');

    // 4. Test help requests for this consultant
    console.log('❓ STEP 4: TESTING HELP REQUESTS');
    console.log('--------------------------------');
    const { data: helpRequests, error: helpRequestsError } = await supabase
      .from('help_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (helpRequestsError) {
      console.error('❌ Error fetching help requests:', helpRequestsError);
    } else {
      console.log(`✅ Recent Help Requests: ${helpRequests?.length || 0}`);
      helpRequests?.forEach(request => {
        console.log(`   - ${request.content?.substring(0, 50)}... (${request.status})`);
      });
    }
    console.log('');

    // 5. Test feedback for this consultant's assigned readers
    console.log('💬 STEP 5: TESTING FEEDBACK');
    console.log('----------------------------');
    const { data: feedback, error: feedbackError } = await supabase
      .from('user_feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (feedbackError) {
      console.error('❌ Error fetching feedback:', feedbackError);
    } else {
      console.log(`✅ Recent Feedback: ${feedback?.length || 0}`);
      feedback?.forEach(fb => {
        console.log(`   - ${fb.content?.substring(0, 50)}... (${fb.feedback_type})`);
      });
    }
    console.log('');

    console.log('🎯 DASHBOARD TEST COMPLETE');
    console.log('===========================');
    console.log('💡 Login Instructions:');
    console.log('   1. Go to http://localhost:5174');
    console.log(`   2. Login with: ${consultant.email}`);
    console.log('   3. You should see the same numbers as above');
    console.log('');
    console.log('🔧 If dashboard shows "0" for everything:');
    console.log('   1. Check browser console for errors');
    console.log('   2. Verify you are logged in as the correct consultant');
    console.log('   3. Try refreshing the page');
    console.log('   4. Check if the dashboard is using the correct service');

  } catch (error) {
    console.error('❌ Dashboard test failed:', error);
  }
}

testDashboardLogin(); 