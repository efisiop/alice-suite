-- Migration: Fix and enhance get_consultant_dashboard_stats function
-- This function provides comprehensive dashboard statistics for consultants

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

    -- Active readers (active in the last 7 days)
    SELECT COUNT(*)
    INTO active_readers_count
    FROM public.profiles
    WHERE id = ANY(assigned_reader_ids)
      AND last_active_at > NOW() - INTERVAL '7 days';

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

    -- Prompts sent by this consultant
    SELECT COUNT(*)
    INTO prompts_sent_count
    FROM public.consultant_actions
    WHERE consultant_id = p_consultant_id
      AND action_type = 'PROMPT';

    -- Recent activity (last 5 interactions)
    SELECT json_agg(recent_activity_data)
    INTO recent_activity
    FROM (
        SELECT 
            'help_request' as type,
            hr.id,
            hr.title,
            hr.status,
            hr.created_at,
            p.full_name as user_name
        FROM public.help_requests hr
        JOIN public.profiles p ON hr.user_id = p.id
        WHERE hr.user_id = ANY(assigned_reader_ids)
        ORDER BY hr.created_at DESC
        LIMIT 5
    ) recent_activity_data;

    -- Top books being read by assigned readers
    SELECT json_agg(top_books_data)
    INTO top_books
    FROM (
        SELECT 
            b.title,
            b.author,
            COUNT(DISTINCT uip.user_id) as readers_count,
            AVG(uip.progress) as avg_progress
        FROM public.user_interaction_progress uip
        JOIN public.books b ON uip.book_id = b.id
        WHERE uip.user_id = ANY(assigned_reader_ids)
        GROUP BY b.id, b.title, b.author
        ORDER BY readers_count DESC
        LIMIT 5
    ) top_books_data;

    -- Reading progress summary
    SELECT json_build_object(
        'total_readers', COUNT(DISTINCT user_id),
        'avg_progress', AVG(progress),
        'completed_books', COUNT(CASE WHEN progress = 100 THEN 1 END),
        'active_books', COUNT(DISTINCT book_id)
    ) INTO reading_progress
    FROM public.user_interaction_progress
    WHERE user_id = ANY(assigned_reader_ids);

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

-- Create function to get readers for a consultant
CREATE OR REPLACE FUNCTION get_consultant_readers(p_consultant_id uuid)
RETURNS json AS $$
BEGIN
    RETURN (
        SELECT json_agg(reader_data)
        FROM (
            SELECT 
                p.id,
                p.full_name,
                p.email,
                p.avatar_url,
                p.last_active_at,
                p.book_id,
                b.title as book_title,
                b.author as book_author,
                uip.progress as reading_progress,
                uip.total_reading_time,
                uip.last_read_at,
                (
                    SELECT COUNT(*)
                    FROM public.help_requests hr
                    WHERE hr.user_id = p.id AND hr.status = 'pending'
                ) as pending_help_requests,
                (
                    SELECT COUNT(*)
                    FROM public.user_feedback uf
                    WHERE uf.user_id = p.id
                ) as feedback_count,
                ca.created_at as assigned_at
            FROM public.consultant_assignments ca
            JOIN public.profiles p ON ca.user_id = p.id
            LEFT JOIN public.books b ON p.book_id = b.id
            LEFT JOIN public.user_interaction_progress uip ON p.id = uip.user_id AND p.book_id = uip.book_id
            WHERE ca.consultant_id = p_consultant_id AND ca.active = TRUE
            ORDER BY ca.created_at DESC
        ) reader_data
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert audit log
INSERT INTO public.audit_logs (action, table_name, record_id, details)
VALUES ('MIGRATION', 'Functions', NULL, 'Fixed get_consultant_dashboard_stats and created get_consultant_readers functions');