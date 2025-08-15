import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import {
  signIn as backendSignIn,
  signUp as backendSignUp,
  signOut as backendSignOut,
  getUserProfile as backendGetUserProfile,
  createUserProfile as backendCreateUserProfile,
  getSession as backendGetSession,
  onAuthStateChange as backendOnAuthStateChange,
  verifyBookCodeComprehensive
} from '../services/backendService';
import { checkSupabaseConnection } from '../services/supabaseClient';
import { isBackendAvailable } from '../services/backendConfig';
import { appLog } from '../components/LogViewer';
import { activityTrackingService } from '../services/activityTrackingService';
import { createSupabaseClient } from '@alice-suite/api-client';
import { appConfig } from '../config';

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
};

// Export the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('AuthProvider: Mounting / Initializing');
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthContextType['profile']>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [realtimeClient, setRealtimeClient] = useState<any | null>(null);

  // Initialize or update realtime client when session changes
  useEffect(() => {
    if (session?.access_token) {
      // Use Socket.IO client directly since we don't have a shared realtime client
      import('socket.io-client').then(io => {
        const client = io.default(appConfig.realtimeUrl || 'http://localhost:3001', {
          auth: {
            token: session.access_token
          },
          autoConnect: true
        });
        setRealtimeClient(client);
        
        return () => {
          client.disconnect();
          setRealtimeClient(null);
        };
      });
    } else {
      if (realtimeClient) {
        realtimeClient.disconnect();
        setRealtimeClient(null);
      }
    }
  }, [session?.access_token]);

  // Sign out using backend service
  const signOut = async () => {
    appLog('AuthContext', 'Signing out user.', 'info');
    setLoading(true);
    
    // Track logout event before clearing state
    const currentUserId = user?.id;
    if (currentUserId && realtimeClient) {
      try {
        realtimeClient.trackLogout();
        await activityTrackingService.trackLogout(currentUserId);
        appLog('AuthContext', 'Logout event tracked successfully', 'info');
      } catch (trackingError) {
        appLog('AuthContext', 'Failed to track logout event', 'warning', trackingError);
        // Don't fail the logout if tracking fails
      }
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
            appLog('AuthContext', `Removed item from localStorage: ${key}`, 'info');
          }
        });
      }

      // Then, sign out from the backend
      const { error } = await backendSignOut();
      if (error) {
        appLog('AuthContext', 'Error during backend sign out', 'error', error);
        // Don't throw, as we want to complete the sign-out process client-side regardless
      } else {
        appLog('AuthContext', 'Backend sign out successful.', 'success');
      }
    } catch (error) {
      appLog('AuthContext', 'An unexpected error occurred during sign out', 'error', error);
    } finally {
      // Ensure loading is turned off and state is fully cleared
      setLoading(false);
      appLog('AuthContext', 'Sign out process complete.', 'info');
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      appLog('AuthContext', 'Initializing authentication state...', 'info');
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
                    appLog('AuthContext', `Removed expired token from localStorage: ${key}`, 'info');
                  }
                }
              } catch (e) {
                // Invalid JSON, remove it
                localStorage.removeItem(key);
                appLog('AuthContext', `Removed invalid token from localStorage: ${key}`, 'info');
              }
            }
          });
        }

        // Attempt to get the current session from the backend
        const sessionResult = await backendGetSession();
        const session = sessionResult?.data?.session || null;
        const sessionError = sessionResult?.error || null;

        if (sessionError) {
          // Handle specific auth errors
          if (sessionError.message?.includes('Invalid Refresh Token') || 
              sessionError.message?.includes('Refresh Token Not Found')) {
            appLog('AuthContext', 'Invalid refresh token detected, clearing auth state', 'warning');
            // Clear all auth-related localStorage
            if (typeof window !== 'undefined') {
              Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-') || key.startsWith('supabase')) {
                  localStorage.removeItem(key);
                }
              });
            }
            // Set clean state
            if (mounted) {
              setSession(null);
              setUser(null);
              setProfile(null);
              setIsVerified(false);
              setLoading(false);
            }
            return;
          }
          appLog('AuthContext', 'Error getting session during initialization', 'error', sessionError);
        }

      if (mounted) {
        if (session) {
          setSession(session);
          setUser(session.user);
          appLog('AuthContext', `Session found for user: ${session.user.id}`, 'info');

          // Fetch profile if session exists
          const { data: profile, error: profileError } = await backendGetUserProfile(session.user.id);
          if (profileError) {
            appLog('AuthContext', 'Error fetching profile on initial load', 'error', profileError);
            // If we can't get a profile, it might be a stale session. Sign out.
            await signOut();
          } else if (profile) {
            setProfile(profile);
            setIsVerified(profile.book_verified || false);
            appLog('AuthContext', 'Profile loaded on initialization', 'success');
          } else {
            appLog('AuthContext', 'No profile found for existing session. Signing out.', 'warning');
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
        appLog('AuthContext', 'Authentication state initialized.', 'info');
      }
      } catch (error) {
        appLog('AuthContext', 'Error during auth initialization', 'error', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsVerified(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up the onAuthStateChange listener
    let subscription: any = null;
    
    const setupAuthStateListener = async () => {
      try {
        const authStateResult = await backendOnAuthStateChange((_event, session) => {
          if (mounted) {
            appLog('AuthContext', `Auth state changed. Event: ${_event}`, 'info');
            setSession(session);
            setUser(session?.user ?? null);

            if (!session) {
              // If the session is null (e.g., after a sign-out), clear profile info
              setProfile(null);
              setIsVerified(false);
              setLoading(false);
            }
          }
        });
        
        subscription = authStateResult?.data?.subscription;
      } catch (error) {
        appLog('AuthContext', 'Error setting up auth state change listener', 'error', error);
      }
    };

    setupAuthStateListener();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
        appLog('AuthContext', 'Auth state change subscription stopped.', 'info');
      }
    };
  }, []);

  // Sign in with email and password using backend service
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      appLog('AuthContext', `Signing in user with email: ${email}`, 'info');
      console.log('AuthContext: Signing in user with email:', email);

      const { data, error } = await backendSignIn(email, password);

      if (error) {
        appLog('AuthContext', 'Error during sign in', 'error', error);
        console.error('AuthContext: Error during sign in:', error);
        throw error;
      }

      if (!data?.user) {
        appLog('AuthContext', 'User not found during sign in', 'error');
        console.error('AuthContext: User not found during sign in');
        throw new Error('User not found');
      }

      appLog('AuthContext', 'Sign in successful', 'success');
      console.log('AuthContext: Sign in successful, user:', data.user);

      // Fetch the user profile after successful sign in
      try {
        const { data: profile, error: profileError } = await backendGetUserProfile(data.user.id);

        if (profileError) {
          appLog('AuthContext', 'Warning: Could not fetch profile after sign in. Signing out.', 'warning', profileError);
          await signOut(); // Force sign out
          throw new Error('Could not verify user profile.');
        }

        if (profile) {
          appLog('AuthContext', 'Profile fetched successfully after sign in', 'success');
          setProfile(profile);
          setIsVerified(profile.book_verified || false);
          
          // Track login event
          try {
            // Track real-time login event
            if (realtimeClient) {
              realtimeClient.trackLogin();
            }
            await activityTrackingService.trackLogin(data.user.id);
            appLog('AuthContext', 'Login event tracked successfully', 'info');
          } catch (trackingError) {
            appLog('AuthContext', 'Failed to track login event', 'warning', trackingError);
            // Don't fail the login if tracking fails
          }
        } else {
            appLog('AuthContext', 'User profile not found. Signing out.', 'error');
            await signOut();
            throw new Error('User profile not found.');
        }
      } catch (profileError) {
        appLog('AuthContext', 'Error fetching profile after sign in. Signing out.', 'warning', profileError);
        await signOut(); // Sign out on error
        throw profileError; // re-throw the error to be caught by the outer catch block
      }

      return { user: data.user, error: null };
    } catch (error) {
      appLog('AuthContext', 'Error signing in', 'error', error);
      console.error('AuthContext: Error signing in:', error);
      return { user: null, error: error instanceof Error ? error : new Error('Unknown error') };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password using backend service
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    try {
      appLog('AuthContext', `Signing up user with email: ${email}`, 'info');
      console.log('AuthContext: Signing up user with email:', email);

      // Create auth user
      const { data, error } = await backendSignUp(email, password);

      if (error) {
        appLog('AuthContext', 'Error during signup', 'error', error);
        console.error('AuthContext: Error during signup:', error);
        throw error;
      }

      if (!data?.user) {
        appLog('AuthContext', 'User creation failed - no user returned', 'error');
        console.error('AuthContext: User creation failed - no user returned');
        throw new Error('User creation failed');
      }

      // The database trigger should create the profile, but let's explicitly update it with first/last name
      appLog('AuthContext', `User created successfully. Updating profile for: ${data.user.id}`, 'info');
      console.log('AuthContext: User created successfully. Updating profile for:', data.user.id);

      try {
        // Wait a moment for the database trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Now update the profile with first name and last name
        const { error: updateError } = await backendCreateUserProfile(
          data.user.id,
          firstName,
          lastName,
          email
        );

        if (updateError) {
          appLog('AuthContext', `Warning: Could not update profile with names: ${updateError.message}`, 'warning');
          console.warn('AuthContext: Could not update profile with names:', updateError);
          // Continue despite this error - we'll try to fix it during verification
        } else {
          appLog('AuthContext', 'Profile updated successfully with names', 'success');
          console.log('AuthContext: Profile updated successfully with names');
        }
      } catch (profileError) {
        appLog('AuthContext', 'Error updating profile during signup', 'warning', profileError);
        console.warn('AuthContext: Error updating profile during signup:', profileError);
        // Continue despite this error - we'll try to fix it during verification
      }

      return { user: data.user, error: null };
    } catch (error) {
      appLog('AuthContext', 'Error signing up', 'error', error);
      console.error('AuthContext: Error signing up:', error);
      return { user: null, error: error instanceof Error ? error : new Error('Unknown error') };
    } finally {
      setLoading(false);
    }
  };

  // Verify book code
  const verifyBook = async (code: string, firstName?: string, lastName?: string): Promise<{ success: boolean; error?: Error | null }> => {
    try {
      if (!user) {
        return { success: false, error: new Error('User not authenticated') };
      }

      console.log('AuthContext: Starting book verification with code:', code);
      console.log('AuthContext: User ID:', user.id);
      console.log('AuthContext: First name:', firstName);
      console.log('AuthContext: Last name:', lastName);

      const result = await verifyBookCodeComprehensive(code, user.id, firstName, lastName);
      console.log('AuthContext: Verification result:', result);

      if (result.error) {
        console.error('AuthContext: Verification error:', result.error);
        return {
          success: false,
          error: new Error(String(result.error))
        };
      }

      // Immediately update our local state to reflect verification
      console.log('AuthContext: Verification successful, updating isVerified state to true');
      setIsVerified(true);

      // Note: After verification, the user will be redirected to the reader dashboard
      // This happens in the VerifyPage component's useEffect that watches isVerified

      // Force a re-fetch of the profile to ensure all data is in sync
      try {
        console.log('AuthContext: Re-fetching user profile after verification');
        const { data: userProfile } = await backendGetUserProfile(user.id);
        if (userProfile) {
          console.log('AuthContext: Updated profile after verification:', userProfile);
          setProfile(userProfile);
        }
      } catch (profileError) {
        console.error('AuthContext: Error fetching profile after verification:', profileError);
        // Continue with success even if profile fetch fails - the verification was successful
      }

      console.log('AuthContext: Book verification completed successfully');
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Unexpected error during verification:', error);
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
    setIsVerified,
    signIn,
    signUp,
    signOut,
    verifyBook,
    isConsultant
  };

  console.log('AuthProvider: Initial loading state:', loading);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};