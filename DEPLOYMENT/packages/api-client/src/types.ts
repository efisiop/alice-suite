// Shared type definitions for Alice Suite API client

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isConsultant?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  coverUrl?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  totalPages?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReadingSession {
  id: string;
  userId: string;
  bookId: string;
  currentPage: number;
  totalPages: number;
  progress: number; // 0-100
  startTime: string;
  lastActivity: string;
  status: 'active' | 'paused' | 'completed';
  notes?: string[];
  bookmarks?: number[];
  highlights?: Highlight[];
}

export interface Highlight {
  id: string;
  userId: string;
  bookId: string;
  page: number;
  content: string;
  color: string;
  note?: string;
  createdAt: string;
}

export interface HelpRequest {
  id: string;
  userId: string;
  consultantId?: string;
  type: 'general' | 'technical' | 'content';
  description: string;
  context?: any;
  status: 'pending' | 'in_progress' | 'resolved';
  response?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  bookId: string;
  type: 'general' | 'content' | 'technical';
  content: string;
  rating?: number;
  createdAt: string;
}

export interface RealTimeEvent {
  type: string;
  userId: string;
  data: any;
  timestamp: string;
}

export interface AuthenticatedSocket {
  userId: string;
  role: 'reader' | 'consultant';
  socketId: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Real-time event types
export type AuthEventType = 'LOGIN' | 'LOGOUT' | 'SESSION_TIMEOUT';
export type ActivityEventType = 'PAGE_SYNC' | 'SECTION_SYNC' | 'DEFINITION_LOOKUP' | 'AI_QUERY';
export type SupportEventType = 'HELP_REQUEST' | 'FEEDBACK_SUBMISSION';

export interface AuthEvent {
  type: AuthEventType;
  userId: string;
  userEmail: string;
  userName?: string;
  timestamp: string;
  metadata?: {
    device?: string;
    browser?: string;
    ipAddress?: string;
    loginDuration?: number;
  };
}

export interface OnlineReader {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  lastActivity: Date;
  currentBook?: string;
  isActive: boolean;
}

// AI Interaction Types
export interface AIInteraction {
  id: string;
  userId: string;
  bookId: string;
  type: AIInteractionType;
  prompt: string;
  response: string;
  context?: AIInteractionContext;
  tokensUsed?: number;
  duration?: number;
  createdAt: string;
}

export type AIInteractionType =
  | 'vocabulary_lookup'
  | 'content_summary'
  | 'quiz_generation'
  | 'reading_assistance'
  | 'definition_explanation'
  | 'translation'
  | 'personalized_recommendation'
  | 'learning_analytics'
  | 'chat_assistance';

export interface AIInteractionContext {
  page?: number;
  section?: string;
  difficulty?: string;
  readingLevel?: string;
  previousInteractions?: string[];
  userPreferences?: UserPreferences;
}

export interface UserPreferences {
  readingLevel?: string;
  learningStyle?: string;
  interests?: string[];
  difficultyPreference?: 'easy' | 'medium' | 'hard';
  language?: string;
  goals?: string[];
}

export interface AIVocabularyLookup {
  word: string;
  definition: string;
  pronunciation?: string;
  examples: string[];
  synonyms: string[];
  antonyms?: string[];
  etymology?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  context?: string;
}

export interface AIQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  pageReference?: number;
  relatedConcepts?: string[];
}

export interface AIQuiz {
  id: string;
  bookId: string;
  userId: string;
  questions: AIQuizQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  totalQuestions: number;
  timeLimit?: number;
  createdAt: string;
  completedAt?: string;
  score?: number;
  feedback?: string;
}

export interface AIRecommendation {
  id: string;
  userId: string;
  bookId: string;
  type: 'next_book' | 'similar_book' | 'difficulty_adjustment' | 'genre_exploration';
  reason: string;
  confidence: number;
  metadata?: {
    readingLevel?: string;
    interests?: string[];
    completionRate?: number;
    averageQuizScore?: number;
  };
  createdAt: string;
}

export interface LearningAnalytics {
  userId: string;
  bookId: string;
  readingSpeed: number; // words per minute
  comprehensionScore: number; // 0-100
  vocabularyGrowth: number; // new words learned
  quizAverage: number; // 0-100
  streakDays: number;
  totalReadingTime: number; // minutes
  pagesPerSession: number;
  difficultyProgression: number[];
  learningStyle: string;
  recommendations: string[];
  generatedAt: string;
}

export interface PersonalizedLearningPath {
  id: string;
  userId: string;
  title: string;
  description: string;
  books: LearningPathBook[];
  estimatedDuration: number; // days
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  currentProgress: number; // 0-100
  achievements: string[];
  milestones: LearningMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningPathBook {
  bookId: string;
  order: number;
  estimatedTime: number; // hours
  prerequisites?: string[];
  objectives: string[];
  completed: boolean;
  completionDate?: string;
  score?: number;
}

export interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  criteria: string[];
  reward?: string;
  completed: boolean;
  completedAt?: string;
  progress: number; // 0-100
}