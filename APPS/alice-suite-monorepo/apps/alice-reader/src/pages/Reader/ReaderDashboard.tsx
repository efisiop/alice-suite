// src/pages/Reader/ReaderDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  IconButton,
  LinearProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Alert,
  Snackbar
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import NoteIcon from '@mui/icons-material/Note';
import HelpIcon from '@mui/icons-material/Help';
import TimerIcon from '@mui/icons-material/Timer';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { localAliceCover } from '../../assets';
import { useBookService, useAuthService, useAnalyticsService } from '../../hooks/useService';
import { usePerformance } from '../../hooks/usePerformance';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { useAIPrompt } from '../../contexts/AIPromptContext';
import { getReadingProgress, getReadingStats } from '../../services/backendService';
import { ALICE_BOOK_ID } from '../../data/fallbackBookData';

// Types for reading progress and stats
interface ReadingProgressData {
  section_id: string;
  last_position: string | null;
  last_read_at: string;
  section_title?: string;
  section_number?: number;
  page_number?: number;
}

interface ReadingStatsData {
  total_reading_time: number;
  pages_read: number;
  sessions_count: number;
  last_session_date: string;
  created_at: string;
}

const ReaderDashboard: React.FC = () => {
  console.log('ReaderDashboard: Rendering component');
  const navigate = useNavigate();
  const { service: bookService, loading: bookLoading } = useBookService();
  const { loading: authLoading } = useAuthService();
  const { service: analyticsService } = useAnalyticsService();
  const { user, profile } = useAuth();
  const { latestPrompt, clearPrompt } = useAIPrompt();
  const [bookData, setBookData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Reading progress and stats state
  const [readingProgress, setReadingProgress] = useState<ReadingProgressData | null>(null);
  const [readingStats, setReadingStats] = useState<ReadingStatsData | null>(null);
  const [progressLoading, setProgressLoading] = useState<boolean>(true);

  // Track performance
  usePerformance({
    trackPageLoad: true,
    trackRender: true,
    componentName: 'ReaderDashboard'
  });

  // Load user data and book data
  useEffect(() => {
    console.log('ReaderDashboard: useEffect triggered', {
      hasBookService: !!bookService,
      hasUser: !!user,
      userId: user?.id
    });

    if (!bookService || !user) {
      console.log('ReaderDashboard: Missing bookService or user, skipping data load');
      return;
    }

    const loadData = async () => {
      console.log('ReaderDashboard: Starting to load data');
      try {
        // Get book data
        console.log('ReaderDashboard: Fetching book data');
        const book = await bookService.getBook('alice-in-wonderland');
        console.log('ReaderDashboard: Book data received', book);
        setBookData(book);

        // Track page view
        if (analyticsService) {
          console.log('ReaderDashboard: Tracking page view');
          analyticsService.trackPageView('reader_dashboard', {
            userId: user.id,
            bookId: 'alice-in-wonderland'
          });
        }
      } catch (error) {
        console.error('ReaderDashboard: Error loading data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while loading data');
      } finally {
        console.log('ReaderDashboard: Finished loading data, setting loading to false');
        setLoading(false);
      }
    };

    loadData();
  }, [bookService, user, analyticsService]);

  // Load reading progress and stats
  useEffect(() => {
    if (!user) return;

    const loadProgressData = async () => {
      try {
        console.log('ReaderDashboard: Loading reading progress and stats');
        
        // Load reading progress
        const progressResult = await getReadingProgress(user.id, ALICE_BOOK_ID);
        if (progressResult.data) {
          // Transform the data to match our interface
          const transformedProgress: ReadingProgressData = {
            section_id: progressResult.data.section_id,
            last_position: progressResult.data.last_position,
            last_read_at: progressResult.data.last_read_at || new Date().toISOString(),
            section_title: progressResult.data.section_title,
            section_number: progressResult.data.section_number,
            page_number: progressResult.data.page_number
          };
          setReadingProgress(transformedProgress);
        }
        
        // Load reading stats  
        const statsResult = await getReadingStats(user.id, ALICE_BOOK_ID);
        if (statsResult.data) {
          setReadingStats(statsResult.data);
        }
        
        console.log('ReaderDashboard: Progress and stats loaded', {
          hasProgress: !!progressResult.data,
          hasStats: !!statsResult.data
        });
      } catch (error) {
        console.error('ReaderDashboard: Error loading progress data:', error);
      } finally {
        setProgressLoading(false);
      }
    };

    loadProgressData();
  }, [user]);

  // Helper functions for progress calculations
  const calculateReadingProgress = () => {
    if (!readingStats) return 0;
    // Estimate: Alice in Wonderland has approximately 200 pages
    const totalPages = 200;
    return Math.min((readingStats.pages_read / totalPages) * 100, 100);
  };

  const formatReadingTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const getLastReadingDate = () => {
    if (!readingProgress) return null;
    return new Date(readingProgress.last_read_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Show loading state
  if (authLoading || bookLoading || loading) {
    console.log('ReaderDashboard: Showing loading state');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    console.log('ReaderDashboard: Showing error state:', error);
    return (
      <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" paragraph>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Paper>
      </Box>
    );
  }

  // Fallback if no book data
  if (!bookData) {
    console.log('ReaderDashboard: No book data available, showing fallback');
    return (
      <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {profile?.first_name || 'Reader'}!
        </Typography>
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Dashboard Test
          </Typography>
          <Typography variant="body1" paragraph>
            Your book data is being loaded. If this message persists, please try refreshing the page.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome back, {profile?.first_name || 'Reader'}!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Your reading companion for Alice in Wonderland
        </Typography>
        {readingProgress && (
          <Typography variant="body1" sx={{ mt: 2 }}>
            Last read: {getLastReadingDate()}
          </Typography>
        )}
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {/* Reading Progress Overview */}
          {!progressLoading && readingProgress && (
            <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                Your Reading Progress
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Overall Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {calculateReadingProgress().toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={calculateReadingProgress()} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <TimerIcon color="primary" sx={{ mb: 1 }} />
                    <Typography variant="h6">
                      {readingStats ? formatReadingTime(readingStats.total_reading_time) : '0min'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Reading Time
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <MenuBookIcon color="primary" sx={{ mb: 1 }} />
                    <Typography variant="h6">
                      {readingStats ? readingStats.pages_read : 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pages Read
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <CalendarTodayIcon color="primary" sx={{ mb: 1 }} />
                    <Typography variant="h6">
                      {readingStats ? readingStats.sessions_count : 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Reading Sessions
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Continue Reading Section */}
          {!progressLoading && readingProgress && (
            <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AutoAwesomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                Continue Reading
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip 
                  label={`Section ${readingProgress.section_number || 'Unknown'}`}
                  color="primary" 
                  variant="outlined" 
                  sx={{ mr: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Last read: {getLastReadingDate()}
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/reader/interaction')}
                sx={{ mt: 2 }}
              >
                Resume Reading
              </Button>
            </Paper>
          )}

          {/* Main Call to Action Card */}
          <Paper
            elevation={3}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              mb: 4,
              textAlign: 'center',
              p: 0
            }}
          >
            <Box sx={{
              p: 0,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              height: { sm: '300px' }
            }}>
              {/* Book Cover */}
              <Box
                sx={{
                  width: { xs: '100%', sm: '200px' },
                  height: { xs: '200px', sm: '100%' },
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box
                  component="img"
                  src={localAliceCover}
                  alt={bookData?.title || "Alice in Wonderland"}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>

              {/* Book Info and Main CTA */}
              <Box sx={{
                p: 3,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <Typography variant="h5" gutterBottom>
                  {bookData?.title || "Alice's Adventures in Wonderland"}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  By {bookData?.author || "Lewis Carroll"}
                </Typography>

                <Divider sx={{ my: 2, width: '100%' }} />

                <Typography variant="body1" sx={{ mb: 3 }}>
                  {readingProgress 
                    ? "Continue your reading journey with your AI companion by your side."
                    : "Ready to start your reading journey? Sync with your physical book to get contextual help, definitions, and AI assistance."
                  }
                </Typography>

                <Button
                  onClick={() => {
                    console.log('ReaderDashboard: Navigating to reader page');
                    navigate('/reader/interaction');
                  }}
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<MenuBookIcon />}
                  sx={{
                    py: 2,
                    px: 5,
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    minWidth: '280px',
                    boxShadow: 4,
                    mt: 2,
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 6
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  {readingProgress ? 'Continue Reading' : 'Start Reading'}
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Welcome Message */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              How to Use Your Reading Companion
            </Typography>
            <Typography variant="body1" paragraph>
              The Alice Reader App is designed to enhance your experience with the physical book, not replace it.
            </Typography>
            <List>
              {[
                "Tell us what page you're on in your physical copy of Alice in Wonderland",
                "Get contextual information about characters, themes, and plot points",
                "Look up definitions for unfamiliar words by highlighting text",
                "Ask the AI assistant questions about what you're reading"
              ].map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {index + 1}
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Sidebar - Narrower */}
        <Grid item xs={12} md={3}>
          {/* Quick Actions */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<EqualizerIcon />}
                component={RouterLink}
                to="/reader/statistics"
              >
                View Statistics
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<BookmarkIcon />}
                disabled
              >
                Bookmarks (Soon)
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<NoteIcon />}
                disabled
              >
                Reading Notes (Soon)
              </Button>
              <Button
                variant="outlined"
                fullWidth
                color="secondary"
                onClick={() => alert('Thank you for your interest! Feedback collection is coming soon.')}
              >
                Give Feedback
              </Button>
            </Stack>
          </Paper>

          {/* Reading Tips */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AutoAwesomeIcon sx={{ mr: 1, color: 'primary.main' }} />
              Reading Tips
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Hover over words"
                  secondary="See instant definitions and context"
                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                  secondaryTypographyProps={{ fontSize: '0.8rem' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Select text"
                  secondary="Get AI explanations for complex passages"
                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                  secondaryTypographyProps={{ fontSize: '0.8rem' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Sync your page"
                  secondary="Keep your digital progress in sync"
                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                  secondaryTypographyProps={{ fontSize: '0.8rem' }}
                />
              </ListItem>
            </List>
          </Paper>

          {/* Help & Resources */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <HelpIcon sx={{ mr: 1, color: 'primary.main' }} />
              Help & Resources
            </Typography>
            <Typography variant="body2" paragraph>
              Need help with the Alice Reader app? Check out these resources:
            </Typography>
            <List>
              {[
                { title: 'User Guide', link: '/help/guide' },
                { title: 'FAQ', link: '/help/faq' },
                { title: 'Contact Support', link: '/help/contact' },
                // Add Alice glossary demo link in development mode
                ...(import.meta.env.DEV ? [{ title: '✨ Alice Glossary Demo', link: '/alice-glossary-demo' }] : [])
              ].map((item, index) => (
                <ListItem
                  key={index}
                  component={RouterLink}
                  to={item.link}
                  sx={{
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                    cursor: 'pointer'
                  }}
                >
                  <ListItemText primary={item.title} />
                </ListItem>
              ))}
            </List>
          </Paper>

        </Grid>
      </Grid>

      <Snackbar
        open={!!latestPrompt}
        autoHideDuration={6000}
        onClose={clearPrompt}
        message={latestPrompt}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default ReaderDashboard;
