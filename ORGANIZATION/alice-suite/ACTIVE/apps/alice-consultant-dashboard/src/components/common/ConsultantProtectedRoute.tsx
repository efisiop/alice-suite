import React from 'react';
import { Navigate } from 'react-router-dom';
import { useConsultantAuth } from '../../contexts/ConsultantAuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ConsultantProtectedRouteProps {
  children: React.ReactNode;
}

const ConsultantProtectedRoute: React.FC<ConsultantProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useConsultantAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/consultant/login" replace />;
  }

  return <>{children}</>;
};

export default ConsultantProtectedRoute;