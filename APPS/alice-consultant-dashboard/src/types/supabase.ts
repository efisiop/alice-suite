// Re-export database types from the shared package
// This file is now a compatibility layer that redirects to @alice-suite/api-client

export type {
  Database,
  Json,
  Profile,
  Book,
  Chapter,
  Section,
  ReadingProgress,
  ReadingStats,
  AiInteraction,
  AiPrompt,
  ConsultantTrigger,
  ConsultantUser,
  UserFeedback,
  HelpRequest,
  ConsultantAction,
  BookWithChapters,
  SectionWithChapter,
  BookProgress,
  BookStats,
  UserProfile,
  UserFeedbackWithRelations,
  HelpRequestWithRelations,
  FeedbackType,
  HelpRequestStatus,
  TriggerType
} from '@alice-suite/api-client';
