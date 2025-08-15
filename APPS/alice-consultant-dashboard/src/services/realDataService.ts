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
import { getSupabaseClient } from '@alice-suite/api-client';

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
      const supabase = getSupabaseClient();

      // Get consultant assignments
      const { data: assignments, error: assignmentError } = await supabase
        .from('consultant_assignments')
        .select('user_id, active')
        .eq('consultant_id', consultantId)
        .eq('active', true);

      if (assignmentError) {
        appLog('RealDataService', `Assignment error: ${assignmentError.message}`, 'error');
        throw new AppError('Failed to fetch assignments', ErrorCode.DATA_ERROR, assignmentError);
      }

      if (!assignments || assignments.length === 0) {
        appLog('RealDataService', 'No assignments found for consultant', 'info');
        return [];
      }

      const userIds = assignments.map(a => a.user_id);

      // Get reader profiles separately
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)
        .eq('is_consultant', false);

      if (profileError) {
        appLog('RealDataService', `Profile error: ${profileError.message}`, 'error');
        throw new AppError('Failed to fetch reader profiles', ErrorCode.DATA_ERROR, profileError);
      }

      // Transform the data to match ReaderProfile interface
      const readers = (profiles || []).map(profile => ({
        id: profile.id,
        first_name: profile.first_name || 'Unknown',
        last_name: profile.last_name || 'User',
        email: profile.email || 'unknown@example.com',
        is_consultant: profile.is_consultant || false,
        book_verified: profile.book_verified || false,
        is_verified: true,
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.updated_at || new Date().toISOString(),
        last_active_at: profile.updated_at || new Date().toISOString(), // Use updated_at as activity timestamp
        assigned_consultant: consultantId,
        status: this.getReaderStatus(profile.updated_at)
      } as ReaderProfile));

      appLog('RealDataService', `Found ${readers.length} assigned readers`, 'success');
      return readers;
    } catch (error) {
      handleServiceError('RealDataService', 'getAssignedReaders', error);
      throw error;
    }
  }

  // Helper method to determine reader status based on last activity
  private getReaderStatus(updatedAt: string | null): 'active' | 'inactive' {
    if (!updatedAt) return 'inactive';
    
    const lastUpdate = new Date(updatedAt);
    const now = new Date();
    const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    
    // Consider active if updated within last 30 minutes
    return minutesSinceUpdate <= 30 ? 'active' : 'inactive';
  }

  // Get all help requests for assigned readers
  async getHelpRequests(consultantId?: string): Promise<HelpRequest[]> {
    try {
      appLog('RealDataService', 'Fetching help requests for consultant:', consultantId);
      const supabase = getSupabaseClient();

      let query = supabase
        .from('help_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // If consultant ID is provided, filter by assigned readers
      if (consultantId) {
        const readers = await this.getAssignedReaders(consultantId);
        const readerIds = readers.map(r => r.id);

        if (readerIds.length === 0) {
          return [];
        }

        query = query.in('user_id', readerIds);
      }

      const { data: helpRequests, error } = await query;

      if (error) {
        appLog('RealDataService', `Help requests error: ${error.message}`, 'error');
        throw new AppError('Failed to fetch help requests', ErrorCode.DATA_ERROR, error);
      }

      // Enhance with user profile data
      if (helpRequests && helpRequests.length > 0) {
        const userIds = [...new Set(helpRequests.map(h => h.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);

        // Add profile data to help requests
        helpRequests.forEach(request => {
          const profile = profiles?.find(p => p.id === request.user_id);
          if (profile) {
            request.user_name = `${profile.first_name || 'Unknown'} ${profile.last_name || 'User'}`;
            request.user_email = profile.email || 'unknown@example.com';
          } else {
            request.user_name = 'Unknown User';
            request.user_email = 'unknown@example.com';
          }
        });
      }

      appLog('RealDataService', `Found ${helpRequests?.length || 0} help requests`, 'success');
      return helpRequests || [];
    } catch (error) {
      handleServiceError('RealDataService', 'getHelpRequests', error);
      throw error;
    }
  }

  // Get all feedback for assigned readers (with fallback for policy issues)
  async getFeedback(consultantId?: string): Promise<UserFeedback[]> {
    try {
      appLog('RealDataService', 'Fetching feedback for consultant:', consultantId);
      const supabase = getSupabaseClient();

      // Try to get feedback, but handle policy errors gracefully
      try {
        let query = supabase
          .from('user_feedback')
          .select('*')
          .order('created_at', { ascending: false });

        // If consultant ID is provided, filter by assigned readers
        if (consultantId) {
          const readers = await this.getAssignedReaders(consultantId);
          const readerIds = readers.map(r => r.id);

          if (readerIds.length === 0) {
            return [];
          }

          query = query.in('user_id', readerIds);
        }

        const { data: feedback, error } = await query;

        if (error) {
          if (error.message.includes('infinite recursion') || error.message.includes('policy')) {
            appLog('RealDataService', 'Policy recursion detected for feedback, returning empty array', 'warning');
            return [];
          }
          appLog('RealDataService', `Feedback error: ${error.message}`, 'error');
          throw new AppError('Failed to fetch feedback', ErrorCode.DATA_ERROR, error);
        }

        // Enhance with user profile data
        if (feedback && feedback.length > 0) {
          const userIds = [...new Set(feedback.map(f => f.user_id))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .in('id', userIds);

          // Add profile data to feedback
          feedback.forEach(item => {
            const profile = profiles?.find(p => p.id === item.user_id);
            if (profile) {
              item.user_name = `${profile.first_name || 'Unknown'} ${profile.last_name || 'User'}`;
              item.user_email = profile.email || 'unknown@example.com';
            } else {
              item.user_name = 'Unknown User';
              item.user_email = 'unknown@example.com';
            }
          });
        }

        appLog('RealDataService', `Found ${feedback?.length || 0} feedback items`, 'success');
        return feedback || [];
      } catch (policyError: any) {
        if (policyError.message && policyError.message.includes('infinite recursion')) {
          appLog('RealDataService', 'Policy recursion detected for feedback, returning empty array', 'warning');
          return [];
        }
        throw policyError;
      }
    } catch (error) {
      appLog('RealDataService', 'Fallback: returning empty feedback due to policy issues', 'warning');
      return [];
    }
  }

  // Get consultant triggers (temporarily disabled due to policy issues)
  async getTriggers(consultantId: string): Promise<ConsultantTrigger[]> {
    try {
      appLog('RealDataService', 'Fetching triggers for consultant (using fallback due to policy issue):', consultantId);
      
      // Temporarily return empty array due to database policy issue
      // TODO: Fix consultant_triggers table policies to prevent infinite recursion
      appLog('RealDataService', 'Returning empty triggers array due to policy issue', 'warning');
      return [];

      /* Original code causing infinite recursion:
      const supabase = getSupabaseClient();
      const { data: triggers, error } = await supabase
        .from('consultant_triggers')
        .select('*')
        .eq('consultant_id', consultantId)
        .order('created_at', { ascending: false });
      */
    } catch (error) {
      appLog('RealDataService', 'Error in getTriggers (using fallback)', 'warning');
      return [];
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
      ] = await Promise.allSettled([
        this.getAssignedReaders(consultantId),
        this.getHelpRequests(consultantId),
        this.getFeedback(consultantId),
        this.getTriggers(consultantId)
      ]);

      // Handle policy errors gracefully
      const actualReaders = readers.status === 'fulfilled' ? readers.value : [];
      const actualHelpRequests = helpRequests.status === 'fulfilled' ? helpRequests.value : [];
      const actualFeedback = feedback.status === 'fulfilled' ? feedback.value : [];
      const actualTriggers = triggers.status === 'fulfilled' ? triggers.value : [];

      // Get interactions with policy error handling
      let interactions: ReaderInteraction[] = [];
      try {
        interactions = await this.getReaderInteractions(consultantId);
      } catch (error) {
        appLog('RealDataService', 'Failed to fetch interactions, using empty array', 'warning');
      }

      const analytics = {
        totalReaders: actualReaders.length,
        activeReaders: actualReaders.filter(r => r.status === 'active').length,
        pendingHelpRequests: actualHelpRequests.filter(h => h.status === 'PENDING').length,
        recentFeedback: actualFeedback.filter(f => {
          const createdDate = new Date(f.created_at);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return createdDate >= sevenDaysAgo;
        }).length
      };


      return {
        readers: actualReaders,
        helpRequests: actualHelpRequests,
        feedback: actualFeedback,
        triggers: actualTriggers,
        interactions,
        analytics
      };
    } catch (error) {
      handleServiceError('RealDataService', 'getDashboardData', error);
      throw error;
    }
  }

  // Get reader interactions
  async getReaderInteractions(consultantId?: string, eventType?: string): Promise<ReaderInteraction[]> {
    try {
      appLog('RealDataService', 'Fetching reader interactions');
      const supabase = getSupabaseClient();

      let query = supabase
        .from('interactions')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by event type if provided
      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      // If consultant ID is provided, filter by assigned readers
      if (consultantId) {
        const readers = await this.getAssignedReaders(consultantId);
        const readerIds = readers.map(r => r.id);

        if (readerIds.length === 0) {
          return [];
        }

        query = query.in('user_id', readerIds);
      }

      const { data: interactions, error } = await query;

      if (error) {
        appLog('RealDataService', `Interactions error: ${error.message}`, 'error');
        if (error.message.includes('infinite recursion') || error.message.includes('policy')) {
          appLog('RealDataService', 'Policy recursion detected for interactions, returning empty array', 'warning');
          return [];
        }
        throw new AppError('Failed to fetch interactions', ErrorCode.DATA_ERROR, error);
      }

      // Enhance with user profile data and transform to match interface
      let transformedInteractions: ReaderInteraction[] = [];
      
      if (interactions && interactions.length > 0) {
        const userIds = [...new Set(interactions.map(i => i.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);

        transformedInteractions = interactions.map(interaction => {
          const profile = profiles?.find(p => p.id === interaction.user_id);
          return {
            id: interaction.id,
            user_id: interaction.user_id,
            book_id: interaction.book_id,
            interaction_type: interaction.event_type,
            metadata: interaction.content ? { content: interaction.content } : {},
            created_at: interaction.created_at,
            user_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown User',
            user_email: profile?.email || 'Unknown Email'
          };
        });
      }

      appLog('RealDataService', `Found ${transformedInteractions.length} interactions`, 'success');
      return transformedInteractions;
    } catch (error) {
      if (error instanceof Error && error.message.includes('infinite recursion')) {
        appLog('RealDataService', 'Policy recursion detected for interactions, returning empty array', 'warning');
        return [];
      }
      handleServiceError('RealDataService', 'getReaderInteractions', error);
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
      const supabase = getSupabaseClient();

      // Simple update for now - can add RPC later if needed
      const { data, error } = await supabase
        .from('help_requests')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        appLog('RealDataService', `Help request update error: ${error.message}`, 'error');
        throw new AppError('Failed to update help request', ErrorCode.DATA_ERROR, error);
      }

      appLog('RealDataService', 'Help request status updated successfully', 'success');
      return true;
    } catch (error) {
      handleServiceError('RealDataService', 'updateHelpRequestStatus', error);
      throw error;
    }
  }

  // Create a consultant trigger
  async createTrigger(trigger: Omit<ConsultantTrigger, 'id' | 'created_at'>): Promise<ConsultantTrigger> {
    try {
      appLog('RealDataService', 'Creating trigger:', trigger);
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('consultant_triggers')
        .insert({
          ...trigger,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        appLog('RealDataService', `Trigger creation error: ${error.message}`, 'error');
        throw new AppError('Failed to create trigger', ErrorCode.DATA_ERROR, error);
      }

      appLog('RealDataService', 'Trigger created successfully', 'success');
      return data;
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
  ): Promise<ConsultantAction | null> {
    try {
      appLog('RealDataService', 'Logging consultant action:', { consultantId, userId, actionType });
      const supabase = getSupabaseClient();

      // For now, just log to console since we don't have consultant_actions_log table
      appLog('RealDataService', `Consultant ${consultantId} performed ${actionType} on user ${userId}`, 'info');
      console.log('Consultant Action:', { consultantId, userId, actionType, details });

      // Return a mock action for now
      return {
        id: Date.now().toString(),
        consultant_id: consultantId,
        user_id: userId,
        action_type: actionType,
        details: details || null,
        created_at: new Date().toISOString()
      } as ConsultantAction;
    } catch (error) {
      handleServiceError('RealDataService', 'logConsultantAction', error);
      return null;
    }
  }

  // Additional utility methods for dashboard features
  
  // Toggle feedback public status
  async toggleFeedbackPublic(feedbackId: string, isPublic: boolean): Promise<boolean> {
    try {
      appLog('RealDataService', 'Toggling feedback public status:', { feedbackId, isPublic });
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('user_feedback')
        .update({ 
          is_public: isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', feedbackId);

      if (error) {
        appLog('RealDataService', `Feedback update error: ${error.message}`, 'error');
        throw new AppError('Failed to update feedback', ErrorCode.DATA_ERROR, error);
      }

      appLog('RealDataService', 'Feedback public status updated successfully', 'success');
      return true;
    } catch (error) {
      handleServiceError('RealDataService', 'toggleFeedbackPublic', error);
      throw error;
    }
  }

  // Add response to help request
  async addHelpRequestResponse(requestId: string, response: string, consultantId: string): Promise<boolean> {
    try {
      appLog('RealDataService', 'Adding help request response:', { requestId, consultantId });
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('help_requests')
        .update({ 
          status: 'ASSIGNED',
          response: response,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        appLog('RealDataService', `Help request response error: ${error.message}`, 'error');
        throw new AppError('Failed to add response', ErrorCode.DATA_ERROR, error);
      }

      // Log the consultant action
      await this.logConsultantAction(consultantId, requestId, 'HELP_REQUEST_RESPONSE', { response });

      appLog('RealDataService', 'Help request response added successfully', 'success');
      return true;
    } catch (error) {
      handleServiceError('RealDataService', 'addHelpRequestResponse', error);
      throw error;
    }
  }
}