import { 
  HelpRequest, 
  HelpRequestStatus, 
  UserFeedback,
  ConsultantTrigger,
  TriggerType,
  FeedbackType,
  UserProfile,
  ConsultantAction
} from '@alice-suite/api-client';
import { appLog } from '../components/LogViewer';
import { handleServiceError, AppError, ErrorCode } from '../utils/errorHandling';
import { dbClient, authClient } from '@alice-suite/api-client';

export interface ReaderProfile extends UserProfile {
  book_verified: boolean;
  is_verified: boolean;
  updated_at: string;
  assigned_consultant?: string;
}

export interface ReaderInteraction {
  id: string;
  user_id: string;
  book_id: string;
  interaction_type: string;
  metadata: any;
  created_at: string;
}

export interface ConsultantDashboardData {
  readers: ReaderProfile[];
  helpRequests: HelpRequest[];
  feedback: UserFeedback[];
  triggers: ConsultantTrigger[];
  interactions: ReaderInteraction[];
  analytics: {
    totalReaders: number;
    activeReaders: number;
    pendingHelpRequests: number;
    recentFeedback: number;
  };
}

export class RealDataService {
  private static instance: RealDataService;

  static getInstance(): RealDataService {
    if (!RealDataService.instance) {
      RealDataService.instance = new RealDataService();
    }
    return RealDataService.instance;
  }

  constructor() {
    appLog('RealDataService', 'Initialized real data service');
  }

