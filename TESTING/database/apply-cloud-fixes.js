// Apply Kimi K2's Fixes to Cloud Supabase
// This script applies the consultant connectivity fixes directly to the cloud database

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyCloudFixes() {
  try {
    console.log('🚀 Applying Kimi K2\'s Consultant Connectivity Fixes to Cloud Database');
    console.log('=====================================================================');
    
    // Step 1: Apply consultant_assignments table migration
    console.log('\n1️⃣ Creating consultant_assignments table...');
    try {
      const sqlContent = fs.readFileSync('./alice-reader/supabase/migrations/20250727_create_consultant_assignments.sql', 'utf8');
      
      // Split into individual statements
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('INSERT INTO public.audit_logs'));
      
      console.log(`Found ${statements.length} SQL statements to execute`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          
          try {
            // Execute the statement directly
            const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
            
            if (error) {
              console.log(`⚠️  Statement ${i + 1} had an issue (might already exist):`, error.message);
              errorCount++;
            } else {
              console.log(`✅ Statement ${i + 1} executed successfully`);
              successCount++;
            }
          } catch (err) {
            console.log(`⚠️  Statement ${i + 1} failed (might already exist):`, err.message);
            errorCount++;
          }
        }
      }
      
      console.log(`\n📊 Table creation results: ${successCount} successful, ${errorCount} errors`);
      
    } catch (err) {
      console.log('⚠️  Error reading migration file:', err.message);
    }
    
    // Step 2: Apply dashboard function migration
    console.log('\n2️⃣ Creating dashboard functions...');
    try {
      const sqlContent = fs.readFileSync('./alice-reader/supabase/migrations/20250727_fix_consultant_dashboard_function.sql', 'utf8');
      
      // Split into individual statements
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('INSERT INTO public.audit_logs'));
      
      console.log(`Found ${statements.length} SQL statements to execute`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          
          try {
            // Execute the statement directly
            const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
            
            if (error) {
              console.log(`⚠️  Statement ${i + 1} had an issue (might already exist):`, error.message);
              errorCount++;
            } else {
              console.log(`✅ Statement ${i + 1} executed successfully`);
              successCount++;
            }
          } catch (err) {
            console.log(`⚠️  Statement ${i + 1} failed (might already exist):`, err.message);
            errorCount++;
          }
        }
      }
      
      console.log(`\n📊 Function creation results: ${successCount} successful, ${errorCount} errors`);
      
    } catch (err) {
      console.log('⚠️  Error reading function file:', err.message);
    }
    
    // Step 3: Test the fixes
    console.log('\n3️⃣ Testing the fixes...');
    try {
      // Test if consultant_assignments table exists
      const { data: assignments, error: assignmentsError } = await supabase
        .from('consultant_assignments')
        .select('*')
        .limit(1);
      
      if (assignmentsError) {
        console.log('❌ consultant_assignments table test failed:', assignmentsError.message);
      } else {
        console.log('✅ consultant_assignments table exists and is accessible');
      }
      
      // Test if the function exists
      try {
        const { data: stats, error: statsError } = await supabase.rpc('get_consultant_dashboard_stats', { 
          p_consultant_id: '11111111-1111-1111-1111-111111111111' 
        });
        
        if (statsError) {
          console.log('❌ get_consultant_dashboard_stats function test failed:', statsError.message);
        } else {
          console.log('✅ get_consultant_dashboard_stats function works');
          console.log('   Result:', stats);
        }
      } catch (err) {
        console.log('❌ Function test failed:', err.message);
      }
      
    } catch (err) {
      console.log('⚠️  Error testing fixes:', err.message);
    }
    
    console.log('\n🎉 Cloud fixes application completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Test feedback submission in Alice Reader');
    console.log('2. Test help request submission in Alice Reader');
    console.log('3. Check consultant dashboard for data');
    console.log('4. Create test consultant assignments if needed');
    
  } catch (err) {
    console.error('❌ Cloud fixes failed:', err);
  }
}

applyCloudFixes(); 