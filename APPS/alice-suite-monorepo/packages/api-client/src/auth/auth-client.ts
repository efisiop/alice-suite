// Authentication client for Alice Suite applications

import { getSupabaseClient } from '../utils/supabase'
import type { 
  AuthUser, 
  AuthError, 
  SignInCredentials, 
  SignUpCredentials,
  AuthStateChangeEvent,
  AuthEventData
} from '../types/auth'
import type { Profile } from '../types/database'

export class AuthClient {
  private get supabase() {
    return getSupabaseClient()
  }
  async signIn(credentials: SignInCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return { user: null, error: { message: error.message, code: error.code } }
      }

      if (!data.user) {
        return { user: null, error: { message: 'No user found' } }
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        return { user: null, error: { message: profileError.message } }
      }

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        role: profile.is_consultant ? 'consultant' : 'reader',
        fullName: `${profile.first_name} ${profile.last_name}`,
        firstName: profile.first_name,
        lastName: profile.last_name,
        isConsultant: profile.is_consultant,
      }

      return { user, error: null }
    } catch (error) {
      return { user: null, error: { message: 'An unexpected error occurred' } }
    }
  }

  async signUp(credentials: SignUpCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return { user: null, error: { message: error.message, code: error.code } }
      }

      if (!data.user) {
        return { user: null, error: { message: 'User creation failed' } }
      }

      // Create user profile
      const profileData: Profile = {
        id: data.user.id,
        first_name: credentials.firstName,
        last_name: credentials.lastName,
        email: credentials.email,
        is_consultant: credentials.isConsultant || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert(profileData)

      if (profileError) {
        return { user: null, error: { message: profileError.message } }
      }

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        role: profileData.is_consultant ? 'consultant' : 'reader',
        fullName: `${profileData.first_name} ${profileData.last_name}`,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        isConsultant: profileData.is_consultant,
      }

      return { user, error: null }
    } catch (error) {
      return { user: null, error: { message: 'An unexpected error occurred' } }
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.supabase.auth.signOut()
      return { error: error ? { message: error.message } : null }
    } catch (error) {
      return { error: { message: 'An unexpected error occurred' } }
    }
  }

  async getCurrentUser(): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data: { user: authUser }, error: authError } = await this.supabase.auth.getUser()
      
      if (authError || !authUser) {
        return { user: null, error: authError ? { message: authError.message } : null }
      }

      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        return { user: null, error: { message: profileError.message } }
      }

      const user: AuthUser = {
        id: authUser.id,
        email: authUser.email!,
        role: profile.is_consultant ? 'consultant' : 'reader',
        fullName: `${profile.first_name} ${profile.last_name}`,
        firstName: profile.first_name,
        lastName: profile.last_name,
        isConsultant: profile.is_consultant,
      }

      return { user, error: null }
    } catch (error) {
      return { user: null, error: { message: 'An unexpected error occurred' } }
    }
  }

  async updateProfile(updates: Partial<Profile>): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data: { user: authUser }, error: authError } = await this.supabase.auth.getUser()
      
      if (authError || !authUser) {
        return { user: null, error: { message: 'Not authenticated' } }
      }

      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', authUser.id)
        .select()
        .single()

      if (profileError) {
        return { user: null, error: { message: profileError.message } }
      }

      const user: AuthUser = {
        id: authUser.id,
        email: authUser.email!,
        role: profile.is_consultant ? 'consultant' : 'reader',
        fullName: `${profile.first_name} ${profile.last_name}`,
        firstName: profile.first_name,
        lastName: profile.last_name,
        isConsultant: profile.is_consultant,
      }

      return { user, error: null }
    } catch (error) {
      return { user: null, error: { message: 'An unexpected error occurred' } }
    }
  }

  onAuthStateChange(callback: (event: AuthStateChangeEvent) => void) {
    return this.supabase.auth.onAuthStateChange((event: string, session: any) => {
      callback({ event: event as any, session })
    })
  }

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email)
      return { error: error ? { message: error.message } : null }
    } catch (error) {
      return { error: { message: 'An unexpected error occurred' } }
    }
  }

  async emitAuthEvent(event: AuthEventData): Promise<{ error: AuthError | null }> {
    try {
      // Emit auth event to realtime server
      const realtimeUrl = process.env.REACT_APP_REALTIME_URL || 'http://localhost:3001'
      
      // Use fetch to emit event to realtime server
      const response = await fetch(`${realtimeUrl}/api/auth-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      })

      if (!response.ok) {
        throw new Error(`Failed to emit auth event: ${response.statusText}`)
      }

      return { error: null }
    } catch (error) {
      console.warn('Failed to emit auth event:', error)
      return { error: { message: 'Failed to emit auth event' } }
    }
  }
}

export const authClient = new AuthClient() 