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

async function fixHelpRequests() {
  console.log('🔧 FIXING HELP REQUESTS ASSIGNMENT');
  console.log('===================================');
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

    // 2. Get unassigned help requests
    console.log('❓ STEP 2: GETTING UNASSIGNED HELP REQUESTS');
    console.log('--------------------------------------------');
    const { data: helpRequests, error: helpRequestsError } = await supabase
      .from('help_requests')
      .select('*')
      .is('assigned_to', null)
      .eq('status', 'PENDING');

    if (helpRequestsError) {
      console.error('❌ Error fetching help requests:', helpRequestsError);
      return;
    }

    console.log(`✅ Found ${helpRequests?.length || 0} unassigned help requests`);
    console.log('');

    // 3. Assign help requests to the consultant
    if (helpRequests && helpRequests.length > 0) {
      console.log('📋 STEP 3: ASSIGNING HELP REQUESTS TO CONSULTANT');
      console.log('------------------------------------------------');
      
      for (const request of helpRequests) {
        const { error: updateError } = await supabase
          .from('help_requests')
          .update({ assigned_to: consultant.id })
          .eq('id', request.id);

        if (updateError) {
          console.error(`❌ Error assigning help request ${request.id}:`, updateError);
        } else {
          console.log(`✅ Assigned help request: ${request.content?.substring(0, 50)}...`);
        }
      }
      console.log('');
    }

    // 4. Test dashboard stats again
    console.log('📊 STEP 4: TESTING UPDATED DASHBOARD STATS');
    console.log('-------------------------------------------');
    const { data: stats, error: statsError } = await supabase
      .rpc('get_consultant_dashboard_stats', { p_consultant_id: consultant.id });

    if (statsError) {
      console.error('❌ Error getting dashboard stats:', statsError);
    } else {
      console.log('✅ Updated Dashboard Stats:');
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

    console.log('🎉 HELP REQUESTS FIX COMPLETE!');
    console.log('===============================');
    console.log('💡 Now test the dashboard:');
    console.log('   1. Go to http://localhost:5174');
    console.log(`   2. Login with: ${consultant.email}`);
    console.log('   3. You should now see:');
    console.log(`      - Total Readers: ${stats?.totalReaders || 0}`);
    console.log(`      - Pending Help Requests: ${stats?.pendingHelpRequests || 0}`);
    console.log(`      - Feedback Count: ${stats?.feedbackCount || 0}`);

  } catch (error) {
    console.error('❌ Help requests fix failed:', error);
  }
}

fixHelpRequests(); 