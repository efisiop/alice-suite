// src/services/supabaseClient.ts
// Re-export the shared Supabase client to eliminate duplicate GoTrueClient instances
import { getSupabaseClient as getSharedClient, initializeSupabase } from '@alice-suite/api-client';
import { appLog } from '../components/LogViewer';
import type { Database } from '../types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

// Legacy compatibility - re-export the shared client
export const getSupabaseClient = getSharedClient;

// Re-export initializeSupabase for initialization
export { initializeSupabase } from '@alice-suite/api-client';

// Export the shared client instance
export default getSharedClient;

// Add back essential functions that are still being used
export const checkSupabaseConnection = async (force: boolean = false): Promise<boolean> => {
  try {
    appLog('SupabaseClient', 'Checking Supabase connection', 'info');
    const client = getSharedClient();
    
    // Try a simple query to check connection
    const { data, error } = await client
      .from('books')
      .select('id')
      .limit(1);

    if (error) {
      appLog('SupabaseClient', `Supabase connection check failed: ${error.message}`, 'error');
      return false;
    }

    appLog('SupabaseClient', 'Supabase connection check successful', 'success');
    return true;
  } catch (error) {
    appLog('SupabaseClient', `Supabase connection check error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    return false;
  }
};

// Add legacy compatibility for files that might still need these
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

// Handler for standard Supabase errors
export const handleSupabaseError = (error: any, context: string = 'Supabase') => {
  if (!error) return;

  // Handle different error types
  if (typeof error === 'string') {
    appLog('SupabaseClient', `${context}: ${error}`, 'error');
  } else if (error.message) {
    appLog('SupabaseClient', `${context}: ${error.message}`, 'error', {
      code: error.code,
      details: error.details
    });
  } else {
    appLog('SupabaseClient', `${context}: Unknown error format`, 'error', error);
  }
};


