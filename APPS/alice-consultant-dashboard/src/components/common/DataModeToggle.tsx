import React, { useState } from 'react';
import {
  Box,
  FormControlLabel,
  Switch,
  Typography,
  Paper,
  Chip,
  Alert
} from '@mui/material';
import { dataServiceManager } from '../../services/dataServiceManager';
import { appLog } from '../LogViewer';

const DataModeToggle: React.FC = () => {
  const [isRealData, setIsRealData] = useState(dataServiceManager.isUsingRealData());

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const useRealData = event.target.checked;
    setIsRealData(useRealData);
    
    try {
      dataServiceManager.setMode(useRealData ? 'real' : 'fake');
      appLog('DataModeToggle', `Switched to ${useRealData ? 'real' : 'fake'} data mode`, 'info');
      
      // Refresh the page to apply the new data mode
      window.location.reload();
    } catch (error) {
      console.error('Error switching data mode:', error);
      appLog('DataModeToggle', `Error switching data mode: ${error}`, 'error');
      // Revert toggle if error
      setIsRealData(!useRealData);
    }
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 2, 
        backgroundColor: isRealData ? 'success.light' : 'warning.light',
        border: `2px solid ${isRealData ? 'success.main' : 'warning.main'}`
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6" color="text.primary">
            Data Source
          </Typography>
          <Chip 
            label={isRealData ? 'Real Database' : 'Demo Data'} 
            color={isRealData ? 'success' : 'warning'}
            variant="filled"
          />
        </Box>
        
        <FormControlLabel
          control={
            <Switch
              checked={isRealData}
              onChange={handleToggle}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              {isRealData ? 'Using real Supabase data' : 'Using fake demo data'}
            </Typography>
          }
        />
      </Box>
      
      {!isRealData && (
        <Alert severity="info" sx={{ mt: 1 }}>
          <Typography variant="body2">
            Currently using demo data for testing. Toggle switch to use real database.
          </Typography>
        </Alert>
      )}
      
      {isRealData && (
        <Alert severity="success" sx={{ mt: 1 }}>
          <Typography variant="body2">
            Connected to real Supabase database. All data is live and persistent.
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default DataModeToggle;
