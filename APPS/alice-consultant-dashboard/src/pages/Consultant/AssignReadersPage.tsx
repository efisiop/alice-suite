import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
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
  TextField,
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
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { realUserService } from '../../services/realUserService';
import { ReaderProfile } from '../../services/consultantService';
import { useAuth } from '../../contexts/EnhancedAuthContext';

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
      id={`assign-tabpanel-${index}`}
      aria-labelledby={`assign-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

interface Assignment {
  id: string;
  readerId: string;
  readerName: string;
  consultantId: string;
  consultantName: string;
  assignedDate: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
  lastContact?: string;
}

const AssignReadersPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [readers, setReaders] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedReader, setSelectedReader] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [assignmentNotes, setAssignmentNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load real readers from database
      const [readersResult, assignmentsResult] = await Promise.all([
        realUserService.getReadersWithStats(),
        user ? realUserService.getReadersForConsultant(user.id) : Promise.resolve({ data: [], error: null })
      ]);

      if (readersResult.error) {
        setError('Failed to load readers: ' + readersResult.error.message);
        return;
      }

      if (assignmentsResult.error) {
        setError('Failed to load assignments: ' + assignmentsResult.error.message);
        return;
      }

      // Transform real users to match expected format
      const realReaders = readersResult.data?.map(readerWithStats => ({
        id: readerWithStats.user.id,
        first_name: readerWithStats.user.first_name || 'Unknown',
        last_name: readerWithStats.user.last_name || 'User',
        email: readerWithStats.user.email,
        progress: {
          chapter: 1, // Default, will be calculated from reading progress
          page: 1,
          last_read_at: readerWithStats.readingStats.last_activity || new Date().toISOString(),
          time_spent_minutes: Math.floor(readerWithStats.readingStats.total_reading_time / 60)
        },
        stats: {
          total_sessions: readerWithStats.readingStats.total_books,
          total_time_minutes: Math.floor(readerWithStats.readingStats.total_reading_time / 60),
          average_session_duration: 30, // Default calculation
          last_activity_date: readerWithStats.readingStats.last_activity || new Date().toISOString()
        },
        engagement: readerWithStats.readingStats.total_reading_time > 3600 ? 'high' : 
                   readerWithStats.readingStats.total_reading_time > 600 ? 'medium' : 'low',
        lastActive: readerWithStats.readingStats.last_activity || new Date().toISOString(),
        status: 'active'
      })) || [];

      setReaders(realReaders);
      
      // Transform real assignments
      if (assignmentsResult.data) {
        const realAssignments: Assignment[] = assignmentsResult.data.flatMap(userWithAssignments => 
          userWithAssignments.assignments.map(assignment => ({
            id: assignment.id,
            readerId: userWithAssignments.user.id,
            readerName: `${userWithAssignments.user.first_name || 'Unknown'} ${userWithAssignments.user.last_name || 'User'}`,
            consultantId: user?.id || '',
            consultantName: 'Dr. Consultant',
            assignedDate: assignment.created_at,
            status: assignment.active ? 'active' : 'completed',
            notes: `Assigned to ${assignment.book_title}`,
            lastContact: assignment.created_at
          }))
        );
        setAssignments(realAssignments);
      }

    } catch (error) {
      setError('Failed to load data: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };


  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAssignReader = async () => {
    if (!selectedReader || !user) return;

    setLoading(true);
    setError(null);

    try {
      const client = await import('../../services/supabaseClient').then(mod => mod.getSupabaseClient());
      
      // Create consultant assignment in database
      const { data, error } = await client
        .from('consultant_assignments')
        .insert({
          consultant_id: user.id,
          user_id: selectedReader,
          book_id: 'alice-in-wonderland',
          active: true,
          notes: assignmentNotes || 'Assigned to consultant'
        })
        .select()
        .single();

      if (error) throw error;

      // Reload data to get fresh assignments
      await loadData();
      
      setShowAssignDialog(false);
      setSelectedReader('');
      setAssignmentNotes('');
      setActiveStep(0);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to assign reader. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (assignmentId: string, newStatus: Assignment['status']) => {
    setLoading(true);
    setError(null);

    try {
      const client = await import('../../services/supabaseClient').then(mod => mod.getSupabaseClient());
      
      // Update consultant assignment status in database
      const { error } = await client
        .from('consultant_assignments')
        .update({ 
          active: newStatus === 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (error) throw error;

      // Reload data to get fresh assignments
      await loadData();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = (assignment: Assignment) => {
    const subject = `Your Alice in Wonderland Reading Journey - ${assignment.readerName}`;
    const body = `Dear ${assignment.readerName},\n\nI hope this message finds you well. I'm excited to be your consultant for your Alice in Wonderland reading journey.\n\nLet's schedule a time to discuss your progress and any questions you might have.\n\nBest regards,\nDr. Consultant`;
    window.open(`mailto:${assignment.readerName.replace(' ', '.').toLowerCase()}@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const filteredReaders = readers.filter(reader => {
    const isAssigned = assignments.some(a => a.readerId === reader.id && a.status === 'active');
    const matchesSearch = !searchQuery || 
      reader.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reader.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reader.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return !isAssigned && matchesSearch;
  });

  const getStats = () => {
    const total = assignments.length;
    const active = assignments.filter(a => a.status === 'active').length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const pending = assignments.filter(a => a.status === 'pending').length;
    const cancelled = assignments.filter(a => a.status === 'cancelled').length;
    
    return { total, active, completed, pending, cancelled };
  };

  const stats = getStats();

  const steps = ['Select Reader', 'Add Notes', 'Confirm Assignment'];

  const renderUnassignedReaders = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Available Readers</Typography>
            <TextField
              size="small"
              placeholder="Search readers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reader</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Progress</TableCell>
                  <TableCell align="right">Engagement</TableCell>
                  <TableCell align="right">Last Active</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReaders.map((reader) => (
                  <TableRow key={reader.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                        <Typography>
                          {reader.first_name} {reader.last_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{reader.email}</TableCell>
                    <TableCell align="right">
                      Chapter {reader.progress?.chapter || 1}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={reader.engagement}
                        color={reader.engagement === 'high' ? 'success' : 
                               reader.engagement === 'medium' ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {new Date(reader.lastActive).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedReader(reader.id);
                          setShowAssignDialog(true);
                        }}
                        startIcon={<AssignmentIcon />}
                      >
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderCurrentAssignments = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Current Assignments ({stats.active})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reader</TableCell>
                  <TableCell>Assigned Date</TableCell>
                  <TableCell>Last Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.filter(a => a.status === 'active' || a.status === 'pending').map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                        <Typography>{assignment.readerName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{new Date(assignment.assignedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {assignment.lastContact ? new Date(assignment.lastContact).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={assignment.status}
                        color={assignment.status === 'active' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {assignment.notes || 'No notes'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="Send Email">
                          <IconButton
                            onClick={() => handleSendEmail(assignment)}
                            color="primary"
                            size="small"
                          >
                            <EmailIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark Complete">
                          <IconButton
                            onClick={() => handleUpdateStatus(assignment.id, 'completed')}
                            color="success"
                            size="small"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel Assignment">
                          <IconButton
                            onClick={() => handleUpdateStatus(assignment.id, 'cancelled')}
                            color="error"
                            size="small"
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderAssignmentHistory = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Assignment History
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reader</TableCell>
                  <TableCell>Assigned Date</TableCell>
                  <TableCell>Completed Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.filter(a => a.status === 'completed' || a.status === 'cancelled').map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.readerName}</TableCell>
                    <TableCell>{new Date(assignment.assignedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {assignment.status === 'completed' ? 'Completed' : 'Cancelled'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={assignment.status}
                        color={assignment.status === 'completed' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {assignment.notes || 'No notes'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderAssignDialog = () => (
    <Dialog open={showAssignDialog} onClose={() => setShowAssignDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>Assign Reader to Consultant</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box sx={{ minHeight: 200 }}>
            <Typography variant="h6" gutterBottom>Select Reader</Typography>
            <FormControl fullWidth>
              <InputLabel>Reader</InputLabel>
              <Select
                value={selectedReader}
                onChange={(e) => setSelectedReader(e.target.value)}
                label="Reader"
              >
                {filteredReaders.map(reader => (
                  <MenuItem key={reader.id} value={reader.id}>
                    {reader.first_name} {reader.last_name} - Chapter {reader.progress?.chapter || 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ minHeight: 200 }}>
            <Typography variant="h6" gutterBottom>Add Assignment Notes</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              placeholder="Add any special notes or instructions for this assignment..."
              variant="outlined"
            />
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ minHeight: 200 }}>
            <Typography variant="h6" gutterBottom>Confirm Assignment</Typography>
            <Typography variant="body1" gutterBottom>
              You are about to assign:
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Reader: {readers.find(r => r.id === selectedReader)?.first_name} {readers.find(r => r.id === selectedReader)?.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Consultant: Dr. Consultant
            </Typography>
            {assignmentNotes && (
              <Typography variant="body2" color="text.secondary" paragraph>
                Notes: {assignmentNotes}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowAssignDialog(false)}>Cancel</Button>
        <Button
          onClick={() => {
            if (activeStep < steps.length - 1) {
              setActiveStep(activeStep + 1);
            } else {
              handleAssignReader();
            }
          }}
          disabled={activeStep === 0 && !selectedReader}
          variant="contained"
        >
          {activeStep === steps.length - 1 ? 'Assign' : 'Next'}
        </Button>
        {activeStep > 0 && (
          <Button onClick={() => setActiveStep(activeStep - 1)}>
            Back
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Assign Readers
        </Typography>
        <Button
          variant="outlined"
          onClick={loadData}
          disabled={loading}
          startIcon={<RefreshIcon />}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setShowAssignDialog(true);
            setActiveStep(0);
          }}
          startIcon={<PersonAddIcon />}
        >
          New Assignment
        </Button>
      </Box>

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

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <GroupIcon />
                </Avatar>
                <Typography variant="h6">{stats.total}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Assignments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h6">{stats.active}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Typography variant="h6">{stats.completed}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Typography variant="h6">{stats.pending}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <CancelIcon />
                </Avatar>
                <Typography variant="h6">{stats.cancelled}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Cancelled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Unassigned Readers" />
          <Tab label="Current Assignments" />
          <Tab label="Assignment History" />
        </Tabs>

        {!loading && (
          <>
            <TabPanel value={tabValue} index={0}>
              {renderUnassignedReaders()}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {renderCurrentAssignments()}
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              {renderAssignmentHistory()}
            </TabPanel>
          </>
        )}
      </Paper>

      {renderAssignDialog()}
    </Box>
  );
};

export default AssignReadersPage;