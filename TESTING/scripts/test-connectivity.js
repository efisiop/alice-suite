#!/usr/bin/env node

/**
 * Test script to verify Alice Reader ↔ Consultant Dashboard connectivity
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'http://localhost:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class ConnectivityTester {
    constructor() {
        this.results = {
            database: [],
            functions: [],
            data_flow: [],
            total_tests: 0,
            passed_tests: 0,
            failed_tests: 0
        };
    }

    async runTest(testName, testFunction) {
        this.results.total_tests++;
        try {
            console.log(`\n🧪 Testing: ${testName}`);
            await testFunction();
            console.log(`✅ PASSED: ${testName}`);
            this.results.passed_tests++;
            this.results.database.push({ name: testName, status: 'PASS' });
        } catch (error) {
            console.error(`❌ FAILED: ${testName}`);
            console.error(`   Error: ${error.message}`);
            this.results.failed_tests++;
            this.results.database.push({ name: testName, status: 'FAIL', error: error.message });
        }
    }

    async testDatabaseTables() {
        console.log('\n📊 Testing Database Tables...');

        // Test consultant_assignments table
        await this.runTest('consultant_assignments table exists', async () => {
            const { data, error } = await supabase
                .from('consultant_assignments')
                .select('*')
                .limit(1);
            
            if (error) throw error;
            console.log(`   Found ${data?.length || 0} assignment records`);
        });

        // Test help_requests table
        await this.runTest('help_requests table accessible', async () => {
            const { data, error } = await supabase
                .from('help_requests')
                .select('*')
                .limit(1);
            
            if (error) throw error;
            console.log(`   Found ${data?.length || 0} help request records`);
        });

        // Test user_feedback table
        await this.runTest('user_feedback table accessible', async () => {
            const { data, error } = await supabase
                .from('user_feedback')
                .select('*')
                .limit(1);
            
            if (error) throw error;
            console.log(`   Found ${data?.length || 0} feedback records`);
        });
    }

    async testDatabaseFunctions() {
        console.log('\n⚙️  Testing Database Functions...');

        const testConsultantId = '00000000-0000-0000-0000-000000000001';

        // Test get_consultant_dashboard_stats
        await this.runTest('get_consultant_dashboard_stats function', async () => {
            const { data, error } = await supabase
                .rpc('get_consultant_dashboard_stats', { p_consultant_id: testConsultantId });
            
            if (error) throw error;
            if (!data) throw new Error('No data returned');
            console.log('   Stats:', data);
        });

        // Test get_consultant_readers
        await this.runTest('get_consultant_readers function', async () => {
            const { data, error } = await supabase
                .rpc('get_consultant_readers', { p_consultant_id: testConsultantId });
            
            if (error) throw error;
            console.log(`   Found ${data ? data.length : 0} assigned readers`);
        });
    }

    async testDataFlow() {
        console.log('\n🔄 Testing Data Flow...');

        // Test 1: Create a test reader
        await this.runTest('Create test reader', async () => {
            const { data: user, error: userError } = await supabase.auth.signUp({
                email: 'test-reader-' + Date.now() + '@example.com',
                password: 'testpassword123'
            });

            if (userError) throw userError;
            if (!user.user) throw new Error('No user created');

            console.log(`   Created test reader: ${user.user.id}`);
            
            // Update profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ 
                    first_name: 'Test',
                    last_name: 'Reader',
                    book_id: '550e8400-e29b-41d4-a716-446655440000'
                })
                .eq('id', user.user.id);

            if (profileError) throw profileError;
            
            // Check if auto-assignment happened
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { data: assignment, error: assignmentError } = await supabase
                .from('consultant_assignments')
                .select('*')
                .eq('user_id', user.user.id)
                .single();

            if (assignmentError) throw assignmentError;
            console.log(`   Auto-assigned consultant: ${assignment?.consultant_id}`);
        });

        // Test 2: Submit feedback and check visibility
        await this.runTest('Feedback submission and visibility', async () => {
            // Get a test user
            const { data: users } = await supabase
                .from('profiles')
                .select('id')
                .limit(1);

            if (!users || users.length === 0) throw new Error('No test users found');
            const userId = users[0].id;

            // Submit feedback
            const { data: feedback, error: feedbackError } = await supabase
                .from('user_feedback')
                .insert({
                    user_id: userId,
                    book_id: '550e8400-e29b-41d4-a716-446655440000',
                    feedback_type: 'general',
                    content: 'Test feedback for connectivity testing'
                })
                .select()
                .single();

            if (feedbackError) throw feedbackError;
            console.log('   Submitted feedback:', feedback.id);

            // Check if feedback appears for consultant
            const { data: consultantAssignments } = await supabase
                .from('consultant_assignments')
                .select('consultant_id')
                .eq('user_id', userId)
                .single();

            if (!consultantAssignments) throw new Error('User not assigned to consultant');

            const { data: consultantFeedback } = await supabase
                .from('user_feedback')
                .select('*')
                .eq('user_id', userId);

            console.log(`   Consultant can see ${consultantFeedback?.length || 0} feedback items`);
        });

        // Test 3: Submit help request and check visibility
        await this.runTest('Help request submission and visibility', async () => {
            // Get a test user
            const { data: users } = await supabase
                .from('profiles')
                .select('id')
                .limit(1);

            if (!users || users.length === 0) throw new Error('No test users found');
            const userId = users[0].id;

            // Submit help request
            const { data: helpRequest, error: helpError } = await supabase
                .from('help_requests')
                .insert({
                    user_id: userId,
                    book_id: '550e8400-e29b-41d4-a716-446655440000',
                    title: 'Test help request',
                    content: 'Test help request for connectivity testing',
                    status: 'pending'
                })
                .select()
                .single();

            if (helpError) throw helpError;
            console.log('   Submitted help request:', helpRequest.id);

            // Check if help request appears correctly
            const { data: consultantHelpRequests } = await supabase
                .from('help_requests')
                .select('*')
                .eq('user_id', userId);

            console.log(`   Consultant can see ${consultantHelpRequests?.length || 0} help requests`);
        });
    }

    async runAllTests() {
        console.log('🎯 Alice Suite Connectivity Test Suite');
        console.log('=======================================');

        try {
            await this.testDatabaseTables();
            await this.testDatabaseFunctions();
            await this.testDataFlow();

            console.log('\n📊 Test Results Summary');
            console.log('======================');
            console.log(`Total Tests: ${this.results.total_tests}`);
            console.log(`Passed: ${this.results.passed_tests}`);
            console.log(`Failed: ${this.results.failed_tests}`);

            if (this.results.failed_tests === 0) {
                console.log('\n🎉 All tests passed! The Reader ↔ Consultant Dashboard connectivity is working correctly.');
            } else {
                console.log('\n⚠️  Some tests failed. Please review the errors above.');
            }

            return this.results.failed_tests === 0;
        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            return false;
        }
    }
}

// Run the tests
async function main() {
    const tester = new ConnectivityTester();
    const success = await tester.runAllTests();
    
    if (!success) {
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = ConnectivityTester;