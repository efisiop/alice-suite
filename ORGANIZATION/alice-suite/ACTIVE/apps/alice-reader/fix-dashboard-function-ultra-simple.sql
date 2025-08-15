-- Ultra-simple dashboard function - only essential counts
-- Fix the dashboard function to use correct case for status values

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
BEGIN
    -- Get assigned reader IDs
    SELECT array_agg(user_id)
    INTO assigned_reader_ids
    FROM public.consultant_assignments
    WHERE consultant_id = p_consultant_id;

    -- If no assigned readers, return empty stats
    IF assigned_reader_ids IS NULL OR array_length(assigned_reader_ids, 1) IS NULL THEN
        RETURN json_build_object(
            'totalReaders', 0,
            'activeReaders', 0,
            'pendingHelpRequests', 0,
            'resolvedHelpRequests', 0,
            'feedbackCount', 0,
            'promptsSent', 0,
            'recentActivity', '[]'::json,
            'topBooks', '[]'::json,
            'readingProgress', '[]'::json
        );
    END IF;

    -- Count total readers
    SELECT COUNT(*)
    INTO total_readers_count
    FROM public.profiles
    WHERE id = ANY(assigned_reader_ids);

    -- Count active readers (active in last 7 days)
    SELECT COUNT(*)
    INTO active_readers_count
    FROM public.profiles
    WHERE id = ANY(assigned_reader_ids) AND updated_at > NOW() - INTERVAL '7 days';

    -- Count pending help requests (FIXED: use 'PENDING' instead of 'pending')
    SELECT COUNT(*)
    INTO pending_help_requests_count
    FROM public.help_requests
    WHERE user_id = ANY(assigned_reader_ids) AND status = 'PENDING';

    -- Count resolved help requests (FIXED: use 'RESOLVED' instead of 'resolved')
    SELECT COUNT(*)
    INTO resolved_help_requests_count
    FROM public.help_requests
    WHERE user_id = ANY(assigned_reader_ids) AND status = 'RESOLVED';

    -- Count feedback
    SELECT COUNT(*)
    INTO feedback_count
    FROM public.user_feedback
    WHERE user_id = ANY(assigned_reader_ids);

    -- Count prompts sent (simplified - no consultant_actions table)
    prompts_sent_count := 0;

    RETURN json_build_object(
        'totalReaders', total_readers_count,
        'activeReaders', active_readers_count,
        'pendingHelpRequests', pending_help_requests_count,
        'resolvedHelpRequests', resolved_help_requests_count,
        'feedbackCount', feedback_count,
        'promptsSent', prompts_sent_count,
        'recentActivity', '[]'::json,
        'topBooks', '[]'::json,
        'readingProgress', '[]'::json
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 