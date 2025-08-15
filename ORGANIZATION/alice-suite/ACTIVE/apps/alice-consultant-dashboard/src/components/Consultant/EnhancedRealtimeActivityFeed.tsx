import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Badge,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Login,
  Logout,
  Book,
  Note,
  Quiz,
  Help,
  SmartToy,
  Translate,
  Person
} from '@mui/icons-material';
import { RealtimeActivity } from '../../services/realtime-service';

interface EnhancedRealtimeActivityFeedProps {
  activities: RealtimeActivity[];
  maxItems?: number;
  showFilters?: boolean;
  onFilterChange?: (eventTypes: string[]) => void;
}

interface ActivityFilter {
  type: string;
  label: string;
  icon: React.ReactNode;
  color?: string;
}

const activityFilters: ActivityFilter[] = [
  { type: 'LOGIN', label: 'Logins', icon: <Login />, color: 'success' },
  { type: 'LOGOUT', label: 'Logouts', icon: <Logout />, color: 'error' },
  { type: 'PAGE_SYNC', label: 'Reading', icon: <Book />, color: 'info' },
  { type: 'SECTION_SYNC', label: 'Navigation', icon: <Book />, color: 'info' },
  { type: 'DEFINITION_LOOKUP', label: 'Definitions', icon: <Translate />, color: 'warning' },
  { type: 'AI_QUERY', label: 'AI Help', icon: <SmartToy />, color: 'secondary' },
  { type: 'HELP_REQUEST', label: 'Help', icon: <Help />, color: 'error' },
  { type: 'FEEDBACK_SUBMISSION', label: 'Feedback', icon: <Note />, color: 'primary' },
  { type: 'NOTE_CREATED', label: 'Notes', icon: <Note />, color: 'default' },
  { type: 'QUIZ_ATTEMPT', label: 'Quizzes', icon: <Quiz />, color: 'success' }
];

export const EnhancedRealtimeActivityFeed: React.FC<EnhancedRealtimeActivityFeedProps> = ({
  activities,
  maxItems = 20,
  showFilters = false,
  onFilterChange
}) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [newActivityCount, setNewActivityCount] = useState(0);
  const [previousActivities, setPreviousActivities] = useState(activities);

  useEffect(() => {
    if (activities.length > previousActivities.length) {
      setNewActivityCount(prev => prev + (activities.length - previousActivities.length));
      setPreviousActivities(activities);
      
      // Reset new activity count after 3 seconds
      const timer = setTimeout(() => setNewActivityCount(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [activities, previousActivities]);

  const getActivityIcon = (eventType: string) => {
    const filter = activityFilters.find(f => f.type === eventType);
    return filter?.icon || <Person />;
  };

  const getActivityColor = (eventType: string) => {
    const filter = activityFilters.find(f => f.type === eventType);
    return filter?.color || 'default';
  };

  const getActivityDescription = (activity: RealtimeActivity) => {
    const { firstName, lastName, eventType, data } = activity;
    const name = firstName || lastName 
      ? `${firstName || ''} ${lastName || ''}`.trim()
      : 'A reader';

    switch (eventType) {
      case 'LOGIN':
        return `${name} signed in`;
      case 'LOGOUT':
        if (data.sessionDuration) {
          const duration = Math.floor(data.sessionDuration / 60);
          return `${name} signed out after ${duration} min${duration !== 1 ? 's' : ''}`;
        }
        return `${name} signed out`;
      case 'PAGE_SYNC':
        return `${name} is on page ${data.pageNumber} of "${data.bookId}"`;
      case 'SECTION_SYNC':
        return `${name} moved to section "${data.section}"`;
      case 'DEFINITION_LOOKUP':
        return `${name} looked up "${data.word}"`;
      case 'AI_QUERY':
        return `${name} asked: "${data.query?.substring(0, 50) || 'question'}..."`;
      case 'HELP_REQUEST':
        return `${name} needs help: ${data.description}`;
      case 'FEEDBACK_SUBMISSION':
        return `${name} submitted feedback`;
      case 'NOTE_CREATED':
        return `${name} created a note on page ${data.pageNumber}`;
      case 'QUIZ_ATTEMPT':
        return `${name} scored ${data.percentage?.toFixed(0) || data.score}% on a quiz`;
      default:
        return `${name} performed ${eventType}`;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  const handleFilterToggle = (eventType: string) => {
    const newFilters = activeFilters.includes(eventType)
      ? activeFilters.filter(f => f !== eventType)
      : [...activeFilters, eventType];
    
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const filteredActivities = activeFilters.length > 0
    ? activities.filter(activity => activeFilters.includes(activity.eventType))
    : activities;

  return (
    <Card elevation={2}>
      <CardContent sx={{ p: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" px={2} py={1.5}>
          <Typography variant="h6" component="h2">
            Real-Time Activity
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {newActivityCount > 0 && (
              <Badge badgeContent={newActivityCount} color="primary">
                <Chip label="New" size="small" color="primary" />
              </Badge>
            )}
            <Chip 
              label={`${filteredActivities.length} events`} 
              size="small" 
              variant="outlined" 
            />
          </Box>
        </Box>

        {showFilters && (
          <Box px={2} pb={1}>
            <Box display="flex" gap={1} flexWrap="wrap">
              {activityFilters.map((filter) => (
                <Chip
                  key={filter.type}
                  label={filter.label}
                  icon={filter.icon}
                  size="small"
                  color={filter.color as any}
                  variant={activeFilters.includes(filter.type) ? 'filled' : 'outlined'}
                  onClick={() => handleFilterToggle(filter.type)}
                />
              ))}
            </Box>
          </Box>
        )}

        <Divider />

        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {filteredActivities.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={4}>
              <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No activity to display
              </Typography>
            </Box>
          ) : (
            <List dense sx={{ p: 1 }}>
              {filteredActivities.slice(0, maxItems).map((activity, index) => (
                <React.Fragment key={`${activity.userId}-${activity.timestamp}-${index}`}>
                  <ListItem
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Chip
                        icon={getActivityIcon(activity.eventType)}
                        color={getActivityColor(activity.eventType) as any}
                        size="small"
                        variant="outlined"
                      />
                    </ListItemIcon>

                    <ListItemText
                      primary={getActivityDescription(activity)}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontSize: '0.875rem'
                      }}
                      secondary={formatTime(activity.timestamp)}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        color: 'text.secondary'
                      }}
                    />

                    <Tooltip title={activity.eventType} arrow
>
                      <Chip
                        label={activity.eventType}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </Tooltip>
                  </ListItem>
                  <Divider sx={{ my: 0.5 }} />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};