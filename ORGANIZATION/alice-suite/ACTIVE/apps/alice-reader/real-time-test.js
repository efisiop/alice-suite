import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealTimeFlow() {
  console.log('🧪 TESTING REAL-TIME DATA FLOW');
  console.log('================================');
  
  try {
    // Step 1: Get current state
    console.log('\n📊 STEP 1: Current Dashboard State');
    const { data: stats, error: statsError } = await supabase
      .rpc('get_consultant_dashboard_stats', { p_consultant_id: '27ce3a11-1d12-417d-b90a-d1635c7c8ec5' });
    
    if (statsError) {
      console.error('❌ Error getting stats:', statsError);
      return;
    }
    
    console.log('✅ Current Stats:');
    console.log(`   Total Readers: ${stats.totalReaders}`);
    console.log(`   Pending Help Requests: ${stats.pendingHelpRequests}`);
    console.log(`   Feedback Count: ${stats.feedbackCount}`);
    
    // Step 2: Create new help request
    console.log('\n📝 STEP 2: Creating New Help Request');
    const { data: helpRequest, error: helpError } = await supabase
      .from('help_requests')
      .insert({
        user_id: '90958f5b-fe41-4cd2-892f-068d6a73bea0',
        book_id: '550e8400-e29b-41d4-a716-446655440000',
        content: `Real-time test help request - ${new Date().toISOString()}`,
        status: 'PENDING',
        assigned_to: '27ce3a11-1d12-417d-b90a-d1635c7c8ec5'
      })
      .select();
    
    if (helpError) {
      console.error('❌ Error creating help request:', helpError);
    } else {
      console.log('✅ Help request created:', helpRequest[0].id);
    }
    
    // Step 3: Create new feedback
    console.log('\n💬 STEP 3: Creating New Feedback');
    const { data: feedback, error: feedbackError } = await supabase
      .from('user_feedback')
      .insert({
        user_id: '90958f5b-fe41-4cd2-892f-068d6a73bea0',
        book_id: '550e8400-e29b-41d4-a716-446655440000',
        content: `Real-time test feedback - ${new Date().toISOString()}`,
        feedback_type: 'TEST_FEEDBACK'
      })
      .select();
    
    if (feedbackError) {
      console.error('❌ Error creating feedback:', feedbackError);
    } else {
      console.log('✅ Feedback created:', feedback[0].id);
    }
    
    // Step 4: Check updated state
    console.log('\n🔄 STEP 4: Checking Updated State (waiting 5 seconds...)');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const { data: newStats, error: newStatsError } = await supabase
      .rpc('get_consultant_dashboard_stats', { p_consultant_id: '27ce3a11-1d12-417d-b90a-d1635c7c8ec5' });
    
    if (newStatsError) {
      console.error('❌ Error getting updated stats:', newStatsError);
      return;
    }
    
    console.log('✅ Updated Stats:');
    console.log(`   Total Readers: ${newStats.totalReaders}`);
    console.log(`   Pending Help Requests: ${newStats.pendingHelpRequests}`);
    console.log(`   Feedback Count: ${newStats.feedbackCount}`);
    
    // Step 5: Verify changes
    console.log('\n🎯 STEP 5: Verifying Changes');
    const helpIncrease = newStats.pendingHelpRequests - stats.pendingHelpRequests;
    const feedbackIncrease = newStats.feedbackCount - stats.feedbackCount;
    
    console.log(`   Help Requests Increase: ${helpIncrease}`);
    console.log(`   Feedback Increase: ${feedbackIncrease}`);
    
    if (helpIncrease > 0 || feedbackIncrease > 0) {
      console.log('✅ SUCCESS: Real-time data flow is working!');
    } else {
      console.log('❌ ISSUE: No data flow detected');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRealTimeFlow(); 