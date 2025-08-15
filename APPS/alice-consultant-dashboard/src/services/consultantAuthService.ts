import { authClient } from '@alice-suite/api-client';
import { appLog } from '../components/LogViewer';

export interface ConsultantAuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isConsultant: boolean;
  };
  error?: string;
}

export interface ConsultantAuthService {
  signIn: (email: string, password: string) => Promise<ConsultantAuthResponse>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  getCurrentUser: () => Promise<ConsultantAuthResponse>;
  isAuthenticated: () => boolean;
  isConsultant: () => boolean;
}

class ConsultantAuthServiceImpl implements ConsultantAuthService {
  private currentUser: any = null;

  async signIn(email: string, password: string): Promise<ConsultantAuthResponse> {
    try {
      appLog('ConsultantAuth', `Attempting login for: ${email}`, 'info');

      const result = await authClient.signIn({ email, password });

      if (result.error) {
        appLog('ConsultantAuth', `Login failed: ${result.error.message}`, 'error');
        return { success: false, error: result.error.message };
      }

      if (!result.user) {
        appLog('ConsultantAuth', 'Login failed: No user data', 'error');
        return { success: false, error: 'No user data returned' };
      }

      // Check if user is a consultant
      if (!result.user.isConsultant) {
        appLog('ConsultantAuth', `Login failed: User ${email} is not a consultant`, 'error');
        return { success: false, error: 'Access denied: Not a consultant' };
      }

      this.currentUser = result.user;
      localStorage.setItem('consultant-auth', JSON.stringify(result.user));

      appLog('ConsultantAuth', `Consultant login successful: ${email}`, 'success');
      return {
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          isConsultant: result.user.isConsultant
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      appLog('ConsultantAuth', `Login error: ${errorMessage}`, 'error');
      return { success: false, error: errorMessage };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      appLog('ConsultantAuth', 'Signing out consultant', 'info');

      await authClient.signOut();
      this.currentUser = null;
      localStorage.removeItem('consultant-auth');

      appLog('ConsultantAuth', 'Consultant sign out successful', 'success');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      appLog('ConsultantAuth', `Sign out error: ${errorMessage}`, 'error');
      return { success: false, error: errorMessage };
    }
  }

  async getCurrentUser(): Promise<ConsultantAuthResponse> {
    try {
      const result = await authClient.getCurrentUser();

      if (result.error) {
        this.currentUser = null;
        localStorage.removeItem('consultant-auth');
        return { success: false, error: result.error.message };
      }

      if (!result.user || !result.user.isConsultant) {
        this.currentUser = null;
        localStorage.removeItem('consultant-auth');
        return { success: false, error: 'Not authenticated or not a consultant' };
      }

      this.currentUser = result.user;
      localStorage.setItem('consultant-auth', JSON.stringify(result.user));

      return {
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          isConsultant: result.user.isConsultant
        }
      };
    } catch (error) {
      return { success: false, error: 'Failed to get current user' };
    }
  }

  isAuthenticated(): boolean {
    if (this.currentUser) return true;

    try {
      const stored = localStorage.getItem('consultant-auth');
      if (stored) {
        this.currentUser = JSON.parse(stored);
        return true;
      }
    } catch (error) {
      localStorage.removeItem('consultant-auth');
    }

    return false;
  }

  isConsultant(): boolean {
    if (!this.isAuthenticated()) return false;
    try {
      const stored = localStorage.getItem('consultant-auth');
      if (stored) {
        const user = JSON.parse(stored);
        return user.isConsultant === true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }
}

// Singleton instance
export const consultantAuthService = new ConsultantAuthServiceImpl();