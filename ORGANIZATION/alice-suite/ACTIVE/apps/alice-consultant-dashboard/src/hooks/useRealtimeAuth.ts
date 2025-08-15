import { useEffect, useState, useCallback } from 'react';
// Use a simple WebSocket connection for now since the realtime classes aren't in the shared package
import { io, Socket } from 'socket.io-client';
import { useConsultantAuth } from '../contexts/ConsultantAuthContext';
import { useSnackbar } from 'notistack';

interface AuthEvent {
  type: 'LOGIN' | 'LOGOUT' | 'SESSION_TIMEOUT';
  userId: string;
  userEmail: string;
  userName: string;
  timestamp: string;
  metadata?: {
    device?: string;
    browser?: string;
    ipAddress?: string;
    loginDuration?: number;
  };
}

interface OnlineReader {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  lastActivity: Date;
  currentBook?: string;
  isActive: boolean;
}

// Demo data for when Socket.IO isn't available
const DEMO_READERS: OnlineReader[] = [
  {
    userId: 'demo_user_1',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    lastActivity: new Date(),
    currentBook: 'The Great Gatsby',
    isActive: true
  },
  {
    userId: 'demo_user_2',
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@example.com',
    lastActivity: new Date(Date.now() - 120000), // 2 minutes ago
    currentBook: '1984',
    isActive: true
  },
  {
    userId: 'demo_user_3',
    firstName: 'Carol',
    lastName: 'Williams',
    email: 'carol.williams@example.com',
    lastActivity: new Date(Date.now() - 300000), // 5 minutes ago
    currentBook: 'To Kill a Mockingbird',
    isActive: true
  }
];

export const useRealtimeAuth = () => {
  const { user } = useConsultantAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [realtimeClient, setRealtimeClient] = useState<any>(null);
  const [onlineReaders, setOnlineReaders] = useState<OnlineReader[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);

  const handleLoginEvent = useCallback((event: AuthEvent) => {
    const readerName = event.userName || event.userEmail;
    enqueueSnackbar(`${readerName} just logged in`, {
      variant: 'success',
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      autoHideDuration: 5000,
    });
    
    // Add to online readers
    setOnlineReaders(prev => {
      const existingIndex = prev.findIndex(r => r.userId === event.userId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastActivity: new Date(event.timestamp),
          isActive: true
        };
        return updated;
      } else {
        return [...prev, {
          userId: event.userId,
          firstName: event.userName?.split(' ')[0] || event.userEmail,
          lastName: event.userName?.split(' ')[1] || '',
          email: event.userEmail,
          lastActivity: new Date(event.timestamp),
          isActive: true
        }];
      }
    });

    setAuthEvents(prev => [event, ...prev.slice(0, 9)]);
  }, [enqueueSnackbar]);

  const handleLogoutEvent = useCallback((event: AuthEvent) => {
    const readerName = event.userName || event.userEmail;
    enqueueSnackbar(`${readerName} logged out`, {
      variant: 'info',
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      autoHideDuration: 3000,
    });

    // Remove from online readers
    setOnlineReaders(prev => prev.filter(r => r.userId !== event.userId));
    
    // Update auth events
    setAuthEvents(prev => [event, ...prev.slice(0, 9)]);
  }, [enqueueSnackbar]);

  const handleOnlineReadersUpdate = useCallback((data: { readers: OnlineReader[] }) => {
    setOnlineReaders(data.readers.map(reader => ({
      ...reader,
      lastActivity: new Date(reader.lastActivity)
    })));
  }, []);

  useEffect(() => {
    if (!user) {
      // Always show demo data when no user is logged in
      setIsDemoMode(true);
      setIsConnected(true);
      setOnlineReaders([
        {
          userId: 'demo_user_1',
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@example.com',
          lastActivity: new Date(),
          currentBook: 'The Great Gatsby',
          isActive: true
        },
        {
          userId: 'demo_user_2',
          firstName: 'Bob',
          lastName: 'Smith',
          email: 'bob.smith@example.com',
          lastActivity: new Date(Date.now() - 120000),
          currentBook: '1984',
          isActive: true
        },
        {
          userId: 'demo_user_3',
          firstName: 'Carol',
          lastName: 'Williams',
          email: 'carol.williams@example.com',
          lastActivity: new Date(Date.now() - 300000),
          currentBook: 'To Kill a Mockingbird',
          isActive: true
        }
      ]);
      return;
    }

    // Initialize Socket.IO client directly
    const socket = io(import.meta.env.VITE_REALTIME_URL || 'http://localhost:3001', {
      auth: {
        token: localStorage.getItem('consultant_token') || ''
      },
      autoConnect: true,
      timeout: 5000, // 5 second timeout
      reconnectionAttempts: 2,
      reconnectionDelay: 1000
    });

    setRealtimeClient(socket);

    // Connection timeout fallback
    const connectionTimeout = setTimeout(() => {
      if (!isConnected) {
        console.warn('Socket.IO connection timeout - switching to demo mode');
        setIsDemoMode(true);
        setIsConnected(true); // Mark as connected for demo purposes
        setOnlineReaders(DEMO_READERS);
        setAuthEvents([]);
      }
    }, 5000);

    // Set up connection handlers
    socket.on('connect', () => {
      clearTimeout(connectionTimeout);
      setIsConnected(true);
      setIsDemoMode(false);
      console.log('Connected to real-time server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      clearTimeout(connectionTimeout);
      setIsDemoMode(true);
      setIsConnected(true); // Mark as connected for demo purposes
      setOnlineReaders(DEMO_READERS);
      setAuthEvents([]);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from real-time server');
      // Don't switch to demo mode on disconnect, keep existing data
    });

    // Subscribe to consultant events
    socket.emit('subscribe-consultant-events');

    // Set up event listeners
    socket.on('reader-activity', (data: any) => {
      if (data.eventType === 'LOGIN') {
        handleLoginEvent(data);
      } else if (data.eventType === 'LOGOUT') {
        handleLogoutEvent(data);
      }
    });

    socket.on('online-readers', handleOnlineReadersUpdate);

    // Request initial online readers
    socket.emit('get-online-readers');

    return () => {
      clearTimeout(connectionTimeout);
      socket.disconnect();
      setRealtimeClient(null);
    };
  }, [user, handleLoginEvent, handleLogoutEvent, handleOnlineReadersUpdate]);

  const refreshOnlineReaders = useCallback(() => {
    if (realtimeClient?.connected) {
      realtimeClient.emit('get-online-readers');
    }
  }, [realtimeClient]);

  const getRecentAuthEvents = useCallback((limit: number = 10) => {
    return authEvents.slice(0, limit);
  }, [authEvents]);

  const getActiveReaderCount = useCallback(() => {
    const now = new Date();
    return onlineReaders.filter(reader => {
      const diff = now.getTime() - reader.lastActivity.getTime();
      return diff < 300000; // Active within last 5 minutes
    }).length;
  }, [onlineReaders]);

  return {
    realtimeClient,
    onlineReaders,
    isConnected,
    authEvents,
    isDemoMode,
    refreshOnlineReaders,
    getRecentAuthEvents,
    getActiveReaderCount
  };
};