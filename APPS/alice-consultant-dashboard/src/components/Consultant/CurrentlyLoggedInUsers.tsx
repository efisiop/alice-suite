import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Person,
  Refresh,
  AccessTime,
  TrendingUp
} from '@mui/icons-material';
import { activityTrackingService } from '../../services/activityTrackingService';
import { formatDistanceToNow } from 'date-fns';

interface LoggedInUser {
  user_id: string;
  login_time: string;
  profile: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const CurrentlyLoggedInUsers: React.FC = () => {
  const [users, setUsers] = useState<LoggedInUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLoggedInUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const loggedInUsers = await activityTrackingService.getCurrentlyLoggedInUsers();
      setUsers(loggedInUsers);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching logged in users:', err);
      setError('Failed to load currently logged in users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoggedInUsers();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchLoggedInUsers, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchLoggedInUsers();
  };

  const getTimeSinceLogin = (loginTime: string) => {
    return formatDistanceToNow(new Date(loginTime), { addSuffix: true });
  };

  const getEngagementLevel = (loginTime: string) => {
    const minutesSinceLogin = (Date.now() - new Date(loginTime).getTime()) / (1000 * 60);
    
    if (minutesSinceLogin < 5) return { level: 'Just Now', color: 'success' as const };
    if (minutesSinceLogin < 15) return { level: 'Active', color: 'primary' as const };
    if (minutesSinceLogin < 30) return { level: 'Recent', color: 'warning' as const };
    return { level: 'Idle', color: 'default' as const };
  };

  if (loading && users.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading currently logged in users...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <IconButton size="small" onClick={handleRefresh} sx={{ ml: 1 }}>
          <Refresh />
        </IconButton>
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h3">
              Currently Logged In
            </Typography>
            <Badge badgeContent={users.length} color="primary" sx={{ ml: 1 }}>
              <Person />
            </Badge>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </Typography>
            )}
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {users.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No users currently logged in
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Users who logged in within the last 30 minutes will appear here
            </Typography>
          </Box>
        ) : (
          <List dense>
            {users.map((user) => {
              const engagement = getEngagementLevel(user.login_time);
              return (
                <ListItem
                  key={user.user_id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:last-child': { mb: 0 }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 1 }}>
                          {user.profile.first_name} {user.profile.last_name}
                        </Typography>
                        <Chip
                          label={engagement.level}
                          size="small"
                          color={engagement.color}
                          icon={<AccessTime />}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {user.profile.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Logged in {getTimeSinceLogin(user.login_time)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}

        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Shows users who logged in within the last 30 minutes. Updates automatically every 30 seconds.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CurrentlyLoggedInUsers; 