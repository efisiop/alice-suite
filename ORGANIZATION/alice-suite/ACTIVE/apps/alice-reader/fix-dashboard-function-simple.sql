-- Simplified dashboard function without consultant_actions table reference
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
    recent_activity json;
    top_books json;
    reading_progress json;
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

    -- Get recent activity (last 10 help requests and feedback)
    SELECT json_agg(
        json_build_object(
            'id', COALESCE(hr.id, uf.id),
            'type', CASE WHEN hr.id IS NOT NULL THEN 'help_request' ELSE 'feedback' END,
            'content', COALESCE(hr.content, uf.content),
            'created_at', COALESCE(hr.created_at, uf.created_at),
            'status', hr.status
        )
    )
    INTO recent_activity
    FROM (
        SELECT id, content, created_at, status, user_id
        FROM public.help_requests
        WHERE user_id = ANY(assigned_reader_ids)
        UNION ALL
        SELECT id, content, created_at, NULL as status, user_id
        FROM public.user_feedback
        WHERE user_id = ANY(assigned_reader_ids)
        ORDER BY created_at DESC
        LIMIT 10
    ) AS combined_data
    LEFT JOIN public.help_requests hr ON combined_data.id = hr.id
    LEFT JOIN public.user_feedback uf ON combined_data.id = uf.id;

    -- Get top books (books with most activity)
    SELECT json_agg(
        json_build_object(
            'book_id', ca.book_id,
            'title', b.title,
            'activity_count', activity_counts.activity_count
        )
    )
    INTO top_books
    FROM (
        SELECT 
            ca.book_id,
            COUNT(*) as activity_count
        FROM public.consultant_assignments ca
        LEFT JOIN public.help_requests hr ON ca.user_id = hr.user_id
        LEFT JOIN public.user_feedback uf ON ca.user_id = uf.user_id
        WHERE ca.consultant_id = p_consultant_id
        GROUP BY ca.book_id
        ORDER BY activity_count DESC
        LIMIT 5
    ) activity_counts
    LEFT JOIN public.books b ON activity_counts.book_id = b.id;

    -- Get reading progress
    SELECT json_agg(
        json_build_object(
            'user_id', rp.user_id,
            'book_id', rp.book_id,
            'current_page', rp.current_page,
            'total_pages', rp.total_pages,
            'progress_percentage', (rp.current_page::float / rp.total_pages * 100)
        )
    )
    INTO reading_progress
    FROM public.reading_progress rp
    WHERE rp.user_id = ANY(assigned_reader_ids);

    RETURN json_build_object(
        'totalReaders', total_readers_count,
        'activeReaders', active_readers_count,
        'pendingHelpRequests', pending_help_requests_count,
        'resolvedHelpRequests', resolved_help_requests_count,
        'feedbackCount', feedback_count,
        'promptsSent', prompts_sent_count,
        'recentActivity', COALESCE(recent_activity, '[]'::json),
        'topBooks', COALESCE(top_books, '[]'::json),
        'readingProgress', COALESCE(reading_progress, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 