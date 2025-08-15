import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const WelcomePage: React.FC = () => {
  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        p: 2,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}
    >
      <Paper 
        elevation={6} 
        sx={{
          p: 6,
          borderRadius: 4,
          textAlign: 'center',
          maxWidth: '600px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
        }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Welcome to Alice Reader!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          You're all set to begin your journey. Verify your book to start reading.
        </Typography>
        <Button 
          component={Link} 
          to="/verify"
          variant="contained" 
          color="primary" 
          size="large"
          sx={{ 
            fontWeight: 'bold', 
            px: 5, 
            py: 1.5,
            borderRadius: '25px',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        >
          Verify Your Book
        </Button>
      </Paper>
    </Box>
  );
};

export default WelcomePage;
