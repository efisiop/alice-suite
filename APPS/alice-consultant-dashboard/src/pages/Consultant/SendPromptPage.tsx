import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
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
  Tooltip
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  AutoAwesome as AutoAwesomeIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { fakeDataService } from '../../services/fakeDataService';
import { ConsultantTrigger, TriggerType } from '@alice-suite/api-client';
import { ReaderProfile } from '../../services/consultantService';

interface PromptHistory {
  id: string;
  readerName: string;
  message: string;
  sentAt: string;
  status: 'sent' | 'pending' | 'failed';
}

const SendPromptPage: React.FC = () => {
  const [readers, setReaders] = useState<ReaderProfile[]>([]);
  const [selectedReader, setSelectedReader] = useState<string>('');
  const [promptMessage, setPromptMessage] = useState('');
  const [triggerType, setTriggerType] = useState<TriggerType>(TriggerType.CONSULTANT_MESSAGE);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [filterEngagement, setFilterEngagement] = useState<string>('all');

  // Predefined prompt templates
  const promptTemplates = {
    [TriggerType.CONSULTANT_MESSAGE]: [
      "Great progress! Consider exploring the deeper themes in this chapter.",
      "You're doing excellent work. Take a moment to reflect on the character development.",
      "Your insights are valuable. Consider how this relates to the broader narrative.",
      "Keep up the great work! The next section has some interesting symbolism to watch for."
    ],
    [TriggerType.READING_REMINDER]: [
      "Just checking in - how is your reading going? Any questions or insights to share?",
      "Haven't seen you active recently. Is everything okay with your reading progress?",
      "Remember, consistency is key! Even 10 minutes of reading can be valuable."
    ],
    [TriggerType.ACHIEVEMENT_UNLOCKED]: [
      "Congratulations on completing this chapter! Your dedication is impressive.",
      "You've reached a new milestone! Take a moment to celebrate your progress.",
      "Amazing work! Your reading journey is really taking shape."
    ]
  };

  useEffect(() => {
    loadReaders();
    loadPromptHistory();
  }, []);

  const loadReaders = () => {
    const allReaders = fakeDataService.getAllReaders();
    setReaders(allReaders);
  };

  const loadPromptHistory = () => {
    const triggers = fakeDataService.getTriggers();
    const history = triggers.map(trigger => ({
      id: trigger.id,
      readerName: fakeDataService.getReaderById(trigger.user_id)?.first_name || 'Unknown',
      message: trigger.message,
      sentAt: trigger.created_at,
      status: trigger.is_processed ? 'sent' : 'pending'
    }));
    setPromptHistory(history);
  };

  const handleSendPrompt = async () => {
    if (!selectedReader || !promptMessage) {
      setError('Please select a reader and enter a message');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate sending prompt
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add to fake data
      fakeDataService.addTrigger({
        user_id: selectedReader,
        trigger_type: triggerType,
        message: promptMessage
      });

      setSuccess(true);
      setPromptMessage('');
      setSelectedReader('');
      
      // Refresh history
      loadPromptHistory();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to send prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: string) => {
    setPromptMessage(template);
  };

  const filteredReaders = readers.filter(reader => {
    if (filterEngagement === 'all') return true;
    return (reader as any).engagement === filterEngagement;
  });

  const getReaderEngagement = (readerId: string) => {
    const reader = fakeDataService.getReaderById(readerId);
    return (reader as any)?.engagement || 'medium';
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Send AI Prompts to Readers
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Prompt sent successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Send Prompt Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Compose New Prompt
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Reader</InputLabel>
                  <Select
                    value={selectedReader}
                    onChange={(e) => setSelectedReader(e.target.value)}
                    label="Reader"
                  >
                    <MenuItem value="">Select a reader...</MenuItem>
                    {filteredReaders.map(reader => (
                      <MenuItem key={reader.id} value={reader.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24 }}>
                            {reader.first_name[0]}
                          </Avatar>
                          {reader.first_name} {reader.last_name}
                          <Chip
                            label={(reader as any).engagement}
                            size="small"
                            color={getEngagementColor((reader as any).engagement) as any}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Trigger Type</InputLabel>
                  <Select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value as TriggerType)}
                    label="Trigger Type"
                  >
                    <MenuItem value={TriggerType.CONSULTANT_MESSAGE}>Consultant Message</MenuItem>
                    <MenuItem value={TriggerType.READING_REMINDER}>Reading Reminder</MenuItem>
                    <MenuItem value={TriggerType.ACHIEVEMENT_UNLOCKED}>Achievement Unlocked</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Prompt Message"
                  value={promptMessage}
                  onChange={(e) => setPromptMessage(e.target.value)}
                  placeholder="Enter your AI prompt message here..."
                  variant="outlined"
                />
              </Grid>

              {/* Quick Templates */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Quick Templates:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {promptTemplates[triggerType]?.map((template, index) => (
                    <Chip
                      key={index}
                      label={template}
                      size="small"
                      variant="outlined"
                      onClick={() => handleTemplateSelect(template)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendPrompt}
                  disabled={loading || !selectedReader || !promptMessage}
                  startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  fullWidth
                >
                  {loading ? 'Sending...' : 'Send AI Prompt'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Reader Stats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Reader Overview
              </Typography>
              <Tooltip title="Refresh readers">
                <IconButton onClick={loadReaders} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Engagement Filter</InputLabel>
              <Select
                value={filterEngagement}
                onChange={(e) => setFilterEngagement(e.target.value)}
                label="Engagement Filter"
              >
                <MenuItem value="all">All Readers</MenuItem>
                <MenuItem value="high">High Engagement</MenuItem>
                <MenuItem value="medium">Medium Engagement</MenuItem>
                <MenuItem value="low">Low Engagement</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Readers: {filteredReaders.length}
            </Typography>

            <List dense>
              {filteredReaders.slice(0, 5).map(reader => (
                <ListItem key={reader.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {reader.first_name[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {reader.first_name} {reader.last_name}
                        </Typography>
                        <Chip
                          label={(reader as any).engagement}
                          size="small"
                          color={getEngagementColor((reader as any).engagement) as any}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption">
                        Last active: {new Date((reader as any).lastActive).toLocaleDateString()}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
              {filteredReaders.length > 5 && (
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="caption" color="text.secondary">
                        +{filteredReaders.length - 5} more readers
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Prompt History */}
      <Paper sx={{ mt: 3, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Prompt History
          </Typography>
          <Button
            size="small"
            onClick={() => setShowHistory(!showHistory)}
            startIcon={<HistoryIcon />}
          >
            {showHistory ? 'Hide' : 'Show'} History
          </Button>
        </Box>

        {showHistory && (
          <List>
            {promptHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No prompts sent yet
              </Typography>
            ) : (
              promptHistory.slice(0, 10).map(history => (
                <React.Fragment key={history.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <AutoAwesomeIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            To: {history.readerName}
                          </Typography>
                          <Chip
                            label={history.status}
                            size="small"
                            color={history.status === 'sent' ? 'success' : 'default'}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary">
                            {history.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Sent: {new Date(history.sentAt).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default SendPromptPage;