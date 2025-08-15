import { ConsultantRealtimeService } from '../realtime-service';
import { ConsultantRealtimeClient } from '@alice-suite/api-client/realtime';

// Mock the realtime client
jest.mock('@alice-suite/api-client/realtime');

const MockConsultantRealtimeClient = ConsultantRealtimeClient as jest.MockedClass<typeof ConsultantRealtimeClient>;

describe('Real-time Authentication Events Integration', () => {
  let service: ConsultantRealtimeService;
  let mockClient: jest.Mocked<ConsultantRealtimeClient>;
  let mockGetToken: jest.Mock<Promise<string | null>>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetToken = jest.fn().mockResolvedValue('test-token');
    service = new ConsultantRealtimeService(mockGetToken);
    mockClient = new MockConsultantRealtimeClient() as jest.Mocked<ConsultantRealtimeClient>;
    
    // Setup mock client methods
    mockClient.disconnect = jest.fn();
    mockClient.subscribeToAllEvents = jest.fn();
    mockClient.onReaderActivity = jest.fn();
    mockClient.onOnlineReaders = jest.fn();
    mockClient.onRecentEvents = jest.fn();
    mockClient.getOnlineReaders = jest.fn();
    mockClient.getRecentEvents = jest.fn();
    mockClient.isConnected = jest.fn().mockReturnValue(true);
    mockClient.updateToken = jest.fn();
  });

  describe('Authentication Event Handling', () => {
    it('should receive LOGIN events from readers', async () => {
      const loginEvent = {
        userId: 'reader-123',
        firstName: 'Alice',
        lastName: 'Smith',
        eventType: 'LOGIN',
        data: {
          email: 'alice@example.com',
          deviceInfo: {
            userAgent: 'Mozilla/5.0...',
            platform: 'MacIntel',
            screenWidth: 1920,
            screenHeight: 1080
          },
          location: {
            ip: '192.168.1.100',
            country: 'US',
            city: 'New York'
          }
        },
        timestamp: new Date()
      };

      let receivedActivity: any = null;
      service.onReaderActivity((activity) => {
        receivedActivity = activity;
      });

      // Simulate receiving the event
      const callback = mockClient.onReaderActivity.mock.calls[0][0];
      callback(loginEvent);

      expect(receivedActivity).toEqual(loginEvent);
      expect(receivedActivity.eventType).toBe('LOGIN');
      expect(receivedActivity.firstName).toBe('Alice');
      expect(receivedActivity.data.deviceInfo).toBeDefined();
    });

    it('should receive LOGOUT events with session duration', async () => {
      const logoutEvent = {
        userId: 'reader-456',
        firstName: 'Bob',
        lastName: 'Johnson',
        eventType: 'LOGOUT',
        data: {
          sessionDuration: 1800000, // 30 minutes in milliseconds
          deviceInfo: {
            userAgent: 'Mozilla/5.0...',
            platform: 'Windows'
          },
          location: {
            ip: '10.0.0.1',
            country: 'US',
            city: 'Los Angeles'
          }
        },
        timestamp: new Date()
      };

      let receivedActivity: any = null;
      service.onReaderActivity((activity) => {
        receivedActivity = activity;
      });

      // Simulate receiving the event
      const callback = mockClient.onReaderActivity.mock.calls[0][0];
      callback(logoutEvent);

      expect(receivedActivity).toEqual(logoutEvent);
      expect(receivedActivity.eventType).toBe('LOGOUT');
      expect(receivedActivity.data.sessionDuration).toBe(1800000);
    });

    it('should update online readers list when users log in/out', async () => {
      const initialReaders = [
        {
          userId: 'reader-1',
          firstName: 'Alice',
          lastName: 'Smith',
          lastActivity: new Date(),
          currentBook: 'Pride and Prejudice',
          currentPage: 42
        }
      ];

      let currentReaders: any[] = [];
      service.onOnlineReaders((data) => {
        currentReaders = data.readers;
      });

      // Initial online readers
      const onlineCallback = mockClient.onOnlineReaders.mock.calls[0][0];
      onlineCallback({ count: 1, readers: initialReaders });

      expect(currentReaders).toHaveLength(1);
      expect(currentReaders[0].firstName).toBe('Alice');

      // Simulate user logging out
      const updatedReaders = [];
      onlineCallback({ count: 0, readers: updatedReaders });

      expect(currentReaders).toHaveLength(0);
    });

    it('should handle multiple concurrent login/logout events', async () => {
      const events = [
        {
          userId: 'reader-1',
          firstName: 'Alice',
          lastName: 'Smith',
          eventType: 'LOGIN',
          data: { email: 'alice@example.com' },
          timestamp: new Date(Date.now() - 60000)
        },
        {
          userId: 'reader-2',
          firstName: 'Bob',
          lastName: 'Johnson',
          eventType: 'LOGIN',
          data: { email: 'bob@example.com' },
          timestamp: new Date(Date.now() - 30000)
        },
        {
          userId: 'reader-1',
          firstName: 'Alice',
          lastName: 'Smith',
          eventType: 'LOGOUT',
          data: { sessionDuration: 3600000 }, // 1 hour
          timestamp: new Date()
        }
      ];

      const receivedActivities: any[] = [];
      service.onReaderActivity((activity) => {
        receivedActivities.push(activity);
      });

      // Simulate receiving all events
      const callback = mockClient.onReaderActivity.mock.calls[0][0];
      events.forEach(event => callback(event));

      expect(receivedActivities).toHaveLength(3);
      expect(receivedActivities[0].eventType).toBe('LOGIN');
      expect(receivedActivities[1].eventType).toBe('LOGIN');
      expect(receivedActivities[2].eventType).toBe('LOGOUT');
      expect(receivedActivities[2].userId).toBe('reader-1');
    });

    it('should handle real-time connection lifecycle', async () => {
      // Test connection
      await service.connect();
      expect(mockClient.subscribeToAllEvents).toHaveBeenCalled();

      // Test disconnection
      service.disconnect();
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should handle authentication token updates', async () => {
      await service.connect();
      
      const newToken = 'new-test-token';
      service.updateToken(newToken);
      
      expect(mockClient.updateToken).toHaveBeenCalledWith(newToken);
    });
  });

  describe('Recent Events Retrieval', () => {
    it('should retrieve recent authentication events', async () => {
      const mockEvents = [
        {
          userId: 'reader-789',
          firstName: 'Charlie',
          lastName: 'Brown',
          eventType: 'LOGIN',
          data: { email: 'charlie@example.com' },
          timestamp: new Date(Date.now() - 3600000) // 1 hour ago
        },
        {
          userId: 'reader-789',
          firstName: 'Charlie',
          lastName: 'Brown',
          eventType: 'LOGOUT',
          data: { sessionDuration: 1800000 }, // 30 minutes
          timestamp: new Date()
        }
      ];

      let retrievedEvents: any[] = [];
      service.onRecentEvents((data) => {
        retrievedEvents = data.events;
      });

      // Simulate receiving recent events
      const recentCallback = mockClient.onRecentEvents.mock.calls[0][0];
      recentCallback({ events: mockEvents });

      expect(retrievedEvents).toHaveLength(2);
      expect(retrievedEvents[0].eventType).toBe('LOGIN');
      expect(retrievedEvents[1].eventType).toBe('LOGOUT');
    });

    it('should filter events by user ID', async () => {
      const specificUserEvents = [
        {
          userId: 'specific-user-123',
          firstName: 'Diana',
          lastName: 'Prince',
          eventType: 'LOGIN',
          data: { email: 'diana@example.com' },
          timestamp: new Date()
        }
      ];

      service.getRecentEvents(10, 'specific-user-123');

      expect(mockClient.getRecentEvents).toHaveBeenCalledWith(10, 'specific-user-123');
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      mockGetToken.mockResolvedValue(null);

      await expect(service.connect()).rejects.toThrow('No authentication token available');
    });

    it('should handle client initialization errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockGetToken.mockRejectedValue(new Error('Token retrieval failed'));

      await expect(service.connect()).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Failed to connect to realtime service:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});