import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { consultantAuthService } from '../services/consultantAuthService';

interface ConsultantUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isConsultant: boolean;
}

interface ConsultantAuthContextType {
  user: ConsultantUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
}

const ConsultantAuthContext = createContext<ConsultantAuthContextType | undefined>(undefined);

export const ConsultantAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ConsultantUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const result = await consultantAuthService.getCurrentUser();
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await consultantAuthService.signIn(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = async () => {
    await consultantAuthService.signOut();
    setUser(null);
  };

  const isAuthenticated = consultantAuthService.isAuthenticated();

  return (
    <ConsultantAuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated,
      checkAuth
    }}>
      {children}
    </ConsultantAuthContext.Provider>
  );
};

export const useConsultantAuth = () => {
  const context = useContext(ConsultantAuthContext);
  if (context === undefined) {
    throw new Error('useConsultantAuth must be used within a ConsultantAuthProvider');
  }
  return context;
};