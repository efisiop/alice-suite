import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, Chip, CircularProgress } from '@mui/material';
import { Person, AccessTime } from '@mui/icons-material';
interface OnlineReader {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  lastActivity: Date;
  currentBook?: string;
  isActive: boolean;
}

interface OnlineReadersWidgetProps {
  readers: OnlineReader[];
  onReaderClick?: (reader: OnlineReader) => void;
  loading?: boolean;
  isDemoMode?: boolean;
}

export const OnlineReadersWidget: React.FC<OnlineReadersWidgetProps> = ({
  readers,
  onReaderClick,
  loading = false,
  isDemoMode = false
}) => {
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  const getTimeSinceLastActivity = (lastActivity: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(lastActivity).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Active now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  const getStatusColor = (lastActivity: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(lastActivity).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 5) return 'success';
    if (minutes < 15) return 'warning';
    return 'default';
  };

  if (loading) {
    return (
      <Card sx={{ height: 400 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" height={300}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: 400, overflow: 'hidden' }}>
      <CardContent sx={{ p: 2, height: '100%' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="h2">
            Online Readers
            {isDemoMode && (
              <Typography variant="caption" color="warning.main" display="block">
                Demo Mode
              </Typography>
            )}
          </Typography>
          <Chip 
            label={`${readers.length} ${isDemoMode ? 'demo' : 'online'}`} 
            color={isDemoMode ? "warning" : "success"} 
            size="small"
            icon={<Person />}
          />
        </Box>

        {readers.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            height="80%"
          >
            <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" align="center">
              {isDemoMode 
                ? 'Demo mode: No readers to display'
                : 'No readers currently online'}
            </Typography>
            {isDemoMode && (
              <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Check if Socket.IO server is running on localhost:3001
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ overflowY: 'auto', maxHeight: 320 }}>
            {readers.map((reader) => (
              <Box
                key={reader.userId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  borderRadius: 1,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                onClick={() => onReaderClick?.(reader)}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    mr: 2, 
                    fontSize: '0.875rem',
                    bgcolor: 'primary.main'
                  }}
                >
                  {getInitials(reader.firstName, reader.lastName)}
                </Avatar>
                
                <Box flex={1}>
                  <Typography variant="body2" fontWeight="medium">
                    {reader.firstName || reader.lastName 
                      ? `${reader.firstName || ''} ${reader.lastName || ''}`.trim()
                      : 'Anonymous Reader'
                    }
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTime sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {getTimeSinceLastActivity(reader.lastActivity)}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" flexDirection="column" alignItems="flex-end">
                  <Chip 
                    label={getStatusColor(reader.lastActivity) === 'success' ? 'Active' : 'Idle'}
                    color={getStatusColor(reader.lastActivity) as any}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 0.5 }}
                  />
                  {reader.currentBook && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {reader.currentBook}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default OnlineReadersWidget;