// Main exports for @alice-suite/api-client package

// Supabase client
export { 
  supabase, 
  validateSupabaseConfig, 
  initializeSupabase,
  createSupabaseClient,
  getSupabaseClient
} from './utils/supabase'
export type { SupabaseClient } from './utils/supabase'

// Authentication
export { authClient } from './auth/auth-client'
export type { 
  AuthUser, 
  AuthError, 
  AuthSession, 
  SignInCredentials, 
  SignUpCredentials,
  AuthStateChangeEvent 
} from './types/auth'

// Database client
export { dbClient } from './database/database-client'

// Database types
export type { 
  Database,
  Profile, 
  Book, 
  Chapter, 
  Section, 
  ReadingProgress, 
  ReadingStats,
  BookWithChapters,
  SectionWithChapter,
  BookProgress,
  BookStats,
  UserFeedback,
  HelpRequest,
  ConsultantTrigger,
  ConsultantAction,
  UserFeedbackWithRelations,
  HelpRequestWithRelations
} from './types/database'

// ID types and utilities
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
  EntityId
} from './utils/id-utils'

export {
  // ID utility functions
  isUuid,
  asUserId,
  asBookId,
  asChapterId,
  asSectionId,
  asProfileId,
  asDictionaryId,
  asReadingProgressId,
  asReadingStatsId,
  asHelpRequestId,
  asFeedbackId,
  asConsultantTriggerId,
  asConsultantActionId,
  getBookUuid,
  getBookStringId,
  validateUuid,
  generateUuid,
  // Constants
  ALICE_BOOK_ID_STRING,
  ALICE_BOOK_ID_UUID
} from './utils/id-utils'

// Enums (runtime exports)
export { 
  FeedbackType,
  HelpRequestStatus,
  TriggerType
} from './types/database' 