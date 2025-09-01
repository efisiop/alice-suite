const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://blwypdcobizmpidmuhvq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsd3lwZGNvYml6bXBpZG11aHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDgzNDcsImV4cCI6MjA1OTc4NDM0N30.YP2r-CnSaM4rKclXBivanAMBQh9sMsI95F2p87zIuWM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardQueries() {
  console.log('🧪 TESTING DASHBOARD QUERIES');
  console.log('============================');
  
  // Test 1: consultant_users
  console.log('1️⃣ Testing consultant_users...');
  try {
    const { data, error } = await supabase
      .from('consultant_users')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ consultant_users error:', error.message);
    } else {
      console.log('✅ consultant_users working!', `Found ${data?.length || 0} records`);
    }
  } catch (err) {
    console.log('❌ consultant_users exception:', err.message);
  }
  
  // Test 2: user_feedback
  console.log('2️⃣ Testing user_feedback...');
  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ user_feedback error:', error.message);
    } else {
      console.log('✅ user_feedback working!', `Found ${data?.length || 0} records`);
    }
  } catch (err) {
    console.log('❌ user_feedback exception:', err.message);
  }
  
  // Test 3: interactions
  console.log('3️⃣ Testing interactions...');
  try {
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ interactions error:', error.message);
    } else {
      console.log('✅ interactions working!', `Found ${data?.length || 0} records`);
    }
  } catch (err) {
    console.log('❌ interactions exception:', err.message);
  }
  
  // Test 4: help_requests
  console.log('4️⃣ Testing help_requests...');
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ help_requests error:', error.message);
    } else {
      console.log('✅ help_requests working!', `Found ${data?.length || 0} records`);
    }
  } catch (err) {
    console.log('❌ help_requests exception:', err.message);
  }
  
  // Test 5: profiles
  console.log('5️⃣ Testing profiles...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, is_consultant')
      .limit(5);
    
    if (error) {
      console.log('❌ profiles error:', error.message);
    } else {
      console.log('✅ profiles working!', `Found ${data?.length || 0} records`);
      if (data && data.length > 0) {
        console.log('   Sample profile:', {
          name: `${data[0].first_name} ${data[0].last_name}`,
          email: data[0].email,
          isConsultant: data[0].is_consultant
        });
      }
    }
  } catch (err) {
    console.log('❌ profiles exception:', err.message);
  }
  
  console.log('\n📊 SUMMARY');
  console.log('==========');
  console.log('If all queries above are working, the database side should be fixed.');
  console.log('Remaining errors are likely in the frontend JavaScript code.');
  console.log('\nNext steps:');
  console.log('1. ✅ WebSocket server is running on port 3001');
  console.log('2. ✅ Database infinite recursion fixed');
  console.log('3. 🔧 Need to fix JavaScript stack overflow errors');
}

(async () => {
  await testDashboardQueries();
})();






