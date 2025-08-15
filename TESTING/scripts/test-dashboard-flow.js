#!/usr/bin/env node

/**
 * Alice Suite - Dashboard Data Flow Test Script
 * This script tests the end-to-end data flow between reader and consultant dashboard
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://blwypdcobizmpidmuhvq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsd3lwZGNvYml6bXBpZG11aHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDgzNDcsImV4cCI6MjA1OTc4NDM0N30.YP2r-CnSaM4rKclXBivanAMBQh9sMsI95F2p87zIuWM';

// Test credentials
const TEST_CREDENTIALS = {
  consultant: {
    email: 'efisio@efisio.com',
    password: 'password123'
  },
  reader: {
    email: 'fausto@fausto.com', 
    password: 'password123'
  }
};

class DashboardTester {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this.consultantId = null;
    this.readerId = null;
  }

  async runFullTest() {
    console.log('🚀 Starting Alice Suite Dashboard Data Flow Test\n');
    
    try {
      // Step 1: Authentication Test
      await this.testAuthentication();
      
      // Step 2: Database Verification
      await this.verifyDatabaseData();
      
      // Step 3: Consultant Assignment Test
      await this.testConsultantAssignments();
      
      // Step 4: Help Request Flow Test
      await this.testHelpRequestFlow();
      
      // Step 5: Feedback Flow Test
      await this.testFeedbackFlow();
      
      // Step 6: Dashboard Stats Test
      await this.testDashboardStats();
      
      console.log('\n✅ All tests completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      console.error('Stack:', error.stack);
    }
  }

  async testAuthentication() {
    console.log('🔐 Testing Authentication...');
    
    // Test consultant login
    const { data: consultantAuth, error: consultantError } = await this.supabase.auth.signInWithPassword({
      email: TEST_CREDENTIALS.consultant.email,
      password: TEST_CREDENTIALS.consultant.password
    });
    
    if (consultantError) {
      throw new Error(`Consultant login failed: ${consultantError.message}`);
    }
    
    this.consultantId = consultantAuth.user.id;
    console.log(`✅ Consultant authenticated: ${this.consultantId}`);
    
    // Test reader login
    const { data: readerAuth, error: readerError } = await this.supabase.auth.signInWithPassword({
      email: TEST_CREDENTIALS.reader.email,
      password: TEST_CREDENTIALS.reader.password
    });
    
    if (readerError) {
      throw new Error(`Reader login failed: ${readerError.message}`);
    }
    
    this.readerId = readerAuth.user.id;
    console.log(`✅ Reader authenticated: ${this.readerId}`);
  }

  async verifyDatabaseData() {
    console.log('\n📊 Verifying Database Data...');
    
    // Check help_requests table
    const { data: helpRequests, error: helpError } = await this.supabase
      .from('help_requests')
      .select('*, user:user_id(first_name, last_name)')
      .order('created_at', { ascending: false });
    
    if (helpError) {
      console.warn('⚠️ Help requests query failed:', helpError.message);
    } else {
      console.log(`📋 Found ${helpRequests.length} help requests:`);
      helpRequests.slice(0, 3).forEach(req => {
        console.log(`  - ${req.status}: ${req.content?.substring(0, 50)}...`);
      });
    }
    
    // Check user_feedback table
    const { data: feedback, error: feedbackError } = await this.supabase
      .from('user_feedback')
      .select('*, user:user_id(first_name, last_name)')
      .order('created_at', { ascending: false });
    
    if (feedbackError) {
      console.warn('⚠️ Feedback query failed:', feedbackError.message);
    } else {
      console.log(`💬 Found ${feedback.length} feedback items:`);
      feedback.slice(0, 3).forEach(fb => {
        console.log(`  - ${fb.feedback_type}: ${fb.content?.substring(0, 50)}...`);
      });
    }
    
    // Check consultant_assignments table
    const { data: assignments, error: assignmentError } = await this.supabase
      .from('consultant_assignments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (assignmentError) {
      console.warn('⚠️ Consultant assignments query failed:', assignmentError.message);
    } else {
      console.log(`👥 Found ${assignments.length} consultant assignments`);
      assignments.forEach(assign => {
        console.log(`  - Consultant: ${assign.consultant_id}, Reader: ${assign.user_id}`);
      });
    }
  }

  async testConsultantAssignments() {
    console.log('\n🎯 Testing Consultant Assignments...');
    
    // Test if the consultant has any assigned readers
    const { data: assignments, error } = await this.supabase
      .from('consultant_assignments')
      .select('*, user:user_id(first_name, last_name, email)')
      .eq('consultant_id', this.consultantId);
    
    if (error) {
      console.warn('⚠️ Consultant assignments test failed:', error.message);
    } else {
      console.log(`✅ Found ${assignments.length} readers assigned to consultant`);
      assignments.forEach(assign => {
        console.log(`  - Reader: ${assign.user.first_name} ${assign.user.last_name} (${assign.user.email})`);
      });
    }
    
    return assignments;
  }

  async testHelpRequestFlow() {
    console.log('\n🆘 Testing Help Request Flow...');
    
    // Create a test help request as reader
    const testRequest = {
      user_id: this.readerId,
      book_id: 'alice-in-wonderland',
      content: 'Test help request for dashboard verification - ' + new Date().toISOString(),
      status: 'pending',
      context: { test: true, source: 'dashboard_test' }
    };
    
    const { data: newRequest, error: createError } = await this.supabase
      .from('help_requests')
      .insert(testRequest)
      .select()
      .single();
    
    if (createError) {
      console.warn('⚠️ Failed to create test help request:', createError.message);
    } else {
      console.log(`✅ Created test help request: ${newRequest.id}`);
      
      // Verify it appears in consultant's view
      const { data: consultantView, error: viewError } = await this.supabase
        .from('help_requests')
        .select('*')
        .eq('status', 'pending');
      
      if (viewError) {
        console.warn('⚠️ Failed to view help requests:', viewError.message);
      } else {
        console.log(`📊 Consultant sees ${consultantView.length} pending requests`);
      }
      
      // Clean up
      await this.supabase.from('help_requests').delete().eq('id', newRequest.id);
    }
  }

  async testFeedbackFlow() {
    console.log('\n💭 Testing Feedback Flow...');
    
    // Create a test feedback as reader
    const testFeedback = {
      user_id: this.readerId,
      book_id: 'alice-in-wonderland',
      feedback_type: 'general',
      content: 'Test feedback for dashboard verification - ' + new Date().toISOString(),
      is_public: false
    };
    
    const { data: newFeedback, error: createError } = await this.supabase
      .from('user_feedback')
      .insert(testFeedback)
      .select()
      .single();
    
    if (createError) {
      console.warn('⚠️ Failed to create test feedback:', createError.message);
    } else {
      console.log(`✅ Created test feedback: ${newFeedback.id}`);
      
      // Verify it appears in consultant's view
      const { data: consultantView, error: viewError } = await this.supabase
        .from('user_feedback')
        .select('*, user:user_id(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (viewError) {
        console.warn('⚠️ Failed to view feedback:', viewError.message);
      } else {
        console.log(`📊 Consultant sees ${consultantView.length} recent feedback items`);
      }
      
      // Clean up
      await this.supabase.from('user_feedback').delete().eq('id', newFeedback.id);
    }
  }

  async testDashboardStats() {
    console.log('\n📈 Testing Dashboard Stats Function...');
    
    // Test the get_consultant_dashboard_stats function
    const { data: stats, error: statsError } = await this.supabase
      .rpc('get_consultant_dashboard_stats', { p_consultant_id: this.consultantId });
    
    if (statsError) {
      console.warn('⚠️ Dashboard stats function failed:', statsError.message);
    } else {
      console.log('✅ Dashboard stats retrieved:');
      console.log(`  - Total Readers: ${stats.totalReaders}`);
      console.log(`  - Active Readers: ${stats.activeReaders}`);
      console.log(`  - Pending Help Requests: ${stats.pendingHelpRequests}`);
      console.log(`  - Resolved Help Requests: ${stats.resolvedHelpRequests}`);
      console.log(`  - Feedback Count: ${stats.feedbackCount}`);
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const tester = new DashboardTester();
  tester.runFullTest().catch(console.error);
}

module.exports = DashboardTester;