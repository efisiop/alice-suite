import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { aiClient } from '@alice-suite/api-client';
import { useAuth } from '../contexts/EnhancedAuthContext';

interface AIInsights {
  totalStudents: number;
  averageReadingSpeed: number;
  averageComprehension: number;
  vocabularyGrowth: number;
  topPerformers: Array<{
    userId: string;
    name: string;
    readingSpeed: number;
    comprehension: number;
    streakDays: number;
  }>;
  strugglingStudents: Array<{
    userId: string;
    name: string;
    readingSpeed: number;
    comprehension: number;
    lastActivity: string;
  }>;
}

const AIAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAIInsights = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch real data from AI service
      const realInsights = await aiClient.getAIInsights({
        consultantId: user.id,
        includeTopPerformers: true,
        includeStrugglingStudents: true,
        timeRange: '7days'
      });
      
      setInsights(realInsights);
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
      setError('Failed to fetch AI insights. Please check if you have assigned readers.');
      
      // Fallback to empty state instead of fake data
      setInsights({
        totalStudents: 0,
        averageReadingSpeed: 0,
        averageComprehension: 0,
        vocabularyGrowth: 0,
        topPerformers: [],
        strugglingStudents: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, [user]);

  if (!user) {
    return (
      <Alert severity="info">
        Please sign in to access AI analytics
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        🤖 AI-Powered Student Analytics
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : insights ? (
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h3">
                    {insights.totalStudents}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success" gutterBottom>
                    Avg Reading Speed
                  </Typography>
                  <Typography variant="h3">
                    {insights.averageReadingSpeed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    words/min
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="info" gutterBottom>
                    Avg Comprehension
                  </Typography>
                  <Typography variant="h3">
                    {insights.averageComprehension}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="warning" gutterBottom>
                    Vocabulary Growth
                  </Typography>
                  <Typography variant="h3">
                    {insights.vocabularyGrowth}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    new words
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🏆 Top Performers
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Student</TableCell>
                          <TableCell align="right">Speed</TableCell>
                          <TableCell align="right">Score</TableCell>
                          <TableCell align="right">Streak</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {insights.topPerformers.map((student) => (
                          <TableRow key={student.userId}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell align="right">{student.readingSpeed} wpm</TableCell>
                            <TableCell align="right">{student.comprehension}%</TableCell>
                            <TableCell align="right">
                              <Chip label={`${student.streakDays}d`} size="small" color="success" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ⚠️ Students Needing Attention
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Student</TableCell>
                          <TableCell align="right">Speed</TableCell>
                          <TableCell align="right">Score</TableCell>
                          <TableCell align="right">Last Active</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {insights.strugglingStudents.map((student) => (
                          <TableRow key={student.userId}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell align="right">{student.readingSpeed} wpm</TableCell>
                            <TableCell align="right">{student.comprehension}%</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={new Date(student.lastActivity).toLocaleDateString()} 
                                size="small" 
                                color="warning" 
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔍 AI Insights Summary
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Alert severity="success">
                  <Typography variant="body2">
                    📈 Overall class performance is improving with an average comprehension score of {insights.averageComprehension}%
                  </Typography>
                </Alert>
                
                <Alert severity="info">
                  <Typography variant="body2">
                    🎯 Students have collectively learned {insights.vocabularyGrowth} new vocabulary words this week
                  </Typography>
                </Alert>
                
                <Alert severity="warning">
                  <Typography variant="body2">
                    ⚠️ {insights.strugglingStudents.length} students need additional support - consider personalized interventions
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Alert severity="info">
          Loading AI insights...
        </Alert>
      )}
    </Box>
  );
};

export default AIAnalyticsDashboard;