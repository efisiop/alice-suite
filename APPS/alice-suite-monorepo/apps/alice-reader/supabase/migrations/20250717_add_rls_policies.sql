-- Migration: Add RLS policies for profiles, help_requests, and consultant_triggers

-- 1. RLS for public.profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Allow consultants to view all profiles
CREATE POLICY "Consultants can view all profiles" ON public.profiles
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_consultant = TRUE));

-- Policy: Allow authenticated users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Allow service_role to manage profiles (for admin operations)
CREATE POLICY "Service role can manage profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- 2. RLS for public.help_requests table
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to insert their own help requests
CREATE POLICY "Users can insert their own help requests" ON public.help_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Allow authenticated users to view their own help requests
CREATE POLICY "Users can view their own help requests" ON public.help_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Allow consultants to view all help requests
CREATE POLICY "Consultants can view all help requests" ON public.help_requests
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_consultant = TRUE));

-- Policy: Allow consultants to update help requests (assign, resolve)
CREATE POLICY "Consultants can update help requests" ON public.help_requests
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_consultant = TRUE));

-- Policy: Allow service_role to manage help requests
CREATE POLICY "Service role can manage help requests" ON public.help_requests
  FOR ALL USING (auth.role() = 'service_role');

-- 3. RLS for public.consultant_triggers table
ALTER TABLE public.consultant_triggers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow consultants to insert consultant triggers
CREATE POLICY "Consultants can insert consultant triggers" ON public.consultant_triggers
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_consultant = TRUE));

-- Policy: Allow users to view their own consultant triggers
CREATE POLICY "Users can view their own consultant triggers" ON public.consultant_triggers
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Allow consultants to view all consultant triggers
CREATE POLICY "Consultants can view all consultant triggers" ON public.consultant_triggers
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_consultant = TRUE));

-- Policy: Allow service_role to manage consultant triggers
CREATE POLICY "Service role can manage consultant triggers" ON public.consultant_triggers
  FOR ALL USING (auth.role() = 'service_role');

-- Add audit log for this migration
INSERT INTO public.audit_logs (action, table_name, record_id, details)
VALUES ('MIGRATION', 'RLS Policies', NULL, 'Added RLS policies for profiles, help_requests, and consultant_triggers');
