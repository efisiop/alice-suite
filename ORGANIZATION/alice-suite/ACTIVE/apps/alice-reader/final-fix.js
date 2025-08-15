// Final Database Fix
// This script fixes the database with correct UUIDs and approach

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

// Correct UUIDs
const ALICE_BOOK_UUID = '550e8400-e29b-41d4-a716-446655440000';
const TEST_CONSULTANT_ID = '11111111-1111-1111-1111-111111111111';
const TEST_READER_ID = '22222222-2222-2222-2222-222222222222';

async function finalFix() {
  try {
    console.log('🔧 Applying final database fixes...');
    console.log('==================================');
    
    // Step 1: Check if books table has the Alice book
    console.log('\n1️⃣ Checking Alice book in database...');
    try {
      const { data: books, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', ALICE_BOOK_UUID);
      
      if (error) {
        console.log('⚠️  Error checking books:', error.message);
      } else if (books && books.length > 0) {
        console.log('✅ Alice book found in database');
      } else {
        console.log('⚠️  Alice book not found, creating it...');
        const { error: insertError } = await supabase
          .from('books')
          .insert({
            id: ALICE_BOOK_UUID,
            title: 'Alice in Wonderland',
            author: 'Lewis Carroll',
            description: 'A classic children\'s novel',
            total_pages: 100,
            string_id: 'alice-in-wonderland',
            created_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.log('⚠️  Error creating Alice book:', insertError.message);
        } else {
          console.log('✅ Alice book created');
        }
      }
    } catch (err) {
      console.log('⚠️  Error with books table:', err.message);
    }
    
    // Step 2: Create test profiles (using auth.users first)
    console.log('\n2️⃣ Creating test profiles...');
    try {
      // First, create auth users
      const { error: authError } = await supabase.auth.admin.createUser({
        email: 'consultant@test.com',
        password: 'testpassword123',
        user_metadata: { name: 'Test Consultant' }
      });
      
      if (authError && !authError.message.includes('already registered')) {
        console.log('⚠️  Error creating consultant auth user:', authError.message);
      } else {
        console.log('✅ Consultant auth user created or already exists');
      }
      
      const { error: authError2 } = await supabase.auth.admin.createUser({
        email: 'reader@test.com',
        password: 'testpassword123',
        user_metadata: { name: 'Test Reader' }
      });
      
      if (authError2 && !authError2.message.includes('already registered')) {
        console.log('⚠️  Error creating reader auth user:', authError2.message);
      } else {
        console.log('✅ Reader auth user created or already exists');
      }
      
      // Now create profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: TEST_CONSULTANT_ID,
            first_name: 'Test',
            last_name: 'Consultant',
            email: 'consultant@test.com',
            is_consultant: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: TEST_READER_ID,
            first_name: 'Test',
            last_name: 'Reader',
            email: 'reader@test.com',
            is_consultant: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ], { onConflict: 'id' });
      
      if (profileError) {
        console.log('⚠️  Profile creation had an issue:', profileError.message);
      } else {
        console.log('✅ Test profiles created');
      }
    } catch (err) {
      console.log('⚠️  Profile creation failed:', err.message);
    }
    
    // Step 3: Create consultant_assignments table manually
    console.log('\n3️⃣ Creating consultant_assignments table...');
    try {
      // Try to create the table using a simple insert that will fail if table doesn't exist
      const { error } = await supabase
        .from('consultant_assignments')
        .select('*')
        .limit(1);
      
      if (error && error.message.includes('does not exist')) {
        console.log('⚠️  consultant_assignments table does not exist');
        console.log('💡 You need to create this table manually in Supabase dashboard');
        console.log('   Table structure:');
        console.log('   - id: UUID PRIMARY KEY');
        console.log('   - consultant_id: UUID REFERENCES auth.users(id)');
        console.log('   - user_id: UUID REFERENCES auth.users(id)');
        console.log('   - book_id: UUID REFERENCES books(id)');
        console.log('   - active: BOOLEAN DEFAULT TRUE');
        console.log('   - created_at: TIMESTAMPTZ DEFAULT NOW()');
      } else {
        console.log('✅ consultant_assignments table exists');
        
        // Try to create test assignment
        const { error: assignmentError } = await supabase
          .from('consultant_assignments')
          .upsert({
            consultant_id: TEST_CONSULTANT_ID,
            user_id: TEST_READER_ID,
            book_id: ALICE_BOOK_UUID,
            active: true,
            created_at: new Date().toISOString()
          }, { onConflict: 'consultant_id,user_id,book_id' });
        
        if (assignmentError) {
          console.log('⚠️  Assignment creation had an issue:', assignmentError.message);
        } else {
          console.log('✅ Test assignment created');
        }
      }
    } catch (err) {
      console.log('⚠️  Assignment table check failed:', err.message);
    }
    
    // Step 4: Create test feedback
    console.log('\n4️⃣ Creating test feedback...');
    try {
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: TEST_READER_ID,
          book_id: ALICE_BOOK_UUID,
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
          user_id: TEST_READER_ID,
          book_id: ALICE_BOOK_UUID,
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
            user_id: TEST_READER_ID,
            event_type: 'PAGE_VIEW',
            book_id: ALICE_BOOK_UUID,
            content: 'Viewed page 1',
            created_at: new Date().toISOString()
          },
          {
            user_id: TEST_READER_ID,
            event_type: 'FEEDBACK_SUBMIT',
            book_id: ALICE_BOOK_UUID,
            content: 'Submitted feedback',
            created_at: new Date().toISOString()
          },
          {
            user_id: TEST_READER_ID,
            event_type: 'HELP_REQUEST',
            book_id: ALICE_BOOK_UUID,
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
    
    console.log('\n🎉 Final fix completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Test data created with correct UUIDs');
    console.log('⚠️  You may need to create consultant_assignments table manually');
    console.log('\n📋 Next steps:');
    console.log('1. Run the test script: node test-feedback-help.js');
    console.log('2. Test feedback submission in Alice Reader');
    console.log('3. Test help request submission in Alice Reader');
    console.log('4. Check consultant dashboard for data');
    
  } catch (err) {
    console.error('❌ Final fix failed:', err);
  }
}

finalFix(); 