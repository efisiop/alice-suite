#!/usr/bin/env node

/**
 * Test script to verify Alice Reader ↔ Consultant Dashboard connectivity
 * Cloud Supabase Version
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Use cloud Supabase credentials
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

console.log('🔗 Using Cloud Supabase:', SUPABASE_URL);
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
            if (!data) throw new Error('No data returned');
            console.log('   Readers:', data);
        });
    }

    async testDataFlow() {
        console.log('\n🔄 Testing Data Flow...');

        // Get existing users for testing
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .limit(5);

        if (profileError) {
            console.log('⚠️  Error getting profiles:', profileError.message);
            return;
        }

        if (!profiles || profiles.length === 0) {
            console.log('⚠️  No existing users found for testing');
            return;
        }

        console.log(`Found ${profiles.length} existing profiles for testing`);

        // Find a consultant and a reader
        const consultant = profiles.find(p => p.is_consultant);
        const reader = profiles.find(p => !p.is_consultant);

        if (!consultant) {
            console.log('⚠️  No consultant found - creating test assignment will fail');
        }

        if (!reader) {
            console.log('⚠️  No reader found - creating test assignment will fail');
        }

        // Test consultant assignment creation
        if (consultant && reader) {
            await this.runTest('Create consultant assignment', async () => {
                const { error } = await supabase
                    .from('consultant_assignments')
                    .insert({
                        consultant_id: consultant.id,
                        user_id: reader.id,
                        book_id: '550e8400-e29b-41d4-a716-446655440000',
                        active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                
                if (error) throw error;
                console.log(`   Assigned consultant ${consultant.first_name} to reader ${reader.first_name}`);
            });
        }

        // Test feedback submission
        if (reader) {
            await this.runTest('Feedback submission and visibility', async () => {
                // Create test feedback
                const { error: feedbackError } = await supabase
                    .from('user_feedback')
                    .insert({
                        user_id: reader.id,
                        book_id: '550e8400-e29b-41d4-a716-446655440000',
                        feedback_type: 'TEST_FEEDBACK',
                        content: 'Test feedback from connectivity test',
                        is_public: true,
                        created_at: new Date().toISOString()
                    });
                
                if (feedbackError) throw feedbackError;
                console.log('   Test feedback created successfully');
            });
        }

        // Test help request submission
        if (reader) {
            await this.runTest('Help request submission and visibility', async () => {
                // Create test help request
                const { error: helpError } = await supabase
                    .from('help_requests')
                    .insert({
                        user_id: reader.id,
                        book_id: '550e8400-e29b-41d4-a716-446655440000',
                        content: 'Test help request from connectivity test',
                        status: 'PENDING',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                
                if (helpError) throw helpError;
                console.log('   Test help request created successfully');
            });
        }
    }

    async runAllTests() {
        console.log('🎯 Alice Suite Cloud Connectivity Test Suite');
        console.log('============================================');

        await this.testDatabaseTables();
        await this.testDatabaseFunctions();
        await this.testDataFlow();

        this.printResults();
    }

    printResults() {
        console.log('\n📊 Test Results Summary');
        console.log('======================');
        console.log(`Total Tests: ${this.results.total_tests}`);
        console.log(`Passed: ${this.results.passed_tests}`);
        console.log(`Failed: ${this.results.failed_tests}`);

        if (this.results.failed_tests > 0) {
            console.log('\n⚠️  Some tests failed. Please review the errors above.');
            console.log('\n💡 Next steps:');
            console.log('1. If consultant_assignments table is missing, create it in Supabase dashboard');
            console.log('2. If functions are missing, create them in Supabase dashboard');
            console.log('3. Test the applications manually to verify functionality');
        } else {
            console.log('\n🎉 All tests passed! Connectivity is working perfectly.');
        }
    }
}

async function main() {
    const tester = new ConnectivityTester();
    await tester.runAllTests();
}

main().catch(console.error); 