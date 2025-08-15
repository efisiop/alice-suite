-- Migration: Create consultant_assignments table and related infrastructure
-- This table links consultants to their assigned readers

-- Create consultant_assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.consultant_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(consultant_id, user_id, book_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_consultant_assignments_consultant ON public.consultant_assignments(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultant_assignments_user ON public.consultant_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_consultant_assignments_book ON public.consultant_assignments(book_id);
CREATE INDEX IF NOT EXISTS idx_consultant_assignments_active ON public.consultant_assignments(active);

-- Enable RLS for consultant_assignments
ALTER TABLE public.consultant_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow consultants to view their own assignments
CREATE POLICY "Consultants can view their own assignments" ON public.consultant_assignments
    FOR SELECT USING (auth.uid() = consultant_id);

-- Policy: Allow service role to manage assignments
CREATE POLICY "Service role can manage consultant assignments" ON public.consultant_assignments
    FOR ALL USING (auth.role() = 'service_role');

-- Create automatic updated_at trigger
CREATE OR REPLACE FUNCTION update_consultant_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consultant_assignments_updated_at
    BEFORE UPDATE ON public.consultant_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_consultant_assignments_updated_at();

-- Create function to assign consultants to new users
CREATE OR REPLACE FUNCTION assign_consultant_to_new_user()
RETURNS TRIGGER AS $$
DECLARE
    available_consultant_id uuid;
    user_book_id uuid;
BEGIN
    -- Get the user's book_id from their profile
    SELECT book_id INTO user_book_id FROM public.profiles WHERE id = NEW.id;
    
    -- Find the consultant with the fewest active assignments for this book
    SELECT consultant_id INTO available_consultant_id
    FROM public.consultant_assignments
    WHERE book_id = user_book_id AND active = TRUE
    GROUP BY consultant_id
    ORDER BY COUNT(*) ASC
    LIMIT 1;
    
    -- If no consultant found for this book, find any consultant
    IF available_consultant_id IS NULL THEN
        SELECT id INTO available_consultant_id
        FROM public.profiles
        WHERE is_consultant = TRUE
        ORDER BY RANDOM()
        LIMIT 1;
    END IF;
    
    -- Assign the consultant to this user
    IF available_consultant_id IS NOT NULL THEN
        INSERT INTO public.consultant_assignments (consultant_id, user_id, book_id)
        VALUES (available_consultant_id, NEW.id, user_book_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign consultants to new users
DROP TRIGGER IF EXISTS auto_assign_consultant ON auth.users;
CREATE TRIGGER auto_assign_consultant
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION assign_consultant_to_new_user();

-- Insert audit log
INSERT INTO public.audit_logs (action, table_name, record_id, details)
VALUES ('MIGRATION', 'consultant_assignments', NULL, 'Created consultant_assignments table and auto-assignment trigger');