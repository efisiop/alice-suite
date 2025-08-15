-- Fix infinite recursion in consultant_users policy
-- The current policy references consultant_users table within itself causing infinite recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Consultants can view consultant list" ON consultant_users;

-- Create a new policy that doesn't cause recursion
-- This allows consultants to view the consultant list without self-referencing
CREATE POLICY "Consultants can view consultant list" 
ON consultant_users FOR SELECT 
USING (
  -- Allow users to see their own record
  user_id = auth.uid() 
  OR 
  -- Allow authenticated users to see active consultants (simpler approach)
  (auth.uid() IS NOT NULL AND is_active = true)
);

-- Alternative: Create a simplified policy for consultant access
-- This avoids the recursive lookup entirely
DROP POLICY IF EXISTS "Consultants can view all feedback" ON user_feedback;
CREATE POLICY "Consultants can view all feedback" 
ON user_feedback FOR SELECT 
USING (
  -- Allow users to see their own feedback
  user_id = auth.uid()
  OR
  -- Allow consultants to see all feedback (using a direct role check)
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_consultant = true
  )
);

-- Update help_requests policy similarly
DROP POLICY IF EXISTS "Consultants can view all help requests" ON help_requests;
CREATE POLICY "Consultants can view all help requests" 
ON help_requests FOR SELECT 
USING (
  -- Allow users to see their own requests
  user_id = auth.uid()
  OR
  -- Allow consultants to see all requests
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_consultant = true
  )
);

-- Update help_requests update policy
DROP POLICY IF EXISTS "Consultants can update help requests" ON help_requests;
CREATE POLICY "Consultants can update help requests" 
ON help_requests FOR UPDATE 
USING (
  -- Allow users to update their own requests
  user_id = auth.uid()
  OR
  -- Allow consultants to update all requests
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_consultant = true
  )
);

-- Update reading_stats policy
DROP POLICY IF EXISTS "Consultants can view all reading stats" ON reading_stats;
CREATE POLICY "Consultants can view all reading stats" 
ON reading_stats FOR SELECT 
USING (
  -- Allow users to see their own stats
  user_id = auth.uid()
  OR
  -- Allow consultants to see all stats
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_consultant = true
  )
);




