const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './alice-consultant-dashboard/.env' });

async function checkConsultantRole() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
  
  console.log('🔍 Checking consultant role for efisio@efisio.com...');
  
  try {
    // Check profiles table for efisio@efisio.com
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, is_consultant')
      .eq('email', 'efisio@efisio.com')
      .single();
    
    if (profileError) {
      console.log('❌ Profile not found for efisio@efisio.com:', profileError.message);
      
      // Let's check if there are any users at all
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, is_consultant')
        .limit(10);
      
      if (allError) {
        console.error('❌ Error getting all profiles:', allError);
      } else {
        console.log('📋 Available profiles:', allProfiles);
      }
      return;
    }
    
    console.log('✅ Profile found:', profileData);
    
    // Check consultant_users table
    const { data: consultantData, error: consultantError } = await supabase
      .from('consultant_users')
      .select('user_id, is_active, created_at')
      .eq('user_id', profileData.id)
      .single();
    
    if (consultantError) {
      console.log('📋 No consultant_users record found:', consultantError.message);
    } else {
      console.log('📋 Consultant user data:', consultantData);
    }
    
    // Check consultant_assignments
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('consultant_assignments')
      .select('id, user_id, book_id, active, created_at')
      .eq('consultant_id', profileData.id);
    
    if (assignmentsError) {
      console.error('❌ Error checking assignments:', assignmentsError);
    } else {
      console.log(`📋 Found ${assignmentsData.length} consultant assignments`);
      if (assignmentsData.length > 0) {
        console.log('📋 First assignment:', assignmentsData[0]);
      }
    }
    
    // Check if user has consultant role in any way
    const isConsultant = profileData.is_consultant || (consultantData && consultantData.is_active) || false;
    console.log('🎯 Final consultant status:', isConsultant);
    
    if (!isConsultant) {
      console.log('⚠️  User is NOT marked as consultant. Need to update database.');
    }
    
  } catch (error) {
    console.error('❌ Error checking consultant role:', error);
  }
}

checkConsultantRole();