// Re-export types from the shared package
// This file is now a compatibility layer that redirects to @alice-suite/api-client

export type {
  UserId,
  BookId,
  ChapterId,
  SectionId,
  ProfileId,
  DictionaryId,
  ReadingProgressId,
  ReadingStatsId,
  HelpRequestId,
  FeedbackId,
  ConsultantTriggerId,
  ConsultantActionId,
  UserProfile
} from '@alice-suite/api-client';

// Help Request types
export interface HelpRequest {
  id: string
  user_id: string
  book_id: string
  section_id: string | null
  status: string
  content: string
  context: string | null
  assigned_to: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

// User Feedback types
export interface UserFeedback {
  id: string
  user_id: string
  book_id: string
  section_id: string | null
  feedback_type: string
  content: string
  is_public: boolean
  created_at: string
}

// Consultant Trigger types
export interface ConsultantTrigger {
  id: string
  consultant_id: string | null
  user_id: string
  book_id: string
  trigger_type: string
  message: string | null
  is_processed: boolean
  processed_at: string | null
  created_at: string
}

// Consultant Action types
export interface ConsultantAction {
  id: string
  consultant_id: string
  user_id: string
  action_type: string
  details: any | null
  created_at: string
}

// Enums
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