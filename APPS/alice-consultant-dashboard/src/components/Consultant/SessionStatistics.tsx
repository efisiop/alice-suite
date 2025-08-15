import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  TrendingUp,
  Group,
  Timer,
  Schedule,
  Refresh
} from '@mui/icons-material';

export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  averageSessionDuration: number; // in minutes
  peakConcurrentUsers: number;
  currentConcurrentUsers: number;
  sessionsToday: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
}

interface SessionStatisticsProps {
  stats: SessionStats;
  loading?: boolean;
  onRefresh?: () => void;
}

export const SessionStatistics: React.FC<SessionStatisticsProps> = ({
  stats,
  loading = false,
  onRefresh
}) => {
  const formatDuration = (minutes: number) => {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min${minutes !== 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const getPeakPercentage = () => {
    if (stats.peakConcurrentUsers === 0) return 0;
    return Math.round((stats.currentConcurrentUsers / stats.peakConcurrentUsers) * 100);
  };

  const getSessionGrowth = () => {
    const yesterday = stats.sessionsToday - 1; // Simplified calculation
    if (yesterday <= 0) return 0;
    return Math.round(((stats.sessionsToday - yesterday) / yesterday) * 100);
  };

  const statCards = [
    {
      title: 'Current Online',
      value: stats.currentConcurrentUsers,
      icon: <Group />,
      color: 'primary',
      trend: stats.currentConcurrentUsers > 0 ? 'up' : 'stable',
      trendValue: stats.currentConcurrentUsers
    },
    {
      title: 'Peak Today',
      value: stats.peakConcurrentUsers,
      icon: <TrendingUp />,
      color: 'success',
      trend: 'stable',
      trendValue: null
    },
    {
      title: 'Avg Session',
      value: formatDuration(stats.averageSessionDuration),
      icon: <Timer />,
      color: 'info',
      trend: stats.averageSessionDuration > 30 ? 'up' : 'down',
      trendValue: stats.averageSessionDuration
    },
    {
      title: 'Sessions Today',
      value: stats.sessionsToday,
      icon: <Schedule />,
      color: 'warning',
      trend: getSessionGrowth() > 0 ? 'up' : 'down',
      trendValue: getSessionGrowth()
    }
  ];

  if (loading) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" height={200}>
            <LinearProgress sx={{ width: '100%' }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h6" component="h2">
            Session Statistics
          </Typography>
          <IconButton onClick={onRefresh} size="small">
            <Refresh />
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  backgroundColor: `${stat.color}.light`,
                  color: `${stat.color}.contrastText`,
                  border: `1px solid ${stat.color}.main`
                }}
                variant="outlined"
              >
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    {React.cloneElement(stat.icon, { sx: { fontSize: 24 } })}
                    <Box textAlign="right">
                      <Typography variant="h4" component="div" fontWeight="bold">
                        {stat.value}
                      </Typography>
                      <Typography variant="caption">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>

                  {stat.trendValue !== null && (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Chip
                        label={`${stat.trend === 'up' ? '↗' : '↘'} ${Math.abs(stat.trendValue)}`}
                        size="small"
                        color={stat.trend === 'up' ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box mt={3}>
          <Typography variant="h6" gutterBottom
>
            Usage Overview
          </Typography>
          
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              label={`Total Sessions: ${stats.totalSessions}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`This Week: ${stats.sessionsThisWeek}`}
              color="secondary"
              variant="outlined"
            />
            <Chip
              label={`This Month: ${stats.sessionsThisMonth}`}
              color="info"
              variant="outlined"
            />
          </Box>
        </Box>

        <Box mt={3}>
          <Typography variant="body2" color="text.secondary">
            Peak Usage: {stats.peakConcurrentUsers} users at peak
          </Typography>
          <Box mt={1}>
            <LinearProgress 
              variant="determinate" 
              value={getPeakPercentage()} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};