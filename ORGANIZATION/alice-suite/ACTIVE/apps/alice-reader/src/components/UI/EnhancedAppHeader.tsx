// src/components/UI/EnhancedAppHeader.tsx
import React, { useState, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Badge,
  useTheme,
  useScrollTrigger,
  Slide,
  Fade,
  useMediaQuery
} from '@mui/material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BarChartIcon from '@mui/icons-material/BarChart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeIcon from '@mui/icons-material/Home';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useAuth } from '../../contexts/AuthContext';
import { TRANSITIONS } from '../../theme/theme';
import { appLog } from '../LogViewer';

// Hide on scroll
interface HideOnScrollProps {
  children: React.ReactElement;
}

const HideOnScroll: React.FC<HideOnScrollProps> = ({ children }) => {
  const trigger = useScrollTrigger();
  
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

const EnhancedAppHeader: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [visible, setVisible] = useState(false);
  
  // Show header with animation on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Get user initials
  const getUserInitials = () => {
    if (!user) return '?';
    
    const email = user.email || '';
    return email.substring(0, 2).toUpperCase();
  };
  
  // Don't show header on login/register pages
  if (['/login', '/register', '/verify'].includes(location.pathname)) {
    return null;
  }
  
  return (
    <HideOnScroll>
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          backgroundColor: theme.palette.background.paper,
          transition: `all ${TRANSITIONS.MEDIUM}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-20px)',
        }}
      >
        <Toolbar>
          {/* Logo/Title */}
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontFamily: '"Alice", serif',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/reader')}
          >
            <MenuBookIcon sx={{ mr: 1 }} />
            Alice Reader
          </Typography>
          
          {/* User section - simplified */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {user.email}
              </Typography>
              <Tooltip title="Logout">
                <IconButton
                  onClick={handleLogout}
                  size="small"
                    sx={{
                    ml: 1,
                      bgcolor: theme.palette.primary.main,
                    color: 'white',
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                      },
                    }}
                  >
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};

export default EnhancedAppHeader;
