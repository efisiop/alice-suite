// Local types to replace @alice-suite/api-client dependency
// This file contains the essential types needed by the consultantService

// ID Types
export type UserId = string
export type BookId = string
export type ChapterId = string
export type SectionId = string
export type ProfileId = string
export type DictionaryId = string
export type ReadingProgressId = string
export type ReadingStatsId = string
export type HelpRequestId = string
export type FeedbackId = string
export type ConsultantTriggerId = string
export type ConsultantActionId = string

// Profile type
export interface UserProfile {
  id: ProfileId
  first_name: string
  last_name: string
  email: string
  is_consultant: boolean
  created_at: string
  updated_at: string
}

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