import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  EmojiEvents as EmojiEventsIcon,
  EmojiObjects as EmojiObjectsIcon,
  SentimentDissatisfied as SentimentDissatisfiedIcon,
  Feedback as FeedbackIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { fakeDataService } from '../../services/fakeDataService';
import { UserFeedback, FeedbackType } from '@alice-suite/api-client';

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
      id={`feedback-tabpanel-${index}`}
      aria-labelledby={`feedback-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const FeedbackManagementPage: React.FC = () => {
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = () => {
    const allFeedback = fakeDataService.getFeedback();
    setFeedback(allFeedback);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTogglePublic = async (feedbackItem: UserFeedback) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedFeedback = feedback.map(f => 
        f.id === feedbackItem.id 
          ? { ...f, is_public: !f.is_public }
          : f
      );
      setFeedback(updatedFeedback);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError('Failed to update visibility. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (feedbackItem: UserFeedback) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedFeedback = feedback.map(f => 
        f.id === feedbackItem.id 
          ? { ...f, is_featured: !f.is_featured }
          : f
      );
      setFeedback(updatedFeedback);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError('Failed to update featured status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (feedbackItem: UserFeedback) => {
    setSelectedFeedback(feedbackItem);
    setShowDetailDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDetailDialog(false);
    setSelectedFeedback(null);
  };

  const getFeedbackTypeIcon = (type: FeedbackType) => {
    switch (type) {
      case FeedbackType.AHA_MOMENT: return <LightbulbIcon color="warning" />;
      case FeedbackType.POSITIVE_EXPERIENCE: return <EmojiEventsIcon color="success" />;
      case FeedbackType.SUGGESTION: return <EmojiObjectsIcon color="info" />;
      case FeedbackType.CONFUSION: return <SentimentDissatisfiedIcon color="error" />;
      case FeedbackType.GENERAL:
      default: return <FeedbackIcon color="primary" />;
    }
  };

  const getFeedbackTypeLabel = (type: FeedbackType) => {
    switch (type) {
      case FeedbackType.AHA_MOMENT: return 'Aha! Moment';
      case FeedbackType.POSITIVE_EXPERIENCE: return 'Positive Experience';
      case FeedbackType.SUGGESTION: return 'Suggestion';
      case FeedbackType.CONFUSION: return 'Question/Confusion';
      case FeedbackType.GENERAL:
      default: return 'General';
    }
  };

  const getFeedbackTypeColor = (type: FeedbackType) => {
    switch (type) {
      case FeedbackType.AHA_MOMENT: return 'warning';
      case FeedbackType.POSITIVE_EXPERIENCE: return 'success';
      case FeedbackType.SUGGESTION: return 'info';
      case FeedbackType.CONFUSION: return 'error';
      case FeedbackType.GENERAL:
      default: return 'default';
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesTab = 
      (tabValue === 0) || // All
      (tabValue === 1 && item.is_public) || // Public
      (tabValue === 2 && item.is_featured) || // Featured
      (tabValue === 3 && !item.is_public); // Private

    const matchesType = filterType === 'all' || item.feedback_type === filterType;
    const matchesSearch = !searchQuery || 
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.last_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesType && matchesSearch;
  });

  const getStats = () => {
    const total = feedback.length;
    const publicCount = feedback.filter(f => f.is_public).length;
    const featured = feedback.filter(f => f.is_featured).length;
    const privateCount = feedback.filter(f => !f.is_public).length;
    const ahaMoments = feedback.filter(f => f.feedback_type === FeedbackType.AHA_MOMENT).length;
    const positive = feedback.filter(f => f.feedback_type === FeedbackType.POSITIVE_EXPERIENCE).length;
    const suggestions = feedback.filter(f => f.feedback_type === FeedbackType.SUGGESTION).length;
    const questions = feedback.filter(f => f.feedback_type === FeedbackType.CONFUSION).length;

    return { 
      total, publicCount, featured, privateCount, 
      ahaMoments, positive, suggestions, questions 
    };
  };

  const stats = getStats();

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Reader Feedback Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Feedback updated successfully!
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ opacity: feedback.length === 0 ? 0.7 : 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <FeedbackIcon />
                </Avatar>
                <Typography variant="h6">
                  {feedback.length === 0 ? 0 : stats.total}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Feedback
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ opacity: feedback.length === 0 ? 0.7 : 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <VisibilityIcon />
                </Avatar>
                <Typography variant="h6">
                  {feedback.length === 0 ? 0 : stats.publicCount}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Public
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ opacity: feedback.length === 0 ? 0.7 : 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <StarIcon />
                </Avatar>
                <Typography variant="h6">
                  {feedback.length === 0 ? 0 : stats.featured}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
              Featured
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ opacity: feedback.length === 0 ? 0.7 : 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <LightbulbIcon />
                </Avatar>
                <Typography variant="h6">
                  {feedback.length === 0 ? 0 : stats.ahaMoments}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Aha! Moments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Type Distribution */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Feedback Type Distribution
        </Typography>
        {feedback.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No feedback data to display. Feedback type distribution will appear here once readers leave feedback.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={6} md={1.5}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                  <LightbulbIcon />
                </Avatar>
                <Typography variant="body2">{feedback.length === 0 ? 0 : stats.ahaMoments}</Typography>
                <Typography variant="caption" color="text.secondary">Aha! Moments</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={1.5}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                  <EmojiEventsIcon />
                </Avatar>
                <Typography variant="body2">{feedback.length === 0 ? 0 : stats.positive}</Typography>
                <Typography variant="caption" color="text.secondary">Positive</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={1.5}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                  <EmojiObjectsIcon />
                </Avatar>
                <Typography variant="body2">{feedback.length === 0 ? 0 : stats.suggestions}</Typography>
                <Typography variant="caption" color="text.secondary">Suggestions</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={1.5}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1 }}>
                  <SentimentDissatisfiedIcon />
                </Avatar>
                <Typography variant="body2">{feedback.length === 0 ? 0 : stats.questions}</Typography>
                <Typography variant="caption" color="text.secondary">Questions</Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Search and Filter */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              disabled={feedback.length === 0}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small" disabled={feedback.length === 0}>
              <InputLabel>Feedback Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Feedback Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value={FeedbackType.AHA_MOMENT}>Aha! Moments</MenuItem>
                <MenuItem value={FeedbackType.POSITIVE_EXPERIENCE}>Positive Experiences</MenuItem>
                <MenuItem value={FeedbackType.SUGGESTION}>Suggestions</MenuItem>
                <MenuItem value={FeedbackType.CONFUSION}>Questions</MenuItem>
                <MenuItem value={FeedbackType.GENERAL}>General</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Tooltip title="Refresh feedback">
              <IconButton onClick={loadFeedback} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label={`All Feedback (${feedback.length === 0 ? 0 : stats.total})`} />
          <Tab label={`Public (${feedback.length === 0 ? 0 : stats.publicCount})`} />
          <Tab label={`Featured (${feedback.length === 0 ? 0 : stats.featured})`} />
          <Tab label={`Private (${feedback.length === 0 ? 0 : stats.privateCount})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderFeedbackList(filteredFeedback)}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderFeedbackList(filteredFeedback)}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {renderFeedbackList(filteredFeedback)}
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          {renderFeedbackList(filteredFeedback)}
        </TabPanel>
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Feedback Details
        </DialogTitle>
        <DialogContent>
          {selectedFeedback && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">
                    Reader: {selectedFeedback.user.first_name} {selectedFeedback.user.last_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">
                    Type: {getFeedbackTypeLabel(selectedFeedback.feedback_type)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">
                    Date: {new Date(selectedFeedback.created_at).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">
                    Status: {selectedFeedback.is_public ? 'Public' : 'Private'}
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" paragraph>
                {selectedFeedback.content}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedFeedback.is_public}
                      onChange={() => handleTogglePublic(selectedFeedback)}
                      disabled={loading}
                    />
                  }
                  label="Public"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedFeedback.is_featured}
                      onChange={() => handleToggleFeatured(selectedFeedback)}
                      disabled={loading}
                    />
                  }
                  label="Featured"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  function renderFeedbackList(items: UserFeedback[]) {
    const tabLabels = ['all feedback', 'public feedback', 'featured feedback', 'private feedback'];
    const currentTab = tabLabels[tabValue];
    
    if (items.length === 0) {
      if (feedback.length === 0) {
        // No feedback at all
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <FeedbackIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No Feedback Available
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              There is currently no feedback from readers.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              When readers leave feedback about their reading experience, it will appear here for you to review and manage.
            </Typography>
            <Button 
              variant="outlined" 
              onClick={loadFeedback}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Box>
        );
      } else {
        // No feedback for current filter/tab
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <FeedbackIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No {currentTab}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No feedback matches the current view criteria.
            </Typography>
            {tabValue === 1 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                No public feedback found. Public feedback can be shared with other users.
              </Typography>
            )}
            {tabValue === 2 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                No featured feedback yet. Mark feedback as featured to highlight important insights.
              </Typography>
            )}
            {tabValue === 3 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                No private feedback found. Private feedback is only visible to consultants.
              </Typography>
            )}
            <Button 
              variant="outlined" 
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                loadFeedback();
              }}
              startIcon={<RefreshIcon />}
            >
              Reset Filters
            </Button>
          </Box>
        );
      }
    }

    return (
      <List>
        {items.map((item) => (
          <React.Fragment key={item.id}>
            <ListItem alignItems="flex-start" sx={{ py: 2 }}>
              <ListItemAvatar>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle1">
                      {item.user.first_name} {item.user.last_name}
                    </Typography>
                    <Chip
                      icon={getFeedbackTypeIcon(item.feedback_type)}
                      label={getFeedbackTypeLabel(item.feedback_type)}
                      color={getFeedbackTypeColor(item.feedback_type) as any}
                      size="small"
                    />
                    {item.is_public && (
                      <Chip
                        icon={<VisibilityIcon fontSize="small" />}
                        label="Public"
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {item.is_featured && (
                      <Chip
                        icon={<StarIcon fontSize="small" />}
                        label="Featured"
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.primary" gutterBottom>
                      {item.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Posted: {new Date(item.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  size="small"
                  onClick={() => handleViewDetails(item)}
                  variant="outlined"
                >
                  View Details
                </Button>
                <Tooltip title={item.is_public ? 'Make private' : 'Make public'}>
                  <IconButton
                    onClick={() => handleTogglePublic(item)}
                    color={item.is_public ? 'success' : 'default'}
                    disabled={loading}
                  >
                    {item.is_public ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title={item.is_featured ? 'Unfeature' : 'Feature'}>
                  <IconButton
                    onClick={() => handleToggleFeatured(item)}
                    color={item.is_featured ? 'warning' : 'default'}
                    disabled={loading}
                  >
                    {item.is_featured ? <StarIcon /> : <StarBorderIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    );
  }
};

export default FeedbackManagementPage;