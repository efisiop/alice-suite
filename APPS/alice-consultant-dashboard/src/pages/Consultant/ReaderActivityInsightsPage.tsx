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
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Book as BookIcon,
  Timer as TimerIcon,
  AccessTime as AccessTimeIcon,
  EmojiEvents as AchievementIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  CenterFocusStrong as TargetIcon
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { fakeDataService } from '../../services/fakeDataService';
import { ReaderProfile } from '../../services/consultantService';

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
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const ReaderActivityInsightsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedReader, setSelectedReader] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [readers, setReaders] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [timeRange, selectedReader]);

  const loadData = () => {
    setLoading(true);
    const allReaders = fakeDataService.getAllReaders();
    const allInteractions = fakeDataService.getInteractions();
    
    setReaders(allReaders);
    setInteractions(allInteractions);
    setLoading(false);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Generate time-based activity data
  const generateActivityData = (days: number) => {
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pageViews: Math.floor(Math.random() * 100) + 50,
        dictionaryLookups: Math.floor(Math.random() * 30) + 10,
        highlights: Math.floor(Math.random() * 20) + 5,
        notes: Math.floor(Math.random() * 15) + 3,
        helpRequests: Math.floor(Math.random() * 8) + 1,
        avgSessionDuration: Math.floor(Math.random() * 45) + 15,
        activeReaders: Math.floor(Math.random() * 10) + 3
      });
    }
    
    return data;
  };

  const activityData = generateActivityData(timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90);

  // Calculate engagement metrics
  const calculateEngagementMetrics = () => {
    const filteredInteractions = selectedReader === 'all' 
      ? interactions 
      : interactions.filter(i => i.user_id === selectedReader);

    const totalSessions = filteredInteractions.length;
    const avgSessionTime = totalSessions > 0 
      ? Math.round(filteredInteractions.reduce((sum, i) => sum + (Math.random() * 60 + 15), 0) / totalSessions)
      : 0;

    const interactionTypes = {
      page_view: filteredInteractions.filter(i => i.event_type === 'page_view').length,
      dictionary_lookup: filteredInteractions.filter(i => i.event_type === 'dictionary_lookup').length,
      highlight: filteredInteractions.filter(i => i.event_type === 'highlight').length,
      note_added: filteredInteractions.filter(i => i.event_type === 'note_added').length,
      help_request: filteredInteractions.filter(i => i.event_type === 'help_request').length,
      chapter_complete: filteredInteractions.filter(i => i.event_type === 'chapter_complete').length
    };

    const readerEngagement = readers.map(reader => {
      const readerInteractions = interactions.filter(i => i.user_id === reader.id);
      return {
        name: `${reader.first_name} ${reader.last_name}`,
        sessions: readerInteractions.length,
        avgDuration: readerInteractions.length > 0 ? Math.random() * 45 + 15 : 0,
        engagement: reader.engagement,
        lastActive: new Date(reader.lastActive).toLocaleDateString(),
        progress: (reader as any).progress?.chapter || 1,
        totalTime: Math.round(((reader as any).stats?.total_time_minutes || 0) / 60)
      };
    });

    return {
      totalSessions,
      avgSessionTime,
      interactionTypes,
      readerEngagement
    };
  };

  const metrics = calculateEngagementMetrics();

  // Prepare chart data
  const interactionTypeData = [
    { name: 'Page Views', value: metrics.interactionTypes.page_view, color: '#8884d8' },
    { name: 'Dictionary', value: metrics.interactionTypes.dictionary_lookup, color: '#82ca9d' },
    { name: 'Highlights', value: metrics.interactionTypes.highlight, color: '#ffc658' },
    { name: 'Notes', value: metrics.interactionTypes.note_added, color: '#ff7300' },
    { name: 'Help', value: metrics.interactionTypes.help_request, color: '#ff4444' },
    { name: 'Completed', value: metrics.interactionTypes.chapter_complete, color: '#00ff00' }
  ];

  const engagementRadarData = [
    { metric: 'Reading Speed', value: Math.floor(Math.random() * 100) + 20 },
    { metric: 'Comprehension', value: Math.floor(Math.random() * 100) + 30 },
    { metric: 'Engagement', value: Math.floor(Math.random() * 100) + 40 },
    { metric: 'Interaction', value: Math.floor(Math.random() * 100) + 25 },
    { metric: 'Progress', value: Math.floor(Math.random() * 100) + 50 },
    { metric: 'Retention', value: Math.floor(Math.random() * 100) + 35 }
  ];

  const topEngagedReaders = metrics.readerEngagement
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5);

  const recentActivity = interactions
    .map(i => ({
      id: i.id,
      user: i.user_name,
      action: i.event_type.replace('_', ' '),
      content: i.content,
      time: i.created_at,
      page: i.page_number
    }))
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);

  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <TimelineIcon />
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
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <TimerIcon />
              </Avatar>
              <Typography variant="h6">{metrics.avgSessionTime}m</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Avg Session Time</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <SpeedIcon />
              </Avatar>
              <Typography variant="h6">{readers.filter(r => r.status === 'active').length}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Active Readers</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <TargetIcon />
              </Avatar>
              <Typography variant="h6">{Math.round(readers.reduce((sum, r) => sum + (r.progress?.chapter || 0), 0) / readers.length)}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Avg Chapter Progress</Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Activity Trends */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Activity Trends</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area type="monotone" dataKey="pageViews" stackId="1" stroke="#8884d8" fill="#8884d8" name="Page Views" />
              <Area type="monotone" dataKey="dictionaryLookups" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Dictionary Lookups" />
              <Area type="monotone" dataKey="highlights" stackId="1" stroke="#ffc658" fill="#ffc658" name="Highlights" />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Interaction Distribution */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Interaction Types</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={interactionTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <RechartsTooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderReaderInsights = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Reader Engagement Rankings</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reader</TableCell>
                  <TableCell align="right">Sessions</TableCell>
                  <TableCell align="right">Avg Duration</TableCell>
                  <TableCell align="right">Total Time (hrs)</TableCell>
                  <TableCell align="right">Progress</TableCell>
                  <TableCell align="right">Last Active</TableCell>
                  <TableCell>Engagement</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topEngagedReaders.map((reader, index) => (
                  <TableRow key={index}>
                    <TableCell>{reader.name}</TableCell>
                    <TableCell align="right">{reader.sessions}</TableCell>
                    <TableCell align="right">{Math.round(reader.avgDuration)}m</TableCell>
                    <TableCell align="right">{reader.totalTime}</TableCell>
                    <TableCell align="right">Chapter {reader.progress}</TableCell>
                    <TableCell align="right">{reader.lastActive}</TableCell>
                    <TableCell>
                      <Chip
                        label={reader.engagement}
                        color={reader.engagement === 'high' ? 'success' : 
                               reader.engagement === 'medium' ? 'warning' : 'error'}
                        size="small"
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

  const renderEngagementMetrics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Engagement Radar</Typography>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={engagementRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Engagement"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Session Duration Trends</Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avgSessionDuration" 
                stroke="#ff7300" 
                name="Avg Session (min)" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderRealTimeActivity = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Recent Activity Feed</Typography>
          <List>
            {recentActivity.map((activity, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">{activity.user}</Typography>
                        <Chip
                          label={activity.action}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.primary">
                          {activity.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Page {activity.page} • {new Date(activity.time).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < recentActivity.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Reader Activity Insights
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Reader</InputLabel>
            <Select
              value={selectedReader}
              onChange={(e) => setSelectedReader(e.target.value)}
              label="Reader"
            >
              <MenuItem value="all">All Readers</MenuItem>
              {readers.map(reader => (
                <MenuItem key={reader.id} value={reader.id}>
                  {reader.first_name} {reader.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Overview" />
          <Tab label="Reader Insights" />
          <Tab label="Engagement Metrics" />
          <Tab label="Real-time Activity" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderOverview()}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderReaderInsights()}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {renderEngagementMetrics()}
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          {renderRealTimeActivity()}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ReaderActivityInsightsPage;