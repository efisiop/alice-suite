// src/services/authService.ts
import { registry } from '@services/serviceRegistry';
import { initManager } from './initManager';
import { authClient } from '@alice-suite/api-client';
import { appLog } from '../components/LogViewer';
import { handleServiceError } from '../utils/errorHandling';
import { mockBackend } from './mockBackend';
import { isBackendAvailable } from './backendConfig';
import { Session, User } from '@supabase/supabase-js';
import { logInteraction, InteractionEventType } from './loggingService';

// Authentication event types for real-time tracking
export interface AuthEventData {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  timestamp: Date;
  eventType: 'LOGIN' | 'LOGOUT' | 'SESSION_TIMEOUT' | 'USER_DISCONNECT';
  sessionDuration?: number;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    screenResolution: string;
    browser: string;
  };
  location?: {
    ip?: string;
    country?: string;
    city?: string;
  };
}

// Session tracking utilities
let sessionStartTimes: Map<string, Date> = new Map();

const getDeviceInfo = () => {
  const screen = window.screen;
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    browser: navigator.userAgent.match(/(chrome|safari|firefox|edge)/i)?.[1] || 'unknown'
  };
};

const getLocationData = async () => {
  try {
    // In production, use a geolocation service
    // For now, return basic info
    return {
      ip: 'unknown',
      country: 'unknown',
      city: 'unknown'
    };
  } catch (error) {
    return {
      ip: 'unknown',
      country: 'unknown',
      city: 'unknown'
    };
  }
};

const trackSessionStart = (userId: string) => {
  sessionStartTimes.set(userId, new Date());
};

const trackSessionEnd = async (userId: string): Promise<number> => {
  const startTime = sessionStartTimes.get(userId);
  sessionStartTimes.delete(userId);
  
  return startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0;
};

// Real-time event emitter
class AuthRealtimeEmitter {
  private static instance: AuthRealtimeEmitter;
  private eventCallbacks: ((event: AuthEventData) => void)[] = [];

  static getInstance(): AuthRealtimeEmitter {
    if (!AuthRealtimeEmitter.instance) {
      AuthRealtimeEmitter.instance = new AuthRealtimeEmitter();
    }
    return AuthRealtimeEmitter.instance;
  }

  on(callback: (event: AuthEventData) => void) {
    this.eventCallbacks.push(callback);
  }

  off(callback: (event: AuthEventData) => void) {
    this.eventCallbacks = this.eventCallbacks.filter(cb => cb !== callback);
  }

  async emit(event: AuthEventData) {
    // Emit to WebSocket server via shared API client
    try {
      const { authClient } = await import('@alice-suite/api-client');
      await authClient.emitAuthEvent(event);
    } catch (error) {
      appLog('AuthService', 'Failed to emit auth event', 'error', error);
    }

    // Emit to local callbacks
    this.eventCallbacks.forEach(callback => callback(event));
  }
}

const authRealtimeEmitter = AuthRealtimeEmitter.getInstance();

/**
 * Auth Service Interface
 */
export interface AuthServiceInterface {
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<any>;
  signOut: () => Promise<any>;
  getSession: () => Promise<any>;
  getUser: () => Promise<any>;
  getUserProfile: (userId: string) => Promise<any>;
  createUserProfile: (userId: string, data: any) => Promise<any>;
  updateUserProfile: (userId: string, data: any) => Promise<any>;
  onAuthStateChange: (callback: (event: any, session: Session | null) => void) => any;
  resetPassword: (email: string) => Promise<any>;
  verifyBookCode: (code: string) => Promise<any>;
}

/**
 * Create Auth Service
 *
 * Factory function to create the auth service implementation
 */
