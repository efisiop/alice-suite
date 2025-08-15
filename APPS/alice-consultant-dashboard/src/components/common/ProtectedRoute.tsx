import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { appLog } from '../LogViewer';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'consultant';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredRole 
}) => {
  const { user, loading, isConsultant, isBypassMode } = useAuth();
  const location = useLocation();

  // Show nothing while checking auth status or bypass mode
  if (loading) {
    return null;
  }

  // Check for bypass mode in localStorage as fallback
  const bypassModeActive = isBypassMode || localStorage.getItem('bypass-mode') === 'true';

  // If not authenticated and not in bypass mode, redirect to login
  if (!user && !bypassModeActive) {
    appLog('ProtectedRoute', 'User not authenticated, redirecting to login', 'info');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required, check it (bypass mode always has consultant role)
  if (requiredRole === 'consultant' && !isConsultant() && !bypassModeActive) {
    appLog('ProtectedRoute', 'User not authorized as consultant, redirecting to home', 'warning');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}; 