const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const FAUSTO_ID = '90958f5b-fe41-4cd2-892f-068d6a73bea0';

(async () => {
  console.log('🚀 Simulating Fausto login...');
  
  try {
    // Update Fausto's updated_at to simulate activity
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', FAUSTO_ID);
    
    if (updateError) {
      console.log('❌ Error updating Fausto activity:', updateError.message);
      return;
    }
    
    console.log('✅ Fausto activity timestamp updated');
    
    // Add a login interaction
    const { error: interactionError } = await supabase
      .from('interactions')
      .insert({
        user_id: FAUSTO_ID,
        book_id: '550e8400-e29b-41d4-a716-446655440000',
        event_type: 'LOGIN',
        content: 'User logged into Alice Reader',
        created_at: new Date().toISOString()
      });
    
    if (interactionError) {
      console.log('❌ Error creating interaction:', interactionError.message);
    } else {
      console.log('✅ Login interaction recorded');
    }
    
    console.log('\n🎯 Now check the Consultant Dashboard!');
    console.log('- Fausto should appear as "active"');
    console.log('- His last activity should show as "just now"');
    console.log('- The interaction should be in the activity feed');
    
  } catch (err) {
    console.error('❌ Simulation failed:', err);
  }
})();
