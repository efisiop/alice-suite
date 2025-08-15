// Test Specific Action: User Lookup
// This script will test a specific interaction and verify it appears in the dashboard

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSpecificAction() {
  try {
    console.log('🎯 Testing Specific Action: User Lookup');
    console.log('=====================================');
    
    // Step 1: Get existing users
    console.log('\n1️⃣ Getting existing users...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);
    
    if (profileError) {
      console.log('❌ Error getting profiles:', profileError.message);
      return;
    }
    
    console.log(`Found ${profiles.length} profiles:`);
    profiles.forEach(p => {
      console.log(`  - ${p.first_name} ${p.last_name} (${p.email}) - Consultant: ${p.is_consultant}`);
    });
    
    // Step 2: Find a consultant and a reader
    const consultant = profiles.find(p => p.is_consultant);
    const reader = profiles.find(p => !p.is_consultant);
    
    if (!consultant) {
      console.log('\n❌ No consultant found! Creating one...');
      // We'll need to create a consultant assignment manually
    }
    
    if (!reader) {
      console.log('\n❌ No reader found!');
      return;
    }
    
    console.log(`\n2️⃣ Using consultant: ${consultant?.first_name || 'None'} ${consultant?.last_name || ''}`);
    console.log(`   Using reader: ${reader.first_name} ${reader.last_name}`);
    
    // Step 3: Create consultant assignment if needed
    if (consultant) {
      console.log('\n3️⃣ Creating consultant assignment...');
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
        console.log('⚠️  Assignment error (might already exist):', assignmentError.message);
      } else {
        console.log('✅ Consultant assignment created');
      }
    }
    
    // Step 4: Create a specific user lookup interaction
    console.log('\n4️⃣ Creating user lookup interaction...');
    const { error: interactionError } = await supabase
      .from('user_interactions')
      .insert({
        user_id: reader.id,
        book_id: '550e8400-e29b-41d4-a716-446655440000',
        interaction_type: 'WORD_LOOKUP',
        content: 'curiouser',
        context: 'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, "and what is the use of a book," thought Alice "without pictures or conversations?"',
        created_at: new Date().toISOString()
      });
    
    if (interactionError) {
      console.log('❌ Interaction error:', interactionError.message);
    } else {
      console.log('✅ User lookup interaction created');
    }
    
    // Step 5: Create a help request
    console.log('\n5️⃣ Creating help request...');
    const { error: helpError } = await supabase
      .from('help_requests')
      .insert({
        user_id: reader.id,
        book_id: '550e8400-e29b-41d4-a716-446655440000',
        content: 'I need help understanding the word "curiouser" in this context',
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (helpError) {
      console.log('❌ Help request error:', helpError.message);
    } else {
      console.log('✅ Help request created');
    }
    
    // Step 6: Create feedback
    console.log('\n6️⃣ Creating feedback...');
    const { error: feedbackError } = await supabase
      .from('user_feedback')
      .insert({
        user_id: reader.id,
        book_id: '550e8400-e29b-41d4-a716-446655440000',
        feedback_type: 'WORD_LOOKUP',
        content: 'The word lookup feature is very helpful for understanding difficult words',
        is_public: true,
        created_at: new Date().toISOString()
      });
    
    if (feedbackError) {
      console.log('❌ Feedback error:', feedbackError.message);
    } else {
      console.log('✅ Feedback created');
    }
    
    // Step 7: Test dashboard stats
    if (consultant) {
      console.log('\n7️⃣ Testing dashboard stats...');
      const { data: stats, error: statsError } = await supabase.rpc('get_consultant_dashboard_stats', { 
        p_consultant_id: consultant.id 
      });
      
      if (statsError) {
        console.log('❌ Stats error:', statsError.message);
      } else {
        console.log('✅ Dashboard stats:', stats);
      }
    }
    
    // Step 8: Test consultant readers
    if (consultant) {
      console.log('\n8️⃣ Testing consultant readers...');
      const { data: readers, error: readersError } = await supabase.rpc('get_consultant_readers', { 
        p_consultant_id: consultant.id 
      });
      
      if (readersError) {
        console.log('❌ Readers error:', readersError.message);
      } else {
        console.log('✅ Consultant readers:', readers);
      }
    }
    
    console.log('\n🎉 Specific action test completed!');
    console.log('\n📋 What to check in the dashboard:');
    console.log('1. Go to http://localhost:5174 (Consultant Dashboard)');
    console.log('2. Login as a consultant');
    console.log('3. Look for:');
    console.log('   - Total readers: 1');
    console.log('   - Pending help requests: 1');
    console.log('   - Feedback count: 1');
    console.log('   - Recent activity showing the help request');
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testSpecificAction(); 