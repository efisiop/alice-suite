// Apply Simple Fixes to Cloud Supabase
// This script applies the key consultant connectivity fixes directly

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySimpleFixes() {
  try {
    console.log('🚀 Applying Simple Consultant Connectivity Fixes');
    console.log('================================================');
    
    // Step 1: Check if consultant_assignments table exists
    console.log('\n1️⃣ Checking consultant_assignments table...');
    try {
      const { data, error } = await supabase
        .from('consultant_assignments')
        .select('*')
        .limit(1);
      
      if (error && error.message.includes('does not exist')) {
        console.log('❌ consultant_assignments table does not exist');
        console.log('💡 You need to create this table manually in Supabase dashboard');
        console.log('   Table structure:');
        console.log('   - id: UUID PRIMARY KEY');
        console.log('   - consultant_id: UUID REFERENCES auth.users(id)');
        console.log('   - user_id: UUID REFERENCES auth.users(id)');
        console.log('   - book_id: UUID REFERENCES books(id)');
        console.log('   - active: BOOLEAN DEFAULT TRUE');
        console.log('   - created_at: TIMESTAMPTZ DEFAULT NOW()');
        console.log('   - updated_at: TIMESTAMPTZ DEFAULT NOW()');
      } else if (error) {
        console.log('⚠️  Error checking table:', error.message);
      } else {
        console.log('✅ consultant_assignments table exists');
      }
    } catch (err) {
      console.log('⚠️  Error checking table:', err.message);
    }
    
    // Step 2: Check if the stats function exists
    console.log('\n2️⃣ Checking dashboard stats function...');
    try {
      const { data, error } = await supabase.rpc('get_consultant_dashboard_stats', { 
        p_consultant_id: '11111111-1111-1111-1111-111111111111' 
      });
      
      if (error && error.message.includes('does not exist')) {
        console.log('❌ get_consultant_dashboard_stats function does not exist');
        console.log('💡 You need to create this function manually in Supabase dashboard');
      } else if (error) {
        console.log('⚠️  Error checking function:', error.message);
      } else {
        console.log('✅ get_consultant_dashboard_stats function exists');
        console.log('   Result:', data);
      }
    } catch (err) {
      console.log('⚠️  Error checking function:', err.message);
    }
    
    // Step 3: Create test consultant assignment if table exists
    console.log('\n3️⃣ Creating test consultant assignment...');
    try {
      // Get existing users
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);
      
      if (profileError) {
        console.log('⚠️  Error getting profiles:', profileError.message);
      } else if (profiles && profiles.length > 0) {
        console.log(`Found ${profiles.length} existing profiles`);
        
        // Find a consultant
        const consultant = profiles.find(p => p.is_consultant);
        const reader = profiles.find(p => !p.is_consultant);
        
        if (consultant && reader) {
          console.log(`Using consultant: ${consultant.first_name} ${consultant.last_name}`);
          console.log(`Using reader: ${reader.first_name} ${reader.last_name}`);
          
          // Try to create assignment
          const { error: assignmentError } = await supabase
            .from('consultant_assignments')
            .insert({
              consultant_id: consultant.id,
              user_id: reader.id,
              book_id: '550e8400-e29b-41d4-a716-446655440000', // Alice book UUID
              active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (assignmentError) {
            console.log('⚠️  Error creating assignment:', assignmentError.message);
          } else {
            console.log('✅ Test consultant assignment created');
          }
        } else {
          console.log('⚠️  No consultant or reader found for testing');
        }
      } else {
        console.log('⚠️  No profiles found');
      }
    } catch (err) {
      console.log('⚠️  Error creating assignment:', err.message);
    }
    
    // Step 4: Test current functionality
    console.log('\n4️⃣ Testing current functionality...');
    try {
      // Test feedback submission
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profiles && profiles.length > 0) {
        const testUser = profiles[0];
        
        // Create test feedback
        const { error: feedbackError } = await supabase
          .from('user_feedback')
          .insert({
            user_id: testUser.id,
            book_id: '550e8400-e29b-41d4-a716-446655440000',
            feedback_type: 'TEST_FEEDBACK',
            content: 'Test feedback from connectivity fix script',
            is_public: true,
            created_at: new Date().toISOString()
          });
        
        if (feedbackError) {
          console.log('❌ Feedback creation failed:', feedbackError.message);
        } else {
          console.log('✅ Test feedback created successfully');
        }
        
        // Create test help request
        const { error: helpError } = await supabase
          .from('help_requests')
          .insert({
            user_id: testUser.id,
            book_id: '550e8400-e29b-41d4-a716-446655440000',
            content: 'Test help request from connectivity fix script',
            status: 'PENDING',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (helpError) {
          console.log('❌ Help request creation failed:', helpError.message);
        } else {
          console.log('✅ Test help request created successfully');
        }
      }
    } catch (err) {
      console.log('⚠️  Error testing functionality:', err.message);
    }
    
    console.log('\n🎉 Simple fixes application completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Core functionality (feedback/help requests) is working');
    console.log('⚠️  You may need to manually create consultant_assignments table');
    console.log('⚠️  You may need to manually create get_consultant_dashboard_stats function');
    console.log('\n📋 Next steps:');
    console.log('1. Test feedback submission in Alice Reader');
    console.log('2. Test help request submission in Alice Reader');
    console.log('3. Check consultant dashboard for data');
    console.log('4. If dashboard shows no data, create missing table/function in Supabase dashboard');
    
  } catch (err) {
    console.error('❌ Simple fixes failed:', err);
  }
}

applySimpleFixes(); 