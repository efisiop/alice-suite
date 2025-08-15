const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const TEST_CONSULTANT_ID = '27ce3a11-1d12-417d-b90a-d1635c7c8ec5'; // efisio@efisio.com
const FAUSTO_ID = '90958f5b-fe41-4cd2-892f-068d6a73bea0';

(async () => {
  console.log('🎯 FINAL TEST: Fausto Login Tracking');
  console.log('===================================');
  
  try {
    // Step 1: Update Fausto's activity to simulate fresh login
    console.log('1️⃣ Simulating Fausto login...');
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
    console.log('✅ Fausto marked as just logged in');

    // Step 2: Verify consultant can see Fausto
    console.log('\n2️⃣ Checking consultant assignments...');
    const { data: assignments, error: assignError } = await supabase
      .from('consultant_assignments')
      .select('*')
      .eq('consultant_id', TEST_CONSULTANT_ID)
      .eq('user_id', FAUSTO_ID)
      .eq('active', true);
    
    if (assignError) {
      console.log('❌ Assignment check failed:', assignError.message);
      return;
    }
    
    if (assignments.length === 0) {
      console.log('❌ No assignment found');
      return;
    }
    console.log('✅ Consultant assignment verified');

    // Step 3: Check what the real data service would return
    console.log('\n3️⃣ Testing real data service query...');
    
    // Get all assigned readers for the consultant
    const { data: allAssignments } = await supabase
      .from('consultant_assignments')
      .select('user_id, active')
      .eq('consultant_id', TEST_CONSULTANT_ID)
      .eq('active', true);
    
    const userIds = allAssignments.map(a => a.user_id);
    
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
      console.log(`     Email: ${profile.email}`);
    });

    console.log('\n🎉 TEST COMPLETE!');
    console.log('================');
    console.log('📋 What to do now:');
    console.log('1. Open: http://localhost:5174');
    console.log('2. Toggle to "Real Database" mode');
    console.log('3. Look for assigned readers section');
    console.log('4. Fausto should appear as ACTIVE');
    console.log('5. Refresh page if needed');

  } catch (err) {
    console.error('❌ Test failed:', err);
  }
})();

