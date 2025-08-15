// src/pages/Auth/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAnalyticsService, useConsultantService } from '../../hooks/useService';
import { usePerformance } from '../../hooks/usePerformance';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { getUserProfile as authGetUserProfile } from '../../services/authService';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { Zoom } from '@mui/material';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, isVerified } = useAuth();
  const { service: analyticsService } = useAnalyticsService();
  const { service: consultantService } = useConsultantService();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Track performance
  usePerformance({
    trackPageLoad: true,
    trackRender: true,
    componentName: 'LoginPage'
  });

  

  // Check for redirect message in location state
  useEffect(() => {
    if (location.state && location.state.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Track page view
  useEffect(() => {
    if (analyticsService) {
      analyticsService.trackPageView('login_page');
    }
  }, [analyticsService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('LoginPage: Attempting consultant login with email:', email);
      const startTime = performance.now();
      const { error, user } = await signIn(email, password);

      if (error) {
        console.error('LoginPage: Login error:', error);
        throw error;
      }

      if (!user) {
        throw new Error('No user returned from authentication');
      }

      console.log('LoginPage: Login successful, checking consultant status...');

      // Check if user is a consultant
      const { profile: userProfile } = await authGetUserProfile(user.id);
      if (!userProfile?.is_consultant) {
        console.log('LoginPage: User is not a consultant');
        setError('Access denied. This portal is for approved consultants only.');
        
        // Sign out non-consultant users immediately
        await signOut();
        setLoading(false);
        return;
      }

      console.log('LoginPage: Consultant login successful, user:', user);

      if (analyticsService) {
        analyticsService.trackEvent('consultant_login', {
          success: true,
          timeToComplete: performance.now() - startTime,
          consultantId: user.id
        });
      }

      setSuccessMessage('Welcome back, consultant!');

      // Log the consultant login event
      if (consultantService && user) {
        try {
          await consultantService.logConsultantAction(user.id, 'CONSULTANT_LOGIN', { email: user.email });
          console.log('LoginPage: Consultant login event logged successfully.');
        } catch (logError) {
          console.error('LoginPage: Failed to log consultant login event:', logError);
        }
      }

      // Set navigating state to prevent login page flash
      setIsNavigating(true);

      // Navigate directly to consultant dashboard
      console.log('LoginPage: Navigating to consultant dashboard');
      navigate('/consultant/dashboard', { replace: true });
      
    } catch (err: any) {
      console.error('LoginPage: Login failed:', err);
      setError(err.message || 'Login failed. Please check your credentials or contact support.');

      if (analyticsService) {
        analyticsService.trackEvent('consultant_login_attempt', {
          success: false,
          error: err.message,
          email: email
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 3
    }}>
      {/* Loading overlay when navigating */}
      {isNavigating && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Redirecting to dashboard...
            </Typography>
          </Box>
        </Box>
      )}
      
      <Container maxWidth="sm">
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Paper
            elevation={6}
            sx={{
              p: 4,
              width: '100%',
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <SupportAgentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Consultant Portal
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Sign in to access your consultant dashboard
              </Typography>
            </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error && !email.trim()}
              disabled={loading || isNavigating}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error && !password.trim()}
              disabled={loading || isNavigating}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading || isNavigating}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2">
                Need access?{' '}
                <Link href="mailto:support@alice-reader.com">
                  Contact Support
                </Link>
              </Typography>
            </Box>
          </Box>
          </Paper>
        </Zoom>
      </Container>
    </Box>
  );
};

export default LoginPage;
