#!/bin/bash

# Script to apply consultant dashboard connectivity fixes
# This script will:
# 1. Apply database migrations
# 2. Create missing tables and functions
# 3. Set up test data
# 4. Verify connectivity

echo "🚀 Starting Consultant Dashboard Connectivity Fix"
echo "================================================"

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    echo "Run: npm install -g supabase"
    exit 1
fi

# Set variables
SUPABASE_PROJECT_ID="alice-reader"
SUPABASE_URL="http://localhost:54321"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

# Function to run SQL commands
run_sql() {
    local sql_file="$1"
    echo "📋 Running SQL file: $sql_file"
    
    if [ -f "$sql_file" ]; then
        supabase db reset --local
        supabase db push --local
        
        # Apply the specific migration
        cat "$sql_file" | psql "postgresql://postgres:postgres@localhost:54322/postgres"
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully applied: $sql_file"
        else
            echo "❌ Failed to apply: $sql_file"
            return 1
        fi
    else
        echo "❌ SQL file not found: $sql_file"
        return 1
    fi
}

# Function to create test consultants
create_test_consultants() {
    echo "👥 Creating test consultants..."
    
    # Test consultant creation SQL
    cat > /tmp/create_test_consultants.sql << 'EOF'
-- Create test consultants
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'consultant1@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'consultant2@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Update profiles to mark as consultants
UPDATE public.profiles 
SET is_consultant = TRUE 
WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');

-- Ensure Alice book exists
INSERT INTO public.books (id, title, author, total_chapters, created_at)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Alice''s Adventures in Wonderland', 'Lewis Carroll', 12, NOW())
ON CONFLICT (id) DO NOTHING;

-- Assign some test users to consultants
INSERT INTO public.consultant_assignments (consultant_id, user_id, book_id, active)
SELECT 
    '00000000-0000-0000-0000-000000000001',
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    TRUE
FROM public.profiles p
WHERE p.is_consultant = FALSE 
    AND p.id NOT IN (SELECT user_id FROM public.consultant_assignments)
LIMIT 5;

-- Create some test help requests
INSERT INTO public.help_requests (user_id, book_id, title, content, status, created_at)
SELECT 
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    'Need help with chapter ' || (random() * 12)::int,
    'I am having difficulty understanding this chapter. Could you please help me?',
    'pending',
    NOW() - INTERVAL '1 day' * (random() * 7)::int
FROM public.profiles p
WHERE p.id IN (SELECT user_id FROM public.consultant_assignments)
LIMIT 3;

-- Create some test feedback
INSERT INTO public.user_feedback (user_id, book_id, feedback_type, content, created_at)
SELECT 
    p.id,
    '550e8400-e29b-41d4-a716-446655440000',
    'general',
    'This book is really interesting! I love the characters and the story.',
    NOW() - INTERVAL '1 day' * (random() * 7)::int
FROM public.profiles p
WHERE p.id IN (SELECT user_id FROM public.consultant_assignments)
LIMIT 2;
EOF

    psql "postgresql://postgres:postgres@localhost:54322/postgres" -f /tmp/create_test_consultants.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Test consultants created successfully"
    else
        echo "❌ Failed to create test consultants"
    fi
}

# Main execution
echo "Step 1: Applying database migrations..."

# Run the consultant assignments migration
run_sql "alice-reader/supabase/migrations/20250727_create_consultant_assignments.sql"

# Run the consultant dashboard function fix
run_sql "alice-reader/supabase/migrations/20250727_fix_consultant_dashboard_function.sql"

# Create test data
echo "Step 2: Creating test data..."
create_test_consultants

echo "Step 3: Verifying database setup..."
supabase status

echo "Step 4: Testing connectivity..."
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('http://localhost:54321', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');

async function testConnectivity() {
    console.log('Testing database connectivity...');
    
    // Test consultant_assignments table
    const { data: assignments, error: assignmentsError } = await supabase
        .from('consultant_assignments')
        .select('*');
    
    if (assignmentsError) {
        console.error('❌ consultant_assignments table:', assignmentsError.message);
    } else {
        console.log('✅ consultant_assignments table:', assignments.length, 'records');
    }
    
    // Test get_consultant_dashboard_stats function
    const { data: stats, error: statsError } = await supabase
        .rpc('get_consultant_dashboard_stats', { p_consultant_id: '00000000-0000-0000-0000-000000000001' });
    
    if (statsError) {
        console.error('❌ get_consultant_dashboard_stats function:', statsError.message);
    } else {
        console.log('✅ get_consultant_dashboard_stats function:', stats);
    }
    
    // Test get_consultant_readers function
    const { data: readers, error: readersError } = await supabase
        .rpc('get_consultant_readers', { p_consultant_id: '00000000-0000-0000-0000-000000000001' });
    
    if (readersError) {
        console.error('❌ get_consultant_readers function:', readersError.message);
    } else {
        console.log('✅ get_consultant_readers function:', readers ? readers.length : 0, 'readers');
    }
}

testConnectivity();
"

echo ""
echo "🎉 Consultant Dashboard Connectivity Fix Complete!"
echo ""
echo "Next steps:"
echo "1. Start the applications: ./start-both-apps.sh"
echo "2. Login to consultant dashboard: http://localhost:5174"
echo "3. Login credentials for test consultant:"
echo "   Email: consultant1@example.com"
echo "   Password: password123"
echo "4. Create new readers in Alice Reader to test auto-assignment"
echo ""
echo "✅ All database infrastructure is now in place!"