// Auth types for Alice Suite applications

export interface AuthUser {
  id: string
  email: string
  role: 'reader' | 'consultant' | 'admin'
  fullName: string
  firstName: string
  lastName: string
  isConsultant: boolean
}

export interface AuthError {
  message: string
  code?: string
}

export interface AuthSession {
  user: AuthUser | null
  loading: boolean
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  firstName: string
  lastName: string
  isConsultant?: boolean
}

export interface AuthStateChangeEvent {
  event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED'
  session: any
}

// Authentication event types for real-time tracking
export interface AuthEventData {
  userId: string
  email: string
  firstName?: string
  lastName?: string
  timestamp: Date
  eventType: 'LOGIN' | 'LOGOUT' | 'SESSION_TIMEOUT' | 'USER_DISCONNECT'
  sessionDuration?: number
  deviceInfo?: {
    userAgent: string
    platform: string
    screenResolution: string
    browser: string
  }
  location?: {
    ip?: string
    country?: string
    city?: string
  }
} 