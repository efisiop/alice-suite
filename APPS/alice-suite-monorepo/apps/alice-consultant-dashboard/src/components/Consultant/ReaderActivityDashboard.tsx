import React, { useEffect, useState } from 'react';
import {
  Person,
  Visibility,
  Timeline,
  Refresh,
  FilterList,
  Search,
  PlayCircleOutline,
  TrendingUp,
  TrendingDown,
  Remove,
  AutoAwesome
} from '@mui/icons-material';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { useConsultantService } from '../../hooks/useService';
import { ReaderInteraction, ReaderProfile } from '../../services/consultantService';
import { format, formatDistanceToNow } from 'date-fns';
import CurrentlyLoggedInUsers from './CurrentlyLoggedInUsers';

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
      id={`activity-tabpanel-${index}`}
      aria-labelledby={`activity-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0.1, height: '100%', overflow: 'auto', maxHeight: '150px' }}>{children}</Box>}
    </div>
  );
}

const ReaderActivityDashboard: React.FC = () => {
  const { service: consultantService, loading: serviceLoading } = useConsultantService();
  const [interactions, setInteractions] = useState<ReaderInteraction[]>([]);
  const [readers, setReaders] = useState<ReaderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [selectedReaderId, setSelectedReaderId] = useState<string | null>(null);
  const [promptMessage, setPromptMessage] = useState('');

  const fetchData = async () => {
    if (!consultantService) return;
    
    setLoading(true);
    setError(null);
    try {
      const [interactionsData, readersData] = await Promise.all([
        consultantService.getReaderInteractions(),
        consultantService.getVerifiedReaders()
      ]);
      setInteractions(interactionsData);
      setReaders(readersData);
    } catch (err: any) {
      console.error('Error fetching reader data:', err);
      setError('Failed to load reader activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPromptDialog = (readerId: string) => {
    setSelectedReaderId(readerId);
    setIsPromptDialogOpen(true);
  };

  const handleClosePromptDialog = () => {
    setIsPromptDialogOpen(false);
    setSelectedReaderId(null);
    setPromptMessage('');
  };

  const handleSendPrompt = async () => {
    if (selectedReaderId && promptMessage) {
      try {
        await consultantService?.sendAIInteractionPrompt(selectedReaderId, promptMessage);
        console.log(`AI prompt sent successfully to reader ${selectedReaderId}`);
        handleClosePromptDialog();
      } catch (err) {
        console.error('Error sending AI prompt:', err);
        setError('Failed to send AI prompt. Please try again.');
      }
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [consultantService]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const getEngagementLevel = (lastActiveDate: string | null) => {
    if (!lastActiveDate) return { level: 'inactive', color: 'error' as const };
    
    const now = new Date();
    const lastActive = new Date(lastActiveDate);
    const hoursAgo = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    
    if (hoursAgo < 24) return { level: 'high', color: 'success' as const };
    if (hoursAgo < 168) return { level: 'medium', color: 'warning' as const };
    return { level: 'low', color: 'error' as const };
  };

  const filteredInteractions = interactions.filter(interaction => {
    const matchesEventType = !eventTypeFilter || interaction.event_type === eventTypeFilter;
    const matchesSearch = !searchQuery || 
      interaction.user_id.includes(searchQuery) ||
      interaction.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (interaction.content && interaction.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesEventType && matchesSearch;
  });

  const getUniqueEventTypes = () => {
    return [...new Set(interactions.map(i => i.event_type))];
  };

  const getReaderStats = () => {
    const totalReaders = readers.length;
    const activeReaders = readers.filter(reader => {
      const engagement = getEngagementLevel(reader.updated_at);
      return engagement.level === 'high';
    }).length;
    
    const recentInteractions = interactions.filter(interaction => {
      const interactionDate = new Date(interaction.created_at);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return interactionDate > oneDayAgo;
    }).length;

    return { totalReaders, activeReaders, recentInteractions };
  };

  const stats = getReaderStats();

  if (loading || serviceLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header with Stats and Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Reader Activity Monitoring
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time reader activity and engagement tracking
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} color="primary" size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ py: 0.75 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 24, height: 24 }}>
                  <Person fontSize="small" />
                </Avatar>
                <Typography variant="body2">Total Readers</Typography>
              </Box>
              <Typography variant="h6" sx={{ mb: 0.25 }}>
                {stats.totalReaders}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Verified readers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ py: 0.75 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 1, width: 24, height: 24 }}>
                  <PlayCircleOutline fontSize="small" />
                </Avatar>
                <Typography variant="body2">Active Readers</Typography>
              </Box>
              <Typography variant="h6" sx={{ mb: 0.25 }}>
                {stats.activeReaders}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active in last 24h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ py: 0.75 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 1, width: 24, height: 24 }}>
                  <Timeline fontSize="small" />
                </Avatar>
                <Typography variant="body2">Recent Activity</Typography>
              </Box>
              <Typography variant="h6" sx={{ mb: 0.25 }}>
                {stats.recentInteractions}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Interactions today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab label="Activity Stream" />
          <Tab label="Reader Status" />
          <Tab label="Engagement Metrics" />
          <Tab label="Currently Logged In" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          {/* Activity Stream with Filters */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                label="Event Type"
              >
                <MenuItem value="">All Events</MenuItem>
                {getUniqueEventTypes().map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {filteredInteractions.length === 0 ? (
            <Alert severity="info">No activity found matching your filters.</Alert>
          ) : (
            <Paper elevation={1} sx={{ maxHeight: 150, overflow: 'auto' }}>
              <List dense>
                {filteredInteractions.map((interaction, index) => (
                  <React.Fragment key={interaction.id}>
                    <ListItem alignItems="flex-start" sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.primary">
                              {interaction.user_name || interaction.user_id}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip label={interaction.event_type} size="small" color="primary" />
                              <Typography variant="caption" color="text.secondary">
                                {formatDistanceToNow(new Date(interaction.created_at), { addSuffix: true })}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.25 }}>
                            {interaction.content && (
                              <Typography variant="caption" color="text.primary" sx={{ mb: 0.25 }}>
                                {interaction.content}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              {interaction.page_number && (
                                <Typography variant="caption" color="text.secondary">
                                  Page: {interaction.page_number}
                                </Typography>
                              )}
                              {interaction.book_id && (
                                <Typography variant="caption" color="text.secondary">
                                  Book: {interaction.book_id}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < filteredInteractions.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Reader Status */}
          <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
            <Grid container spacing={1}>
              {readers.map((reader) => {
                const engagement = getEngagementLevel(reader.updated_at);
                return (
                  <Grid item xs={12} sm={6} md={4} key={reader.id}>
                    <Card>
                      <CardContent sx={{ py: 0.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Avatar sx={{ mr: 1, width: 24, height: 24 }}>
                            <Person fontSize="small" />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="caption">
                              {reader.first_name} {reader.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {reader.email}
                            </Typography>
                          </Box>
                          <Chip
                            label={engagement.level}
                            size="small"
                            color={engagement.color}
                            icon={engagement.level === 'high' ? <TrendingUp fontSize="small" /> : 
                                  engagement.level === 'medium' ? <Remove fontSize="small" /> : <TrendingDown fontSize="small" />}
                          />
                          <Tooltip title="Send AI Prompt">
                            <IconButton size="small" onClick={() => handleOpenPromptDialog(reader.id)}>
                              <AutoAwesome fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Last active: {formatDistanceToNow(new Date(reader.updated_at), { addSuffix: true })}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </TabPanel>

        <Dialog open={isPromptDialogOpen} onClose={handleClosePromptDialog}>
          <DialogTitle>Send AI Prompt to Reader</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="prompt"
              label="AI Prompt Message"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              value={promptMessage}
              onChange={(e) => setPromptMessage(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePromptDialog}>Cancel</Button>
            <Button onClick={handleSendPrompt} disabled={!promptMessage}>Send</Button>
          </DialogActions>
        </Dialog>

        <TabPanel value={tabValue} index={2}>
          {/* Engagement Metrics */}
          <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
            <Grid container spacing={1}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent sx={{ py: 0.75 }}>
                    <Typography variant="body2" gutterBottom>
                      Engagement Distribution
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {['high', 'medium', 'low'].map(level => {
                        const count = readers.filter(reader => 
                          getEngagementLevel(reader.updated_at).level === level
                        ).length;
                        const percentage = readers.length > 0 ? (count / readers.length) * 100 : 0;
                        
                        return (
                          <Box key={level} sx={{ mb: 0.75 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                              <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                                {level} Engagement
                              </Typography>
                              <Typography variant="caption">
                                {count} ({percentage.toFixed(1)}%)
                              </Typography>
                            </Box>
                            <Box sx={{ 
                              height: 4, 
                              bgcolor: 'grey.200', 
                              borderRadius: 1,
                              overflow: 'hidden'
                            }}>
                              <Box sx={{ 
                                width: `${percentage}%`, 
                                height: '100%', 
                                bgcolor: level === 'high' ? 'success.main' : 
                                         level === 'medium' ? 'warning.main' : 'error.main',
                                transition: 'width 0.3s ease'
                              }} />
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent sx={{ py: 0.75 }}>
                    <Typography variant="body2" gutterBottom>
                      Recent Activity Summary
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Activity in the last 24 hours
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body1" sx={{ mr: 2 }}>
                          {stats.recentInteractions}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          total interactions
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ mr: 2 }}>
                          {stats.activeReaders}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          active readers
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Currently Logged In Users */}
          <CurrentlyLoggedInUsers />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ReaderActivityDashboard;