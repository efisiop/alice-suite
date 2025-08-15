
import React from 'react';
import { Box } from '@mui/material';

interface ConsultantLayoutProps {
  children: React.ReactNode;
}

const ConsultantLayout: React.FC<ConsultantLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {children}
    </Box>
  );
};

export default ConsultantLayout;
