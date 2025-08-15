// Local Supabase client to replace @alice-suite/api-client dependency
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Simple database type definition
interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          is_consultant: boolean
          book_verified?: boolean
          is_verified?: boolean
          created_at: string
          updated_at: string
        }
      }
      help_requests: {
        Row: {
          id: string
          user_id: string
          book_id: string
          section_id: string | null
          status: string
          content: string
          context: string | null
          assigned_to: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
      }
      user_feedback: {
        Row: {
          id: string
          user_id: string
          book_id: string
          section_id: string | null
          feedback_type: string
          content: string
          is_public: boolean
          created_at: string
        }
      }
      consultant_triggers: {
        Row: {
          id: string
          consultant_id: string | null
          user_id: string
          book_id: string
          trigger_type: string
          message: string | null
          is_processed: boolean
          processed_at: string | null
          created_at: string
        }
      }
      consultant_actions_log: {
        Row: {
          id: string
          consultant_id: string
          user_id: string
          action_type: string
          details: any | null
          created_at: string
        }
      }
      reading_progress: {
        Row: {
          id: string
          user_id: string
          book_id: string
          section_id: string
          last_position: string | null
          last_read_at: string
          created_at: string
          updated_at: string
        }
      }
      reading_stats: {
        Row: {
          id: string
          user_id: string
          book_id: string
          total_reading_time: number
          pages_read: number
          last_session_date: string
          created_at: string
          updated_at: string
        }
      }
      interactions: {
        Row: {
          id: string
          user_id: string
          event_type: string
          book_id?: string
          section_id?: string
          page_number?: number
          content?: string
          context?: any
          created_at: string
        }
      }
      feedback: {
        Row: {
          id: string
          user_id: string
          book_id: string
          section_id?: string
          feedback_type: string
          content: string
          is_public: boolean
          created_at: string
        }
      }
      consultant_assignments: {
        Row: {
          id: string
          consultant_id: string
          user_id: string
          book_id: string
          active: boolean
          created_at: string
        }
      }
    }
  }
}

// Get credentials from environment
const getSupabaseCredentials = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (window as any).ENV_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (window as any).ENV_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not found in environment or window globals');
  }

  return { supabaseUrl, supabaseAnonKey };
};

// Create and export the client
let supabaseClient: SupabaseClient<Database> | null = null;

export const getLocalSupabaseClient = (): SupabaseClient<Database> => {
  if (!supabaseClient) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      }
    });
  }
  return supabaseClient;
};

// Export as default for compatibility
export default getLocalSupabaseClient; 