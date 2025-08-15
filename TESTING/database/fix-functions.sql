-- Fix get_consultant_dashboard_stats function to match actual schema
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

    -- Prompts sent by this consultant (if consultant_actions table exists)
    SELECT COUNT(*)
    INTO prompts_sent_count
    FROM public.consultant_actions
    WHERE consultant_id = p_consultant_id
      AND action_type = 'PROMPT';

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