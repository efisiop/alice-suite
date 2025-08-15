const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

(async () => {
  console.log('🔍 Checking available database tables...');
  
  const tables = [
    'profiles', 
    'user_feedback', 
    'help_requests', 
    'consultant_assignments', 
    'interactions', 
    'books', 
    'consultant_triggers'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Available (found ${data?.length || 0} sample records)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
  
  // Check consultant assignments data specifically
  console.log('\n📋 Checking consultant assignment data...');
  try {
    const { data, error } = await supabase
      .from('consultant_assignments')
      .select('*, consultant:consultant_id(first_name, last_name), reader:user_id(first_name, last_name)')
      .limit(5);
    
    if (error) {
      console.log('❌ Consultant assignments query failed:', error.message);
    } else {
      console.log(`✅ Found ${data?.length || 0} consultant assignments`);
      if (data && data.length > 0) {
        console.log('   Sample assignment:', {
          consultant: data[0].consultant,
          reader: data[0].reader,
          active: data[0].active
        });
      }
    }
  } catch (err) {
    console.log('❌ Consultant assignments check failed:', err.message);
  }
})();
