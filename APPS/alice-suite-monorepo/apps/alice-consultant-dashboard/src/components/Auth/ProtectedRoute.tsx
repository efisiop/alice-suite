import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { Box, CircularProgress } from '@mui/material';
import { appLog } from '../../components/LogViewer';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireVerification?: boolean;
  requireAdmin?: boolean;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireVerification = true,
  requireAdmin = false
}) => {
  const { user, loading, isVerified, isBypassMode } = useAuth();
  const location = useLocation();

  // Log navigation for debugging
  useEffect(() => {
    appLog('ProtectedRoute', `Navigating to protected route: ${location.pathname}`, 'info', {
      isAuthenticated: !!user,
      isVerified,
      isBypassMode,
      requireVerification,
      requireAdmin
    });
  }, [location.pathname, user, isVerified, isBypassMode, requireVerification, requireAdmin]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if we're in a redirect loop
  const isRedirectLoop = location.state && (location.state as any).isRedirect;

  // Allow access if user is authenticated OR bypass mode is enabled
  if (!user && !isBypassMode) {
    appLog('ProtectedRoute', 'User not authenticated and bypass mode disabled, redirecting to login', 'info');
    return <Navigate to="/login" state={{ from: location, isRedirect: true }} replace />;
  }

  // Check if admin access is required first
  if (requireAdmin) {
    // Allow admin access if bypass mode is enabled OR user has admin permissions
    const isAdmin = user?.email?.endsWith('@alicereader.com') ||
                   user?.email === 'admin@example.com' ||
                   localStorage.getItem('isAdmin') === 'true' ||
                   isBypassMode;

    if (!isAdmin) {
      appLog('ProtectedRoute', 'User not authorized for admin access', 'warning');
      return <Navigate to="/reader" state={{ from: location, isRedirect: true }} replace />;
    }

    appLog('ProtectedRoute', 'Admin access granted', 'success');
    // If admin access is granted, we don't need to check verification for admin pages
    return <>{children}</>;
  }

  // Only check verification for non-admin routes - bypass if bypass mode enabled
  if (requireVerification && !isVerified && !isBypassMode) {
    appLog('ProtectedRoute', 'User not verified and bypass mode disabled, redirecting to verification page', 'info');
    // Prevent redirect loop by checking if we're already coming from the verification page
    if (isRedirectLoop) {
      appLog('ProtectedRoute', 'Detected redirect loop, rendering children anyway', 'warning');
      return <>{children}</>;
    }
    return <Navigate to="/verify" state={{ from: location, isRedirect: true }} replace />;
  }

  appLog('ProtectedRoute', 'Access granted - user authenticated, bypass mode enabled, or verification bypassed', 'success');
  return <>{children}</>;
};

export default ProtectedRoute;