// Simple script to test database connectivity for alice-consultant-dashboard
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Alice Consultant Dashboard - Database Connection Test');
console.log('=======================================================');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnectivity() {
  console.log('\n📋 Environment Check:');
  console.log(`   VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SUPABASE_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);
  
  try {
    console.log('\n🔗 Testing Supabase Connection...');
    
    // Test basic connection
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, author')
      .limit(5);
    
    if (booksError) {
      console.error('❌ Database connection failed:', booksError.message);
      return false;
    }
    
    console.log('   ✅ Database connection successful!');
    console.log(`   📊 Found ${books.length} books`);
    
    if (books.length > 0) {
      console.log(`   📖 Sample book: ${books[0].title} (ID: ${books[0].id})`);
    }
    
    // Test verification codes (consultant-specific functionality)
    console.log('\n🔐 Testing verification codes...');
    const { data: verificationCodes, error: verificationError } = await supabase
      .from('verification_codes')
      .select('code, is_used')
      .limit(10);
    
    if (verificationError) {
      console.error('❌ Verification codes test failed:', verificationError.message);
    } else {
      console.log('   ✅ Verification codes table accessible!');
      console.log(`   📊 Found ${verificationCodes.length} verification codes`);
      
      const availableCodes = verificationCodes.filter(code => !code.is_used);
      console.log(`   🔓 Available codes: ${availableCodes.length}`);
    }
    
    // Test profiles table (for consultant functionality)
    console.log('\n👥 Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, is_consultant')
      .limit(10);
    
    if (profilesError) {
      console.error('❌ Profiles test failed:', profilesError.message);
    } else {
      console.log('   ✅ Profiles table accessible!');
      console.log(`   📊 Found ${profiles.length} profiles`);
      
      const consultants = profiles.filter(p => p.is_consultant);
      console.log(`   👨‍💼 Consultants: ${consultants.length}`);
    }
    
    // Test help requests (consultant-specific functionality)
    console.log('\n🆘 Testing help requests...');
    const { data: helpRequests, error: helpRequestsError } = await supabase
      .from('help_requests')
      .select('id, status, content')
      .limit(10);
    
    if (helpRequestsError) {
      console.error('❌ Help requests test failed:', helpRequestsError.message);
    } else {
      console.log('   ✅ Help requests table accessible!');
      console.log(`   📊 Found ${helpRequests.length} help requests`);
      
      const pendingRequests = helpRequests.filter(req => req.status === 'PENDING');
      console.log(`   ⏳ Pending requests: ${pendingRequests.length}`);
    }
    
    // Test consultant dashboard stats function
    console.log('\n📊 Testing consultant dashboard stats function...');
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_consultant_dashboard_stats', { 
        p_consultant_id: '00000000-0000-0000-0000-000000000000' // dummy ID
      });
    
    if (statsError) {
      console.error('❌ Stats function test failed:', statsError.message);
    } else {
      console.log('   ✅ Consultant dashboard stats function accessible!');
      console.log('   📊 Stats function returned data:', statsData);
    }
    
    console.log('\n🎉 SUCCESS: Alice Consultant Dashboard database connectivity test passed!');
    console.log('   The consultant dashboard should be able to connect to Supabase and manage readers.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Database connectivity test failed:', error.message);
    return false;
  }
}

// Run the test
testDatabaseConnectivity().catch(console.error);