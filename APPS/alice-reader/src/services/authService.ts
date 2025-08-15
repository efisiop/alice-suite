// src/services/authService.ts
import { authClient, dbClient } from '@alice-suite/api-client';
import { appLog } from '../components/LogViewer';
import { handleServiceError } from '../utils/errorHandling';
import { Session } from '@supabase/supabase-js';

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
      await authClient.emitAuthEvent(event);
    } catch (error) {
      appLog('AuthService', 'Failed to emit auth event', 'warning', error);
    }

    // Emit to local callbacks
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        appLog('AuthService', 'Error in auth event callback', 'error', error);
      }
    });
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
 * Create Auth Service with Shared Client Integration
 */
export const createAuthService = async (): Promise<AuthServiceInterface> => {
  appLog('AuthService', 'Creating auth service with shared client', 'info');

  // Create service implementation
  const authService: AuthServiceInterface = {
    signIn: async (email: string, password: string) => {
      try {
        appLog('AuthService', 'Signing in user with shared auth client', 'info');

        const result = await authClient.signIn({ email, password });

        if (result.error) {
          appLog('AuthService', 'Sign in failed', 'error', result.error.message);
          throw result.error;
        }

        if (result.user) {
          // Track session start
          trackSessionStart(result.user.id);

          // Emit real-time auth event
          const authEvent: AuthEventData = {
            userId: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            timestamp: new Date(),
            eventType: 'LOGIN',
            deviceInfo: getDeviceInfo(),
            location: await getLocationData()
          };

          await authRealtimeEmitter.emit(authEvent);
        }

        appLog('AuthService', 'Sign in successful', 'success');
        return { data: { user: result.user }, error: null };
      } catch (error) {
        throw handleServiceError(error, 'authService', 'signIn');
      }
    },

    signUp: async (email: string, password: string, firstName?: string, lastName?: string) => {
      try {
        appLog('AuthService', 'Signing up user with shared auth client', 'info');

        const result = await authClient.signUp({
          email,
          password,
          firstName,
          lastName
        });

        if (result.error) {
          appLog('AuthService', 'Sign up failed', 'error', result.error.message);
          throw result.error;
        }

        appLog('AuthService', 'Sign up successful', 'success');
        return { data: { user: result.user }, error: null };
      } catch (error) {
        throw handleServiceError(error, 'authService', 'signUp');
      }
    },

    signOut: async () => {
      try {
        appLog('AuthService', 'Signing out user with shared auth client', 'info');

        const result = await authClient.signOut();

        if (result.error) {
          appLog('AuthService', 'Sign out failed', 'error', result.error.message);
          throw result.error;
        }

        appLog('AuthService', 'Sign out successful', 'success');
        return result;
      } catch (error) {
        throw handleServiceError(error, 'authService', 'signOut');
      }
    },

    getSession: async () => {
      try {
        appLog('AuthService', 'Getting session with shared auth client', 'info');
        return await authClient.getCurrentUser();
      } catch (error) {
        throw handleServiceError(error, 'authService', 'getSession');
      }
    },

    getUser: async () => {
      try {
        appLog('AuthService', 'Getting user with shared auth client', 'info');
        return await authClient.getCurrentUser();
      } catch (error) {
        throw handleServiceError(error, 'authService', 'getUser');
      }
    },

    getUserProfile: async (userId: string) => {
      try {
        appLog('AuthService', `Getting user profile for ${userId}`, 'info');
        return await dbClient.getProfile(userId);
      } catch (error) {
        throw handleServiceError(error, 'authService', 'getUserProfile');
      }
    },

    createUserProfile: async (userId: string, data: any) => {
      try {
        appLog('AuthService', `Creating user profile for ${userId}`, 'info');
        return await dbClient.updateProfile(userId, data);
      } catch (error) {
        throw handleServiceError(error, 'authService', 'createUserProfile');
      }
    },

    updateUserProfile: async (userId: string, data: any) => {
      try {
        appLog('AuthService', `Updating user profile for ${userId}`, 'info');
        return await dbClient.updateProfile(userId, data);
      } catch (error) {
        throw handleServiceError(error, 'authService', 'updateUserProfile');
      }
    },

    onAuthStateChange: (callback: (event: any, session: Session | null) => void) => {
      return authClient.onAuthStateChange(callback);
    },

    resetPassword: async (email: string) => {
      try {
        appLog('AuthService', 'Resetting password with shared auth client', 'info');
        return await authClient.resetPassword(email);
      } catch (error) {
        throw handleServiceError(error, 'authService', 'resetPassword');
      }
    },

    verifyBookCode: async (code: string) => {
      try {
        appLog('AuthService', 'Verifying book code', 'info');
        // This would need to be implemented in the shared package or kept local
        // For now, return a placeholder
        return { success: false, error: 'Book code verification not implemented in shared package' };
      } catch (error) {
        throw handleServiceError(error, 'authService', 'verifyBookCode');
      }
    }
  };

  return authService;
};

// Export convenience functions
export const signIn = async (email: string, password: string) => {
  const service = await createAuthService();
  return service.signIn(email, password);
};

export const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
  const service = await createAuthService();
  return service.signUp(email, password, firstName, lastName);
};

export const signOut = async () => {
  const service = await createAuthService();
  return service.signOut();
};

export const getSession = async () => {
  const service = await createAuthService();
  return service.getSession();
};

export const getUser = async () => {
  const service = await createAuthService();
  return service.getUser();
};

export const getUserProfile = async (userId: string) => {
  const service = await createAuthService();
  return service.getUserProfile(userId);
};

export const createUserProfile = async (userId: string, data: any) => {
  const service = await createAuthService();
  return service.createUserProfile(userId, data);
};

export const updateUserProfile = async (userId: string, data: any) => {
  const service = await createAuthService();
  return service.updateUserProfile(userId, data);
};

export const onAuthStateChange = (callback: (event: any, session: Session | null) => void) => {
  return authClient.onAuthStateChange(callback);
};

export const resetPassword = async (email: string) => {
  const service = await createAuthService();
  return service.resetPassword(email);
};

export const verifyBookCode = async (code: string) => {
  const service = await createAuthService();
  return service.verifyBookCode(code);
};

// Real-time event functions
export const emitAuthEvent = async (event: AuthEventData) => {
  await authRealtimeEmitter.emit(event);
};

export const onAuthEvent = (callback: (event: AuthEventData) => void) => {
  authRealtimeEmitter.on(callback);
};

export const offAuthEvent = (callback: (event: AuthEventData) => void) => {
  authRealtimeEmitter.off(callback);
};
