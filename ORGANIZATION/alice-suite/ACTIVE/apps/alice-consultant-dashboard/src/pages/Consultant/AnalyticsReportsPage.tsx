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
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Book as BookIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  EmojiEvents as AchievementIcon,
  Assessment as ReportIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { fakeDataService } from '../../services/fakeDataService';
import { ReaderProfile, UserFeedback, HelpRequest } from '../../services/consultantService';

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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const AnalyticsReportsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(false);
  const [readers, setReaders] = useState<ReaderProfile[]>([]);
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = () => {
    setLoading(true);
    const allReaders = fakeDataService.getAllReaders();
    const allFeedback = fakeDataService.getFeedback();
    const allHelpRequests = fakeDataService.getHelpRequests();
    
    setReaders(allReaders);
    setFeedback(allFeedback);
    setHelpRequests(allHelpRequests);
    setLoading(false);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Generate mock time-series data
  const generateTimeSeriesData = (days: number) => {
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sessions: Math.floor(Math.random() * 50) + 20,
        activeReaders: Math.floor(Math.random() * 15) + 5,
        newFeedback: Math.floor(Math.random() * 8) + 2,
        helpRequests: Math.floor(Math.random() * 5) + 1
      });
    }
    
    return data;
  };

  const timeSeriesData = generateTimeSeriesData(timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90);

  // Calculate key metrics
  const calculateMetrics = () => {
    const totalReaders = readers.length;
    const activeReaders = readers.filter(r => (r as any).status === 'active').length;
    const totalSessions = readers.reduce((sum, r) => sum + ((r as any).stats?.total_sessions || 0), 0);
    const totalReadingTime = readers.reduce((sum, r) => sum + ((r as any).stats?.total_time_minutes || 0), 0);
    const avgSessionTime = totalSessions > 0 ? Math.round(totalReadingTime / totalSessions) : 0;
    
    const engagementDistribution = {
      high: readers.filter(r => (r as any).engagement === 'high').length,
      medium: readers.filter(r => (r as any).engagement === 'medium').length,
      low: readers.filter(r => (r as any).engagement === 'low').length
    };

    const feedbackTypes = {
      aha: feedback.filter(f => f.feedback_type === 'aha_moment').length,
      positive: feedback.filter(f => f.feedback_type === 'positive_experience').length,
      suggestion: feedback.filter(f => f.feedback_type === 'suggestion').length,
      confusion: feedback.filter(f => f.feedback_type === 'confusion').length
    };

    const helpRequestStats = {
      pending: helpRequests.filter(h => h.status === 'pending').length,
      assigned: helpRequests.filter(h => h.status === 'assigned').length,
      resolved: helpRequests.filter(h => h.status === 'resolved').length
    };

    return {
      totalReaders,
      activeReaders,
      totalSessions,
      totalReadingTime: Math.round(totalReadingTime / 60), // Convert to hours
      avgSessionTime,
      engagementDistribution,
      feedbackTypes,
      helpRequestStats
    };
  };

  const metrics = calculateMetrics();

  // Prepare chart data
  const engagementData = [
    { name: 'High', value: metrics.engagementDistribution.high, color: '#4caf50' },
    { name: 'Medium', value: metrics.engagementDistribution.medium, color: '#ff9800' },
    { name: 'Low', value: metrics.engagementDistribution.low, color: '#f44336' }
  ];

  const feedbackData = [
    { name: 'Aha! Moments', value: metrics.feedbackTypes.aha, color: '#ff9800' },
    { name: 'Positive', value: metrics.feedbackTypes.positive, color: '#4caf50' },
    { name: 'Suggestions', value: metrics.feedbackTypes.suggestion, color: '#2196f3' },
    { name: 'Questions', value: metrics.feedbackTypes.confusion, color: '#f44336' }
  ];

  const topPerformers = readers
    .sort((a, b) => ((b as any).stats?.total_sessions || 0) - ((a as any).stats?.total_sessions || 0))
    .slice(0, 5)
    .map(reader => ({
      name: `${reader.first_name} ${reader.last_name}`,
      sessions: (reader as any).stats?.total_sessions || 0,
      timeSpent: Math.round(((reader as any).stats?.total_time_minutes || 0) / 60),
      engagement: (reader as any).engagement || 'medium'
    }));

  const recentActivity = [
    ...readers.map(r => ({ type: 'reader', name: `${r.first_name} ${r.last_name}`, action: 'joined', time: r.created_at })),
    ...feedback.map(f => ({ type: 'feedback', name: `${f.user.first_name} ${f.user.last_name}`, action: 'shared feedback', time: f.created_at })),
    ...helpRequests.map(h => ({ type: 'help', name: `${h.user.first_name} ${h.user.last_name}`, action: 'asked for help', time: h.created_at }))
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);

  const exportReport = (format: 'csv' | 'json') => {
    const report = {
      metrics,
      topPerformers,
      engagementData,
      feedbackData,
      generatedAt: new Date().toISOString()
    };

    if (format === 'json') {
      const dataStr = JSON.stringify(report, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <PeopleIcon />
              </Avatar>
              <Typography variant="h6">{metrics.totalReaders}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Total Readers</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <TrendingUpIcon />
              </Avatar>
              <Typography variant="h6">{metrics.activeReaders}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Active Readers</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <BookIcon />
              </Avatar>
              <Typography variant="h6">{metrics.totalSessions}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Total Sessions</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <TimerIcon />
              </Avatar>
              <Typography variant="h6">{metrics.avgSessionTime}m</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Avg Session Time</Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Time Series Chart */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Reader Activity Over Time</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="sessions" stroke="#8884d8" name="Sessions" />
              <Line type="monotone" dataKey="activeReaders" stroke="#82ca9d" name="Active Readers" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Engagement Distribution */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Engagement Distribution</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={engagementData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {engagementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderReaderAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Top Performing Readers</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reader</TableCell>
                  <TableCell align="right">Sessions</TableCell>
                  <TableCell align="right">Time Spent (hrs)</TableCell>
                  <TableCell>Engagement</TableCell>
                  <TableCell>Progress</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topPerformers.map((reader, index) => (
                  <TableRow key={index}>
                    <TableCell>{reader.name}</TableCell>
                    <TableCell align="right">{reader.sessions}</TableCell>
                    <TableCell align="right">{reader.timeSpent}</TableCell>
                    <TableCell>
                      <Chip
                        label={reader.engagement}
                        color={reader.engagement === 'high' ? 'success' : 
                               reader.engagement === 'medium' ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.random() * 100} 
                        sx={{ width: 100 }}
                      />
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

  const renderContentAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Feedback Types</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={feedbackData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="value" fill="#8884d8">
                {feedbackData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Help Request Status</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={[
                { name: 'Pending', value: metrics.helpRequestStats.pending, color: '#ff9800' },
                { name: 'Assigned', value: metrics.helpRequestStats.assigned, color: '#2196f3' },
                { name: 'Resolved', value: metrics.helpRequestStats.resolved, color: '#4caf50' }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="value" fill="#8884d8">
                {[
                  { name: 'Pending', value: metrics.helpRequestStats.pending, color: '#ff9800' },
                  { name: 'Assigned', value: metrics.helpRequestStats.assigned, color: '#2196f3' },
                  { name: 'Resolved', value: metrics.helpRequestStats.resolved, color: '#4caf50' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderActivityFeed = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Recent Activity</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Activity</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentActivity.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Chip
                        label={activity.action}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{activity.name}</TableCell>
                    <TableCell>{new Date(activity.time).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Analytics & Reports
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh Data">
            <IconButton onClick={loadData} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            onClick={() => exportReport('json')}
            startIcon={<DownloadIcon />}
          >
            Export
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Overview" />
          <Tab label="Reader Analytics" />
          <Tab label="Content Analytics" />
          <Tab label="Activity Feed" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderOverview()}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderReaderAnalytics()}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {renderContentAnalytics()}
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          {renderActivityFeed()}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AnalyticsReportsPage;