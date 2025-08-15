import { RedisService } from '../services/redis.service';

jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    publish: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    lPush: jest.fn(),
    expire: jest.fn(),
    lRange: jest.fn(),
    keys: jest.fn(),
    sAdd: jest.fn(),
    sRem: jest.fn(),
    sMembers: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    zAdd: jest.fn(),
    zPopMin: jest.fn(),
    zCard: jest.fn(),
    lLen: jest.fn(),
    del: jest.fn()
  }))
}));

describe('RedisService', () => {
  let redisService: RedisService;
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      publish: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      lPush: jest.fn(),
      expire: jest.fn(),
      lRange: jest.fn(),
      keys: jest.fn(),
      sAdd: jest.fn(),
      sRem: jest.fn(),
      sMembers: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
      zAdd: jest.fn(),
      zPopMin: jest.fn(),
      zCard: jest.fn(),
      lLen: jest.fn(),
      del: jest.fn()
    };

    redisService = new RedisService({
      host: 'localhost',
      port: 6379
    });

    // @ts-ignore
    redisService['publisher'] = mockClient;
    // @ts-ignore
    redisService['subscriber'] = mockClient;
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      mockClient.connect.mockResolvedValue(undefined);

      await redisService.connect();

      expect(mockClient.connect).toHaveBeenCalledTimes(2);
      expect(redisService['isConnected']).toBe(true);
    });

    it('should throw error on connection failure', async () => {
      const error = new Error('Connection failed');
      mockClient.connect.mockRejectedValue(error);

      await expect(redisService.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('publishEvent', () => {
    it('should publish event successfully', async () => {
      mockClient.publish.mockResolvedValue(1);

      const event = {
        id: 'test-id',
        userId: 'user-1',
        eventType: 'LOGIN',
        eventData: { foo: 'bar' },
        timestamp: new Date(),
        sessionId: 'session-1'
      };

      await redisService.publishEvent('test-channel', event);

      expect(mockClient.publish).toHaveBeenCalledWith(
        'test-channel',
        JSON.stringify(event)
      );
    });

    it('should throw error when not connected', async () => {
      // @ts-ignore
      redisService['isConnected'] = false;

      const event = {
        id: 'test-id',
        userId: 'user-1',
        eventType: 'LOGIN',
        eventData: { foo: 'bar' },
        timestamp: new Date(),
        sessionId: 'session-1'
      };

      await expect(redisService.publishEvent('test-channel', event))
        .rejects.toThrow('Redis not connected');
    });
  });

  describe('storeEvent', () => {
    it('should store event successfully', async () => {
      mockClient.lPush.mockResolvedValue(1);
      mockClient.expire.mockResolvedValue(1);

      const event = {
        id: 'test-id',
        userId: 'user-1',
        eventType: 'LOGIN',
        eventData: { foo: 'bar' },
        timestamp: new Date(),
        sessionId: 'session-1'
      };

      await redisService.storeEvent(event);

      expect(mockClient.lPush).toHaveBeenCalledWith(
        `events:${event.userId}:${event.sessionId}`,
        JSON.stringify(event)
      );
      expect(mockClient.expire).toHaveBeenCalledWith(
        `events:${event.userId}:${event.sessionId}`,
        86400
      );
    });
  });

  describe('setUserOnline', () => {
    it('should set user online', async () => {
      mockClient.sAdd.mockResolvedValue(1);
      mockClient.set.mockResolvedValue('OK');

      await redisService.setUserOnline('user-1', true);

      expect(mockClient.sAdd).toHaveBeenCalledWith('online_users', 'user-1');
      expect(mockClient.set).toHaveBeenCalledWith(
        expect.stringMatching(/user_last_seen:user-1/),
        expect.any(String)
      );
    });

    it('should set user offline', async () => {
      mockClient.sRem.mockResolvedValue(1);

      await redisService.setUserOnline('user-1', false);

      expect(mockClient.sRem).toHaveBeenCalledWith('online_users', 'user-1');
    });
  });

  describe('getOnlineUsers', () => {
    it('should return online users', async () => {
      const mockUsers = ['user-1', 'user-2'];
      mockClient.sMembers.mockResolvedValue(mockUsers);

      const result = await redisService.getOnlineUsers();

      expect(mockClient.sMembers).toHaveBeenCalledWith('online_users');
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array on error', async () => {
      mockClient.sMembers.mockRejectedValue(new Error('Redis error'));

      const result = await redisService.getOnlineUsers();

      expect(result).toEqual([]);
    });
  });
});