export const createAuthService = async (): Promise<AuthServiceInterface> => {
  appLog('AuthService', 'Creating auth service', 'info');

  // Helper function to check if we should use the real backend
  const useRealBackend = async (): Promise<boolean> => {
    return await isBackendAvailable();
  };

  // Create service implementation
  const authService: AuthServiceInterface = {
    signIn: async (email: string, password: string) => {
      try {
        appLog('AuthService', 'Signing in user', 'info');

        if (await useRealBackend()) {
          const result = await authClient.signIn(email, password);

          if (result.data?.user) {
            const user = result.data.user;
            
            // Get user profile for additional info
            const profileResult = await authClient.getUserProfile(user.id);
            const profile = profileResult.data;

            // Track session start
            trackSessionStart(user.id);

            // Log successful login
            await logInteraction(user.id, InteractionEventType.LOGIN, {
              content: 'User logged in successfully'
            }).catch(err => {
              appLog('AuthService', 'Error logging login interaction', 'error', err);
            });

            // Emit real-time auth event
            const authEvent: AuthEventData = {
              userId: user.id,
              email: user.email!,
              firstName: profile?.first_name,
              lastName: profile?.last_name,
              timestamp: new Date(),
              eventType: 'LOGIN',
              deviceInfo: getDeviceInfo(),
              location: await getLocationData()
            };

            await authRealtimeEmitter.emit(authEvent);
          }

          return result;
        } else {
          const mockResult = await mockBackend.auth.signIn(email, password);
          
          if (mockResult.data?.user) {
            trackSessionStart(mockResult.data.user.id);
            
            // Emit mock auth event
            const authEvent: AuthEventData = {
              userId: mockResult.data.user.id,
              email: mockResult.data.user.email!,
              firstName: 'Test',
              lastName: 'User',
              timestamp: new Date(),
              eventType: 'LOGIN',
              deviceInfo: getDeviceInfo(),
              location: await getLocationData()
            };
            
            await authRealtimeEmitter.emit(authEvent);
          }
          
          return mockResult;
        }
      } catch (error) {
        throw handleServiceError(error, 'authService', 'signIn');
      }
    },

    signUp: async (email: string, password: string, firstName?: string, lastName?: string) => {
      try {
        appLog('AuthService', 'Signing up user', 'info');

        if (await useRealBackend()) {
          const result = await authClient.signUp({
            email,
            password,
            firstName,
            lastName
          });
          return result;
        } else {
          return mockBackend.auth.signUp(email, password);
        }
      } catch (error) {
        throw handleServiceError(error, 'authService', 'signUp');
      }
    },

    signOut: async () => {
      try {
        appLog('AuthService', 'Signing out user', 'info');

        // Get current user before signing out
        let currentUser = null;
        let userProfile = null;
        
        if (await useRealBackend()) {
          const userResult = await authClient.getCurrentUser();
          currentUser = userResult.data?.user;
          
          if (currentUser) {
            const profileResult = await authClient.getUserProfile(currentUser.id);
            userProfile = profileResult.data;
          }
        } else {
          const mockUser = await mockBackend.auth.getUser();
          currentUser = mockUser.data?.user;
          userProfile = mockUser.data?.user ? {
            first_name: 'Test',
            last_name: 'User'
          } : null;
        }

        if (currentUser) {
          // Calculate session duration
          const sessionDuration = await trackSessionEnd(currentUser.id);

          // Emit real-time logout event
          const authEvent: AuthEventData = {
            userId: currentUser.id,
            email: currentUser.email!,
            firstName: userProfile?.first_name,
            lastName: userProfile?.last_name,
            timestamp: new Date(),
            eventType: 'LOGOUT',
            sessionDuration,
            deviceInfo: getDeviceInfo()
          };

          await authRealtimeEmitter.emit(authEvent);
        }

        if (await useRealBackend()) {
          const result = await authClient.signOut();
          return result;
        } else {
          return mockBackend.auth.signOut();
        }
      } catch (error) {
        throw handleServiceError(error, 'authService', 'signOut');
      }
    },

    getSession: async () => {
      try {
        appLog('AuthService', 'Getting session', 'info');

        if (await useRealBackend()) {
          const result = await authClient.getSession();
          return result;
        } else {
          return mockBackend.auth.getSession();
        }
      } catch (error) {
        throw handleServiceError(error, 'authService', 'getSession');
      }
    },

    getUser: async () => {
      try {
        appLog('AuthService', 'Getting user', 'info');

        if (await useRealBackend()) {
          const result = await authClient.getCurrentUser();
          return result;
        } else {
          return mockBackend.auth.getUser();
        }
      } catch (error) {
        throw handleServiceError(error, 'authService', 'getUser');
      }
    },

    getUserProfile: async (userId: string) => {
      try {
        appLog('AuthService', `Getting user profile for ${userId}`, 'info');

        if (await useRealBackend()) {
          const result = await authClient.getUserProfile(userId);
          return result;
        } else {
          return mockBackend.auth.getUserProfile(userId);
        }
      } catch (error) {
        throw handleServiceError(error, 'authService', 'getUserProfile');
      }
    },

    createUserProfile: async (userId: string, data: any) => {
      try {
        appLog('AuthService', `Creating user profile for ${userId}`, 'info');

        if (await useRealBackend()) {
          const result = await authClient.createUserProfile(userId, data);
          return result;
        } else {
          return mockBackend.auth.createUserProfile(userId, data);
        }
      } catch (error) {
        throw handleServiceError(error, 'authService', 'createUserProfile');
      }
    },

    updateUserProfile: async (userId: string, data: any) => {
      try {
        appLog('AuthService', `Updating user profile for ${userId}`, 'info');

        if (await useRealBackend()) {
          const result = await authClient.updateUserProfile(userId, data);
          return result;
        } else {
          return mockBackend.auth.updateUserProfile(userId, data);
        }
      } catch (error) {
        throw handleServiceError(error, 'authService', 'updateUserProfile');
      }
    },

    onAuthStateChange: (callback) => {
      try {
        appLog('AuthService', 'Setting up auth state change listener', 'info');

        if (useRealBackend()) {
          return authClient.onAuthStateChange(callback);
        } else {
          return mockBackend.auth.onAuthStateChange(callback);
        }
      } catch (error) {
        throw handleServiceError(error, 'authService', 'onAuthStateChange');
      }
    },

    resetPassword: async (email: string) => {
      try {
        appLog('AuthService', `Sending password reset email to ${email}`, 'info');

        if (await useRealBackend()) {
          const result = await authClient.resetPassword(email);
          return result;
        } else {
          return mockBackend.auth.resetPassword(email);
        }
      } catch (error) {
        throw handleServiceError(error, 'authService', 'resetPassword');
      }
    },

    verifyBookCode: async (code: string) => {
      try {
        appLog('AuthService', `Verifying book code: ${code}`, 'info');

        if (await useRealBackend()) {
          const result = await authClient.verifyBookCode(code);
          return result;
        } else {
          return mockBackend.auth.verifyBookCode(code);
        }
      } catch (error) {
        throw handleServiceError(error, 'authService', 'verifyBookCode');
      }
    }
  };

  return authService;
};

