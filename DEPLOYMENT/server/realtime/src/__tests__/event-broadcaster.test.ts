import { EventBroadcaster } from '../services/event-broadcaster';
import { RedisService } from '../services/redis.service';
import { Server } from 'socket.io';
import { RealTimeEvent } from '../types';

describe('EventBroadcaster', () => {
  let broadcaster: EventBroadcaster;
  let mockRedis: jest.Mocked<RedisService>;
  let mockIO: jest.Mocked<Server>;

  beforeEach(() => {
    mockRedis = {
      storeEvent: jest.fn(),
      setUserOnline: jest.fn(),
      getOnlineUsers: jest.fn(),
      getUserLastSeen: jest.fn(),
      getRecentEvents: jest.fn(),
      publishEvent: jest.fn(),
      subscribeToChannel: jest.fn(),
      unsubscribeFromChannel: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as any;

    mockIO = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      rooms: new Map(),
    } as any;

    broadcaster = new EventBroadcaster(mockIO, mockRedis);
  });

  describe('broadcastEvent', () => {
    it('should broadcast event to appropriate rooms', async () => {
      const event: RealTimeEvent = {
        id: 'test-id',
        userId: 'user-1',
        eventType: 'LOGIN',
        eventData: { foo: 'bar' },
        timestamp: new Date(),
        sessionId: 'session-1'
      };

      await broadcaster.broadcastEvent(event);

      expect(mockRedis.storeEvent).toHaveBeenCalledWith(event);
      expect(mockIO.to).toHaveBeenCalledWith('consultants');
      expect(mockIO.to).toHaveBeenCalledWith('user:user-1');
      expect(mockIO.to).toHaveBeenCalledWith('event:LOGIN');
      expect(mockIO.emit).toHaveBeenCalledWith('reader-activity', {
        userId: event.userId,
        eventType: event.eventType,
        data: event.eventData,
        timestamp: event.timestamp,
      });
    });

    it('should update online readers on login/logout', async () => {
      const loginEvent: RealTimeEvent = {
        id: 'test-id',
        userId: 'user-1',
        eventType: 'LOGIN',
        eventData: { foo: 'bar' },
        timestamp: new Date(),
        sessionId: 'session-1'
      };

      mockRedis.getOnlineUsers.mockResolvedValue(['user-1', 'user-2']);
      mockRedis.getUserLastSeen.mockResolvedValue(new Date());

      await broadcaster.broadcastEvent(loginEvent);

      expect(mockIO.to).toHaveBeenCalledWith('consultants');
      expect(mockIO.emit).toHaveBeenCalledWith('online-readers', expect.objectContaining({
        count: 2,
        readers: expect.any(Array)
      }));
    });
  });

  describe('joinRoom', () => {
    it('should join socket to room and send initial data', async () => {
      const mockSocket = {
        join: jest.fn(),
        emit: jest.fn(),
        user: { id: 'consultant-1', role: 'consultant' }
      } as any;

      mockRedis.getOnlineUsers.mockResolvedValue(['user-1']);
      mockRedis.getUserLastSeen.mockResolvedValue(new Date());

      await broadcaster.joinRoom(mockSocket, 'consultants');

      expect(mockSocket.join).toHaveBeenCalledWith('consultants');
      expect(mockSocket.emit).toHaveBeenCalledWith('online-readers', expect.objectContaining({
        count: 1,
        readers: expect.any(Array)
      }));
    });
  });

  describe('handleUserConnection', () => {
    it('should handle consultant connection', async () => {
      const mockSocket = {
        join: jest.fn(),
        user: { id: 'consultant-1', role: 'consultant' }
      } as any;

      mockRedis.setUserOnline.mockResolvedValue(undefined);
      mockRedis.getOnlineUsers.mockResolvedValue(['user-1']);
      mockRedis.getUserLastSeen.mockResolvedValue(new Date());

      await broadcaster.handleUserConnection(mockSocket);

      expect(mockRedis.setUserOnline).toHaveBeenCalledWith('consultant-1', true);
      expect(mockSocket.join).toHaveBeenCalledWith('consultants');
      expect(mockSocket.join).toHaveBeenCalledWith('support');
    });

    it('should handle reader connection', async () => {
      const mockSocket = {
        join: jest.fn(),
        user: { id: 'reader-1', role: 'reader' }
      } as any;

      mockRedis.setUserOnline.mockResolvedValue(undefined);

      await broadcaster.handleUserConnection(mockSocket);

      expect(mockRedis.setUserOnline).toHaveBeenCalledWith('reader-1', true);
      expect(mockSocket.join).toHaveBeenCalledWith('user:reader-1');
    });
  });

  describe('handleUserDisconnection', () => {
    it('should handle user disconnection', async () => {
      const mockSocket = {
        rooms: new Set(['room1', 'room2']),
        leave: jest.fn(),
        user: { id: 'user-1' }
      } as any;

      mockRedis.setUserOnline.mockResolvedValue(undefined);
      mockRedis.getOnlineUsers.mockResolvedValue([]);

      await broadcaster.handleUserDisconnection(mockSocket);

      expect(mockRedis.setUserOnline).toHaveBeenCalledWith('user-1', false);
      expect(mockSocket.leave).toHaveBeenCalledWith('room1');
      expect(mockSocket.leave).toHaveBeenCalledWith('room2');
    });
  });

  describe('room management', () => {
    it('should track room occupants', () => {
      expect(broadcaster.getRoomOccupants('test-room')).toBe(0);
    });

    it('should return all rooms', () => {
      expect(broadcaster.getAllRooms()).toEqual([]);
    });
  });
});