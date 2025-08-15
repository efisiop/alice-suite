import { ConsultantRealtimeClient } from '@alice-suite/api-client/realtime';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';

export interface RealtimeActivity {
  userId: string;
  firstName?: string;
  lastName?: string;
  eventType: string;
  data: any;
  timestamp: Date;
}

export interface OnlineReader {
  userId: string;
  firstName?: string;
  lastName?: string;
  lastActivity: Date;
  currentBook?: string;
  currentPage?: number;
  deviceInfo?: any;
}

export class ConsultantRealtimeService {
  private client: ConsultantRealtimeClient | null = null;
  private isConnected = false;

  constructor(private getToken: () => Promise<string | null>) {}

  async connect(): Promise<void> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      this.client = new ConsultantRealtimeClient({
        url: process.env.REACT_APP_REALTIME_URL || 'http://localhost:3001',
        token,
        autoConnect: true
      });

      this.isConnected = true;
      console.log('🟢 Consultant realtime service connected');
    } catch (error) {
      console.error('❌ Failed to connect to realtime service:', error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
      this.isConnected = false;
    }
  }

  subscribeToAllEvents(): void {
    if (!this.client) return;
    this.client.subscribeToAllEvents();
  }

  subscribeToHelpEvents(): void {
    if (!this.client) return;
    this.client.subscribeToHelpEvents();
  }

  subscribeToProgressEvents(): void {
    if (!this.client) return;
    this.client.subscribeToProgressEvents();
  }

  onReaderActivity(callback: (activity: RealtimeActivity) => void): void {
    if (!this.client) return;
    this.client.onReaderActivity(callback);
  }

  onOnlineReaders(callback: (data: { count: number; readers: OnlineReader[] }) => void): void {
    if (!this.client) return;
    this.client.onOnlineReaders(callback);
  }

  onRecentEvents(callback: (events: { events: RealtimeActivity[] }) => void): void {
    if (!this.client) return;
    this.client.onRecentEvents(callback);
  }

  getOnlineReaders(): void {
    if (!this.client) return;
    this.client.getOnlineReaders();
  }

  getRecentEvents(limit?: number, userId?: string): void {
    if (!this.client) return;
    this.client.getRecentEvents(limit, userId);
  }

  isConnected(): boolean {
    return this.isConnected && this.client?.isConnected() || false;
  }

  updateToken(token: string): void {
    if (this.client) {
      this.client.updateToken(token);
    }
  }
}

// React Hook for using the realtime service
export const useRealtimeService = () => {
  const { user, getToken } = useAuth();
  const [service] = useState(() => new ConsultantRealtimeService(getToken));
  const [isConnected, setIsConnected] = useState(false);
  const [onlineReaders, setOnlineReaders] = useState<OnlineReader[]>([]);
  const [recentActivity, setRecentActivity] = useState<RealtimeActivity[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (user?.user_metadata?.role === 'consultant') {
      service.connect()
        .then(() => {
          setIsConnected(true);
          service.subscribeToAllEvents();
          service.getOnlineReaders();
          service.getRecentEvents(50);
        })
        .catch(console.error);

      service.onOnlineReaders((data) => {
        setOnlineReaders(data.readers);
        setOnlineCount(data.count);
      });

      service.onReaderActivity((activity) => {
        setRecentActivity(prev => [activity, ...prev].slice(0, 50));
      });

      service.onRecentEvents((data) => {
        setRecentActivity(data.events);
      });

      return () => {
        service.disconnect();
        setIsConnected(false);
      };
    }
  }, [user, service]);

  useEffect(() => {
    const updateToken = async () => {
      const token = await getToken();
      if (token) {
        service.updateToken(token);
      }
    };

    updateToken();
  }, [getToken, service]);

  return {
    service,
    isConnected,
    onlineReaders,
    recentActivity,
    onlineCount,
    getOnlineReaders: () => service.getOnlineReaders(),
    getRecentEvents: (limit?: number, userId?: string) => service.getRecentEvents(limit, userId)
  };
};

// Component for displaying realtime activity
export const RealtimeActivityWidget: React.FC = () => {
  const { isConnected, onlineCount, recentActivity } = useRealtimeService();

  const getActivityIcon = (eventType: string) => {
    switch (eventType) {
      case 'LOGIN': return '🟢';
      case 'LOGOUT': return '🔴';
      case 'PAGE_SYNC': return '📖';
      case 'SECTION_SYNC': return '📚';
      case 'DEFINITION_LOOKUP': return '📖';
      case 'AI_QUERY': return '🤖';
      case 'HELP_REQUEST': return '❓';
      case 'FEEDBACK_SUBMISSION': return '💬';
      case 'NOTE_CREATED': return '📝';
      case 'QUIZ_ATTEMPT': return '🎯';
      default: return '📊';
    }
  };

  const getActivityDescription = (activity: RealtimeActivity) => {
    const { firstName, lastName, eventType, data } = activity;
    const name = firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : 'A reader';

    switch (eventType) {
      case 'LOGIN': return `${name} signed in`;
      case 'LOGOUT': return `${name} signed out`;
      case 'PAGE_SYNC': return `${name} is on page ${data.pageNumber} of "${data.bookId}"`;
      case 'SECTION_SYNC': return `${name} moved to section "${data.section}"`;
      case 'DEFINITION_LOOKUP': return `${name} looked up "${data.word}"`;
      case 'AI_QUERY': return `${name} asked: "${data.query.substring(0, 50)}..."`;
      case 'HELP_REQUEST': return `${name} needs help: ${data.description}`;
      case 'FEEDBACK_SUBMISSION': return `${name} submitted feedback`;
      case 'NOTE_CREATED': return `${name} created a note on page ${data.pageNumber}`;
      case 'QUIZ_ATTEMPT': return `${name} scored ${data.percentage}% on a quiz`;
      default: return `${name} performed ${eventType}`;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Real-Time Activity</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">{isConnected ? `${onlineCount} online` : 'Disconnected'}</span>
        </div>
      </div>

      {recentActivity.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentActivity.slice(0, 10).map((activity, index) => (
            <div key={`${activity.userId}-${activity.timestamp}-${index}`} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
              <span className="text-lg">{getActivityIcon(activity.eventType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{getActivityDescription(activity)}</p>
                <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};