  // Get all readers assigned to the current consultant
  async getAssignedReaders(consultantId: string): Promise<ReaderProfile[]> {
    try {
      appLog('RealDataService', 'Fetching assigned readers for consultant:', consultantId);

      // Get consultant assignments
      const { data: assignments, error: assignmentError } = await dbClient.supabase
        .from('consultant_assignments')
        .select('user_id')
        .eq('consultant_id', consultantId)
        .eq('active', true);

      if (assignmentError) {
        throw new AppError('Failed to fetch assignments', ErrorCode.DATABASE_ERROR, assignmentError);
      }

      if (!assignments || assignments.length === 0) {
        return [];
      }

      const userIds = assignments.map(a => a.user_id);

      // Get reader profiles
      const { data: profiles, error: profileError } = await dbClient.supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)
        .eq('is_consultant', false);

      if (profileError) {
        throw new AppError('Failed to fetch reader profiles', ErrorCode.DATABASE_ERROR, profileError);
      }

      return profiles.map(profile => ({
        ...profile,
        book_verified: false,
        is_verified: true,
        updated_at: profile.updated_at || new Date().toISOString(),
      }));
    } catch (error) {
      handleServiceError('RealDataService', 'getAssignedReaders', error);
      throw error;
    }
  }

  // Get all help requests for assigned readers
  async getHelpRequests(consultantId: string): Promise<HelpRequest[]> {
    try {
      appLog('RealDataService', 'Fetching help requests for consultant:', consultantId);

      const readers = await this.getAssignedReaders(consultantId);
      const readerIds = readers.map(r => r.id);

      if (readerIds.length === 0) {
        return [];
      }

      const { data: helpRequests, error } = await dbClient.supabase
        .from('help_requests')
        .select('*, profiles!inner(*)')
        .in('user_id', readerIds)
        .order('created_at', { ascending: false });

      if (error) {
        throw new AppError('Failed to fetch help requests', ErrorCode.DATABASE_ERROR, error);
      }

      return helpRequests || [];
    } catch (error) {
      handleServiceError('RealDataService', 'getHelpRequests', error);
      throw error;
    }
  }

  // Get all feedback for assigned readers
  async getFeedback(consultantId: string): Promise<UserFeedback[]> {
    try {
      appLog('RealDataService', 'Fetching feedback for consultant:', consultantId);

      const readers = await this.getAssignedReaders(consultantId);
      const readerIds = readers.map(r => r.id);

      if (readerIds.length === 0) {
        return [];
      }

      const { data: feedback, error } = await dbClient.supabase
        .from('user_feedback')
        .select('*, profiles!inner(*)')
        .in('user_id', readerIds)
        .order('created_at', { ascending: false });

      if (error) {
        throw new AppError('Failed to fetch feedback', ErrorCode.DATABASE_ERROR, error);
      }

      return feedback || [];
    } catch (error) {
      handleServiceError('RealDataService', 'getFeedback', error);
      throw error;
    }
  }

  // Get consultant triggers
  async getTriggers(consultantId: string): Promise<ConsultantTrigger[]> {
    try {
      appLog('RealDataService', 'Fetching triggers for consultant:', consultantId);

      const { data: triggers, error } = await dbClient.supabase
        .from('consultant_triggers')
        .select('*, profiles!inner(*)')
        .eq('consultant_id', consultantId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new AppError('Failed to fetch triggers', ErrorCode.DATABASE_ERROR, error);
      }

      return triggers || [];
    } catch (error) {
      handleServiceError('RealDataService', 'getTriggers', error);
      throw error;
    }
  }

  // Get all dashboard data for a consultant
  async getDashboardData(consultantId: string): Promise<ConsultantDashboardData> {
    try {
      appLog('RealDataService', 'Fetching dashboard data for consultant:', consultantId);

      const [
        readers,
        helpRequests,
        feedback,
        triggers
      ] = await Promise.all([
        this.getAssignedReaders(consultantId),
        this.getHelpRequests(consultantId),
        this.getFeedback(consultantId),
        this.getTriggers(consultantId)
      ]);

      const analytics = {
        totalReaders: readers.length,
        activeReaders: readers.filter(r => r.status === 'active').length,
        pendingHelpRequests: helpRequests.filter(h => h.status === 'PENDING').length,
        recentFeedback: feedback.filter(f => {
          const createdDate = new Date(f.created_at);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return createdDate >= sevenDaysAgo;
        }).length
      };

      return {
        readers,
        helpRequests,
        feedback,
        triggers,
        interactions: [], // TODO: Implement reader interactions
        analytics
      };
    } catch (error) {
      handleServiceError('RealDataService', 'getDashboardData', error);
      throw error;
    }
  }

  // Update help request status
  async updateHelpRequestStatus(
    requestId: string, 
    status: HelpRequestStatus, 
    consultantId: string,
    assignToSelf: boolean = false
  ): Promise<boolean> {
    try {
      appLog('RealDataService', 'Updating help request status:', { requestId, status, consultantId });

      const { data, error } = await dbClient.supabase
        .rpc('update_help_request_status', {
          p_request_id: requestId,
          p_status: status,
          p_assign_to_self: assignToSelf
        });

      if (error) {
        throw new AppError('Failed to update help request', ErrorCode.DATABASE_ERROR, error);
      }

      return data || false;
    } catch (error) {
      handleServiceError('RealDataService', 'updateHelpRequestStatus', error);
      throw error;
    }
  }

  // Create a consultant trigger
  async createTrigger(trigger: Omit<ConsultantTrigger, 'id' | 'created_at'>): Promise<ConsultantTrigger> {
    try {
      appLog('RealDataService', 'Creating trigger:', trigger);

      const { data, error } = await dbClient.supabase
        .rpc('create_consultant_trigger', {
          p_user_id: trigger.user_id,
          p_book_id: trigger.book_id,
          p_trigger_type: trigger.trigger_type,
          p_message: trigger.message
        });

      if (error) {
        throw new AppError('Failed to create trigger', ErrorCode.DATABASE_ERROR, error);
      }

      const { data: createdTrigger } = await dbClient.supabase
        .from('consultant_triggers')
        .select('*')
        .eq('id', data)
        .single();

      if (!createdTrigger) {
        throw new AppError('Failed to fetch created trigger', ErrorCode.DATABASE_ERROR);
      }

      return createdTrigger;
    } catch (error) {
      handleServiceError('RealDataService', 'createTrigger', error);
      throw error;
    }
  }

  // Log consultant action
  async logConsultantAction(
    consultantId: string,
    userId: string,
    actionType: string,
    details?: any
  ): Promise<ConsultantAction> {
    try {
      appLog('RealDataService', 'Logging consultant action:', { consultantId, userId, actionType });

      const { data, error } = await dbClient.supabase
        .rpc('log_consultant_action', {
          p_user_id: userId,
          p_action_type: actionType,
          p_details: details || null
        });

      if (error) {
        throw new AppError('Failed to log consultant action', ErrorCode.DATABASE_ERROR, error);
      }

      const { data: createdAction } = await dbClient.supabase
        .from('consultant_actions_log')
        .select('*')
        .eq('id', data)
        .single();

      if (!createdAction) {
        throw new AppError('Failed to fetch created action', ErrorCode.DATABASE_ERROR);
      }

      return createdAction;
    } catch (error) {
      handleServiceError('RealDataService', 'logConsultantAction', error);
      throw error;
    }
  }
}