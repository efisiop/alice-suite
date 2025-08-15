import { authService } from '../authService';
import { supabase } from '../supabase';
import { authClient } from '@alice-suite/api-client';

// Mock dependencies
jest.mock('../supabase');
jest.mock('@alice-suite/api-client');

const mockSupabaseAuth = {
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
  getUser: jest.fn(),
  getSession: jest.fn(),
  onAuthStateChange: jest.fn()
};

const mockAuthClient = {
  emitAuthEvent: jest.fn(),
  getCurrentUser: jest.fn()
};

beforeEach(() => {
  jest.clearAllMocks();
  (supabase.auth as any) = mockSupabaseAuth;
  (authClient as any) = mockAuthClient;
});

describe('AuthService - Authentication Events', () => {
  describe('signIn method', () => {
    it('should emit LOGIN event on successful authentication', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          first_name: 'John',
          last_name: 'Doe'
        }
      };

      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token123' } },
        error: null
      });

      mockAuthClient.emitAuthEvent.mockResolvedValue({ success: true });

      const result = await authService.signIn('test@example.com', 'password123');

      expect(result).toEqual({
        user: mockUser,
        error: null
      });

      expect(mockAuthClient.emitAuthEvent).toHaveBeenCalledWith({
        type: 'LOGIN',
        userId: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        timestamp: expect.any(String),
        sessionId: expect.any(String),
        deviceInfo: expect.objectContaining({
          userAgent: expect.any(String),
          platform: expect.any(String),
          screenWidth: expect.any(Number),
          screenHeight: expect.any(Number)
        }),
        location: expect.objectContaining({
          ip: expect.any(String),
          country: expect.any(String),
          city: expect.any(String)
        })
      });
    });

    it('should not emit event on authentication failure', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' }
      });

      const result = await authService.signIn('test@example.com', 'wrongpassword');

      expect(result).toEqual({
        user: null,
        error: { message: 'Invalid credentials' }
      });

      expect(mockAuthClient.emitAuthEvent).not.toHaveBeenCalled();
    });

    it('should handle emitAuthEvent failure gracefully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          first_name: 'John',
          last_name: 'Doe'
        }
      };

      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token123' } },
        error: null
      });

      mockAuthClient.emitAuthEvent.mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await authService.signIn('test@example.com', 'password123');

      expect(result).toEqual({
        user: mockUser,
        error: null
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to emit login event:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('signOut method', () => {
    beforeEach(() => {
      // Mock session tracking
      (authService as any).sessionStartTimes = new Map();
      (authService as any).sessionStartTimes.set('user-123', Date.now() - 300000); // 5 minutes ago
    });

    it('should emit LOGOUT event with session duration on successful sign out', async () => {
      mockSupabaseAuth.signOut.mockResolvedValue({ error: null });
      mockAuthClient.emitAuthEvent.mockResolvedValue({ success: true });

      const result = await authService.signOut('user-123');

      expect(result).toEqual({ error: null });

      expect(mockAuthClient.emitAuthEvent).toHaveBeenCalledWith({
        type: 'LOGOUT',
        userId: 'user-123',
        timestamp: expect.any(String),
        sessionDuration: expect.any(Number),
        deviceInfo: expect.objectContaining({
          userAgent: expect.any(String),
          platform: expect.any(String)
        }),
        location: expect.objectContaining({
          ip: expect.any(String),
          country: expect.any(String),
          city: expect.any(String)
        })
      });

      // Verify session duration is approximately 5 minutes (300 seconds)
      const callArgs = mockAuthClient.emitAuthEvent.mock.calls[0][0];
      expect(callArgs.sessionDuration).toBeGreaterThan(280000); // 280 seconds in ms
      expect(callArgs.sessionDuration).toBeLessThan(320000); // 320 seconds in ms
    });

    it('should emit LOGOUT event with 0 duration if no session start time', async () => {
      (authService as any).sessionStartTimes.clear();

      mockSupabaseAuth.signOut.mockResolvedValue({ error: null });
      mockAuthClient.emitAuthEvent.mockResolvedValue({ success: true });

      const result = await authService.signOut('user-456');

      expect(result).toEqual({ error: null });

      const callArgs = mockAuthClient.emitAuthEvent.mock.calls[0][0];
      expect(callArgs.sessionDuration).toBe(0);
    });

    it('should not emit event on sign out failure', async () => {
      mockSupabaseAuth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' }
      });

      const result = await authService.signOut('user-123');

      expect(result).toEqual({ error: { message: 'Sign out failed' } });
      expect(mockAuthClient.emitAuthEvent).not.toHaveBeenCalled();
    });

    it('should clean up session tracking data on sign out', async () => {
      const sessionStartTimes = (authService as any).sessionStartTimes;
      sessionStartTimes.set('user-123', Date.now());

      mockSupabaseAuth.signOut.mockResolvedValue({ error: null });
      mockAuthClient.emitAuthEvent.mockResolvedValue({ success: true });

      await authService.signOut('user-123');

      expect(sessionStartTimes.has('user-123')).toBe(false);
    });
  });

  describe('session tracking utilities', () => {
    it('should track session start time', () => {
      const sessionStartTimes = (authService as any).sessionStartTimes;
      const userId = 'test-user-123';
      const startTime = Date.now();

      (authService as any).trackSessionStart(userId);

      expect(sessionStartTimes.has(userId)).toBe(true);
      expect(sessionStartTimes.get(userId)).toBeGreaterThanOrEqual(startTime);
    });

    it('should calculate session duration correctly', () => {
      const sessionStartTimes = (authService as any).sessionStartTimes;
      const userId = 'test-user-123';
      const startTime = Date.now() - 60000; // 1 minute ago

      sessionStartTimes.set(userId, startTime);

      const duration = (authService as any).trackSessionEnd(userId);

      expect(duration).toBeGreaterThanOrEqual(60000); // 1 minute in ms
      expect(duration).toBeLessThan(62000); // Allow small variance
      expect(sessionStartTimes.has(userId)).toBe(false);
    });

    it('should return 0 duration if no session start time', () => {
      const sessionStartTimes = (authService as any).sessionStartTimes;
      const userId = 'non-existent-user';

      const duration = (authService as any).trackSessionEnd(userId);

      expect(duration).toBe(0);
    });
  });

  describe('device info collection', () => {
    it('should collect device information', () => {
      const deviceInfo = (authService as any).getDeviceInfo();

      expect(deviceInfo).toHaveProperty('userAgent');
      expect(deviceInfo).toHaveProperty('platform');
      expect(deviceInfo).toHaveProperty('screenWidth');
      expect(deviceInfo).toHaveProperty('screenHeight');
      expect(deviceInfo).toHaveProperty('viewportWidth');
      expect(deviceInfo).toHaveProperty('viewportHeight');
      expect(deviceInfo).toHaveProperty('language');
      expect(deviceInfo).toHaveProperty('timezone');
    });

    it('should handle missing screen properties gracefully', () => {
      const originalScreen = global.screen;
      delete (global as any).screen;

      const deviceInfo = (authService as any).getDeviceInfo();

      expect(deviceInfo.screenWidth).toBe(0);
      expect(deviceInfo.screenHeight).toBe(0);

      global.screen = originalScreen;
    });
  });

  describe('location data collection', () => {
    it('should collect location data', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          ip: '192.168.1.1',
          country: 'US',
          city: 'San Francisco'
        })
      };

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const location = await (authService as any).getLocationData();

      expect(location).toEqual({
        ip: '192.168.1.1',
        country: 'US',
        city: 'San Francisco'
      });
    });

    it('should handle location API failure gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const location = await (authService as any).getLocationData();

      expect(location).toEqual({
        ip: 'unknown',
        country: 'unknown',
        city: 'unknown'
      });
    });
  });
});