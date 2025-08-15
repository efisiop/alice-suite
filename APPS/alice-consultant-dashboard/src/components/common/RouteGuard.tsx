import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { appLog } from '../LogViewer';

// Define route types
type RouteType = 'public' | 'auth' | 'verified' | 'admin';

interface RouteGuardProps {
  children: React.ReactNode;
  routeType: RouteType;
}

/**
 * RouteGuard component to handle routing based on authentication and verification status
 *
 * routeType options:
 * - 'public': Accessible to everyone (landing, login, register, etc.)
 * - 'auth': Requires authentication but not verification (verify page, logout)
 * - 'verified': Requires authentication and verification (reader dashboard, etc.)
 * - 'admin': Requires admin privileges
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({ children, routeType }) => {
  const { user, loading, isVerified, profile, loginInProgress, isBypassMode } = useAuth();
  const location = useLocation();

  // Check for bypass mode in localStorage as fallback
  const bypassModeActive = isBypassMode || localStorage.getItem('bypass-mode') === 'true';

  // Log for debugging
  appLog('RouteGuard', `Checking access to ${location.pathname} (type: ${routeType})`, 'info', {
    isAuthenticated: !!user || bypassModeActive,
    isVerified: isVerified || bypassModeActive,
    routeType,
    loginInProgress,
    isBypassMode: bypassModeActive
  });

  // Show nothing while checking auth status or during login process
  if (loading || loginInProgress) {
    return null;
  }

  // Handle different route types
  switch (routeType) {
    case 'public':
      // Public routes are always accessible
      // Only redirect from login/register if user is verified AND we're not in the middle of a login process
      // Skip redirect for bypass mode and bypass page
      if ((user || bypassModeActive) && (isVerified || bypassModeActive) && 
          (location.pathname === '/login' || location.pathname === '/register') &&
          location.pathname !== '/bypass') {
        // Check if we're coming from a login process to avoid flash
        const isFromLoginProcess = location.state?.fromLoginProcess;
        // Also check if login is in progress to prevent interference
        if (!isFromLoginProcess && !loginInProgress) {
          appLog('RouteGuard', 'User is verified, redirecting from public route to dashboard', 'info');
          return <Navigate to="/" replace />;
        }
      }
      return <>{children}</>;

    case 'auth':
      // Auth routes require authentication but not verification
      if (!user && !bypassModeActive) {
        appLog('RouteGuard', 'User not authenticated, redirecting to login', 'info');
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
      return <>{children}</>;

    case 'verified':
      // Verified routes require authentication and verification
      if (!user && !bypassModeActive) {
        appLog('RouteGuard', 'User not authenticated, redirecting to login', 'info');
        return <Navigate to="/login" state={{ from: location }} replace />;
      }

      if (!isVerified && !bypassModeActive) {
        appLog('RouteGuard', 'User not verified, redirecting to verification page', 'info');
        return <Navigate to="/verify" state={{ from: location }} replace />;
      }

      return <>{children}</>;

    case 'admin':
      // Admin routes require authentication and admin privileges
      if (!user && !bypassModeActive) {
        appLog('RouteGuard', 'User not authenticated, redirecting to login', 'info');
        return <Navigate to="/login" state={{ from: location }} replace />;
      }

      // In bypass mode, treat as admin
      if (bypassModeActive) {
        return <>{children}</>;
      }

      // Check admin status (adjust this based on how admin status is stored)
      const isAdmin = (profile as any)?.is_admin ||
                     user?.email?.endsWith('@alicereader.com') ||
                     user?.email === 'admin@example.com';

      if (!isAdmin) {
        appLog('RouteGuard', 'User not authorized for admin access', 'warning');
        return <Navigate to="/reader" replace />;
      }

      return <>{children}</>;

    default:
      // Default to requiring verification for unknown route types
      appLog('RouteGuard', `Unknown route type: ${routeType}, treating as verified route`, 'warning');

      if (!user && !bypassModeActive) {
        return <Navigate to="/login" state={{ from: location }} replace />;
      }

      if (!isVerified && !bypassModeActive) {
        return <Navigate to="/verify" state={{ from: location }} replace />;
      }

      return <>{children}</>;
  }
};
