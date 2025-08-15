#!/usr/bin/env node

/**
 * Database Verification Script
 * Verifies the actual data and relationships in the database
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://blwypdcobizmpidmuhvq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsd3lwZGNvYml6bXBpZG11aHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDgzNDcsImV4cCI6MjA1OTc4NDM0N30.YP2r-CnSaM4rKclXBivanAMBQh9sMsI95F2p87zIuWM'
);

async function verifyDatabase() {
  console.log('🔍 Database Verification Report\n');

  // 1. Check all tables and counts
  console.log('📊 Table Counts:');
  const tables = [
    'profiles',
    'help_requests', 
    'user_feedback',
    'consultant_assignments',
    'reading_progress',
    'reading_stats'
  ];

  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`  ❌ ${table}: ${error.message}`);
    } else {
      console.log(`  ✅ ${table}: ${count} records`);
    }
  }

  console.log('\n🔍 Detailed Analysis:');

  // 2. Check help requests by status
  console.log('\n🆘 Help Requests by Status:');
  const { data: helpRequests, error: helpError } = await supabase
    .from('help_requests')
    .select('*, user:user_id(first_name, last_name, email)')
    .order('created_at', { ascending: false });

  if (helpError) {
    console.log('  ❌ Error loading help requests:', helpError.message);
  } else {
    const statusCounts = {};
    helpRequests.forEach(req => {
      statusCounts[req.status] = (statusCounts[req.status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    console.log('\n  Recent Help Requests:');
    helpRequests.slice(0, 3).forEach(req => {
      console.log(`    - ${req.status}: ${req.content?.substring(0, 60)}... (${req.user?.email})`);
    });
  }

  // 3. Check feedback
  console.log('\n💬 User Feedback:');
  const { data: feedback, error: fbError } = await supabase
    .from('user_feedback')
    .select('*, user:user_id(first_name, last_name, email)')
    .order('created_at', { ascending: false });

  if (fbError) {
    console.log('  ❌ Error loading feedback:', fbError.message);
  } else {
    console.log(`  Total: ${feedback.length} feedback items`);
    feedback.slice(0, 3).forEach(fb => {
      console.log(`    - ${fb.feedback_type}: ${fb.content?.substring(0, 60)}... (${fb.user?.email})`);
    });
  }

  // 4. Check consultant assignments
  console.log('\n👥 Consultant Assignments:');
  const { data: assignments, error: assignError } = await supabase
    .from('consultant_assignments')
    .select('*, consultant:consultant_id(first_name, last_name, email), user:user_id(first_name, last_name, email)')
    .order('created_at', { ascending: false });

  if (assignError) {
    console.log('  ❌ Error loading assignments:', assignError.message);
  } else {
    console.log(`  Total: ${assignments.length} assignments`);
    assignments.forEach(assign => {
      console.log(`    - ${assign.consultant?.email} → ${assign.user?.email} (${assign.active ? 'active' : 'inactive'})`);
    });
  }

  // 5. Test the get_consultant_dashboard_stats function
  console.log('\n📈 Testing Dashboard Stats Function:');
  
  // Find the consultant user
  const { data: consultantUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'consultant@test.com')
    .single();

  if (consultantUser) {
    console.log(`  Testing with consultant ID: ${consultantUser.id}`);
    
    const { data: stats, error: statsError } = await supabase
      .rpc('get_consultant_dashboard_stats', { p_consultant_id: consultantUser.id });

    if (statsError) {
      console.log('  ❌ Stats function error:', statsError.message);
      console.log('  ❌ Full error:', JSON.stringify(statsError, null, 2));
    } else {
      console.log('  ✅ Stats retrieved:');
      console.log(`    - Total Readers: ${stats.totalReaders}`);
      console.log(`    - Active Readers: ${stats.activeReaders}`);
      console.log(`    - Pending Help Requests: ${stats.pendingHelpRequests}`);
      console.log(`    - Resolved Help Requests: ${stats.resolvedHelpRequests}`);
      console.log(`    - Feedback Count: ${stats.feedbackCount}`);
      console.log(`    - Prompts Sent: ${stats.promptsSent}`);
    }
  } else {
    console.log('  ❌ No consultant user found');
  }

  // 6. Check reading progress for assigned users
  console.log('\n📖 Reading Progress Check:');
  if (assignments.length > 0) {
    const userIds = assignments.map(a => a.user_id);
    
    const { data: progress, error: progressError } = await supabase
      .from('reading_progress')
      .select('*, user:user_id(first_name, last_name, email)')
      .in('user_id', userIds);

    if (progressError) {
      console.log('  ❌ Error loading reading progress:', progressError.message);
    } else {
      console.log(`  Found ${progress.length} reading progress records for assigned users`);
    }
  }

  // 7. Identify the issue
  console.log('\n🔍 Issue Analysis:');
  
  if (assignments.length === 0) {
    console.log('  ⚠️  ISSUE FOUND: No consultant assignments exist!');
    console.log('  💡 Solution: Need to assign readers to the consultant');
  }

  if (helpRequests.filter(req => req.status === 'pending').length === 0) {
    console.log('  ⚠️  ISSUE FOUND: No pending help requests!');
    console.log('  💡 Solution: Create test help requests');
  }

  if (consultantUser && assignments.length === 0) {
    console.log('  🔧 Creating test assignment...');
    const testAssignment = {
      consultant_id: consultantUser.id,
      user_id: '90958f5b-fe41-4cd2-892f-068d6a73bea0', // fausto@fausto.com
      active: true
    };

    const { error: insertError } = await supabase
      .from('consultant_assignments')
      .insert(testAssignment);

    if (insertError) {
      console.log('  ❌ Failed to create test assignment:', insertError.message);
    } else {
      console.log('  ✅ Test assignment created for fausto@fausto.com');
    }
  }

  console.log('\n✅ Database verification complete!');
}

verifyDatabase().catch(console.error);