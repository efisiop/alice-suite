import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth, AuthContext } from './EnhancedAuthContext';

interface BypassUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_consultant: boolean;
  is_verified: boolean;
  book_verified: boolean;
}

interface BypassAuthContextType {
  isBypassMode: boolean;
  bypassUser: BypassUser | null;
  enableBypassMode: () => void;
  disableBypassMode: () => void;
  getBypassSession: () => any;
}

const BypassAuthContext = createContext<BypassAuthContextType | undefined>(undefined);

export const useBypassAuth = () => {
  const context = useContext(BypassAuthContext);
  if (context === undefined) {
    throw new Error('useBypassAuth must be used within a BypassAuthProvider');
  }
  return context;
};

export const BypassAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isBypassMode, setIsBypassMode] = useState(false);
  const [bypassUser, setBypassUser] = useState<BypassUser | null>(null);

  useEffect(() => {
    // Check if bypass mode is active
    const bypassActive = localStorage.getItem('bypass-mode') === 'true';
    if (bypassActive) {
      const userData = localStorage.getItem('bypass-user');
      const profileData = localStorage.getItem('bypass-profile');
      
      if (userData && profileData) {
        const profile = JSON.parse(profileData);
        setBypassUser({
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          is_consultant: profile.is_consultant,
          is_verified: profile.is_verified,
          book_verified: profile.book_verified,
        });
        setIsBypassMode(true);
      }
    }
  }, []);

  const enableBypassMode = () => {
    const mockUser = {
      id: 'bypass-user-id',
      email: 'bypass@alice.com',
      first_name: 'Alice',
      last_name: 'Consultant',
      is_consultant: true,
      is_verified: true,
      book_verified: true,
    };
    
    setBypassUser(mockUser);
    setIsBypassMode(true);
    localStorage.setItem('bypass-mode', 'true');
    localStorage.setItem('bypass-user', JSON.stringify(mockUser));
    localStorage.setItem('bypass-profile', JSON.stringify(mockUser));
    localStorage.setItem('bypass-timestamp', new Date().toISOString());
  };

  const disableBypassMode = () => {
    setIsBypassMode(false);
    setBypassUser(null);
    localStorage.removeItem('bypass-mode');
    localStorage.removeItem('bypass-user');
    localStorage.removeItem('bypass-profile');
    localStorage.removeItem('bypass-timestamp');
  };

  const getBypassSession = () => {
    if (!isBypassMode || !bypassUser) return null;
    
    return {
      user: {
        id: bypassUser.id,
        email: bypassUser.email,
        user_metadata: {
          first_name: bypassUser.first_name,
          last_name: bypassUser.last_name,
        },
      },
      access_token: 'bypass-token',
      refresh_token: 'bypass-refresh-token',
    };
  };

  return (
    <BypassAuthContext.Provider value={{
      isBypassMode,
      bypassUser,
      enableBypassMode,
      disableBypassMode,
      getBypassSession,
    }}>
      {children}
    </BypassAuthContext.Provider>
  );
};

// HOC to wrap AuthContext and provide bypass functionality
export const withBypassAuth = (AuthProvider: React.FC<{ children: ReactNode }>) => {
  return ({ children }: { children: ReactNode }) => (
    <BypassAuthProvider>
      <AuthProvider>{children}</AuthProvider>
    </BypassAuthProvider>
  );
};