// Register initialization function
// The dependencies are automatically loaded from SERVICE_DEPENDENCIES
initManager.register('authService', async () => {
  const service = await createAuthService();
  registry.register('authService', service);
});

// Create backward-compatible exports
export const signIn = async (email: string, password: string) => {
  const service = await registry.getOrInitialize<AuthServiceInterface>('authService', initManager);
  return service.signIn(email, password);
};

export const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
  const service = await registry.getOrInitialize<AuthServiceInterface>('authService', initManager);
  return service.signUp(email, password, firstName, lastName);
};

export const signOut = async () => {
  const service = await registry.getOrInitialize<AuthServiceInterface>('authService', initManager);
  return service.signOut();
};

export const getSession = async () => {
  const service = await registry.getOrInitialize<AuthServiceInterface>('authService', initManager);
  return service.getSession();
};

export const getUser = async () => {
  const service = await registry.getOrInitialize<AuthServiceInterface>('authService', initManager);
  return service.getUser();
};

export const getUserProfile = async (userId: string) => {
  const service = await registry.getOrInitialize<AuthServiceInterface>('authService', initManager);
  return service.getUserProfile(userId);
};

export const createUserProfile = async (userId: string, data: any) => {
  const service = await registry.getOrInitialize<AuthServiceInterface>('authService', initManager);
  return service.createUserProfile(userId, data);
};

export const updateUserProfile = async (userId: string, data: any) => {
  const service = await registry.getOrInitialize<AuthServiceInterface>('authService', initManager);
  return service.updateUserProfile(userId, data);
};

export const onAuthStateChange = (callback: (event: any, session: Session | null) => void) => {
  const service = registry.get<AuthServiceInterface>('authService');
  return service.onAuthStateChange(callback);
};

export const resetPassword = async (email: string) => {
  const service = await registry.getOrInitialize<AuthServiceInterface>('authService', initManager);
  return service.resetPassword(email);
};

export const verifyBookCode = async (code: string) => {
  const service = await registry.getOrInitialize<AuthServiceInterface>('authService', initManager);
  return service.verifyBookCode(code);
};

// New exports for auth realtime functionality
export const emitAuthEvent = async (event: AuthEventData) => {
  await authRealtimeEmitter.emit(event);
};

export const onAuthEvent = (callback: (event: AuthEventData) => void) => {
  authRealtimeEmitter.on(callback);
};

export const offAuthEvent = (callback: (event: AuthEventData) => void) => {
  authRealtimeEmitter.off(callback);
};

// Default export for backward compatibility
export default {
  signIn,
  signUp,
  signOut,
  getSession,
  getUser,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  onAuthStateChange,
  resetPassword,
  verifyBookCode,
  emitAuthEvent,
  onAuthEvent,
  offAuthEvent
};
