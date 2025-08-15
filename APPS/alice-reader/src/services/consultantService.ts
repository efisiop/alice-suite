import { appLog } from '../components/LogViewer';
import { registry } from './serviceRegistry';
import { BOOK_IDS } from '../constants/app';
import { handleServiceError, AppError, ErrorCode } from '../utils/errorHandling';
import { getLocalSupabaseClient } from './localSupabaseClient';

// Local types to replace @alice-suite/api-client dependency
export type UserId = string;
export type BookId = string;
export type ChapterId = string;
export type SectionId = string;
export type ProfileId = string;

export interface UserProfile {
  id: ProfileId;
  first_name: string;
  last_name: string;
  email: string;
  is_consultant: boolean;
  created_at: string;
  updated_at: string;
}

export interface HelpRequest {
  id: string;
  user_id: string;
  book_id: string;
  section_id: string | null;
  status: string;
  content: string;
  context: string | null;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFeedback {
  id: string;
  user_id: string;
  book_id: string;
  section_id: string | null;
  feedback_type: string;
  content: string;
  is_public: boolean;
  created_at: string;
}

export interface ConsultantTrigger {
  id: string;
  consultant_id: string | null;
  user_id: string;
  book_id: string;
  trigger_type: string;
  message: string | null;
  is_processed: boolean;
  processed_at: string | null;
  created_at: string;
}

export interface ConsultantAction {
  id: string;
  consultant_id: string;
  user_id: string;
  action_type: string;
  details: any | null;
  created_at: string;
}

export enum FeedbackType {
  AHA_MOMENT = 'AHA_MOMENT',
  POSITIVE_EXPERIENCE = 'POSITIVE_EXPERIENCE',
  SUGGESTION = 'SUGGESTION',
  CONFUSION = 'CONFUSION',
  GENERAL = 'GENERAL'
}

export enum HelpRequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export enum TriggerType {
  ENGAGEMENT = 'ENGAGEMENT',
  CHECK_IN = 'CHECK_IN',
  QUIZ = 'QUIZ',
  ENCOURAGE = 'ENCOURAGE'
}

const SERVICE_NAME = 'ConsultantService';

export interface ReaderProfile extends UserProfile {
  book_verified: boolean;
  is_verified: boolean;
  updated_at: string;
}

export interface ReadingProgress {
  chapter: number;
  page: number;
  last_read_at: string | null;
  time_spent_minutes: number;
}

export interface ReaderInteraction {
  id: string;
  user_id: string;
  event_type: string;
  book_id?: string;
  section_id?: string;
  page_number?: number;
  content?: string;
  context?: any;
  created_at: string;
}

export interface ReaderActivity {
  id: string;
  type: 'help_request' | 'feedback' | 'chapter_complete';
  chapter?: number;
  page?: number;
  message?: string;
  created_at: string;
}

export interface ReaderDetails {
  profile: ReaderProfile;
  progress: any;
  stats: any;
  activity: {
    interactions: any[];
    feedback: any[];
    helpRequests: any[];
    consultantActions: any[];
  };
}

export interface ConsultantServiceInterface {
  checkIsConsultant: () => Promise<boolean>;
  getVerifiedReaders: () => Promise<ReaderProfile[]>;
  getUserReadingDetails: (userId: string, bookId?: string) => Promise<ReaderDetails>;
  getPendingHelpRequests: (bookId?: string) => Promise<HelpRequest[]>;
  getAssignedHelpRequests: (consultantId: string, bookId?: string) => Promise<HelpRequest[]>;
  updateHelpRequestStatus: (requestId: string, status: HelpRequestStatus, consultantId?: string) => Promise<HelpRequest>;
  getAllFeedback: (bookId?: string) => Promise<UserFeedback[]>;
  getPublicFeedback: (bookId?: string) => Promise<UserFeedback[]>;
  createConsultantTrigger: (userId: string, bookId: string, triggerType: TriggerType, message?: string) => Promise<string | null>;
  getUserTriggers: (userId: string) => Promise<ConsultantTrigger[]>;
  markTriggerProcessed: (triggerId: string) => Promise<boolean>;
  logConsultantAction: (userId: string, actionType: string, details?: any) => Promise<string | null>;
  submitFeedback: (userId: string, bookId: string, feedbackType: FeedbackType, content: string, sectionId?: string, isPublic?: boolean) => Promise<UserFeedback | null>;
  submitHelpRequest: (userId: string, bookId: string, content: string, sectionId?: string, context?: string) => Promise<HelpRequest | null>;
  getUserHelpRequests: (userId: string, bookId?: string) => Promise<HelpRequest[]>;
  getUserFeedback: (userId: string, bookId?: string) => Promise<UserFeedback[]>;
  getConsultantAssignments: () => Promise<any[]>;
  getConsultantStats: () => Promise<any>;
  getHelpRequests: (statusFilter?: string) => Promise<HelpRequest[]>;
  getReaderInteractions: (userId?: string, eventType?: string) => Promise<ReaderInteraction[]>;
}

const createConsultantService = async (): Promise<ConsultantServiceInterface> => {
  appLog(SERVICE_NAME, 'Creating consultant service', 'info');

  const supabase = getLocalSupabaseClient();

  const consultantService: ConsultantServiceInterface = {
checkIsConsultant: async (): Promise<boolean> => {
  try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_consultant')
          .eq('id', user.id)
          .single();

        return profile?.is_consultant || false;
      } catch (error) {
        handleServiceError(error, 'Failed to check consultant status', SERVICE_NAME);
      return false;
  }
},

getVerifiedReaders: async (): Promise<ReaderProfile[]> => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_verified', true);

    if (error) {
      throw error;
    }

        appLog(SERVICE_NAME, `Found ${profiles?.length || 0} verified readers`, 'success');
        return (profiles || []).map(profile => ({
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      created_at: profile.created_at,
      book_verified: Boolean(profile.book_verified),
      is_verified: Boolean(profile.is_verified),
      is_consultant: Boolean(profile.is_consultant),
      updated_at: profile.updated_at || profile.created_at
    })) as ReaderProfile[];
  } catch (error) {
    handleServiceError(error, 'Failed to fetch verified readers', SERVICE_NAME);
    return [];
  }
},

    getUserReadingDetails: async (userId: string, bookId: string = BOOK_IDS.ALICE): Promise<ReaderDetails> => {
  try {
    appLog(SERVICE_NAME, 'Getting user reading details', 'info', { userId, bookId });

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw handleServiceError(profileError, 'Failed to fetch user profile', SERVICE_NAME);
    }

        const { data: progress } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();

        const { data: stats } = await supabase
      .from('reading_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();

        const { data: interactions } = await supabase
      .from('interactions')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });

        const { data: feedback } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });

        const { data: helpRequests } = await supabase
      .from('help_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });

        const { data: consultantActions } = await supabase
          .from('consultant_actions_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return {
      profile: {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
            is_consultant: profile.is_consultant,
        created_at: profile.created_at,
            updated_at: profile.updated_at,
        book_verified: Boolean(profile.book_verified),
            is_verified: Boolean(profile.is_verified)
      },
          progress: progress || null,
          stats: stats || null,
      activity: {
        interactions: interactions || [],
        feedback: feedback || [],
        helpRequests: helpRequests || [],
        consultantActions: consultantActions || []
      }
    };
  } catch (error) {
        handleServiceError(error, 'Failed to get user reading details', SERVICE_NAME);
        throw error;
  }
},

    getPendingHelpRequests: async (bookId: string = BOOK_IDS.ALICE): Promise<HelpRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
          .select('*')
      .eq('book_id', bookId)
          .eq('status', 'PENDING')
          .order('created_at', { ascending: false });

        if (error) throw error;
    return data || [];
  } catch (error) {
        handleServiceError(error, 'Failed to fetch pending help requests', SERVICE_NAME);
        return [];
  }
},

    getAssignedHelpRequests: async (consultantId: string, bookId: string = BOOK_IDS.ALICE): Promise<HelpRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
          .select('*')
      .eq('book_id', bookId)
          .eq('assigned_to', consultantId)
          .order('created_at', { ascending: false });

        if (error) throw error;
    return data || [];
  } catch (error) {
        handleServiceError(error, 'Failed to fetch assigned help requests', SERVICE_NAME);
        return [];
  }
},

    updateHelpRequestStatus: async (requestId: string, status: HelpRequestStatus, consultantId?: string): Promise<HelpRequest> => {
  try {
        const updates: any = { status };
        if (consultantId) updates.assigned_to = consultantId;
        if (status === 'RESOLVED') updates.resolved_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('help_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

        if (error) throw error;
    return data;
  } catch (error) {
        handleServiceError(error, 'Failed to update help request status', SERVICE_NAME);
        throw error;
  }
},

getAllFeedback: async (bookId: string = BOOK_IDS.ALICE): Promise<UserFeedback[]> => {
  try {
    const { data, error } = await supabase
      .from('user_feedback')
          .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        handleServiceError(error, 'Failed to fetch all feedback', SERVICE_NAME);
      return [];
  }
},

getPublicFeedback: async (bookId: string = BOOK_IDS.ALICE): Promise<UserFeedback[]> => {
  try {
    const { data, error } = await supabase
      .from('user_feedback')
          .select('*')
      .eq('book_id', bookId)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        handleServiceError(error, 'Failed to fetch public feedback', SERVICE_NAME);
      return [];
    }
    },

    createConsultantTrigger: async (userId: string, bookId: string = BOOK_IDS.ALICE, triggerType: TriggerType, message?: string): Promise<string | null> => {
  try {
        const { data, error } = await supabase
          .from('consultant_triggers')
          .insert({
            user_id: userId,
            book_id: bookId,
            trigger_type: triggerType,
            message: message || null
          })
          .select()
          .single();

        if (error) throw error;
        return data?.id || null;
      } catch (error) {
        handleServiceError(error, 'Failed to create consultant trigger', SERVICE_NAME);
      return null;
  }
},

getUserTriggers: async (userId: string): Promise<ConsultantTrigger[]> => {
  try {
    const { data, error } = await supabase
      .from('consultant_triggers')
          .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        handleServiceError(error, 'Failed to fetch user triggers', SERVICE_NAME);
      return [];
  }
},

markTriggerProcessed: async (triggerId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('consultant_triggers')
      .update({
        is_processed: true,
        processed_at: new Date().toISOString()
      })
      .eq('id', triggerId);

        if (error) throw error;
    return true;
  } catch (error) {
        handleServiceError(error, 'Failed to mark trigger as processed', SERVICE_NAME);
        return false;
  }
},

    logConsultantAction: async (userId: string, actionType: string, details?: any): Promise<string | null> => {
  try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
          .from('consultant_actions_log')
          .insert({
            consultant_id: user.id,
            user_id: userId,
            action_type: actionType,
            details: details || null
          })
          .select()
          .single();

        if (error) throw error;
        return data?.id || null;
      } catch (error) {
        handleServiceError(error, 'Failed to log consultant action', SERVICE_NAME);
      return null;
    }
    },

    submitFeedback: async (userId: string, bookId: string = BOOK_IDS.ALICE, feedbackType: FeedbackType, content: string, sectionId?: string, isPublic: boolean = false): Promise<UserFeedback | null> => {
  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: userId,
        book_id: bookId,
        section_id: sectionId || null,
        feedback_type: feedbackType,
        content,
        is_public: isPublic
      })
      .select()
      .single();

        if (error) throw error;
    return data;
  } catch (error) {
        handleServiceError(error, 'Failed to submit feedback', SERVICE_NAME);
        return null;
  }
},

    submitHelpRequest: async (userId: string, bookId: string = '550e8400-e29b-41d4-a716-446655440000', content: string, sectionId?: string, context?: string): Promise<HelpRequest | null> => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .insert({
        user_id: userId,
        book_id: bookId,
        section_id: sectionId || null,
        content,
            context: context || null,
            status: 'PENDING'
      })
      .select()
      .single();

        if (error) throw error;
    return data;
  } catch (error) {
        handleServiceError(error, 'Failed to submit help request', SERVICE_NAME);
        return null;
  }
},

    getUserHelpRequests: async (userId: string, bookId: string = BOOK_IDS.ALICE): Promise<HelpRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('help_requests')
          .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        handleServiceError(error, 'Failed to fetch user help requests', SERVICE_NAME);
      return [];
    }
},

    getUserFeedback: async (userId: string, bookId: string = BOOK_IDS.ALICE): Promise<UserFeedback[]> => {
  try {
    const { data, error } = await supabase
      .from('user_feedback')
          .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        handleServiceError(error, 'Failed to fetch user feedback', SERVICE_NAME);
      return [];
  }
},

