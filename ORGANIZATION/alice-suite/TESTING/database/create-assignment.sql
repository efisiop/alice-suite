-- Create consultant assignment (policy already exists)
INSERT INTO public.consultant_assignments (consultant_id, user_id, book_id, active, created_at, updated_at)
VALUES (
    (SELECT id FROM public.profiles WHERE email = 'fausto@fausto.com' LIMIT 1),
    (SELECT id FROM public.profiles WHERE email = 'beppe@beppe.com' LIMIT 1),
    '550e8400-e29b-41d4-a716-446655440000',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (consultant_id, user_id, book_id) DO NOTHING; 