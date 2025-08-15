// Script to create the consultant dashboard stats function
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

const functionSQL = `
create or replace function get_consultant_dashboard_stats(p_consultant_id uuid)
returns json as $$
declare
  assigned_reader_ids uuid[];
  total_readers_count int;
  active_readers_count int;
  pending_help_requests_count int;
  resolved_help_requests_count int;
  feedback_count int;
  prompts_sent_count int;
begin
  -- Get assigned reader IDs
  select array_agg(user_id)
  into assigned_reader_ids
  from consultant_assignments
  where consultant_id = p_consultant_id;

  -- Total readers
  total_readers_count := array_length(assigned_reader_ids, 1);

  -- Active readers (active in the last 7 days)
  select count(*)
  into active_readers_count
  from profiles
  where id = any(assigned_reader_ids)
    and last_active_at > now() - interval '7 days';

  -- Pending help requests
  select count(*)
  into pending_help_requests_count
  from help_requests
  where user_id = any(assigned_reader_ids)
    and status = 'pending';

  -- Resolved help requests
  select count(*)
  into resolved_help_requests_count
  from help_requests
  where user_id = any(assigned_reader_ids)
    and status = 'resolved';

  -- Feedback count
  select count(*)
  into feedback_count
  from user_feedback
  where user_id = any(assigned_reader_ids);

  -- Prompts sent
  select count(*)
  into prompts_sent_count
  from consultant_actions
  where consultant_id = p_consultant_id
    and action_type = 'PROMPT';

  return json_build_object(
    'totalReaders', total_readers_count,
    'activeReaders', active_readers_count,
    'pendingHelpRequests', pending_help_requests_count,
    'resolvedHelpRequests', resolved_help_requests_count,
    'feedbackCount', feedback_count,
    'promptsSent', prompts_sent_count
  );
end;
$$ language plpgsql;
`;

async function createFunction() {
  try {
    console.log('Creating consultant dashboard stats function...');
    
    // Use direct SQL execution
    const { error } = await supabase.rpc('exec_sql', { sql: functionSQL });
    
    if (error) {
      console.error('Error creating function:', error);
      // Try alternative approach
      console.log('Trying alternative approach...');
      const { error: altError } = await supabase.from('_exec_sql').select('*').eq('sql', functionSQL);
      if (altError) {
        console.error('Alternative approach also failed:', altError);
      }
    } else {
      console.log('✅ Consultant dashboard stats function created successfully!');
    }
  } catch (err) {
    console.error('Failed to create function:', err);
  }
}

createFunction(); 