getConsultantAssignments: async (): Promise<any[]> => {
  try {
    const { data: assignments, error: assignmentsError } = await supabase
      .from('consultant_assignments')
          .select('*')
      .eq('active', true);

        if (assignmentsError) throw assignmentsError;

    const { data: helpRequests, error: helpRequestsError } = await supabase
      .from('help_requests')
      .select('*')
          .eq('status', 'PENDING');

        if (helpRequestsError) throw helpRequestsError;

    const { data: feedback, error: feedbackError } = await supabase
      .from('user_feedback')
      .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(10);

        if (feedbackError) throw feedbackError;

    const { data: recentActions, error: actionsError } = await supabase
      .from('consultant_actions_log')
          .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

        if (actionsError) throw actionsError;

        return [
          { type: 'assignments', data: assignments || [] },
          { type: 'pending_requests', data: helpRequests || [] },
          { type: 'recent_feedback', data: feedback || [] },
          { type: 'recent_actions', data: recentActions || [] }
        ];
      } catch (error) {
        handleServiceError(error, 'Failed to fetch consultant assignments', SERVICE_NAME);
        return [];
      }
    },

    getConsultantStats: async (): Promise<any> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return {};

        const { data: assignments } = await supabase
          .from('consultant_assignments')
          .select('*')
          .eq('consultant_id', user.id)
          .eq('active', true);

        const { data: helpRequests } = await supabase
          .from('help_requests')
          .select('*')
          .eq('assigned_to', user.id);

        const { data: actions } = await supabase
          .from('consultant_actions_log')
          .select('*')
          .eq('consultant_id', user.id);

      return {
          activeAssignments: assignments?.length || 0,
          totalHelpRequests: helpRequests?.length || 0,
          pendingRequests: helpRequests?.filter(r => r.status === 'PENDING').length || 0,
          totalActions: actions?.length || 0
        };
  } catch (error) {
        handleServiceError(error, 'Failed to fetch consultant stats', SERVICE_NAME);
        return {};
  }
},

