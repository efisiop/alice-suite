// src/services/authService.ts
import { appLog } from '../components/LogViewer';
import { handleServiceError } from '../utils/errorHandling';
import { authClient } from '@alice-suite/api-client';
import { Session, User } from '@supabase/supabase-js';

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
 * Create Auth Service with Real Supabase Integration
 */
export const createAuthService = async (): Promise<AuthServiceInterface> => {
  appLog('AuthService', 'Creating real auth service with Supabase', 'info');

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

        const result = await authClient.getSession();

        if (result.error) {
          appLog('AuthService', 'Get session failed', 'error', result.error.message);
          throw result.error;
        }

        return result;
      } catch (error) {
        throw handleServiceError(error, 'authService', 'getSession');
      }
    },

    getUser: async () => {
      try {
        appLog('AuthService', 'Getting user with shared auth client', 'info');

        const result = await authClient.getCurrentUser();
        return result;
      } catch (error) {
        throw handleServiceError(error, 'authService', 'getUser');
      }
    },

    getUserProfile: async (userId: string) => {
      try {
        appLog('AuthService', `Getting user profile for ${userId}`, 'info');

        const result = await authClient.getUserProfile(userId);
        return result;
      } catch (error) {
        throw handleServiceError(error, 'authService', 'getUserProfile');
      }
    },

    createUserProfile: async (userId: string, data: any) => {
      try {
        appLog('AuthService', `Creating user profile for ${userId}`, 'info');

        const result = await authClient.createUserProfile(userId, data);
        return result;
      } catch (error) {
        throw handleServiceError(error, 'authService', 'createUserProfile');
      }
    },

    updateUserProfile: async (userId: string, data: any) => {
      try {
        appLog('AuthService', `Updating user profile for ${userId}`, 'info');

        const result = await authClient.updateUserProfile(userId, data);
        return result;
      } catch (error) {
        throw handleServiceError(error, 'authService', 'updateUserProfile');
      }
    },

    onAuthStateChange: (callback: (event: any, session: Session | null) => void) => {
      try {
        appLog('AuthService', 'Setting up auth state change listener', 'info');

        return authClient.onAuthStateChange(callback);
      } catch (error) {
        throw handleServiceError(error, 'authService', 'onAuthStateChange');
      }
    },

    resetPassword: async (email: string) => {
      try {
        appLog('AuthService', `Sending password reset email to ${email}`, 'info');

        const result = await authClient.resetPassword(email);
        return result;
      } catch (error) {
        throw handleServiceError(error, 'authService', 'resetPassword');
      }
    },

    verifyBookCode: async (code: string) => {
      try {
        appLog('AuthService', `Verifying book code: ${code}`, 'info');

        const result = await authClient.verifyBookCode(code);
        return result;
      } catch (error) {
        throw handleServiceError(error, 'authService', 'verifyBookCode');
      }
    }
  };

  appLog('AuthService', 'Real auth service created successfully', 'success');
  return authService;
};

// Backward compatibility exports
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

export const onAuthStateChange = (callback: (event: any, session: any) => void) => {
  const service = createAuthService();
  return service.then(s => s.onAuthStateChange(callback));
};

export const resetPassword = async (email: string) => {
  const service = await createAuthService();
  return service.resetPassword(email);
};

export const verifyBookCode = async (code: string) => {
  const service = await createAuthService();
  return service.verifyBookCode(code);
};
