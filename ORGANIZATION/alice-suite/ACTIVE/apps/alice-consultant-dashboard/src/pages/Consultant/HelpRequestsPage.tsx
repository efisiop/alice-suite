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
  Tooltip,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import {
  QuestionAnswer as QuestionAnswerIcon,
  Person as PersonIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { fakeDataService } from '../../services/fakeDataService';
import { HelpRequest, HelpRequestStatus } from '@alice-suite/api-client';

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
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const HelpRequestsPage: React.FC = () => {
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResponseDialog, setShowResponseDialog] = useState(false);

  useEffect(() => {
    loadHelpRequests();
  }, []);

  const loadHelpRequests = () => {
    const requests = fakeDataService.getHelpRequests();
    setHelpRequests(requests);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRespond = (request: HelpRequest) => {
    setSelectedRequest(request);
    setResponseText('');
    setShowResponseDialog(true);
  };

  const handleCloseDialog = () => {
    setShowResponseDialog(false);
    setSelectedRequest(null);
    setResponseText('');
  };

  const handleSubmitResponse = async () => {
    if (!selectedRequest || !responseText.trim()) {
      setError('Please enter a response');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the help request in fake data
      const updatedRequests = helpRequests.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: HelpRequestStatus.RESOLVED, response: responseText, consultant_id: 'consultant-1' }
          : req
      );
      setHelpRequests(updatedRequests);

      setSuccess(true);
      handleCloseDialog();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to send response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToSelf = async (request: HelpRequest) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedRequests = helpRequests.map(req => 
        req.id === request.id 
          ? { ...req, status: HelpRequestStatus.ASSIGNED, consultant_id: 'consultant-1' }
          : req
      );
      setHelpRequests(updatedRequests);
    } catch (err) {
      setError('Failed to assign request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: HelpRequestStatus) => {
    switch (status) {
      case HelpRequestStatus.PENDING: return 'warning';
      case HelpRequestStatus.ASSIGNED: return 'info';
      case HelpRequestStatus.RESOLVED: return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: HelpRequestStatus) => {
    switch (status) {
      case HelpRequestStatus.PENDING: return <QuestionAnswerIcon />;
      case HelpRequestStatus.ASSIGNED: return <AssignmentIcon />;
      case HelpRequestStatus.RESOLVED: return <CheckIcon />;
      default: return <QuestionAnswerIcon />;
    }
  };

  const filteredRequests = helpRequests.filter(request => {
    const matchesTab = 
      (tabValue === 0) || // All
      (tabValue === 1 && request.status === HelpRequestStatus.PENDING) || // Pending
      (tabValue === 2 && request.status === HelpRequestStatus.ASSIGNED) || // Assigned
      (tabValue === 3 && request.status === HelpRequestStatus.RESOLVED); // Resolved

    const matchesSearch = !searchQuery || 
      request.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user.last_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStats = () => {
    const pending = helpRequests.filter(r => r.status === HelpRequestStatus.PENDING).length;
    const assigned = helpRequests.filter(r => r.status === HelpRequestStatus.ASSIGNED).length;
    const resolved = helpRequests.filter(r => r.status === HelpRequestStatus.RESOLVED).length;
    const total = helpRequests.length;

    return { pending, assigned, resolved, total };
  };

  const stats = getStats();

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Help Requests Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Response sent successfully!
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ opacity: helpRequests.length === 0 ? 0.7 : 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <QuestionAnswerIcon />
                </Avatar>
                <Typography variant="h6">
                  {helpRequests.length === 0 ? 0 : stats.total}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ opacity: helpRequests.length === 0 ? 0.7 : 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Badge badgeContent={helpRequests.length === 0 ? 0 : stats.pending} color="error">
                    <QuestionAnswerIcon />
                  </Badge>
                </Avatar>
                <Typography variant="h6">
                  {helpRequests.length === 0 ? 0 : stats.pending}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ opacity: helpRequests.length === 0 ? 0.7 : 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <AssignmentIcon />
                </Avatar>
                <Typography variant="h6">
                  {helpRequests.length === 0 ? 0 : stats.assigned}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Assigned
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ opacity: helpRequests.length === 0 ? 0.7 : 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckIcon />
                </Avatar>
                <Typography variant="h6">
                  {helpRequests.length === 0 ? 0 : stats.resolved}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Resolved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search help requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              disabled={helpRequests.length === 0}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Tooltip title="Refresh requests">
              <IconButton onClick={loadHelpRequests} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label={`All Requests (${helpRequests.length === 0 ? 0 : stats.total})`} />
          <Tab label={`Pending (${helpRequests.length === 0 ? 0 : stats.pending})`} />
          <Tab label={`Assigned (${helpRequests.length === 0 ? 0 : stats.assigned})`} />
          <Tab label={`Resolved (${helpRequests.length === 0 ? 0 : stats.resolved})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderRequestsList(filteredRequests)}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderRequestsList(filteredRequests)}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {renderRequestsList(filteredRequests)}
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          {renderRequestsList(filteredRequests)}
        </TabPanel>
      </Paper>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Respond to Help Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                From: {selectedRequest.user.first_name} {selectedRequest.user.last_name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Question: {selectedRequest.content}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Your Response"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                variant="outlined"
                placeholder="Enter your response here..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitResponse} 
            variant="contained" 
            disabled={loading || !responseText.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            Send Response
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  function renderRequestsList(requests: HelpRequest[]) {
    if (requests.length === 0) {
      const tabLabels = ['all', 'pending', 'assigned', 'resolved'];
      const currentTab = tabLabels[tabValue];
      
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <QuestionAnswerIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            {currentTab === 'all' ? 'No Help Requests' : `No ${currentTab} help requests`}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {currentTab === 'all' 
              ? 'There are currently no help requests from readers.'
              : `No help requests with ${currentTab} status found.`}
          </Typography>
          {currentTab === 'all' && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              When readers ask for help, their requests will appear here.
            </Typography>
          )}
          {currentTab === 'pending' && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              No pending help requests. All pending requests have been processed.
            </Typography>
          )}
          {currentTab === 'assigned' && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You haven't been assigned any help requests yet.
            </Typography>
          )}
          {currentTab === 'resolved' && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              No resolved help requests yet. Completed requests will appear here.
            </Typography>
          )}
          <Button 
            variant="outlined" 
            onClick={() => {
              setSearchQuery('');
              loadHelpRequests();
            }}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>
      );
    }

    return (
      <List>
        {requests.map((request) => (
          <React.Fragment key={request.id}>
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
                      {request.user.first_name} {request.user.last_name}
                    </Typography>
                    <Chip
                      icon={getStatusIcon(request.status)}
                      label={request.status}
                      color={getStatusColor(request.status) as any}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.primary" gutterBottom>
                      {request.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Asked: {new Date(request.created_at).toLocaleString()}
                    </Typography>
                    {request.response && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Response: {request.response}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {request.status === HelpRequestStatus.PENDING && (
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => handleAssignToSelf(request)}
                    disabled={loading}
                    startIcon={<AssignmentIcon />}
                  >
                    Assign to Me
                  </Button>
                )}
                {(request.status === HelpRequestStatus.ASSIGNED || request.status === HelpRequestStatus.PENDING) && (
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => handleRespond(request)}
                    disabled={loading}
                    startIcon={<SendIcon />}
                  >
                    Respond
                  </Button>
                )}
              </Box>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    );
  }
};

export default HelpRequestsPage;