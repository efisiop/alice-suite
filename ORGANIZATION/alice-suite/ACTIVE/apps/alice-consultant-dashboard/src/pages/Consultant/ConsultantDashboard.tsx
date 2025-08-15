// src/pages/Consultant/ConsultantDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Badge,
  IconButton,
  Tabs,
  Tab,
  Fade,
  Zoom,
  Slide
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import HelpIcon from '@mui/icons-material/Help';
import FeedbackIcon from '@mui/icons-material/Feedback';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { RealDataService } from '../../services/realDataService';
import { useAnalyticsService } from '../../hooks/useService';
import { usePerformance } from '../../hooks/usePerformance';
import { useConsultantAuth } from '../../contexts/ConsultantAuthContext';
import ReaderActivityDashboard from '../../components/Consultant/ReaderActivityDashboard';
import { useConsultantService } from '../../hooks/useConsultantService';
import { activityTrackingService } from '../../services/activityTrackingService';
import { useRealtimeAuth } from '../../hooks/useRealtimeAuth';
import OnlineReadersWidget from '../../components/Consultant/OnlineReadersWidget';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 4, height: '100%', overflow: 'auto', maxHeight: '1000px' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ConsultantDashboard: React.FC = () => {
  // Authentication with consultant auth
  const { user, logout } = useConsultantAuth();
  const consultantService = useConsultantService();
  const { service: analyticsService } = useAnalyticsService();
  const realDataService = RealDataService.getInstance();
  const { onlineReaders, isConnected, isDemoMode, refreshOnlineReaders, getActiveReaderCount } = useRealtimeAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>({
    assignedReaders: [],
    helpRequests: [],
    feedback: [],
    currentlyLoggedIn: 0,
    stats: {
      totalReaders: 0,
      activeReaders: 0,
      pendingHelpRequests: 0,
      resolvedHelpRequests: 0,
      feedbackCount: 0,
      promptsSent: 0
    }
  });
  const [tabValue, setTabValue] = useState(0);
  const [visible, setVisible] = useState(false);
  
  // Track performance
  usePerformance({
    trackPageLoad: true,
    trackRender: true,
    componentName: 'ConsultantDashboard'
  });
  
  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Use real-time online readers instead of polling
  useEffect(() => {
    setDashboardData((prev: any) => ({
      ...prev,
      currentlyLoggedIn: onlineReaders.length
    }));
  }, [onlineReaders]);

  // WebSocket for real-time updates
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    const reconnectDelay = 2000;
    let isConnecting = false;

    const connectWebSocket = () => {
      if (isConnecting || ws?.readyState === WebSocket.CONNECTING) {
        console.log('WebSocket connection already in progress, skipping...');
        return;
      }

      try {
        isConnecting = true;
        ws = new WebSocket('ws://localhost:3001');

        ws.onopen = () => {
          console.log('Connected to activity WebSocket server');
          reconnectAttempts = 0; // Reset reconnect attempts on successful connection
          isConnecting = false;
        };

        ws.onmessage = event => {
          try {
            const activity = JSON.parse(event.data);
            console.log('Received activity:', activity);
            // Update dashboardData based on the activity
            setDashboardData((prevData: any) => {
              const newData = { ...prevData };
              if (activity.type === 'app_start') {
                newData.stats.totalReaders += 1;
                newData.stats.activeReaders += 1;
              }
              // Add more logic here to update other parts of dashboardData
              return newData;
            });
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = (event) => {
          console.log('Disconnected from activity WebSocket server', event.code, event.reason);
          isConnecting = false;
          
          // Only attempt to reconnect if it wasn't a clean close and we haven't exceeded max attempts
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`WebSocket reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts}`);
            
            reconnectTimeout = setTimeout(() => {
              connectWebSocket();
            }, reconnectDelay * reconnectAttempts);
          }
        };

        ws.onerror = error => {
          console.error('WebSocket error:', error);
          isConnecting = false;
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        isConnecting = false;
      }
    };

    // Initial connection with a small delay to ensure component is fully mounted
    const initialConnectionTimeout = setTimeout(() => {
      connectWebSocket();
    }, 100);

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (initialConnectionTimeout) {
        clearTimeout(initialConnectionTimeout);
      }
      if (ws) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, []);
  
  
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Track tab change
    if (analyticsService) {
      analyticsService.trackEvent('consultant_tab_change', {
        tabIndex: newValue
      });
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }
  
    
  return (
    <Fade in={visible} timeout={800}>
      <Box sx={{ 
        p: 3, 
        width: '100%', 
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <Slide direction="down" in={visible} timeout={600}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 0 }}>
                Consultant Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor and assist your assigned readers
              </Typography>
            </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (
            <Typography variant="body2" color="text.secondary">
              Welcome, {user.firstName} {user.lastName}
            </Typography>
          )}
          
          <IconButton color="primary" sx={{ mr: 1 }}>
            <Badge badgeContent={dashboardData.helpRequests.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <Button 
            variant="contained" 
            component={RouterLink} 
            to="/consultant/help-requests"
            startIcon={<HelpIcon />}
            sx={{ mr: 1 }}
          >
            Help Requests
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={logout}
            startIcon={<LogoutIcon />}
            size="small"
          >
            Logout
          </Button>
        </Box>
          </Box>
        </Slide>
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          {
            title: 'Currently Logged In',
            value: onlineReaders.length,
            secondary: `${getActiveReaderCount()} active now`,
            icon: <PersonIcon sx={{ fontSize: 24 }} />,
            color: 'success.main',
            link: '/consultant/readers'
          },
          {
            title: 'Assigned Readers',
            value: dashboardData.stats.totalReaders,
            secondary: `${dashboardData.stats.activeReaders} active`,
            icon: <PeopleIcon sx={{ fontSize: 24 }} />,
            color: 'primary.main',
            link: '/consultant/readers'
          },
          {
            title: 'Help Requests',
            value: dashboardData.stats.pendingHelpRequests,
            secondary: `${dashboardData.stats.resolvedHelpRequests} resolved`,
            icon: <HelpIcon sx={{ fontSize: 24 }} />,
            color: 'error.main',
            link: '/consultant/help-requests'
          },
          {
            title: 'Reader Feedback',
            value: dashboardData.stats.feedbackCount,
            secondary: 'Last 7 days',
            icon: <FeedbackIcon sx={{ fontSize: 24 }} />,
            color: 'success.main',
            link: '/consultant/feedback'
          },
          {
            title: 'Prompts Sent',
            value: dashboardData.stats.promptsSent,
            secondary: 'Last 7 days',
            icon: <NotificationsIcon sx={{ fontSize: 24 }} />,
            color: 'info.main',
            link: '/consultant/prompts'
          }
        ].map((card, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Zoom in={visible} style={{ transitionDelay: `${index * 100 + 400}ms` }}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 1, 
                  height: '150px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
              >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: card.color, mr: 1, width: 32, height: 32 }}>
                  {React.cloneElement(card.icon, { sx: { fontSize: 18 } })}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {card.title}
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="h5">
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.secondary}
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Button 
                  component={RouterLink} 
                  to={card.link}
                  size="small"
                  sx={{ py: 0.5, px: 1, fontSize: '0.75rem' }}
                >
                  View Details
                </Button>
              </Box>
              </Paper>
            </Zoom>
          </Grid>
        ))}
      </Grid>
      
      {/* Dashboard Content */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Slide direction="up" in={visible} timeout={800}>
            <Paper sx={{ borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
              <Tab label="Assigned Readers" />
              <Tab label="Help Requests" />
              <Tab label="Recent Feedback" />
              <Tab label="Reader Activity" /> {/* New Tab */}
            </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <List sx={{ p: 2 }}>
            {dashboardData.assignedReaders && dashboardData.assignedReaders.length > 0 ? (
              dashboardData.assignedReaders.map((reader: any) => (
                <ListItem 
                  key={reader.id}
                  sx={{ 
                    mb: 1.5, 
                    p: 2, 
                    bgcolor: 'background.paper', 
                    borderRadius: 1,
                    boxShadow: 1
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {reader.name}
                        <Chip 
                          label={reader.status === 'active' ? 'Active' : 'Inactive'} 
                          color={reader.status === 'active' ? 'success' : 'default'}
                          size="medium"
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body1">
                          Progress: {reader.progress}% • Last active: {reader.lastActive}
                        </Typography>
                      </>
                    }
                  />
                  <Button 
                    variant="outlined" 
                    size="medium"
                    component={RouterLink}
                    to={`/consultant/readers/${reader.id}`}
                  >
                    View Profile
                  </Button>
                </ListItem>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom color="text.secondary">
                  No Assigned Readers
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  You haven't been assigned any readers yet. Readers will appear here once they are assigned to you.
                </Typography>
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to="/consultant/assign-readers"
                  size="small"
                  sx={{ mt: 2 }}
                >
                  Assign New Readers
                </Button>
              </Box>
            )}
          </List>
          
          {dashboardData.assignedReaders && dashboardData.assignedReaders.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 0.25 }}>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/consultant/readers"
                size="small"
                sx={{ py: 0.25, px: 1, fontSize: '0.7rem' }}
              >
                View All Readers
              </Button>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <List sx={{ p: 2 }}>
            {dashboardData.helpRequests && dashboardData.helpRequests.length > 0 ? (
              dashboardData.helpRequests.map((request: any) => (
                <ListItem 
                  key={request.id}
                  sx={{ 
                    mb: 1.5, 
                    p: 2, 
                    bgcolor: 'background.paper', 
                    borderRadius: 1,
                    boxShadow: 1
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6">
                          {request.reader}
                        </Typography>
                        <Chip 
                          label={request.status} 
                          color={request.status === 'pending' ? 'error' : 'success'}
                          size="medium"
                          sx={{ ml: 2 }}
                        />
                        <Typography variant="body1" color="text.secondary" sx={{ ml: 'auto' }}>
                          {request.time}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body1" sx={{ mt: 1.5 }}>
                        "{request.question}"
                      </Typography>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <HelpIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom color="text.secondary">
                  No Help Requests
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  There are currently no help requests from readers. When readers ask for help, their requests will appear here.
                </Typography>
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to="/consultant/help-requests"
                  color="error"
                  size="small"
                  sx={{ mt: 2 }}
                >
                  View Help Requests Page
                </Button>
              </Box>
            )}
          </List>
          
          {dashboardData.helpRequests && dashboardData.helpRequests.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 0.25 }}>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/consultant/help-requests"
                color="error"
                size="small"
                sx={{ py: 0.25, px: 1, fontSize: '0.7rem' }}
              >
                Respond to Help Requests
              </Button>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <List sx={{ p: 2 }}>
            {dashboardData.feedback && dashboardData.feedback.length > 0 ? (
              dashboardData.feedback.map((feedback: any) => (
                <ListItem 
                  key={feedback.id}
                  sx={{ 
                    mb: 1.5, 
                    p: 2, 
                    bgcolor: 'background.paper', 
                    borderRadius: 1,
                    boxShadow: 1
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6">
                          {feedback.reader}
                        </Typography>
                        <Chip 
                          label={feedback.type} 
                          color="primary"
                          size="medium"
                          sx={{ ml: 2 }}
                        />
                        <Box sx={{ ml: 2 }}>
                          {Array(feedback.rating).fill(0).map((_, i) => (
                            <span key={i} role="img" aria-label="star">⭐</span>
                          ))}
                        </Box>
                        <Typography variant="body1" color="text.secondary" sx={{ ml: 'auto' }}>
                          {feedback.time}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body1" sx={{ mt: 1.5 }}>
                        "{feedback.content}"
                      </Typography>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <FeedbackIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom color="text.secondary">
                  No Recent Feedback
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No feedback has been received from readers recently. When readers leave feedback, it will appear here.
                </Typography>
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to="/consultant/feedback"
                  color="primary"
                  size="small"
                  sx={{ mt: 2 }}
                >
                  View Feedback Page
                </Button>
              </Box>
            )}
          </List>
          
          {dashboardData.feedback && dashboardData.feedback.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 0.25 }}>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/consultant/feedback"
                color="primary"
                size="small"
                sx={{ py: 0.25, px: 1, fontSize: '0.7rem' }}
              >
                View All Feedback
              </Button>
            </Box>
          )}
        </TabPanel>
        
        {/* New TabPanel for Reader Activity */}
        <TabPanel value={tabValue} index={3}>
          <ReaderActivityDashboard />
        </TabPanel>
        </Paper>
      </Slide>
    </Grid>
    
    <Grid item xs={12} md={4}>
      <Slide direction="left" in={visible} timeout={800}>
        <Box sx={{ height: '100%' }}>
          <OnlineReadersWidget 
            readers={onlineReaders}
            loading={false}
            isDemoMode={isDemoMode}
          />
        </Box>
      </Slide>
    </Grid>
  </Grid>
      
      {/* Quick Actions */}
      <Slide direction="up" in={visible} timeout={1000}>
        <Paper sx={{ p: 2, mt: 2, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 1, fontWeight: 'bold' }}>
          Quick Actions
        </Typography>
        <Divider sx={{ mb: 1.5 }} />
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              component={RouterLink}
              to="/consultant/send-prompt"
              size="small"
              sx={{ py: 1, fontSize: '0.75rem' }}
            >
              Send Subtle Prompt
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              component={RouterLink}
              to="/consultant/reading-insights"
              size="small"
              sx={{ py: 1, fontSize: '0.75rem' }}
            >
              Generate Insights
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              component={RouterLink}
              to="/consultant/assign-readers"
              size="small"
              sx={{ py: 1, fontSize: '0.75rem' }}
            >
              Assign Readers
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              component={RouterLink}
              to="/consultant/reports"
              size="small"
              sx={{ py: 1, fontSize: '0.75rem' }}
            >
              Generate Reports
            </Button>
          </Grid>
        </Grid>
        </Paper>
      </Slide>
      </Box>
    </Fade>
  );
};

export default ConsultantDashboard;
