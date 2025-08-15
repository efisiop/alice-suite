const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const TEST_CONSULTANT_ID = '27ce3a11-1d12-417d-b90a-d1635c7c8ec5';
const FAUSTO_ID = '90958f5b-fe41-4cd2-892f-068d6a73bea0';

(async () => {
  console.log('🔍 Final Verification: Fausto Tracking Setup');
  console.log('============================================');
  
  try {
    // Check Fausto's current status
    const { data: fausto, error: faustoError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', FAUSTO_ID)
      .single();
    
    if (faustoError) {
      console.log('❌ Error getting Fausto:', faustoError.message);
      return;
    }
    
    console.log('✅ Fausto Profile:');
    console.log(`   - Name: ${fausto.first_name} ${fausto.last_name}`);
    console.log(`   - Email: ${fausto.email}`);
    console.log(`   - Last Updated: ${fausto.updated_at}`);
    
    // Calculate if he should be "active"
    const lastUpdate = new Date(fausto.updated_at);
    const now = new Date();
    const minutesAgo = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    const isActive = minutesAgo <= 30;
    
    console.log(`   - Minutes since update: ${Math.round(minutesAgo)}`);
    console.log(`   - Should appear as: ${isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}`);
    
    // Check recent interactions
    const { data: interactions, error: intError } = await supabase
      .from('interactions')
      .select('*')
      .eq('user_id', FAUSTO_ID)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (intError) {
      console.log('❌ Error getting interactions:', intError.message);
    } else {
      console.log(`\\n✅ Recent Interactions: ${interactions.length}`);
      interactions.forEach((int, index) => {
        console.log(`   ${index + 1}. ${int.event_type} - ${int.created_at}`);
      });
    }
    
    // Check assignment
    const { data: assignment, error: assignError } = await supabase
      .from('consultant_assignments')
      .select('*')
      .eq('user_id', FAUSTO_ID)
      .eq('consultant_id', TEST_CONSULTANT_ID)
      .eq('active', true)
      .single();
    
    if (assignError) {
      console.log('❌ Assignment check failed:', assignError.message);
    } else {
      console.log('\\n✅ Consultant Assignment: ACTIVE');
      console.log(`   - Assigned to consultant: ${assignment.consultant_id}`);
    }
    
    console.log('\\n🎯 TEST READY!');
    console.log('================');
    console.log('1. Open: http://localhost:5174');
    console.log('2. Toggle to "Real Database" mode');
    console.log(`3. Fausto should show as: ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
    console.log('4. Check the assigned readers list');
    console.log('5. Check the activity feed');
    
  } catch (err) {
    console.error('❌ Verification failed:', err);
  }
})();