getHelpRequests: async (statusFilter?: string): Promise<HelpRequest[]> => {
  try {
    let query = supabase
      .from('help_requests')
          .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (error) {
        handleServiceError(error, 'Failed to fetch help requests', SERVICE_NAME);
      return [];
  }
},

getReaderInteractions: async (userId?: string, eventType?: string): Promise<ReaderInteraction[]> => {
  try {
    let query = supabase
      .from('interactions')
          .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (error) {
        handleServiceError(error, 'Failed to fetch reader interactions', SERVICE_NAME);
      return [];
    }
    }
  };

  appLog(SERVICE_NAME, 'Consultant service created successfully', 'success');
  return consultantService;
};

// Export the service creation function
export { createConsultantService };

// Export individual functions for backward compatibility
export async function checkIsConsultant(): Promise<boolean> {
  const service = await createConsultantService();
  return service.checkIsConsultant();
}

export async function getVerifiedReaders(): Promise<ReaderProfile[]> {
  const service = await createConsultantService();
  return service.getVerifiedReaders();
}

export async function getUserReadingDetails(userId: string, bookId: string = BOOK_IDS.ALICE) {
  const service = await createConsultantService();
  return service.getUserReadingDetails(userId, bookId);
}

export async function getPendingHelpRequests(bookId: string = BOOK_IDS.ALICE): Promise<HelpRequest[]> {
  const service = await createConsultantService();
  return service.getPendingHelpRequests(bookId);
}

