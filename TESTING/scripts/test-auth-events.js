#!/usr/bin/env node

/**
 * End-to-End Test for Authentication Events
 * This script tests the real-time authentication event flow
 */

const io = require('socket.io-client');
const axios = require('axios');

// Test configuration
const READER_URL = 'http://localhost:5173';
const CONSULTANT_URL = 'http://localhost:5174';
const REALTIME_SERVER = 'http://localhost:3001';

// Test data
const testReader = {
  email: 'test-reader@example.com',
  password: 'testpassword123'
};

const testConsultant = {
  email: 'consultant@alice.com',
  password: 'consultant123'
};

class AuthEventTester {
  constructor() {
    this.readerSocket = null;
    this.consultantSocket = null;
    this.events = [];
  }

  async initialize() {
    console.log('🧪 Starting Authentication Event E2E Test...\n');
    
    // Test real-time server connection
    await this.testRealtimeServer();
    
    // Test consultant notifications
    await this.testConsultantNotifications();
    
    // Test reader authentication events
    await this.testReaderAuthEvents();
    
    // Generate test report
    this.generateReport();
  }

  async testRealtimeServer() {
    console.log('📡 Testing Real-time Server...');
    
    try {
      const response = await axios.get(`${REALTIME_SERVER}/health`);
      console.log(`✅ Real-time server is running (Status: ${response.status})`);
    } catch (error) {
      console.log('❌ Real-time server not responding');
      process.exit(1);
    }
  }

  async testConsultantNotifications() {
    console.log('👩‍🏫 Testing Consultant Notifications...');
    
    return new Promise((resolve) => {
      // Connect as consultant
      this.consultantSocket = io(REALTIME_SERVER, {
        auth: {
          token: 'consultant-test-token',
          role: 'consultant'
        }
      });

      this.consultantSocket.on('connect', () => {
        console.log('✅ Consultant connected to real-time server');
      });

      this.consultantSocket.on('reader-activity', (data) => {
        console.log('📢 Consultant received event:', data);
        this.events.push({
          type: 'consultant_notification',
          data,
          timestamp: new Date()
        });
      });

      this.consultantSocket.on('online-readers', (data) => {
        console.log(`👥 Online readers update: ${data.readers?.length || 0} readers`);
      });

      setTimeout(resolve, 2000); // Wait for connection
    });
  }

  async testReaderAuthEvents() {
    console.log('📖 Testing Reader Authentication Events...');
    
    return new Promise((resolve) => {
      // Connect as reader
      this.readerSocket = io(REALTIME_SERVER, {
        auth: {
          token: 'reader-test-token',
          role: 'reader'
        }
      });

      this.readerSocket.on('connect', () => {
        console.log('✅ Reader connected to real-time server');
      });

      // Simulate login event
      setTimeout(() => {
        this.readerSocket.emit('reader-event', {
          eventType: 'LOGIN',
          userId: 'test-reader-123',
          userEmail: testReader.email,
          userName: 'Test Reader',
          timestamp: new Date().toISOString(),
          metadata: {
            device: 'desktop',
            browser: 'Chrome',
            ipAddress: '127.0.0.1'
          }
        });
        console.log('📤 Emulated LOGIN event');
      }, 1000);

      // Simulate logout event
      setTimeout(() => {
        this.readerSocket.emit('reader-event', {
          eventType: 'LOGOUT',
          userId: 'test-reader-123',
          userEmail: testReader.email,
          userName: 'Test Reader',
          timestamp: new Date().toISOString(),
          metadata: {
            loginDuration: 1800 // 30 minutes
          }
        });
        console.log('📤 Emulated LOGOUT event');
      }, 3000);

      setTimeout(resolve, 5000);
    });
  }

  generateReport() {
    console.log('\n📊 Test Report:');
    console.log('================');
    
    const loginEvents = this.events.filter(e => e.data?.eventType === 'LOGIN');
    const logoutEvents = this.events.filter(e => e.data?.eventType === 'LOGOUT');
    
    console.log(`✅ LOGIN events received: ${loginEvents.length}`);
    console.log(`✅ LOGOUT events received: ${logoutEvents.length}`);
    console.log(`📋 Total events: ${this.events.length}`);
    
    if (this.events.length > 0) {
      console.log('\n📋 Event Details:');
      this.events.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.data?.eventType} - ${event.data?.userEmail}`);
      });
    }

    console.log('\n🎯 Test Results:');
    if (loginEvents.length > 0 && logoutEvents.length > 0) {
      console.log('✅ Authentication events are working correctly!');
      console.log('✅ Real-time notifications are being delivered to consultants');
      console.log('✅ End-to-end flow is operational');
    } else {
      console.log('⚠️  Some tests failed or timed out');
    }

    // Cleanup
    if (this.readerSocket) this.readerSocket.disconnect();
    if (this.consultantSocket) this.consultantSocket.disconnect();
    
    console.log('\n🧪 Test completed!');
  }
}

// Run tests
if (require.main === module) {
  const tester = new AuthEventTester();
  tester.initialize().catch(console.error);
}

module.exports = AuthEventTester;