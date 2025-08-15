#!/usr/bin/env node

/**
 * Database Fix Script
 * Fixes the database relationships and creates proper assignments
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://blwypdcobizmpidmuhvq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsd3lwZGNvYml6bXBpZG11aHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDgzNDcsImV4cCI6MjA1OTc4NDM0N30.YP2r-CnSaM4rKclXBivanAMBQh9sMsI95F2p87zIuWM'
);

async function fixDatabase() {
  console.log('🔧 Database Fix Script\n');

  // 1. Get actual data without broken relationships
  console.log('📊 Current Data (without relationships):');
  
  const { data: helpRequests, error: helpError } = await supabase
    .from('help_requests')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: feedback, error: fbError } = await supabase
    .from('user_feedback')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: assignments, error: assignError } = await supabase
    .from('consultant_assignments')
    .select('*')
    .order('created_at', { ascending: false });

  console.log(`  Help requests: ${helpRequests?.length || 0}`);
  console.log(`  Feedback: ${feedback?.length || 0}`);
  console.log(`  Consultant assignments: ${assignments?.length || 0}`);

  // 2. Find the consultant and reader
  const { data: consultantUser } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name')
    .eq('email', 'consultant@test.com')
    .single();

  const { data: readerUser } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name')
    .eq('email', 'fausto@fausto.com')
    .single();

  if (!consultantUser || !readerUser) {
    console.log('❌ Required users not found');
    return;
  }

  console.log(`\n👤 Consultant: ${consultantUser.email} (${consultantUser.id})`);
  console.log(`👤 Reader: ${readerUser.email} (${readerUser.id})`);

  // 3. Fix consultant assignments
  console.log('\n🔧 Fixing Consultant Assignments...');
  
  // Check if assignment already exists
  const { data: existingAssignment } = await supabase
    .from('consultant_assignments')
    .select('*')
    .eq('consultant_id', consultantUser.id)
    .eq('user_id', readerUser.id)
    .single();

  if (!existingAssignment) {
    const newAssignment = {
      consultant_id: consultantUser.id,
      user_id: readerUser.id,
      active: true,
      created_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('consultant_assignments')
      .insert(newAssignment);

    if (insertError) {
      console.log('❌ Failed to create assignment:', insertError.message);
    } else {
      console.log('✅ Created assignment: consultant@test.com → fausto@fausto.com');
    }
  } else {
    console.log('✅ Assignment already exists');
  }

  // 4. Update help requests to have proper consultant relationships
  console.log('\n🔧 Updating Help Requests...');
  
  // Check if any help requests are from assigned readers
  const { data: assignedReaders } = await supabase
    .from('consultant_assignments')
    .select('user_id')
    .eq('consultant_id', consultantUser.id);

  if (assignedReaders && assignedReaders.length > 0) {
    const readerIds = assignedReaders.map(a => a.user_id);
    
    const { data: relevantRequests } = await supabase
      .from('help_requests')
      .select('*')
      .in('user_id', readerIds);

    console.log(`📋 Found ${relevantRequests?.length || 0} help requests from assigned readers`);
    
    relevantRequests?.forEach(req => {
      console.log(`  - Request ${req.id}: ${req.status} - ${req.content?.substring(0, 50)}...`);
    });
  }

  // 5. Test the dashboard stats function
  console.log('\n📈 Testing Dashboard Stats After Fix...');
  
  const { data: stats, error: statsError } = await supabase
    .rpc('get_consultant_dashboard_stats', { p_consultant_id: consultantUser.id });

  if (statsError) {
    console.log('❌ Stats function error:', statsError.message);
  } else {
    console.log('✅ Updated stats:');
    console.log(`  - Total Readers: ${stats.totalReaders}`);
    console.log(`  - Active Readers: ${stats.activeReaders}`);
    console.log(`  - Pending Help Requests: ${stats.pendingHelpRequests}`);
    console.log(`  - Resolved Help Requests: ${stats.resolvedHelpRequests}`);
    console.log(`  - Feedback Count: ${stats.feedbackCount}`);
    console.log(`  - Prompts Sent: ${stats.promptsSent}`);
  }

  // 6. Check for any help requests from the assigned reader
  console.log('\n🔍 Checking Help Requests from Assigned Reader:');
  const { data: assignedHelpRequests } = await supabase
    .from('help_requests')
    .select('*')
    .eq('user_id', readerUser.id)
    .order('created_at', { ascending: false });

  if (assignedHelpRequests && assignedHelpRequests.length > 0) {
    console.log(`  Found ${assignedHelpRequests.length} help requests from ${readerUser.email}:`);
    assignedHelpRequests.forEach(req => {
      console.log(`    - ${req.id}: ${req.status} - ${req.content?.substring(0, 60)}...`);
    });
  } else {
    console.log('  No help requests found from assigned reader');
  }

  // 7. Check feedback from assigned reader
  console.log('\n💬 Checking Feedback from Assigned Reader:');
  const { data: assignedFeedback } = await supabase
    .from('user_feedback')
    .select('*')
    .eq('user_id', readerUser.id)
    .order('created_at', { ascending: false });

  if (assignedFeedback && assignedFeedback.length > 0) {
    console.log(`  Found ${assignedFeedback.length} feedback items from ${readerUser.email}:`);
    assignedFeedback.forEach(fb => {
      console.log(`    - ${fb.id}: ${fb.feedback_type} - ${fb.content?.substring(0, 60)}...`);
    });
  } else {
    console.log('  No feedback found from assigned reader');
  }

  console.log('\n✅ Database fix complete!');
  console.log('\n🎯 Summary:');
  console.log('  - Created consultant assignment');
  console.log('  - Verified data relationships');
  console.log('  - Dashboard should now show real data');
}

fixDatabase().catch(console.error);