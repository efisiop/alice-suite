-- Fix RLS policies for consultant_assignments table
-- Enable RLS if not already enabled
ALTER TABLE public.consultant_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Consultants can view their own assignments" ON public.consultant_assignments;
DROP POLICY IF EXISTS "Service role can manage consultant assignments" ON public.consultant_assignments;

-- Create simple policies that allow all operations (for testing)
CREATE POLICY "Allow all consultant assignment operations" ON public.consultant_assignments FOR ALL USING (true);

-- Create the assignment manually
INSERT INTO public.consultant_assignments (consultant_id, user_id, book_id, active, created_at, updated_at)
VALUES (
    (SELECT id FROM public.profiles WHERE email = 'fausto@fausto.com' LIMIT 1),
    (SELECT id FROM public.profiles WHERE email = 'beppe@beppe.com' LIMIT 1),
    '550e8400-e29b-41d4-a716-446655440000',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (consultant_id, user_id, book_id) DO NOTHING; 