export async function getAssignedHelpRequests(consultantId: string, bookId: string = BOOK_IDS.ALICE): Promise<HelpRequest[]> {
  const service = await createConsultantService();
  return service.getAssignedHelpRequests(consultantId, bookId);
}

export async function updateHelpRequestStatus(
  requestId: string,
  status: HelpRequestStatus,
  consultantId?: string
): Promise<HelpRequest> {
  const service = await createConsultantService();
  return service.updateHelpRequestStatus(requestId, status, consultantId);
}

export async function getAllFeedback(bookId: string = BOOK_IDS.ALICE): Promise<UserFeedback[]> {
  const service = await createConsultantService();
  return service.getAllFeedback(bookId);
}

export async function getPublicFeedback(bookId: string = BOOK_IDS.ALICE): Promise<UserFeedback[]> {
  const service = await createConsultantService();
  return service.getPublicFeedback(bookId);
}

export async function createConsultantTrigger(
  userId: string,
  bookId: string = BOOK_IDS.ALICE,
  triggerType: TriggerType,
  message?: string
): Promise<string | null> {
  const service = await createConsultantService();
  return service.createConsultantTrigger(userId, bookId, triggerType, message);
}

export async function getUserTriggers(userId: string): Promise<ConsultantTrigger[]> {
  const service = await createConsultantService();
  return service.getUserTriggers(userId);
}

