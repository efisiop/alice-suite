// Re-export all ID types and utilities from the shared package
// This file is now a compatibility layer that redirects to @alice-suite/api-client

export type {
  EntityId,
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
  ConsultantActionId
} from '@alice-suite/api-client';

export {
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
  ALICE_BOOK_ID_STRING,
  ALICE_BOOK_ID_UUID
} from '@alice-suite/api-client';
