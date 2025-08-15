-- Final Fix: Corrected functions without non-existent table references
CREATE OR REPLACE FUNCTION get_consultant_dashboard_stats(p_consultant_id uuid)
RETURNS json AS $$
DECLARE
    assigned_reader_ids uuid[];
    total_readers_count int := 0;
    active_readers_count int := 0;
    pending_help_requests_count int := 0;
    resolved_help_requests_count int := 0;
    feedback_count int := 0;
    prompts_sent_count int := 0;
    recent_activity json;
    top_books json;
    reading_progress json;
BEGIN
    -- Get assigned reader IDs
    SELECT array_agg(user_id)
    INTO assigned_reader_ids
    FROM public.consultant_assignments
    WHERE consultant_id = p_consultant_id AND active = TRUE;

    -- Handle case when no readers are assigned
    IF assigned_reader_ids IS NULL THEN
        assigned_reader_ids := ARRAY[]::uuid[];
    END IF;

    -- Total readers count
    total_readers_count := COALESCE(array_length(assigned_reader_ids, 1), 0);

    -- Active readers (active in the last 7 days) - using updated_at since last_active_at doesn't exist
    SELECT COUNT(*)
    INTO active_readers_count
    FROM public.profiles
    WHERE id = ANY(assigned_reader_ids)
      AND updated_at > NOW() - INTERVAL '7 days';

    -- Pending help requests
    SELECT COUNT(*)
    INTO pending_help_requests_count
    FROM public.help_requests
    WHERE user_id = ANY(assigned_reader_ids)
      AND status = 'pending';

    -- Resolved help requests
    SELECT COUNT(*)
    INTO resolved_help_requests_count
    FROM public.help_requests
    WHERE user_id = ANY(assigned_reader_ids)
      AND status = 'resolved';

    -- Feedback count
    SELECT COUNT(*)
    INTO feedback_count
    FROM public.user_feedback
    WHERE user_id = ANY(assigned_reader_ids);

    -- Prompts sent by this consultant (set to 0 since consultant_actions table doesn't exist)
    prompts_sent_count := 0;

    RETURN json_build_object(
        'totalReaders', total_readers_count,
        'activeReaders', active_readers_count,
        'pendingHelpRequests', pending_help_requests_count,
        'resolvedHelpRequests', resolved_help_requests_count,
        'feedbackCount', feedback_count,
        'promptsSent', prompts_sent_count,
        'recentActivity', COALESCE(recent_activity, '[]'::json),
        'topBooks', COALESCE(top_books, '[]'::json),
        'readingProgress', COALESCE(reading_progress, '{}'::json)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_consultant_readers function to match actual schema
CREATE OR REPLACE FUNCTION get_consultant_readers(p_consultant_id uuid)
RETURNS json AS $$
BEGIN
    RETURN (
        SELECT json_agg(reader_data)
        FROM (
            SELECT 
                p.id,
                CONCAT(p.first_name, ' ', p.last_name) as full_name,
                p.email,
                p.created_at,
                p.updated_at,
                p.is_consultant,
                ca.book_id,
                b.title as book_title,
                b.author as book_author,
                ca.created_at as assigned_at
            FROM public.consultant_assignments ca
            JOIN public.profiles p ON ca.user_id = p.id
            LEFT JOIN public.books b ON ca.book_id = b.id
            WHERE ca.consultant_id = p_consultant_id AND ca.active = TRUE
            ORDER BY ca.created_at DESC
        ) reader_data
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix RLS policies for user_feedback table
DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.user_feedback;
CREATE POLICY "Users can insert their own feedback" ON public.user_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own feedback" ON public.user_feedback;
CREATE POLICY "Users can view their own feedback" ON public.user_feedback
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Consultants can view feedback from assigned readers" ON public.user_feedback;
CREATE POLICY "Consultants can view feedback from assigned readers" ON public.user_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.consultant_assignments ca
            WHERE ca.consultant_id = auth.uid()
            AND ca.user_id = user_feedback.user_id
            AND ca.active = TRUE
        )
    );

-- Fix RLS policies for help_requests table
DROP POLICY IF EXISTS "Users can insert their own help requests" ON public.help_requests;
CREATE POLICY "Users can insert their own help requests" ON public.help_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own help requests" ON public.help_requests;
CREATE POLICY "Users can view their own help requests" ON public.help_requests
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Consultants can view help requests from assigned readers" ON public.help_requests;
CREATE POLICY "Consultants can view help requests from assigned readers" ON public.help_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.consultant_assignments ca
            WHERE ca.consultant_id = auth.uid()
            AND ca.user_id = help_requests.user_id
            AND ca.active = TRUE
        )
    );

-- Create a test consultant (if none exists)
INSERT INTO public.profiles (id, first_name, last_name, email, is_consultant, created_at, updated_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Test',
    'Consultant',
    'consultant1@example.com',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING; 