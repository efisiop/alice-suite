import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

const BypassPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bypassInfo, setBypassInfo] = useState<string>('');

  // This is a temporary bypass for development/testing purposes
  // In production, this should be removed or properly secured
  const handleBypass = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create a mock session for testing
      const mockUser = {
        id: 'bypass-user-id',
        email: 'bypass@alice.com',
        user_metadata: {
          first_name: 'Bypass',
          last_name: 'User',
          is_consultant: true,
          is_verified: true,
          book_verified: true,
        },
        app_metadata: {
          provider: 'email',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store mock data in localStorage for the session
      localStorage.setItem('bypass-mode', 'true');
      localStorage.setItem('bypass-user', JSON.stringify(mockUser));
      localStorage.setItem('bypass-timestamp', new Date().toISOString());

      // Also set some mock profile data
      const mockProfile = {
        id: 'bypass-user-id',
        first_name: 'Alice',
        last_name: 'Consultant',
        email: 'bypass@alice.com',
        is_consultant: true,
        is_verified: true,
        book_verified: true,
      };
      localStorage.setItem('bypass-profile', JSON.stringify(mockProfile));

      // Navigate to the dashboard
      navigate('/', { replace: true });
    } catch (err) {
      setError('Failed to create bypass session. Please try again.');
      console.error('Bypass error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if bypass is already active
    const bypassActive = localStorage.getItem('bypass-mode') === 'true';
    if (bypassActive) {
      const timestamp = localStorage.getItem('bypass-timestamp');
      if (timestamp) {
        const age = Date.now() - new Date(timestamp).getTime();
        const hours = Math.floor(age / (1000 * 60 * 60));
        setBypassInfo(`Bypass session active for ${hours} hours`);
      }
    }
  }, []);

  const handleClearBypass = () => {
    localStorage.removeItem('bypass-mode');
    localStorage.removeItem('bypass-user');
    localStorage.removeItem('bypass-profile');
    localStorage.removeItem('bypass-timestamp');
    setBypassInfo('');
    setError(null);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            🚨 Temporary Bypass
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This is a temporary bypass for development/testing purposes only.
              Do not use in production environments.
            </Typography>
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" paragraph>
              This bypass page allows direct access to the consultant dashboard without authentication.
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              When you click "Enter Dashboard", a mock session will be created with consultant privileges.
              All data will be simulated and not persisted to the database.
            </Typography>
          </Box>

          {bypassInfo && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {bypassInfo}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleBypass}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Creating Session...' : 'Enter Dashboard (Bypass)'}
            </Button>

            {localStorage.getItem('bypass-mode') === 'true' && (
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                fullWidth
                onClick={handleClearBypass}
              >
                Clear Bypass Session
              </Button>
            )}

            <Divider sx={{ my: 2 }} />

            <Button
              variant="text"
              color="primary"
              size="medium"
              fullWidth
              onClick={() => navigate('/login')}
            >
              Back to Normal Login
            </Button>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Bypass Details:</strong><br />
              • User: Alice Consultant<br />
              • Role: Consultant<br />
              • Access: Full dashboard access<br />
              • Data: Mock/simulated data<br />
              • Duration: Until browser session ends or cleared
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default BypassPage;