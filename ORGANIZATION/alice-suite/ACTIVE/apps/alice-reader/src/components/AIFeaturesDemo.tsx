import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { aiClient } from '@alice-suite/api-client';
import { useAuth } from '../contexts/AuthContext';

const AIFeaturesDemo: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchLearningAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await aiClient.getLearningAnalytics(user.id);
      if (error) {
        setError(error);
      } else {
        setAnalytics(data?.[0] || null);
      }
    } catch (err) {
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await aiClient.getAIRecommendations(user.id);
      if (error) {
        setError(error);
      } else {
        setRecommendations(data || []);
      }
    } catch (err) {
      setError('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLearningAnalytics();
      fetchRecommendations();
    }
  }, [user]);

  if (!user) {
    return (
      <Alert severity="info">
        Please sign in to access AI features
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        🤖 AI-Powered Learning Features
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Learning Analytics
          </Typography>
          
          {loading && !analytics ? (
            <CircularProgress />
          ) : analytics ? (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Personalized insights based on your reading patterns
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip label={`Reading Speed: ${analytics.readingSpeed} wpm`} color="primary" />
                <Chip label={`Comprehension: ${analytics.comprehensionScore}%`} color="success" />
                <Chip label={`Vocabulary Growth: ${analytics.vocabularyGrowth} words`} color="info" />
                <Chip label={`Quiz Average: ${analytics.quizAverage}%`} color="secondary" />
                <Chip label={`Streak: ${analytics.streakDays} days`} color="warning" />
              </Box>
              
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Learning Style: {analytics.learningStyle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total reading time: {Math.round(analytics.totalReadingTime / 60)} hours
              </Typography>
            </Box>
          ) : (
            <Typography>No analytics data available yet</Typography>
          )}
          
          <Button 
            variant="outlined" 
            onClick={fetchLearningAnalytics}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            Refresh Analytics
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            AI Recommendations
          </Typography>
          
          {loading && recommendations.length === 0 ? (
            <CircularProgress />
          ) : recommendations.length > 0 ? (
            <List>
              {recommendations.map((rec, index) => (
                <React.Fragment key={rec.id}>
                  <ListItem>
                    <ListItemText
                      primary={rec.reason}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            Type: {rec.type.replace('_', ' ').toUpperCase()}
                          </Typography>
                          <Typography variant="caption">
                            Confidence: {(rec.confidence * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recommendations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography>No recommendations available yet</Typography>
          )}
          
          <Button 
            variant="outlined" 
            onClick={fetchRecommendations}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            Get New Recommendations
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Available AI Features
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography>
              • 📚 Vocabulary lookup with context
            </Typography>
            <Typography>
              • 🎯 Personalized quiz generation
            </Typography>
            <Typography>
              • 📊 Real-time learning analytics
            </Typography>
            <Typography>
              • 🎯 Smart book recommendations
            </Typography>
            <Typography>
              • 📈 Progress tracking and insights
            </Typography>
            <Typography>
              • 🗺️ Personalized learning paths
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AIFeaturesDemo;