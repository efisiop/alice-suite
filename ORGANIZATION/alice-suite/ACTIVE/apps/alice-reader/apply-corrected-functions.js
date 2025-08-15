// Apply Corrected Database Functions
// This script applies the corrected functions that match your actual database schema

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

async function applyCorrectedFunctions() {
  try {
    console.log('🔧 Applying Corrected Database Functions');
    console.log('========================================');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('./fix-functions.sql', 'utf8');
    
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
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          // Execute the statement directly using RPC
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          
          if (error) {
            console.log(`⚠️  Statement ${i + 1} had an issue:`, error.message);
            errorCount++;
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            successCount++;
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} failed:`, err.message);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📊 Function creation results: ${successCount} successful, ${errorCount} errors`);
    
    if (errorCount > 0) {
      console.log('\n💡 Since exec_sql failed, you need to apply these functions manually:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of fix-functions.sql');
      console.log('4. Execute the SQL');
    }
    
    // Test the functions
    console.log('\n🧪 Testing the functions...');
    try {
      const { data, error } = await supabase.rpc('get_consultant_dashboard_stats', { 
        p_consultant_id: '11111111-1111-1111-1111-111111111111' 
      });
      
      if (error) {
        console.log('❌ get_consultant_dashboard_stats test failed:', error.message);
      } else {
        console.log('✅ get_consultant_dashboard_stats function works');
        console.log('   Result:', data);
      }
    } catch (err) {
      console.log('❌ Function test failed:', err.message);
    }
    
    console.log('\n🎉 Corrected functions application completed!');
    
  } catch (err) {
    console.error('❌ Function application failed:', err);
  }
}

applyCorrectedFunctions(); 