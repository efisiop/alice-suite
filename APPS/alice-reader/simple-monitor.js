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

async function simpleMonitor() {
  console.log('🔍 SIMPLE DASHBOARD MONITOR');
  console.log('===========================');
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}`);
  console.log('');

  try {
    // 1. Check all consultants (simple query)
    console.log('👨‍💼 STEP 1: CHECKING CONSULTANTS');
    console.log('--------------------------------');
    const { data: consultants, error: consultantsError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, is_consultant')
      .eq('is_consultant', true);

    if (consultantsError) {
      console.error('❌ Error fetching consultants:', consultantsError);
    } else {
      console.log(`Found ${consultants.length} consultants:`);
      consultants.forEach(consultant => {
        console.log(`  ✅ ${consultant.first_name} ${consultant.last_name} (${consultant.email}) - ID: ${consultant.id}`);
      });
    }
    console.log('');

    // 2. Check all consultant assignments (simple query)
    console.log('📋 STEP 2: CHECKING CONSULTANT ASSIGNMENTS');
    console.log('------------------------------------------');
    const { data: assignments, error: assignmentsError } = await supabase
      .from('consultant_assignments')
      .select('*');

    if (assignmentsError) {
      console.error('❌ Error fetching assignments:', assignmentsError);
    } else {
      console.log(`Found ${assignments.length} assignments:`);
      assignments.forEach(assignment => {
        console.log(`  📌 Assignment ID: ${assignment.id}`);
        console.log(`     Consultant ID: ${assignment.consultant_id}`);
        console.log(`     User ID: ${assignment.user_id}`);
        console.log(`     Book ID: ${assignment.book_id}`);
        console.log(`     Assigned: ${assignment.assigned_at}`);
        console.log('');
      });
    }
    console.log('');

    // 3. Check all help requests (simple query)
    console.log('❓ STEP 3: CHECKING HELP REQUESTS');
    console.log('--------------------------------');
    const { data: helpRequests, error: helpRequestsError } = await supabase
      .from('help_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (helpRequestsError) {
      console.error('❌ Error fetching help requests:', helpRequestsError);
    } else {
      console.log(`Found ${helpRequests.length} help requests:`);
      helpRequests.forEach(request => {
        console.log(`  🆘 Help Request ID: ${request.id}`);
        console.log(`     User ID: ${request.user_id}`);
        console.log(`     Status: ${request.status}`);
        console.log(`     Content: ${request.content?.substring(0, 50)}...`);
        console.log(`     Created: ${request.created_at}`);
        console.log('');
      });
    }
    console.log('');

    // 4. Check all user feedback (simple query)
    console.log('💬 STEP 4: CHECKING USER FEEDBACK');
    console.log('--------------------------------');
    const { data: feedback, error: feedbackError } = await supabase
      .from('user_feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (feedbackError) {
      console.error('❌ Error fetching feedback:', feedbackError);
    } else {
      console.log(`Found ${feedback.length} feedback entries:`);
      feedback.forEach(fb => {
        console.log(`  💭 Feedback ID: ${fb.id}`);
        console.log(`     User ID: ${fb.user_id}`);
        console.log(`     Type: ${fb.feedback_type}`);
        console.log(`     Rating: ${fb.rating}`);
        console.log(`     Content: ${fb.content?.substring(0, 50)}...`);
        console.log(`     Created: ${fb.created_at}`);
        console.log('');
      });
    }
    console.log('');

    // 5. Get some sample profiles to see what users exist
    console.log('👥 STEP 5: CHECKING SAMPLE PROFILES');
    console.log('-----------------------------------');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, is_consultant')
      .limit(5);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log(`Found ${profiles.length} sample profiles:`);
      profiles.forEach(profile => {
        console.log(`  👤 ${profile.first_name} ${profile.last_name} (${profile.email}) - Consultant: ${profile.is_consultant}`);
      });
    }
    console.log('');

    // 6. Test dashboard stats for the consultant
    if (consultants && consultants.length > 0) {
      const consultant = consultants[0];
      console.log(`📊 STEP 6: TESTING DASHBOARD STATS FOR ${consultant.first_name}`);
      console.log('------------------------------------------------------------');
      
      const { data: stats, error: statsError } = await supabase
        .rpc('get_consultant_dashboard_stats', { p_consultant_id: consultant.id });

      if (statsError) {
        console.error(`  ❌ Error getting stats:`, statsError);
      } else {
        console.log(`  📈 Dashboard Stats:`);
        console.log(`     Total Readers: ${stats.totalReaders}`);
        console.log(`     Active Readers: ${stats.activeReaders}`);
        console.log(`     Pending Help Requests: ${stats.pendingHelpRequests}`);
        console.log(`     Resolved Help Requests: ${stats.resolvedHelpRequests}`);
        console.log(`     Feedback Count: ${stats.feedbackCount}`);
        console.log(`     Prompts Sent: ${stats.promptsSent}`);
        console.log(`     Recent Activity: ${stats.recentActivity?.length || 0} items`);
        console.log(`     Top Books: ${stats.topBooks?.length || 0} books`);
      }
      console.log('');
    }

    console.log('🎯 SIMPLE MONITORING COMPLETE');
    console.log('=============================');
    console.log('💡 Next steps:');
    console.log('   1. If no assignments exist, we need to create one');
    console.log('   2. If no help requests/feedback exist, we need to create test data');
    console.log('   3. The dashboard should show the same numbers as above');

  } catch (error) {
    console.error('❌ Monitoring failed:', error);
  }
}

simpleMonitor(); 