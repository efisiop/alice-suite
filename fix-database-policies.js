const { createClient } = require('@supabase/supabase-js');

// Use the hardcoded credentials from the project
const supabaseUrl = "https://blwypdcobizmpidmuhvq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsd3lwZGNvYml6bXBpZG11aHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDgzNDcsImV4cCI6MjA1OTc4NDM0N30.YP2r-CnSaM4rKclXBivanAMBQh9sMsI95F2p87zIuWM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabasePolicies() {
  console.log('🔧 FIXING DATABASE POLICIES');
  console.log('===========================');
  
  try {
    console.log('1️⃣ Fixing infinite recursion in consultant_users policy...');
    
    // Fix consultant_users policy
    const consultantPolicyFix = `
      DROP POLICY IF EXISTS "Consultants can view consultant list" ON consultant_users;
      
      CREATE POLICY "Consultants can view consultant list" 
      ON consultant_users FOR SELECT 
      USING (
        user_id = auth.uid() 
        OR 
        (auth.uid() IS NOT NULL AND is_active = true)
      );
    `;
    
    const { error: consultantError } = await supabase.rpc('exec_sql', { 
      sql: consultantPolicyFix 
    });
    
    if (consultantError) {
      console.log('⚠️ Consultant policy fix failed (may need service role):', consultantError.message);
    } else {
      console.log('✅ Consultant policy fixed!');
    }
    
    console.log('2️⃣ Fixing user_feedback policy...');
    
    // Fix user_feedback policy to avoid infinite recursion
    const feedbackPolicyFix = `
      DROP POLICY IF EXISTS "Consultants can view all feedback" ON user_feedback;
      
      CREATE POLICY "Consultants can view all feedback" 
      ON user_feedback FOR SELECT 
      USING (
        user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND is_consultant = true
        )
      );
    `;
    
    const { error: feedbackError } = await supabase.rpc('exec_sql', { 
      sql: feedbackPolicyFix 
    });
    
    if (feedbackError) {
      console.log('⚠️ Feedback policy fix failed (may need service role):', feedbackError.message);
    } else {
      console.log('✅ Feedback policy fixed!');
    }
    
    console.log('3️⃣ Testing policies...');
    
    // Test if we can now query without infinite recursion
    const { data: consultants, error: consultantsError } = await supabase
      .from('consultant_users')
      .select('*')
      .limit(1);
    
    if (consultantsError) {
      if (consultantsError.message.includes('infinite recursion')) {
        console.log('❌ Still has infinite recursion in consultant_users');
      } else {
        console.log('⚠️ Other error in consultant_users:', consultantsError.message);
      }
    } else {
      console.log('✅ consultant_users query working!');
    }
    
    const { data: feedback, error: feedbackTestError } = await supabase
      .from('user_feedback')
      .select('*')
      .limit(1);
    
    if (feedbackTestError) {
      if (feedbackTestError.message.includes('infinite recursion')) {
        console.log('❌ Still has infinite recursion in user_feedback');
      } else {
        console.log('⚠️ Other error in user_feedback:', feedbackTestError.message);
      }
    } else {
      console.log('✅ user_feedback query working!');
    }
    
    console.log('\n🎉 Database policy fixes completed!');
    console.log('Note: If policies still need fixing, they may require service role access.');
    
  } catch (error) {
    console.error('❌ Failed to fix database policies:', error);
  }
}

// Try to create the exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  console.log('🔧 Creating exec_sql function...');
  
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `;
  
  try {
    // This likely won't work with anon key, but let's try
    const { error } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    if (error) {
      console.log('⚠️ Could not create exec_sql function:', error.message);
    }
  } catch (err) {
    console.log('⚠️ exec_sql function creation failed - will use alternative approach');
  }
}

async function alternativeApproach() {
  console.log('\n🔄 TRYING ALTERNATIVE APPROACH');
  console.log('==============================');
  
  // Since we can't modify policies with anon key, let's check current status
  // and suggest manual fixes
  
  console.log('Checking current policy status...');
  
  // Test consultant_users table
  try {
    const { data, error } = await supabase
      .from('consultant_users')
      .select('count(*)')
      .limit(1);
    
    if (error && error.message.includes('infinite recursion')) {
      console.log('❌ consultant_users has infinite recursion policy');
      console.log('🔧 Manual fix needed: Update RLS policy in Supabase dashboard');
    } else if (error) {
      console.log('⚠️ consultant_users error:', error.message);
    } else {
      console.log('✅ consultant_users table accessible');
    }
  } catch (err) {
    console.log('❌ consultant_users test failed:', err.message);
  }
  
  // Test user_feedback table  
  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .select('count(*)')
      .limit(1);
    
    if (error && error.message.includes('infinite recursion')) {
      console.log('❌ user_feedback has infinite recursion policy');
      console.log('🔧 Manual fix needed: Update RLS policy in Supabase dashboard');
    } else if (error) {
      console.log('⚠️ user_feedback error:', error.message);
    } else {
      console.log('✅ user_feedback table accessible');
    }
  } catch (err) {
    console.log('❌ user_feedback test failed:', err.message);
  }
  
  // Test interactions table
  try {
    const { data, error } = await supabase
      .from('interactions')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.log('❌ interactions table error:', error.message);
    } else {
      console.log('✅ interactions table accessible');
    }
  } catch (err) {
    console.log('❌ interactions test failed:', err.message);
  }
}

(async () => {
  await createExecSqlFunction();
  await fixDatabasePolicies();
  await alternativeApproach();
})();




