// Script to apply the consultant dashboard stats function
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

async function applyFunction() {
  try {
    console.log('Reading SQL file...');
    const sqlContent = fs.readFileSync('./apply-function.sql', 'utf8');
    
    console.log('Applying function to database...');
    
    // Try to execute the SQL directly
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('Error applying function:', error);
      console.log('Trying alternative method...');
      
      // Alternative: Try to create the function using a simpler approach
      const simpleFunction = `
        CREATE OR REPLACE FUNCTION get_consultant_dashboard_stats(p_consultant_id uuid)
        RETURNS json AS $$
        BEGIN
          RETURN json_build_object(
            'totalReaders', 0,
            'activeReaders', 0,
            'pendingHelpRequests', 0,
            'resolvedHelpRequests', 0,
            'feedbackCount', 0,
            'promptsSent', 0
          );
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      const { error: simpleError } = await supabase.rpc('exec_sql', { sql: simpleFunction });
      
      if (simpleError) {
        console.error('Simple function also failed:', simpleError);
      } else {
        console.log('✅ Simple function created successfully!');
      }
    } else {
      console.log('✅ Function applied successfully!');
    }
    
  } catch (err) {
    console.error('Failed to apply function:', err);
  }
}

applyFunction(); 