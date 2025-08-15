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

async function monitorDashboard() {
  console.log('🔍 ALICE SUITE DASHBOARD MONITOR');
  console.log('================================');
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}`);
  console.log('');

  try {
    // 1. Check all consultants
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
        console.log(`  ✅ ${consultant.first_name} ${consultant.last_name} (${consultant.email})`);
      });
    }
    console.log('');

    // 2. Check all consultant assignments
    console.log('📋 STEP 2: CHECKING CONSULTANT ASSIGNMENTS');
    console.log('------------------------------------------');
    const { data: assignments, error: assignmentsError } = await supabase
      .from('consultant_assignments')
      .select(`
        id,
        consultant_id,
        user_id,
        book_id,
        assigned_at,
        profiles!consultant_assignments_consultant_id_fkey(first_name, last_name, email),
        profiles!consultant_assignments_user_id_fkey(first_name, last_name, email)
      `);

    if (assignmentsError) {
      console.error('❌ Error fetching assignments:', assignmentsError);
    } else {
      console.log(`Found ${assignments.length} assignments:`);
      assignments.forEach(assignment => {
        const consultant = assignment.profiles;
        const reader = assignment.profiles;
        console.log(`  📌 Assignment ID: ${assignment.id}`);
        console.log(`     Consultant: ${consultant?.first_name} ${consultant?.last_name} (${consultant?.email})`);
        console.log(`     Reader: ${reader?.first_name} ${reader?.last_name} (${reader?.email})`);
        console.log(`     Book ID: ${assignment.book_id}`);
        console.log(`     Assigned: ${assignment.assigned_at}`);
        console.log('');
      });
    }
    console.log('');

    // 3. Check all help requests
    console.log('❓ STEP 3: CHECKING HELP REQUESTS');
    console.log('--------------------------------');
    const { data: helpRequests, error: helpRequestsError } = await supabase
      .from('help_requests')
      .select(`
        id,
        user_id,
        content,
        status,
        created_at,
        profiles(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (helpRequestsError) {
      console.error('❌ Error fetching help requests:', helpRequestsError);
    } else {
      console.log(`Found ${helpRequests.length} help requests:`);
      helpRequests.forEach(request => {
        const user = request.profiles;
        console.log(`  🆘 Help Request ID: ${request.id}`);
        console.log(`     User: ${user?.first_name} ${user?.last_name} (${user?.email})`);
        console.log(`     Status: ${request.status}`);
        console.log(`     Content: ${request.content?.substring(0, 50)}...`);
        console.log(`     Created: ${request.created_at}`);
        console.log('');
      });
    }
    console.log('');

    // 4. Check all user feedback
    console.log('💬 STEP 4: CHECKING USER FEEDBACK');
    console.log('--------------------------------');
    const { data: feedback, error: feedbackError } = await supabase
      .from('user_feedback')
      .select(`
        id,
        user_id,
        feedback_type,
        content,
        rating,
        created_at,
        profiles(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (feedbackError) {
      console.error('❌ Error fetching feedback:', feedbackError);
    } else {
      console.log(`Found ${feedback.length} feedback entries:`);
      feedback.forEach(fb => {
        const user = fb.profiles;
        console.log(`  💭 Feedback ID: ${fb.id}`);
        console.log(`     User: ${user?.first_name} ${user?.last_name} (${user?.email})`);
        console.log(`     Type: ${fb.feedback_type}`);
        console.log(`     Rating: ${fb.rating}`);
        console.log(`     Content: ${fb.content?.substring(0, 50)}...`);
        console.log(`     Created: ${fb.created_at}`);
        console.log('');
      });
    }
    console.log('');

    // 5. Test dashboard stats for each consultant
    console.log('📊 STEP 5: TESTING DASHBOARD STATS');
    console.log('----------------------------------');
    
    if (consultants && consultants.length > 0) {
      for (const consultant of consultants) {
        console.log(`Testing dashboard stats for: ${consultant.first_name} ${consultant.last_name}`);
        
        const { data: stats, error: statsError } = await supabase
          .rpc('get_consultant_dashboard_stats', { p_consultant_id: consultant.id });

        if (statsError) {
          console.error(`  ❌ Error getting stats for ${consultant.email}:`, statsError);
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
    } else {
      console.log('⚠️  No consultants found to test dashboard stats');
    }

    // 6. Test consultant readers function
    console.log('👥 STEP 6: TESTING CONSULTANT READERS');
    console.log('-------------------------------------');
    
    if (consultants && consultants.length > 0) {
      for (const consultant of consultants) {
        console.log(`Testing readers for: ${consultant.first_name} ${consultant.last_name}`);
        
        const { data: readers, error: readersError } = await supabase
          .rpc('get_consultant_readers', { p_consultant_id: consultant.id });

        if (readersError) {
          console.error(`  ❌ Error getting readers for ${consultant.email}:`, readersError);
        } else {
          console.log(`  👥 Assigned Readers: ${readers?.length || 0}`);
          if (readers && readers.length > 0) {
            readers.forEach(reader => {
              console.log(`     - ${reader.full_name} (${reader.email}) - Book: ${reader.book_title}`);
            });
          }
        }
        console.log('');
      }
    }

    console.log('🎯 MONITORING COMPLETE');
    console.log('======================');
    console.log('💡 What to check in the dashboard:');
    console.log('   1. Go to http://localhost:5174');
    console.log('   2. Login with consultant credentials');
    console.log('   3. Compare the numbers above with what you see');

  } catch (error) {
    console.error('❌ Monitoring failed:', error);
  }
}

monitorDashboard(); 