export async function markTriggerProcessed(triggerId: string): Promise<boolean> {
  const service = await createConsultantService();
  return service.markTriggerProcessed(triggerId);
}

export async function logConsultantAction(
  userId: string,
  actionType: string,
  details?: any
): Promise<string | null> {
  const service = await createConsultantService();
  return service.logConsultantAction(userId, actionType, details);
}

export async function submitFeedback(
  userId: string,
  bookId: string = BOOK_IDS.ALICE,
  feedbackType: FeedbackType,
  content: string,
  sectionId?: string,
  isPublic: boolean = false
): Promise<UserFeedback | null> {
  const service = await createConsultantService();
  return service.submitFeedback(userId, bookId, feedbackType, content, sectionId, isPublic);
}

export async function submitHelpRequest(
  userId: string,
  bookId: string = BOOK_IDS.ALICE,
  content: string,
  sectionId?: string,
  context?: string
): Promise<HelpRequest | null> {
  const service = await createConsultantService();
  return service.submitHelpRequest(userId, bookId, content, sectionId, context);
}

export async function getUserHelpRequests(
  userId: string,
  bookId: string = BOOK_IDS.ALICE
): Promise<HelpRequest[]> {
  const service = await createConsultantService();
  return service.getUserHelpRequests(userId, bookId);
}

export async function getUserFeedback(
  userId: string,
  bookId: string = BOOK_IDS.ALICE
): Promise<UserFeedback[]> {
  const service = await createConsultantService();
  return service.getUserFeedback(userId, bookId);
}

export async function getConsultantAssignments(): Promise<any[]> {
  const service = await createConsultantService();
  return service.getConsultantAssignments();
}

export async function getConsultantStats() {
  const service = await createConsultantService();
  return service.getConsultantStats();
}

export async function getReaderInteractions(userId?: string, eventType?: string): Promise<ReaderInteraction[]> {
  const service = await createConsultantService();
  return service.getReaderInteractions(userId, eventType);
}
