-- Setup Missing Database Tables and Test Data
-- This script creates the missing consultant_assignments table and adds test data

-- 1. Create consultant_assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS consultant_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(consultant_id, user_id, book_id)
);

-- 2. Create the missing stats function
CREATE OR REPLACE FUNCTION get_consultant_dashboard_stats(p_consultant_id uuid)
RETURNS json AS $$
DECLARE
  assigned_reader_ids uuid[];
  total_readers_count int;
  active_readers_count int;
  pending_help_requests_count int;
  resolved_help_requests_count int;
  feedback_count int;
  prompts_sent_count int;
BEGIN
  -- Get assigned reader IDs
  SELECT array_agg(user_id)
  INTO assigned_reader_ids
  FROM consultant_assignments
  WHERE consultant_id = p_consultant_id;

  -- Total readers
  total_readers_count := array_length(assigned_reader_ids, 1);

  -- Active readers (active in the last 7 days)
  SELECT count(*)
  INTO active_readers_count
  FROM profiles
  WHERE id = ANY(assigned_reader_ids)
    AND last_active_at > now() - interval '7 days';

  -- Pending help requests
  SELECT count(*)
  INTO pending_help_requests_count
  FROM help_requests
  WHERE user_id = ANY(assigned_reader_ids)
    AND status = 'PENDING';

  -- Resolved help requests
  SELECT count(*)
  INTO resolved_help_requests_count
  FROM help_requests
  WHERE user_id = ANY(assigned_reader_ids)
    AND status = 'RESOLVED';

  -- Feedback count
  SELECT count(*)
  INTO feedback_count
  FROM user_feedback
  WHERE user_id = ANY(assigned_reader_ids);

  -- Prompts sent
  SELECT count(*)
  INTO prompts_sent_count
  FROM consultant_actions_log
  WHERE consultant_id = p_consultant_id
    AND action_type = 'PROMPT';

  RETURN json_build_object(
    'totalReaders', total_readers_count,
    'activeReaders', active_readers_count,
    'pendingHelpRequests', pending_help_requests_count,
    'resolvedHelpRequests', resolved_help_requests_count,
    'feedbackCount', feedback_count,
    'promptsSent', prompts_sent_count
  );
END;
$$ LANGUAGE plpgsql;

-- 3. Add some test data (you'll need to replace these UUIDs with actual user IDs)
-- First, let's create a test consultant and reader if they don't exist
INSERT INTO profiles (id, first_name, last_name, email, is_consultant, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Test', 'Consultant', 'consultant@test.com', true, now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'Test', 'Reader', 'reader@test.com', false, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 4. Create a test assignment
INSERT INTO consultant_assignments (consultant_id, user_id, book_id, active, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'alice-in-wonderland', true, now())
ON CONFLICT (consultant_id, user_id, book_id) DO NOTHING;

-- 5. Add some test feedback
INSERT INTO user_feedback (user_id, book_id, feedback_type, content, is_public, created_at)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'alice-in-wonderland', 'AHA_MOMENT', 'This is a test feedback from the reader!', true, now())
ON CONFLICT DO NOTHING;

-- 6. Add some test help requests
INSERT INTO help_requests (user_id, book_id, content, status, created_at, updated_at)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'alice-in-wonderland', 'This is a test help request from the reader!', 'PENDING', now(), now())
ON CONFLICT DO NOTHING;

-- 7. Add some test activity tracking
INSERT INTO interactions (user_id, event_type, book_id, content, created_at)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'PAGE_VIEW', 'alice-in-wonderland', 'Viewed page 1', now()),
  ('22222222-2222-2222-2222-222222222222', 'FEEDBACK_SUBMIT', 'alice-in-wonderland', 'Submitted feedback', now()),
  ('22222222-2222-2222-2222-222222222222', 'HELP_REQUEST', 'alice-in-wonderland', 'Requested help', now())
ON CONFLICT DO NOTHING;

-- 8. Update profiles with last_active_at
UPDATE profiles 
SET last_active_at = now() 
WHERE id = '22222222-2222-2222-2222-222222222222';

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consultant_assignments_consultant_id ON consultant_assignments(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultant_assignments_user_id ON consultant_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_help_requests_user_id ON help_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON interactions(user_id);

-- 10. Test the function
SELECT get_consultant_dashboard_stats('11111111-1111-1111-1111-111111111111') as test_stats; 