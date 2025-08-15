import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  getUserProfile as authGetUserProfile,
  createUserProfile as authCreateUserProfile,
  getSession as authGetSession,
  onAuthStateChange as authOnAuthStateChange,
  verifyBookCode as authVerifyBookCode
} from '../services/authService';
import { checkSupabaseConnection } from '../services/supabaseClient';
import { appLog } from '../components/LogViewer';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_consultant: boolean;
    is_verified: boolean;
    book_verified: boolean;
  } | null;
  loading: boolean;
  isVerified: boolean;
  loginInProgress: boolean;
  setIsVerified: React.Dispatch<React.SetStateAction<boolean>>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    user: User | null;
  }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{
    error: Error | null;
    user: User | null;
  }>;
  signOut: () => Promise<void>;
  verifyBook: (code: string, firstName?: string, lastName?: string) => Promise<{
    success: boolean;
    error?: Error | null;
  }>;
  isConsultant: () => boolean;
  isBypassMode: boolean;
};

// Export the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const EnhancedAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('EnhancedAuthProvider: Mounting / Initializing');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_consultant: boolean;
    is_verified: boolean;
    book_verified: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [isBypassMode, setIsBypassMode] = useState(false);

  // Check for bypass mode
  useEffect(() => {
    const checkBypassMode = () => {
      const bypassActive = localStorage.getItem('bypass-mode') === 'true';
      if (bypassActive) {
        const profileData = localStorage.getItem('bypass-profile');
        if (profileData) {
          const profile = JSON.parse(profileData);
          setProfile(profile);
          setIsVerified(true);
          setIsBypassMode(true);
          
          // Create a mock user object
          const mockUser = {
            id: profile.id,
            email: profile.email,
            user_metadata: {
              first_name: profile.first_name,
              last_name: profile.last_name,
            },
            app_metadata: {
              provider: 'email',
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as User;
          
          setUser(mockUser);
          setSession({
            user: mockUser,
            access_token: 'bypass-token',
            refresh_token: 'bypass-refresh-token',
            expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            expires_in: 86400,
            token_type: 'bearer',
          } as Session);
          
          setLoading(false);
          return true;
        }
      }
      return false;
    };

    if (!checkBypassMode()) {
      initializeAuth();
    }
  }, []);

  const initializeAuth = async () => {
    appLog('EnhancedAuthProvider', 'Initializing authentication state...', 'info');
    setLoading(true);

    try {
      // Clear any stale local storage entries first
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.startsWith('supabase')) {
            try {
              const item = localStorage.getItem(key);
              if (item) {
                const parsed = JSON.parse(item);
                // Check if the token is expired or invalid
                if (parsed.expires_at && new Date(parsed.expires_at * 1000) < new Date()) {
                  localStorage.removeItem(key);
                  appLog('EnhancedAuthProvider', `Removed expired token from localStorage: ${key}`, 'info');
                }
              }
            } catch (e) {
              // Invalid JSON, remove it
              localStorage.removeItem(key);
              appLog('EnhancedAuthProvider', `Removed invalid token from localStorage: ${key}`, 'info');
            }
          }
        });
      }

      // Attempt to get the current session from the auth service
      const sessionResult = await authGetSession();
      const session = sessionResult?.data?.session || null;
      const sessionError = sessionResult?.error || null;

      if (sessionError) {
        // Handle specific auth errors
        if (sessionError.message?.includes('Invalid Refresh Token') || 
            sessionError.message?.includes('Refresh Token Not Found')) {
          appLog('EnhancedAuthProvider', 'Invalid refresh token detected, clearing auth state', 'warning');
          // Clear all auth-related localStorage
          if (typeof window !== 'undefined') {
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('sb-') || key.startsWith('supabase')) {
                localStorage.removeItem(key);
              }
            });
          }
          // Set clean state
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsVerified(false);
          setLoading(false);
          return;
        }
        appLog('EnhancedAuthProvider', 'Error getting session during initialization', 'error', sessionError);
      }

      if (session) {
        setSession(session);
        setUser(session.user);
        appLog('EnhancedAuthProvider', `Session found for user: ${session.user.id}`, 'info');

        // Fetch profile if session exists
        const { data: profile, error: profileError } = await authGetUserProfile(session.user.id);
        if (profileError) {
          appLog('EnhancedAuthProvider', 'Error fetching profile on initial load', 'error', profileError);
          // If we can't get a profile, it might be a stale session. Sign out.
          await signOut();
        } else if (profile) {
          setProfile(profile);
          setIsVerified(profile.book_verified || false);
          appLog('EnhancedAuthProvider', 'Profile loaded on initialization', 'success');
        } else {
          appLog('EnhancedAuthProvider', 'No profile found for existing session. Signing out.', 'warning');
          await signOut();
        }
      } else {
        // No session, ensure everything is cleared
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsVerified(false);
      }
      setLoading(false);
      appLog('EnhancedAuthProvider', 'Authentication state initialized.', 'info');
    } catch (error) {
      appLog('EnhancedAuthProvider', 'Error during auth initialization', 'error', error);
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsVerified(false);
      setLoading(false);
    }
  };

  // Sign out using auth service
  const signOut = async () => {
    appLog('EnhancedAuthProvider', 'Signing out user.', 'info');
    setLoading(true);
    
    // Clear bypass mode if active
    if (isBypassMode) {
      localStorage.removeItem('bypass-mode');
      localStorage.removeItem('bypass-user');
      localStorage.removeItem('bypass-profile');
      localStorage.removeItem('bypass-timestamp');
      setIsBypassMode(false);
    }
    
    try {
      // Immediately clear local state
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsVerified(false);

      // Clear all localStorage items related to Supabase
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.startsWith('supabase')) {
            localStorage.removeItem(key);
            appLog('EnhancedAuthProvider', `Removed item from localStorage: ${key}`, 'info');
          }
        });
      }

      // Only call authSignOut if not in bypass mode
      if (!isBypassMode) {
        const { error } = await authSignOut();
        if (error) {
          appLog('EnhancedAuthProvider', 'Error during auth sign out', 'error', error);
        } else {
          appLog('EnhancedAuthProvider', 'Auth sign out successful.', 'success');
        }
      }
    } catch (error) {
      appLog('EnhancedAuthProvider', 'An unexpected error occurred during sign out', 'error', error);
    } finally {
      setLoading(false);
      appLog('EnhancedAuthProvider', 'Sign out process complete.', 'info');
    }
  };

  // Sign in with email and password using backend service
  const signIn = async (email: string, password: string) => {
    if (isBypassMode) {
      return { user: null, error: new Error('Cannot sign in while bypass mode is active') };
    }
    
    setLoading(true);
    setLoginInProgress(true);
    try {
      appLog('EnhancedAuthProvider', `Signing in user with email: ${email}`, 'info');
      console.log('EnhancedAuthProvider: Signing in user with email:', email);

      const { data, error } = await authSignIn(email, password);

      if (error) {
        appLog('EnhancedAuthProvider', 'Error during sign in', 'error', error);
        console.error('EnhancedAuthProvider: Error during sign in:', error);
        throw error;
      }

      if (!data?.user) {
        appLog('EnhancedAuthProvider', 'User not found during sign in', 'error');
        console.error('EnhancedAuthProvider: User not found during sign in');
        throw new Error('User not found');
      }

      appLog('EnhancedAuthProvider', 'Sign in successful', 'success');
      console.log('EnhancedAuthProvider: Sign in successful, user:', data.user);

      setUser(data.user);

      const { data: profile, error: profileError } = await authGetUserProfile(data.user.id);
      if (profileError) {
        appLog('EnhancedAuthProvider', 'Warning: Could not fetch profile after sign in. Signing out.', 'warning', profileError);
        await signOut();
        throw new Error('Could not verify user profile.');
      }

      if (profile) {
        appLog('EnhancedAuthProvider', 'Profile fetched successfully after sign in', 'success');
        setProfile(profile);
        setIsVerified(profile.book_verified || false);
      } else {
          appLog('EnhancedAuthProvider', 'User profile not found. Signing out.', 'error');
          await signOut();
          throw new Error('User profile not found.');
      }

      return { user: data.user, error: null };
    } catch (error) {
      appLog('EnhancedAuthProvider', 'Error signing in', 'error', error);
      console.error('EnhancedAuthProvider: Error signing in:', error);
      return { user: null, error: error instanceof Error ? error : new Error('Unknown error') };
    } finally {
      setLoading(false);
      setLoginInProgress(false);
    }
  };

  // Sign up with email and password using backend service
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    if (isBypassMode) {
      return { user: null, error: new Error('Cannot sign up while bypass mode is active') };
    }
    
    setLoading(true);
    try {
      appLog('EnhancedAuthProvider', `Signing up user with email: ${email}`, 'info');
      console.log('EnhancedAuthProvider: Signing up user with email:', email);

      const { data, error } = await authSignUp(email, password);

      if (error) {
        appLog('EnhancedAuthProvider', 'Error during signup', 'error', error);
        console.error('EnhancedAuthProvider: Error during signup:', error);
        throw error;
      }

      if (!data?.user) {
        appLog('EnhancedAuthProvider', 'User creation failed - no user returned', 'error');
        console.error('EnhancedAuthProvider: User creation failed - no user returned');
        throw new Error('User creation failed');
      }

      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { error: updateError } = await authCreateUserProfile(data.user.id, {
          first_name: firstName,
          last_name: lastName,
          email: email
        });

        if (updateError) {
          appLog('EnhancedAuthProvider', `Warning: Could not update profile with names: ${String(updateError)}`, 'warning');
          console.warn('EnhancedAuthProvider: Could not update profile with names:', updateError);
        } else {
          appLog('EnhancedAuthProvider', 'Profile updated successfully with names', 'success');
          console.log('EnhancedAuthProvider: Profile updated successfully with names');
        }
      } catch (profileError) {
        appLog('EnhancedAuthProvider', 'Error updating profile during signup', 'warning', profileError);
        console.warn('EnhancedAuthProvider: Error updating profile during signup:', profileError);
      }

      return { user: data.user, error: null };
    } catch (error) {
      appLog('EnhancedAuthProvider', 'Error signing up', 'error', error);
      console.error('EnhancedAuthProvider: Error signing up:', error);
      return { user: null, error: error instanceof Error ? error : new Error('Unknown error') };
    } finally {
      setLoading(false);
    }
  };

  // Verify book code
  const verifyBook = async (code: string, firstName?: string, lastName?: string): Promise<{ success: boolean; error?: Error | null }> => {
    if (isBypassMode) {
      return { success: true }; // Always return success in bypass mode
    }
    
    try {
      if (!user) {
        return { success: false, error: new Error('User not authenticated') };
      }

      const result = await authVerifyBookCode(code);
      if (result.error) {
        return { success: false, error: new Error(String(result.error)) };
      }

      setIsVerified(true);

      try {
        const { data: userProfile } = await authGetUserProfile(user.id);
        if (userProfile) {
          setProfile(userProfile);
        }
      } catch (profileError) {
        console.error('EnhancedAuthProvider: Error fetching profile after verification:', profileError);
      }

      return { success: true };
    } catch (error) {
      console.error('EnhancedAuthProvider: Unexpected error during verification:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error during verification')
      };
    }
  };

  // Helper function to check if user is a consultant
  const isConsultant = () => {
    return profile?.is_consultant || false;
  };

  const value = {
    session,
    user,
    profile,
    loading,
    isVerified,
    loginInProgress,
    setIsVerified,
    signIn,
    signUp,
    signOut,
    verifyBook,
    isConsultant,
    isBypassMode,
  };

  console.log('EnhancedAuthProvider: Initial loading state:', loading);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};