const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

(async () => {
  console.log('🔍 Looking for Fausto in the database...');
  
  try {
    // Find Fausto
    const { data: faustoProfiles, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('first_name', '%fausto%');
    
    if (error) {
      console.log('❌ Error finding Fausto:', error.message);
      return;
    }
    
    if (!faustoProfiles || faustoProfiles.length === 0) {
      console.log('⚠️  No Fausto found in profiles');
      return;
    }
    
    console.log(`✅ Found ${faustoProfiles.length} Fausto profile(s):`);
    faustoProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.first_name} ${profile.last_name}`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Is Consultant: ${profile.is_consultant}`);
      console.log(`   Last Active: ${profile.last_active_at || 'Never'}`);
    });
    
    // Use the first Fausto found
    const fausto = faustoProfiles[0];
    
    // Check consultant assignments
    console.log(`\n📋 Checking consultant assignments for ${fausto.first_name}...`);
    const { data: assignments, error: assignError } = await supabase
      .from('consultant_assignments')
      .select('*')
      .eq('user_id', fausto.id)
      .eq('active', true);
    
    if (assignError) {
      console.log('❌ Assignment check error:', assignError.message);
    } else {
      console.log(`   Found ${assignments.length} active assignments`);
      if (assignments.length > 0) {
        assignments.forEach(assignment => {
          console.log(`   - Assigned to consultant: ${assignment.consultant_id}`);
          console.log(`   - Book ID: ${assignment.book_id || 'No specific book'}`);
        });
      } else {
        console.log('⚠️  Fausto has no active consultant assignments');
        
        // Let's create an assignment for testing
        console.log('\n🔧 Creating test assignment for Fausto...');
        const testConsultantId = '27ce3a11-1d12-417d-b90a-d1635c7c8ec5'; // efisio@efisio.com
        
        const { error: createError } = await supabase
          .from('consultant_assignments')
          .insert({
            consultant_id: testConsultantId,
            user_id: fausto.id,
            book_id: '550e8400-e29b-41d4-a716-446655440000', // Alice book
            active: true
          });
        
        if (createError) {
          console.log('❌ Error creating assignment:', createError.message);
        } else {
          console.log('✅ Test assignment created');
        }
      }
    }
    
    console.log('\n🎯 Test Setup Summary:');
    console.log(`- Fausto ID: ${fausto.id}`);
    console.log(`- Fausto Email: ${fausto.email}`);
    console.log('- Now you can test login tracking!');
    
  } catch (err) {
    console.error('❌ Script failed:', err);
  }
})();

