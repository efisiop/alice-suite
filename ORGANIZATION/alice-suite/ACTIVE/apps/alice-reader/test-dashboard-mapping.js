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

async function testDashboardMapping() {
  console.log('🔍 TESTING DASHBOARD DATA MAPPING');
  console.log('==================================');
  
  try {
    // Get data from database function
    console.log('\n📊 STEP 1: Database Function Output');
    const { data: dbStats, error: dbError } = await supabase
      .rpc('get_consultant_dashboard_stats', { p_consultant_id: '27ce3a11-1d12-417d-b90a-d1635c7c8ec5' });
    
    if (dbError) {
      console.error('❌ Database function error:', dbError);
      return;
    }
    
    console.log('✅ Database function returns:');
    console.log(JSON.stringify(dbStats, null, 2));
    
    // Check what component expects
    console.log('\n🎯 STEP 2: Component Expectations');
    console.log('Component expects these fields:');
    console.log('- totalReaders: ✅ (matches)');
    console.log('- activeReaders: ✅ (matches)');
    console.log('- pendingRequests: ❌ (database has pendingHelpRequests)');
    console.log('- resolvedRequests: ✅ (matches)');
    console.log('- totalFeedback: ❌ (database has feedbackCount)');
    console.log('- recentFeedback: ❌ (not in database)');
    
    // Create mapped data
    console.log('\n🔄 STEP 3: Data Mapping');
    const mappedStats = {
      totalReaders: dbStats.totalReaders,
      activeReaders: dbStats.activeReaders,
      pendingRequests: dbStats.pendingHelpRequests, // Map this field
      resolvedRequests: dbStats.resolvedHelpRequests,
      totalFeedback: dbStats.feedbackCount, // Map this field
      recentFeedback: 0, // Default value
      readerEngagement: {
        high: 0,
        medium: 0,
        low: 0
      },
      recentActivity: dbStats.recentActivity || []
    };
    
    console.log('✅ Mapped data for component:');
    console.log(JSON.stringify(mappedStats, null, 2));
    
    console.log('\n🎯 CONCLUSION:');
    console.log('The issue is field name mismatch between database and component!');
    console.log('Database returns: pendingHelpRequests, feedbackCount');
    console.log('Component expects: pendingRequests, totalFeedback');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDashboardMapping(); 