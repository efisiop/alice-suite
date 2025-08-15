// src/services/supabaseClient.ts
// Re-export the shared Supabase client to eliminate duplicate implementations
import { getSupabaseClient as getSharedClient, initializeSupabase } from '@alice-suite/api-client';
import { appLog } from '../components/LogViewer';
import type { Database } from '@alice-suite/api-client';
import type { SupabaseClient } from '@supabase/supabase-js';

// Re-export the shared client
export const getSupabaseClient = getSharedClient;
export { initializeSupabase } from '@alice-suite/api-client';

// Legacy compatibility - re-export the shared client
export const supabase = {
  auth: {
    getUser: () => {
      const client = getSharedClient();
      return client.auth.getUser();
    },
    signInWithPassword: (credentials: any) => {
      const client = getSharedClient();
      return client.auth.signInWithPassword(credentials);
    },
    signOut: () => {
      const client = getSharedClient();
      return client.auth.signOut();
    }
  },
  from: (table: string) => {
    const client = getSharedClient();
    return client.from(table);
  }
};

// Legacy error handling function
export const handleSupabaseError = (error: any, context: string = 'Supabase') => {
  appLog('SupabaseClient', `${context}: ${error.message || error}`, 'error');
};

// Legacy retry utility
export const executeWithRetries = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  return operation(); // Simplified - let the shared client handle retries
};

// Legacy connection check
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const client = getSharedClient();
    const { error } = await client.from('books').select('id').limit(1);
    return !error;
  } catch (error) {
    return false;
  }
};

// Legacy profile functions - now use shared dbClient
export const getUserProfile = async (userId: string) => {
  const { dbClient } = await import('@alice-suite/api-client');
  return dbClient.getProfile(userId);
};

export const createUserProfile = async (userId: string, data: any) => {
  const { dbClient } = await import('@alice-suite/api-client');
  return dbClient.updateProfile(userId, data);
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { dbClient } = await import('@alice-suite/api-client');
  return dbClient.updateProfile(userId, updates);
};

// Legacy book functions - now use shared dbClient
export const getBookWithChapters = async (bookId: string) => {
  const { dbClient } = await import('@alice-suite/api-client');
  return dbClient.getBookWithChapters(bookId);
};

export const getSectionsForPage = async (bookId: string, pageNumber: number) => {
  const { dbClient } = await import('@alice-suite/api-client');
  return dbClient.getSectionsForPage(bookId, pageNumber);
};

// Legacy reading progress functions - now use shared dbClient
export const saveReadingProgress = async (userId: string, bookId: string, sectionId: string, position?: string) => {
  const { dbClient } = await import('@alice-suite/api-client');
  return dbClient.updateReadingProgress({
    user_id: userId,
    book_id: bookId,
    section_id: sectionId,
    last_position: position
  });
};

export const getReadingProgress = async (userId: string, bookId: string) => {
  const { dbClient } = await import('@alice-suite/api-client');
  return dbClient.getReadingProgress(userId, bookId);
};

// Legacy book code verification function
export const verifyBookCode = async (code: string, userId: string, firstName?: string, lastName?: string) => {
  try {
    const client = getSharedClient();
    const { dbClient } = await import('@alice-suite/api-client');
    
    // Check if code exists and is not used
    const { data, error } = await client
      .from('verification_codes')
      .select('*, books(id, title, author)')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) {
      return { success: false, error: 'Invalid verification code' };
    }

    if (data.is_used) {
      return { success: false, error: 'This code has already been used' };
    }

    // Mark code as used and update profile in parallel
    const codePromise = client
      .from('verification_codes')
      .update({
        is_used: true,
        used_by: userId
      })
      .eq('code', code.toUpperCase());

    // Update the user's profile to mark them as verified
    const updates: any = {
      book_verified: true,
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {})
    };

    const profilePromise = dbClient.updateProfile(userId, updates);

    // Wait for both operations to complete
    const [codeResult, profileResult] = await Promise.all([codePromise, profilePromise]);

    if (codeResult.error) {
      return { success: false, error: 'Error updating verification code' };
    }

    if (profileResult.error) {
      return {
        success: false,
        error: `Profile update failed: ${String(profileResult.error)}`,
        verificationStatus: 'code_marked_used_profile_update_failed'
      };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: 'Error verifying book code' };
  }
};