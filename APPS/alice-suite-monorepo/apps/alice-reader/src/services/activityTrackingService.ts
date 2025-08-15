import { getSupabaseClient } from './supabaseClient';
import { appLog } from '../components/LogViewer';

export interface ActivityEvent {
  user_id: string;
  event_type: 'LOGIN' | 'LOGOUT' | 'PAGE_SYNC' | 'SECTION_SYNC' | 'DEFINITION_LOOKUP' | 'AI_QUERY' | 'HELP_REQUEST' | 'FEEDBACK_SUBMISSION';
  book_id?: string;
  section_id?: string;
  page_number?: number;
  content?: string;
  context?: any;
}

export class ActivityTrackingService {
  private static instance: ActivityTrackingService;
  private isInitialized = false;

  static getInstance(): ActivityTrackingService {
    if (!ActivityTrackingService.instance) {
      ActivityTrackingService.instance = new ActivityTrackingService();
    }
    return ActivityTrackingService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Ensure the interactions table exists
      await this.ensureTableExists();
      this.isInitialized = true;
      appLog('ActivityTrackingService', 'Activity tracking service initialized successfully', 'info');
    } catch (error) {
      appLog('ActivityTrackingService', 'Failed to initialize activity tracking service', 'error', error);
    }
  }

  private async ensureTableExists() {
    // The table should already exist from migrations, but we'll add a safety check
    const supabase = await getSupabaseClient();
    const { error } = await supabase.rpc('check_table_exists', { table_name: 'interactions' });
    if (error) {
      appLog('ActivityTrackingService', 'Interactions table check failed, table may not exist', 'warning', error);
    }
  }

  async trackEvent(event: ActivityEvent): Promise<boolean> {
    try {
      await this.initialize();
      const supabase = await getSupabaseClient();

      const { error } = await supabase
        .from('interactions')
        .insert({
          user_id: event.user_id,
          event_type: event.event_type,
          book_id: event.book_id || null,
          section_id: event.section_id || null,
          page_number: event.page_number || null,
          content: event.content || null,
          context: event.context || null,
          created_at: new Date().toISOString()
        });

      if (error) {
        appLog('ActivityTrackingService', 'Failed to track event', 'error', error);
        return false;
      }

      appLog('ActivityTrackingService', `Event tracked successfully: ${event.event_type}`, 'info');
      return true;
    } catch (error) {
      appLog('ActivityTrackingService', 'Error tracking event', 'error', error);
      return false;
    }
  }

  async trackLogin(userId: string): Promise<boolean> {
    return this.trackEvent({
      user_id: userId,
      event_type: 'LOGIN'
    });
  }

  async trackLogout(userId: string): Promise<boolean> {
    return this.trackEvent({
      user_id: userId,
      event_type: 'LOGOUT'
    });
  }

  async trackPageSync(userId: string, bookId: string, pageNumber: number): Promise<boolean> {
    return this.trackEvent({
      user_id: userId,
      event_type: 'PAGE_SYNC',
      book_id: bookId,
      page_number: pageNumber
    });
  }

  async trackAIQuery(userId: string, bookId: string, question: string, response: string): Promise<boolean> {
    return this.trackEvent({
      user_id: userId,
      event_type: 'AI_QUERY',
      book_id: bookId,
      content: question,
      context: { response }
    });
  }

  async trackHelpRequest(userId: string, bookId: string, content: string): Promise<boolean> {
    return this.trackEvent({
      user_id: userId,
      event_type: 'HELP_REQUEST',
      book_id: bookId,
      content
    });
  }

  async trackFeedback(userId: string, bookId: string, content: string, feedbackType: string): Promise<boolean> {
    return this.trackEvent({
      user_id: userId,
      event_type: 'FEEDBACK_SUBMISSION',
      book_id: bookId,
      content,
      context: { feedback_type: feedbackType }
    });
  }

  // Get recent activity for a user
  async getUserActivity(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        appLog('ActivityTrackingService', 'Failed to get user activity', 'error', error);
        return [];
      }

      return data || [];
    } catch (error) {
      appLog('ActivityTrackingService', 'Error getting user activity', 'error', error);
      return [];
    }
  }

  // Get all recent activity (for consultants)
  async getAllRecentActivity(limit: number = 100): Promise<any[]> {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('interactions')
        .select(`
          *,
          profiles:user_id(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        appLog('ActivityTrackingService', 'Failed to get all recent activity', 'error', error);
        return [];
      }

      return data || [];
    } catch (error) {
      appLog('ActivityTrackingService', 'Error getting all recent activity', 'error', error);
      return [];
    }
  }

  // Get currently logged in users (users with LOGIN events in the last 30 minutes)
  async getCurrentlyLoggedInUsers(): Promise<any[]> {
    try {
      const supabase = await getSupabaseClient();
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('interactions')
        .select(`
          user_id,
          created_at,
          profiles:user_id(first_name, last_name, email)
        `)
        .eq('event_type', 'LOGIN')
        .gte('created_at', thirtyMinutesAgo)
        .order('created_at', { ascending: false });

      if (error) {
        appLog('ActivityTrackingService', 'Failed to get currently logged in users', 'error', error);
        return [];
      }

      // Remove duplicates and get the most recent login for each user
      const uniqueUsers = new Map();
      data?.forEach((interaction: any) => {
        if (!uniqueUsers.has(interaction.user_id)) {
          uniqueUsers.set(interaction.user_id, {
            user_id: interaction.user_id,
            login_time: interaction.created_at,
            profile: interaction.profiles
          });
        }
      });

      return Array.from(uniqueUsers.values());
    } catch (error) {
      appLog('ActivityTrackingService', 'Error getting currently logged in users', 'error', error);
      return [];
    }
  }

  // Get activity statistics
  async getActivityStats(): Promise<any> {
    try {
      const supabase = await getSupabaseClient();
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Get daily stats
      const { data: dailyData, error: dailyError } = await supabase
        .from('interactions')
        .select('event_type, created_at')
        .gte('created_at', oneDayAgo);

      // Get weekly stats
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('interactions')
        .select('event_type, created_at')
        .gte('created_at', oneWeekAgo);

      if (dailyError || weeklyError) {
        appLog('ActivityTrackingService', 'Failed to get activity stats', 'error', { dailyError, weeklyError });
        return {};
      }

      const dailyStats = this.calculateEventStats(dailyData || []);
      const weeklyStats = this.calculateEventStats(weeklyData || []);

      return {
        daily: dailyStats,
        weekly: weeklyStats,
        total_daily_events: dailyData?.length || 0,
        total_weekly_events: weeklyData?.length || 0
      };
    } catch (error) {
      appLog('ActivityTrackingService', 'Error getting activity stats', 'error', error);
      return {};
    }
  }

  private calculateEventStats(data: any[]): any {
    const stats: any = {};
    data.forEach(item => {
      if (!stats[item.event_type]) {
        stats[item.event_type] = 0;
      }
      stats[item.event_type]++;
    });
    return stats;
  }
}

// Export singleton instance
export const activityTrackingService = ActivityTrackingService.getInstance(); 