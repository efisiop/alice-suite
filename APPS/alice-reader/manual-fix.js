// Manual Database Fix
// This script manually creates the missing tables and functions

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

async function manualFix() {
  try {
    console.log('🔧 Applying manual database fixes...');
    console.log('===================================');
    
    // Step 1: Create consultant_assignments table
    console.log('\n1️⃣ Creating consultant_assignments table...');
    try {
      const { error } = await supabase.rpc('exec_sql', { 
        sql: `
          CREATE TABLE IF NOT EXISTS consultant_assignments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            consultant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            book_id TEXT NOT NULL,
            active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(consultant_id, user_id, book_id)
          );
        `
      });
      
      if (error) {
        console.log('⚠️  Table creation had an issue (might already exist):', error.message);
      } else {
        console.log('✅ consultant_assignments table created');
      }
    } catch (err) {
      console.log('⚠️  Table creation failed (might already exist):', err.message);
    }
    
    // Step 2: Create test profiles
    console.log('\n2️⃣ Creating test profiles...');
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert([
          {
            id: '11111111-1111-1111-1111-111111111111',
            first_name: 'Test',
            last_name: 'Consultant',
            email: 'consultant@test.com',
            is_consultant: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '22222222-2222-2222-2222-222222222222',
            first_name: 'Test',
            last_name: 'Reader',
            email: 'reader@test.com',
            is_consultant: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ], { onConflict: 'id' });
      
      if (error) {
        console.log('⚠️  Profile creation had an issue:', error.message);
      } else {
        console.log('✅ Test profiles created');
      }
    } catch (err) {
      console.log('⚠️  Profile creation failed:', err.message);
    }
    
    // Step 3: Create test assignment
    console.log('\n3️⃣ Creating test assignment...');
    try {
      const { error } = await supabase
        .from('consultant_assignments')
        .upsert({
          consultant_id: '11111111-1111-1111-1111-111111111111',
          user_id: '22222222-2222-2222-2222-222222222222',
          book_id: 'alice-in-wonderland',
          active: true,
          created_at: new Date().toISOString()
        }, { onConflict: 'consultant_id,user_id,book_id' });
      
      if (error) {
        console.log('⚠️  Assignment creation had an issue:', error.message);
      } else {
        console.log('✅ Test assignment created');
      }
    } catch (err) {
      console.log('⚠️  Assignment creation failed:', err.message);
    }
    
    // Step 4: Create test feedback
    console.log('\n4️⃣ Creating test feedback...');
    try {
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: '22222222-2222-2222-2222-222222222222',
          book_id: 'alice-in-wonderland',
          feedback_type: 'AHA_MOMENT',
          content: 'This is a test feedback from the reader!',
          is_public: true,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.log('⚠️  Feedback creation had an issue:', error.message);
      } else {
        console.log('✅ Test feedback created');
      }
    } catch (err) {
      console.log('⚠️  Feedback creation failed:', err.message);
    }
    
    // Step 5: Create test help request
    console.log('\n5️⃣ Creating test help request...');
    try {
      const { error } = await supabase
        .from('help_requests')
        .insert({
          user_id: '22222222-2222-2222-2222-222222222222',
          book_id: 'alice-in-wonderland',
          content: 'This is a test help request from the reader!',
          status: 'PENDING',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.log('⚠️  Help request creation had an issue:', error.message);
      } else {
        console.log('✅ Test help request created');
      }
    } catch (err) {
      console.log('⚠️  Help request creation failed:', err.message);
    }
    
    // Step 6: Create test interactions
    console.log('\n6️⃣ Creating test interactions...');
    try {
      const { error } = await supabase
        .from('interactions')
        .insert([
          {
            user_id: '22222222-2222-2222-2222-222222222222',
            event_type: 'PAGE_VIEW',
            book_id: 'alice-in-wonderland',
            content: 'Viewed page 1',
            created_at: new Date().toISOString()
          },
          {
            user_id: '22222222-2222-2222-2222-222222222222',
            event_type: 'FEEDBACK_SUBMIT',
            book_id: 'alice-in-wonderland',
            content: 'Submitted feedback',
            created_at: new Date().toISOString()
          },
          {
            user_id: '22222222-2222-2222-2222-222222222222',
            event_type: 'HELP_REQUEST',
            book_id: 'alice-in-wonderland',
            content: 'Requested help',
            created_at: new Date().toISOString()
          }
        ]);
      
      if (error) {
        console.log('⚠️  Interactions creation had an issue:', error.message);
      } else {
        console.log('✅ Test interactions created');
      }
    } catch (err) {
      console.log('⚠️  Interactions creation failed:', err.message);
    }
    
    console.log('\n🎉 Manual fix completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the test script: node test-feedback-help.js');
    console.log('2. Test feedback submission in Alice Reader');
    console.log('3. Test help request submission in Alice Reader');
    console.log('4. Check consultant dashboard for data');
    
  } catch (err) {
    console.error('❌ Manual fix failed:', err);
  }
}

manualFix(); 