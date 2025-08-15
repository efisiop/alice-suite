import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  Snackbar,
  Fade
} from '@mui/material';
import { RealtimeActivity, OnlineReader } from '../../services/realtime-service';
import { OnlineReadersWidget } from './OnlineReadersWidget';
import { EnhancedRealtimeActivityFeed } from './EnhancedRealtimeActivityFeed';
import { SessionStatistics, SessionStats } from './SessionStatistics';
import { useRealtimeService } from '../../services/realtime-service';

export const RealtimeDashboard: React.FC = () => {
  const { service, isConnected, onlineReaders, recentActivity } = useRealtimeService();
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalSessions: 0,
    activeSessions: 0,
    averageSessionDuration: 0,
    peakConcurrentUsers: 0,
    currentConcurrentUsers: 0,
    sessionsToday: 0,
    sessionsThisWeek: 0,
    sessionsThisMonth: 0
  });
  const [showConnectionAlert, setShowConnectionAlert] = useState(false);
  const [selectedReader, setSelectedReader] = useState<OnlineReader | null>(null);

  // Calculate session statistics based on activity
  const calculateSessionStats = useCallback((activities: RealtimeActivity[], readers: OnlineReader[]) => {
    const loginEvents = activities.filter(a => a.eventType === 'LOGIN');
    const logoutEvents = activities.filter(a => a.eventType === 'LOGOUT');
    
    // Calculate session durations
    const sessionDurations = logoutEvents
      .filter(event => event.data?.sessionDuration)
      .map(event => event.data.sessionDuration)
      .filter(duration => duration > 0);

    const avgDuration = sessionDurations.length > 0 
      ? sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length
      : 0;

    // Get today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionsToday = loginEvents.filter(event => 
      new Date(event.timestamp) >= today
    ).length;

    // Get this week's sessions
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const sessionsThisWeek = loginEvents.filter(event => 
      new Date(event.timestamp) >= weekStart
    ).length;

    // Get this month's sessions
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const sessionsThisMonth = loginEvents.filter(event => 
      new Date(event.timestamp) >= monthStart
    ).length;

    // Calculate peak concurrent users (simplified)
    const peakUsers = Math.max(readers.length, sessionStats.peakConcurrentUsers);

    setSessionStats({
      totalSessions: loginEvents.length,
      activeSessions: readers.length,
      averageSessionDuration: Math.round(avgDuration / 60), // Convert to minutes
      peakConcurrentUsers: peakUsers,
      currentConcurrentUsers: readers.length,
      sessionsToday,
      sessionsThisWeek,
      sessionsThisMonth
    });
  }, [sessionStats.peakConcurrentUsers]);

  useEffect(() => {
    calculateSessionStats(recentActivity, onlineReaders);
  }, [recentActivity, onlineReaders, calculateSessionStats]);

  useEffect(() => {
    setShowConnectionAlert(!isConnected);
  }, [isConnected]);

  const handleReaderClick = (reader: OnlineReader) => {
    setSelectedReader(reader);
    // Could open a detailed reader modal/profile
  };

  const handleRefreshStats = () => {
    if (service) {
      service.getOnlineReaders();
      service.getRecentEvents(100);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Connection Status */}
      <Snackbar
        open={showConnectionAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="warning" onClose={() => setShowConnectionAlert(false)}>
          Real-time connection lost. Some features may be delayed.
        </Alert>
      </Snackbar>

      <Fade in={true} timeout={600}>
        <Box>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h4" component="h1">
              Real-Time Monitoring
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip
                label={isConnected ? 'Live' : 'Offline'}
                color={isConnected ? 'success' : 'error'}
                icon={<Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: isConnected ? 'success.main' : 'error.main',
                  animation: isConnected ? 'pulse 2s infinite' : 'none'
                }} />}
              />
              <Chip
                label={`${onlineReaders.length} online`}
                variant="outlined"
                color="primary"
              />
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Session Statistics */}
            <Grid item xs={12}>
              <SessionStatistics
                stats={sessionStats}
                onRefresh={handleRefreshStats}
              />
            </Grid>

            {/* Online Readers */}
            <Grid item xs={12} md={4}>
              <OnlineReadersWidget
                readers={onlineReaders}
                onReaderClick={handleReaderClick}
                loading={!isConnected}
              />
            </Grid>

            {/* Real-time Activity Feed */}
            <Grid item xs={12} md={8}>
              <EnhancedRealtimeActivityFeed
                activities={recentActivity}
                maxItems={25}
                showFilters={true}
              />
            </Grid>
          </Grid>

          {/* Selected Reader Details (if any) */}
          {selectedReader && (
            <Box mt={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom
>
                    Selected Reader: {selectedReader.firstName || selectedReader.lastName 
                      ? `${selectedReader.firstName || ''} ${selectedReader.lastName || ''}`.trim()
                      : 'Anonymous'}
                  </Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Chip label={`User ID: ${selectedReader.userId}`} variant="outlined" />
                    <Chip 
                      label={`Last Activity: ${new Date(selectedReader.lastActivity).toLocaleString()}`} 
                      variant="outlined" 
                    />
                    {selectedReader.currentBook && (
                      <Chip 
                        label={`Current Book: ${selectedReader.currentBook}`} 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </Fade>

      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </Box>
  );
};