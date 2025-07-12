import React, { useEffect, useState } from 'react';
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
  Chip
} from '@mui/material';
import { useConsultantService } from '../../hooks/useService';
import { ReaderInteraction } from '../../services/consultantService';
import { format } from 'date-fns';

const ReaderActivityDashboard: React.FC = () => {
  const { service: consultantService, loading: serviceLoading } = useConsultantService();
  const [interactions, setInteractions] = useState<ReaderInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!consultantService) return;

    const fetchInteractions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await consultantService.getReaderInteractions();
        setInteractions(data);
      } catch (err: any) {
        console.error('Error fetching reader interactions:', err);
        setError('Failed to load reader activity. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, [consultantService]);

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Reader Activity Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Monitor real-time login and interaction data for all readers.
      </Typography>

      {interactions.length === 0 ? (
        <Alert severity="info">No reader activity found.</Alert>
      ) : (
        <Paper elevation={1} sx={{ maxHeight: 600, overflow: 'auto' }}>
          <List>
            {interactions.map((interaction, index) => (
              <React.Fragment key={interaction.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          sx={{ display: 'inline' }}
                          component="span"
                          variant="subtitle1"
                          color="text.primary"
                        >
                          {/* @ts-ignore */}
                          {interaction.user_name || interaction.user_id}
                        </Typography>
                        <Chip label={interaction.event_type} size="small" color="primary" />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: 'block' }}
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {/* @ts-ignore */}
                          {interaction.user_email}
                        </Typography>
                        <Typography
                          sx={{ display: 'block' }}
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {format(new Date(interaction.created_at), 'PPP p')}
                        </Typography>
                        {interaction.content && (
                          <Typography
                            sx={{ display: 'block', mt: 1 }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            Content: {interaction.content}
                          </Typography>
                        )}
                        {interaction.page_number && (
                          <Typography
                            sx={{ display: 'block' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            Page: {interaction.page_number}
                          </Typography>
                        )}
                        {interaction.book_id && (
                          <Typography
                            sx={{ display: 'block' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            Book ID: {interaction.book_id}
                          </Typography>
                        )}
                      </React.Fragment>
                    }
                  />
                </ListItem>
                {index < interactions.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default ReaderActivityDashboard;