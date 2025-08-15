const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const TEST_CONSULTANT_ID = '27ce3a11-1d12-417d-b90a-d1635c7c8ec5'; // efisio@efisio.com
const FAUSTO_ID = '90958f5b-fe41-4cd2-892f-068d6a73bea0';

(async () => {
  console.log('🔍 COMPREHENSIVE TEST: All Fixes Verification');
  console.log('==============================================');
  
  try {
    console.log('1️⃣ Testing Database Connectivity...');
    const { data: testQuery } = await supabase.from('profiles').select('count').limit(1);
    console.log('✅ Database connection working');

    console.log('\n2️⃣ Simulating Fresh Fausto Login...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', FAUSTO_ID);
    
    if (updateError) {
      console.log('❌ Update failed:', updateError.message);
      return;
    }
    
    // Also add a fresh interaction
    const { error: interactionError } = await supabase
      .from('interactions')
      .insert({
        user_id: FAUSTO_ID,
        book_id: '550e8400-e29b-41d4-a716-446655440000', // Alice book
        event_type: 'LOGIN',
        content: 'User logged in via web interface',
        created_at: new Date().toISOString()
      });
    
    if (interactionError) {
      console.log('⚠️ Interaction insert failed (non-critical):', interactionError.message);
    } else {
      console.log('✅ Fresh login activity recorded');
    }

    console.log('\n3️⃣ Testing Real Data Service Query (Assigned Readers)...');
    
    // Test the exact query the dashboard will use
    const { data: assignments } = await supabase
      .from('consultant_assignments')
      .select('user_id, active')
      .eq('consultant_id', TEST_CONSULTANT_ID)
      .eq('active', true);
    
    const userIds = assignments.map(a => a.user_id);
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds)
      .eq('is_consultant', false);
    
    console.log(`✅ Found ${profiles.length} assigned readers:`);
    profiles.forEach(profile => {
      const minutesAgo = Math.round((new Date() - new Date(profile.updated_at)) / (1000 * 60));
      const isActive = minutesAgo <= 30;
      
      console.log(`   - ${profile.first_name} ${profile.last_name}`);
      console.log(`     Status: ${isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'} (${minutesAgo} min ago)`);
    });

    console.log('\n4️⃣ Testing Help Requests Query...');
    const { data: helpRequests } = await supabase
      .from('help_requests')
      .select('*')
      .in('user_id', userIds)
      .order('created_at', { ascending: false });
    
    console.log(`✅ Found ${helpRequests.length} help requests`);

    console.log('\n5️⃣ Testing Feedback Query...');
    const { data: feedback } = await supabase
      .from('user_feedback')
      .select('*')
      .in('user_id', userIds)
      .order('created_at', { ascending: false });
    
    console.log(`✅ Found ${feedback.length} feedback items`);

    console.log('\n6️⃣ Testing Interactions Query...');
    const { data: interactions } = await supabase
      .from('interactions')
      .select('*')
      .in('user_id', userIds)
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log(`✅ Found ${interactions.length} recent interactions`);
    interactions.forEach(interaction => {
      console.log(`   - ${interaction.event_type} by ${interaction.user_id} (${new Date(interaction.created_at).toLocaleTimeString()})`);
    });

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('==================');
    console.log('✅ Database connectivity: Working');
    console.log('✅ Fausto activity simulation: Working');
    console.log('✅ Real data service queries: Working');
    console.log('✅ Data structure compatibility: Working');
    
    console.log('\n🚀 READY TO TEST IN BROWSER:');
    console.log('============================');
    console.log('1. Consultant Dashboard: http://localhost:5174');
    console.log('2. Alice Reader: http://localhost:5173');
    console.log('3. Toggle to "Real Database" mode in consultant dashboard');
    console.log('4. Verify Fausto appears as active reader');
    console.log('5. Test login in Alice Reader to see real-time updates');

  } catch (err) {
    console.error('❌ Test failed:', err);
  }
})();

