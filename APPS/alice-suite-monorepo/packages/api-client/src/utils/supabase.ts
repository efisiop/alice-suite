// Supabase client utility for Alice Suite applications

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Global configuration that can be set by consuming applications
interface SupabaseConfig {
  url: string
  anonKey: string
}

let supabaseConfig: SupabaseConfig | null = null
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

// Create a factory function to initialize the client
export const createSupabaseClient = (url: string, anonKey: string) => {
  if (!url || !anonKey) {
    throw new Error('supabaseUrl and supabaseAnonKey are required.')
  }
  
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

// Initialize the Supabase client with configuration
export const initializeSupabase = (config: SupabaseConfig) => {
  supabaseConfig = config
  supabaseInstance = createSupabaseClient(config.url, config.anonKey)
  return supabaseInstance
}

// Get the initialized Supabase client
export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    throw new Error('Supabase client not initialized. Call initializeSupabase() first with your environment variables.')
  }
  return supabaseInstance
}

// Export a function that returns the client for backward compatibility
// Note: This is deprecated, use getSupabaseClient() instead
export const supabase = () => getSupabaseClient()

export type SupabaseClient = ReturnType<typeof createClient<Database>>

// Helper function to validate configuration
export function validateSupabaseConfig(config: Partial<SupabaseConfig>): boolean {
  return !!(config.url && config.anonKey)
} 