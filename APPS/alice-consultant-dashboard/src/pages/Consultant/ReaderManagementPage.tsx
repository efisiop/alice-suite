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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Book as BookIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Mail as MailIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { getVerifiedReaders } from '../../services/consultantService';

interface ReaderManagementPageProps {}

const ReaderManagementPage: React.FC<ReaderManagementPageProps> = () => {
  const [readers, setReaders] = useState<any[]>([]);
  const [selectedReader, setSelectedReader] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEngagement, setFilterEngagement] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadReaders();
  }, []);

  const loadReaders = async () => {
    try {
      setLoading(true);
      const realReaders = await getVerifiedReaders();
      
      // Transform real reader data to match expected structure
      const transformedReaders = realReaders.map(reader => ({
        ...reader,
        // These will be populated with real data in Phase 2.2
        progress: {
          chapter: 1,
          page: 1,
          last_read_at: reader.updated_at,
          time_spent_minutes: 0
        },
        stats: {
          total_sessions: 0,
          total_time_minutes: 0,
          average_session_duration: 0,
          last_activity_date: reader.updated_at
        },
        engagement: 'medium' as const, // Default for now
        lastActive: reader.updated_at,
        status: reader.last_active_at ? 
          (new Date(reader.last_active_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 'active' : 'inactive') : 
          'inactive'
      }));
      
      setReaders(transformedReaders);
    } catch (error) {
      console.error('Error loading readers:', error);
      setError('Failed to load readers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (reader: any) => {
    setSelectedReader(reader);
    setShowDetailDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDetailDialog(false);
    setSelectedReader(null);
  };

  const handleSendEmail = (reader: any) => {
    setSelectedReader(reader);
    setEmailSubject('');
    setEmailMessage('');
    setShowEmailDialog(true);
  };

  const handleCloseEmailDialog = () => {
    setShowEmailDialog(false);
    setSelectedReader(null);
    setEmailSubject('');
    setEmailMessage('');
  };

  const handleSubmitEmail = async () => {
    if (!selectedReader || !emailSubject.trim() || !emailMessage.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess(true);
      handleCloseEmailDialog();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'error';
      default: return 'default';
    }
  };

  const getEngagementIcon = (engagement: string) => {
    switch (engagement) {
      case 'high': return <TrendingUpIcon />;
      case 'medium': return <RemoveIcon />;
      case 'low': return <TrendingDownIcon />;
      default: return <RemoveIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default';
  };

  const filteredReaders = readers.filter(reader => {
    const matchesSearch = !searchQuery || 
      reader.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reader.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reader.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEngagement = filterEngagement === 'all' || reader.engagement === filterEngagement;
    const matchesStatus = filterStatus === 'all' || reader.status === filterStatus;

    return matchesSearch && matchesEngagement && matchesStatus;
  });

  const getStats = () => {
    const total = readers.length;
    const active = readers.filter(r => r.status === 'active').length;
    const inactive = readers.filter(r => r.status === 'inactive').length;
    const highEngagement = readers.filter(r => r.engagement === 'high').length;
    const mediumEngagement = readers.filter(r => r.engagement === 'medium').length;
    const lowEngagement = readers.filter(r => r.engagement === 'low').length;

    const totalSessions = readers.reduce((sum, r) => sum + (r.stats?.total_sessions || 0), 0);
    const totalTime = readers.reduce((sum, r) => sum + (r.stats?.total_time_minutes || 0), 0);
    const avgSessionTime = totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0;

    return { 
      total, active, inactive, highEngagement, mediumEngagement, lowEngagement,
      totalSessions, totalTime, avgSessionTime
    };
  };

  const stats = getStats();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedReaders = filteredReaders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Reader Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Action completed successfully!
        </Alert>
      )}

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ opacity: readers.length === 0 ? 0.7 : 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="h6">
                  {readers.length === 0 ? 0 : stats.total}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Readers
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ opacity: readers.length === 0 ? 0.7 : 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h6">
                  {readers.length === 0 ? 0 : stats.highEngagement}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                High Engagement
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ opacity: readers.length === 0 ? 0.7 : 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Typography variant="h6">
                  {readers.length === 0 ? 0 : stats.avgSessionTime}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Avg Session (min)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ opacity: readers.length === 0 ? 0.7 : 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <BookIcon />
                </Avatar>
                <Typography variant="h6">
                  {readers.length === 0 ? 0 : stats.totalSessions}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Sessions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Engagement Distribution */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Engagement Distribution
        </Typography>
        {readers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Engagement metrics will appear here once readers are registered.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h6">{stats.highEngagement}</Typography>
                <Typography variant="caption" color="text.secondary">High Engagement</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                  <RemoveIcon />
                </Avatar>
                <Typography variant="h6">{stats.mediumEngagement}</Typography>
                <Typography variant="caption" color="text.secondary">Medium Engagement</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1 }}>
                  <TrendingDownIcon />
                </Avatar>
                <Typography variant="h6">{stats.lowEngagement}</Typography>
                <Typography variant="caption" color="text.secondary">Low Engagement</Typography>
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
              placeholder="Search readers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              disabled={readers.length === 0}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small" disabled={readers.length === 0}>
              <InputLabel>Engagement Level</InputLabel>
              <Select
                value={filterEngagement}
                onChange={(e) => setFilterEngagement(e.target.value)}
                label="Engagement Level"
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small" disabled={readers.length === 0}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Tooltip title="Refresh readers">
              <IconButton onClick={loadReaders} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Readers Table */}
      <Paper>
        {readers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No Readers Available
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              There are no readers registered in the system yet.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Readers will appear here once they register and are verified.
            </Typography>
            <Button 
              variant="contained" 
              onClick={loadReaders}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Box>
        ) : filteredReaders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <FilterIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No Readers Match Your Filters
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No readers match the current search or filter criteria.
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => {
                setSearchQuery('');
                setFilterEngagement('all');
                setFilterStatus('all');
              }}
            >
              Clear Filters
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Reader</TableCell>
                    <TableCell>Engagement</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Sessions</TableCell>
                    <TableCell>Total Time</TableCell>
                    <TableCell>Last Active</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedReaders.map((reader) => (
                    <TableRow key={reader.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar>{reader.first_name[0]}</Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {reader.first_name} {reader.last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {reader.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getEngagementIcon(reader.engagement)}
                          label={reader.engagement}
                          color={getEngagementColor(reader.engagement) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={reader.status}
                          color={getStatusColor(reader.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            Chapter {reader.progress?.chapter || 1}, Page {reader.progress?.page || 1}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={((reader.progress?.chapter || 1) / 12) * 100} 
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{reader.stats?.total_sessions || 0}</TableCell>
                      <TableCell>{Math.round((reader.stats?.total_time_minutes || 0) / 60)}h</TableCell>
                      <TableCell>
                        {new Date(reader.lastActive).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton onClick={() => handleViewDetails(reader)} size="small">
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send Email">
                            <IconButton onClick={() => handleSendEmail(reader)} size="small">
                              <MailIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredReaders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Reader Detail Dialog */}
      <Dialog open={showDetailDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Reader Details
        </DialogTitle>
        <DialogContent>
          {selectedReader && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    {selectedReader.first_name} {selectedReader.last_name}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedReader.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Joined: {new Date(selectedReader.created_at).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Reading Progress
                  </Typography>
                  <Typography variant="body1">
                    Chapter {selectedReader.progress?.chapter || 1}, Page {selectedReader.progress?.page || 1}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last Read: {new Date(selectedReader.progress?.last_read_at || '').toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Statistics
                  </Typography>
                  <Typography variant="body2">
                    Total Sessions: {selectedReader.stats?.total_sessions || 0}
                  </Typography>
                  <Typography variant="body2">
                    Total Time: {Math.round((selectedReader.stats?.total_time_minutes || 0) / 60)} hours
                  </Typography>
                  <Typography variant="body2">
                    Average Session: {selectedReader.stats?.average_session_duration || 0} minutes
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Engagement
                  </Typography>
                  <Chip
                    label={selectedReader.engagement}
                    color={getEngagementColor(selectedReader.engagement) as any}
                    icon={getEngagementIcon(selectedReader.engagement)}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2">
                    Status: {selectedReader.status}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onClose={handleCloseEmailDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Send Email to {selectedReader?.first_name} {selectedReader?.last_name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Message"
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              multiline
              rows={6}
              fullWidth
              variant="outlined"
              placeholder="Enter your message here..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmailDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitEmail} 
            variant="contained" 
            disabled={loading || !emailSubject.trim() || !emailMessage.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReaderManagementPage;