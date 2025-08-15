// Apply Database Fixes
// This script applies the fixes for missing tables and functions

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

async function applyFix() {
  try {
    console.log('🔧 Applying database fixes...');
    console.log('=============================');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('./fix-database.sql', 'utf8');
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`\n${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        
        try {
          // Try to execute the statement
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          
          if (error) {
            console.log(`⚠️  Statement ${i + 1} had an issue:`, error.message);
            errorCount++;
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            successCount++;
          }
        } catch (err) {
          console.log(`❌ Statement ${i + 1} failed:`, err.message);
          errorCount++;
        }
      }
    }
    
    console.log('\n🎉 Database fix completed!');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎯 All fixes applied successfully!');
      console.log('📋 Next steps:');
      console.log('1. Run the test script: node test-feedback-help.js');
      console.log('2. Test feedback submission in Alice Reader');
      console.log('3. Test help request submission in Alice Reader');
      console.log('4. Check consultant dashboard for data');
    } else {
      console.log('\n⚠️  Some fixes had issues. This might be expected.');
      console.log('📋 You can still test the apps - some functionality may work.');
    }
    
  } catch (err) {
    console.error('❌ Failed to apply fixes:', err);
  }
}

applyFix(); 