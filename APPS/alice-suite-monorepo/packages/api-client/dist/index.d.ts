import * as _supabase_supabase_js from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import * as _supabase_auth_js from '@supabase/auth-js';

type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
type UserId = string;
type BookId = string;
type ChapterId = string;
type SectionId = string;
type ProfileId = string;
type DictionaryId = string;
type ReadingProgressId = string;
type ReadingStatsId = string;
type HelpRequestId = string;
type FeedbackId = string;
type ConsultantTriggerId = string;
type ConsultantActionId = string;
interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: ProfileId;
                    first_name: string;
                    last_name: string;
                    email: string;
                    is_consultant: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: UserId;
                    first_name: string;
                    last_name: string;
                    email: string;
                    is_consultant?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: ProfileId;
                    first_name?: string;
                    last_name?: string;
                    email?: string;
                    is_consultant?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            books: {
                Row: {
                    id: BookId;
                    title: string;
                    author: string;
                    description: string | null;
                    cover_image_url: string | null;
                    total_pages: number;
                    created_at: string;
                    string_id?: string;
                };
                Insert: {
                    id?: BookId;
                    title: string;
                    author: string;
                    description?: string | null;
                    cover_image_url?: string | null;
                    total_pages: number;
                    created_at?: string;
                    string_id?: string;
                };
                Update: {
                    id?: BookId;
                    title?: string;
                    author?: string;
                    description?: string | null;
                    cover_image_url?: string | null;
                    total_pages?: number;
                    created_at?: string;
                    string_id?: string;
                };
            };
            chapters: {
                Row: {
                    id: ChapterId;
                    book_id: BookId;
                    title: string;
                    number: number;
                    created_at: string;
                };
                Insert: {
                    id?: ChapterId;
                    book_id: BookId;
                    title: string;
                    number: number;
                    created_at?: string;
                };
                Update: {
                    id?: ChapterId;
                    book_id?: BookId;
                    title?: string;
                    number?: number;
                    created_at?: string;
                };
            };
            sections: {
                Row: {
                    id: SectionId;
                    chapter_id: ChapterId;
                    title: string;
                    content: string;
                    start_page: number;
                    end_page: number;
                    number: number;
                    created_at: string;
                };
                Insert: {
                    id?: SectionId;
                    chapter_id: ChapterId;
                    title: string;
                    content: string;
                    start_page: number;
                    end_page: number;
                    number: number;
                    created_at?: string;
                };
                Update: {
                    id?: SectionId;
                    chapter_id?: ChapterId;
                    title?: string;
                    content?: string;
                    start_page?: number;
                    end_page?: number;
                    number?: number;
                    created_at?: string;
                };
            };
            verification_codes: {
                Row: {
                    code: string;
                    book_id: string;
                    is_used: boolean;
                    used_by: string | null;
                    created_at: string;
                };
                Insert: {
                    code: string;
                    book_id: string;
                    is_used?: boolean;
                    used_by?: string | null;
                    created_at?: string;
                };
                Update: {
                    code?: string;
                    book_id?: string;
                    is_used?: boolean;
                    used_by?: string | null;
                    created_at?: string;
                };
            };
            dictionary: {
                Row: {
                    id: DictionaryId;
                    book_id: BookId;
                    chapter_id: ChapterId | null;
                    section_id: SectionId | null;
                    term: string;
                    definition: string;
                    created_at: string;
                };
                Insert: {
                    id?: DictionaryId;
                    book_id: BookId;
                    chapter_id?: ChapterId | null;
                    section_id?: SectionId | null;
                    term: string;
                    definition: string;
                    created_at?: string;
                };
                Update: {
                    id?: DictionaryId;
                    book_id?: BookId;
                    chapter_id?: ChapterId | null;
                    section_id?: SectionId | null;
                    term?: string;
                    definition?: string;
                    created_at?: string;
                };
            };
            reading_progress: {
                Row: {
                    id: ReadingProgressId;
                    user_id: UserId;
                    book_id: BookId;
                    section_id: SectionId;
                    last_position: string | null;
                    last_read_at: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: ReadingProgressId;
                    user_id: UserId;
                    book_id: BookId;
                    section_id: SectionId;
                    last_position?: string | null;
                    last_read_at?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: ReadingProgressId;
                    user_id?: UserId;
                    book_id?: BookId;
                    section_id?: SectionId;
                    last_position?: string | null;
                    last_read_at?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            reading_stats: {
                Row: {
                    id: ReadingStatsId;
                    user_id: UserId;
                    book_id: BookId;
                    total_reading_time: number;
                    pages_read: number;
                    last_session_date: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: ReadingStatsId;
                    user_id: UserId;
                    book_id: BookId;
                    total_reading_time?: number;
                    pages_read?: number;
                    last_session_date?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: ReadingStatsId;
                    user_id?: UserId;
                    book_id?: BookId;
                    total_reading_time?: number;
                    pages_read?: number;
                    last_session_date?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            ai_interactions: {
                Row: {
                    id: string;
                    user_id: string;
                    book_id: string;
                    section_id: string | null;
                    question: string;
                    context: string | null;
                    response: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    book_id: string;
                    section_id?: string | null;
                    question: string;
                    context?: string | null;
                    response: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    book_id?: string;
                    section_id?: string | null;
                    question?: string;
                    context?: string | null;
                    response?: string;
                    created_at?: string;
                };
            };
            ai_prompts: {
                Row: {
                    id: string;
                    prompt_text: string;
                    prompt_type: string;
                    active: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    prompt_text: string;
                    prompt_type: string;
                    active?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    prompt_text?: string;
                    prompt_type?: string;
                    active?: boolean;
                    created_at?: string;
                };
            };
            user_prompt_responses: {
                Row: {
                    id: string;
                    user_id: string;
                    prompt_id: string;
                    response: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    prompt_id: string;
                    response?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    prompt_id?: string;
                    response?: string | null;
                    created_at?: string;
                };
            };
            consultant_assignments: {
                Row: {
                    id: string;
                    consultant_id: string;
                    user_id: string;
                    book_id: string;
                    active: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    consultant_id: string;
                    user_id: string;
                    book_id: string;
                    active?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    consultant_id?: string;
                    user_id?: string;
                    book_id?: string;
                    active?: boolean;
                    created_at?: string;
                };
            };
            consultant_triggers: {
                Row: {
                    id: string;
                    consultant_id: string | null;
                    user_id: string;
                    book_id: string;
                    trigger_type: string;
                    message: string | null;
                    is_processed: boolean;
                    processed_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    consultant_id?: string | null;
                    user_id: string;
                    book_id: string;
                    trigger_type: string;
                    message?: string | null;
                    is_processed?: boolean;
                    processed_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    consultant_id?: string | null;
                    user_id?: string;
                    book_id?: string;
                    trigger_type?: string;
                    message?: string | null;
                    is_processed?: boolean;
                    processed_at?: string | null;
                    created_at?: string;
                };
            };
            consultant_users: {
                Row: {
                    user_id: string;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    is_active?: boolean;
                    created_at?: string;
                };
                Update: {
                    user_id?: string;
                    is_active?: boolean;
                    created_at?: string;
                };
            };
            user_feedback: {
                Row: {
                    id: string;
                    user_id: string;
                    book_id: string;
                    section_id: string | null;
                    feedback_type: string;
                    content: string;
                    is_public: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    book_id: string;
                    section_id?: string | null;
                    feedback_type: string;
                    content: string;
                    is_public?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    book_id?: string;
                    section_id?: string | null;
                    feedback_type?: string;
                    content?: string;
                    is_public?: boolean;
                    created_at?: string;
                };
            };
            help_requests: {
                Row: {
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
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    book_id: string;
                    section_id?: string | null;
                    status?: string;
                    content: string;
                    context?: string | null;
                    assigned_to?: string | null;
                    resolved_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    book_id?: string;
                    section_id?: string | null;
                    status?: string;
                    content?: string;
                    context?: string | null;
                    assigned_to?: string | null;
                    resolved_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            consultant_actions_log: {
                Row: {
                    id: string;
                    consultant_id: string;
                    user_id: string;
                    action_type: string;
                    details: Json | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    consultant_id: string;
                    user_id: string;
                    action_type: string;
                    details?: Json | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    consultant_id?: string;
                    user_id?: string;
                    action_type?: string;
                    details?: Json | null;
                    created_at?: string;
                };
            };
        };
        Functions: {
            get_sections_for_page: {
                Args: {
                    book_id_param: string;
                    page_number_param: number;
                };
                Returns: {
                    id: string;
                    chapter_id: string;
                    title: string;
                    content: string;
                    start_page: number;
                    end_page: number;
                    number: number;
                    chapter_title: string;
                    chapter_number: number;
                }[];
            };
            get_definition_with_context: {
                Args: {
                    book_id_param: string;
                    term_param: string;
                    section_id_param?: string;
                    chapter_id_param?: string;
                };
                Returns: {
                    definition: string;
                    priority: number;
                }[];
            };
            increment_counter: {
                Args: {
                    table_name: string;
                    column_name: string;
                    row_id: string;
                    increment_by: number;
                };
                Returns: undefined;
            };
            is_consultant: {
                Args: Record<string, never>;
                Returns: boolean;
            };
            log_consultant_action: {
                Args: {
                    p_user_id: string;
                    p_action_type: string;
                    p_details?: Json;
                };
                Returns: string;
            };
            create_consultant_trigger: {
                Args: {
                    p_user_id: string;
                    p_book_id: string;
                    p_trigger_type: string;
                    p_message?: string;
                };
                Returns: string;
            };
            update_help_request_status: {
                Args: {
                    p_request_id: string;
                    p_status: string;
                    p_assign_to_self?: boolean;
                };
                Returns: boolean;
            };
        };
    };
}
type Profile = Database['public']['Tables']['profiles']['Row'];
type Book = Database['public']['Tables']['books']['Row'];
type Chapter = Database['public']['Tables']['chapters']['Row'];
type Section = Database['public']['Tables']['sections']['Row'];
type ReadingProgress = Database['public']['Tables']['reading_progress']['Row'];
type ReadingStats = Database['public']['Tables']['reading_stats']['Row'];
type ConsultantTrigger = Database['public']['Tables']['consultant_triggers']['Row'];
type UserFeedback = Database['public']['Tables']['user_feedback']['Row'];
type HelpRequest = Database['public']['Tables']['help_requests']['Row'];
type ConsultantAction = Database['public']['Tables']['consultant_actions_log']['Row'];
type BookWithChapters = Book & {
    chapters: (Chapter & {
        sections: Section[];
    })[];
};
type SectionWithChapter = Section & {
    chapter_title: string;
    chapter_number: number;
};
type BookProgress = {
    section_id: SectionId;
    last_position: string | null;
    section_title?: string;
    chapter_title?: string;
    page_number?: number;
    percentage?: number;
};
type BookStats = ReadingStats & {
    percentage_complete?: number;
};
type UserProfile = Profile;
type UserFeedbackWithRelations = UserFeedback & {
    user?: UserProfile;
    section?: {
        title: string;
        chapter_title: string;
    };
};
type HelpRequestWithRelations = HelpRequest & {
    user?: UserProfile;
    consultant?: UserProfile;
    section?: {
        title: string;
        chapter_title: string;
    };
};
declare enum FeedbackType {
    AHA_MOMENT = "AHA_MOMENT",
    POSITIVE_EXPERIENCE = "POSITIVE_EXPERIENCE",
    SUGGESTION = "SUGGESTION",
    CONFUSION = "CONFUSION",
    GENERAL = "GENERAL"
}
declare enum HelpRequestStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED"
}
declare enum TriggerType {
    ENGAGEMENT = "ENGAGEMENT",
    CHECK_IN = "CHECK_IN",
    QUIZ = "QUIZ",
    ENCOURAGE = "ENCOURAGE"
}

interface SupabaseConfig {
    url: string;
    anonKey: string;
}
declare const createSupabaseClient: (url: string, anonKey: string) => _supabase_supabase_js.SupabaseClient<Database, "public", any>;
declare const initializeSupabase: (config: SupabaseConfig) => _supabase_supabase_js.SupabaseClient<Database, "public", any>;
declare const getSupabaseClient: () => _supabase_supabase_js.SupabaseClient<Database, "public", any>;
declare const supabase: () => _supabase_supabase_js.SupabaseClient<Database, "public", any>;
type SupabaseClient = ReturnType<typeof createClient<Database>>;
declare function validateSupabaseConfig(config: Partial<SupabaseConfig>): boolean;

interface AuthUser {
    id: string;
    email: string;
    role: 'reader' | 'consultant' | 'admin';
    fullName: string;
    firstName: string;
    lastName: string;
    isConsultant: boolean;
}
interface AuthError {
    message: string;
    code?: string;
}
interface AuthSession {
    user: AuthUser | null;
    loading: boolean;
}
interface SignInCredentials {
    email: string;
    password: string;
}
interface SignUpCredentials {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isConsultant?: boolean;
}
interface AuthStateChangeEvent {
    event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';
    session: any;
}
interface AuthEventData {
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    timestamp: Date;
    eventType: 'LOGIN' | 'LOGOUT' | 'SESSION_TIMEOUT' | 'USER_DISCONNECT';
    sessionDuration?: number;
    deviceInfo?: {
        userAgent: string;
        platform: string;
        screenResolution: string;
        browser: string;
    };
    location?: {
        ip?: string;
        country?: string;
        city?: string;
    };
}

declare class AuthClient {
    private get supabase();
    signIn(credentials: SignInCredentials): Promise<{
        user: AuthUser | null;
        error: AuthError | null;
    }>;
    signUp(credentials: SignUpCredentials): Promise<{
        user: AuthUser | null;
        error: AuthError | null;
    }>;
    signOut(): Promise<{
        error: AuthError | null;
    }>;
    getCurrentUser(): Promise<{
        user: AuthUser | null;
        error: AuthError | null;
    }>;
    updateProfile(updates: Partial<Profile>): Promise<{
        user: AuthUser | null;
        error: AuthError | null;
    }>;
    onAuthStateChange(callback: (event: AuthStateChangeEvent) => void): {
        data: {
            subscription: _supabase_auth_js.Subscription;
        };
    };
    resetPassword(email: string): Promise<{
        error: AuthError | null;
    }>;
    emitAuthEvent(event: AuthEventData): Promise<{
        error: AuthError | null;
    }>;
}
declare const authClient: AuthClient;

declare class DatabaseClient {
    private get supabase();
    getProfile(userId: UserId): Promise<{
        data: Profile | null;
        error: Error | null;
    }>;
    updateProfile(userId: UserId, updates: Partial<Profile>): Promise<{
        data: Profile | null;
        error: Error | null;
    }>;
    getBook(bookId: BookId): Promise<{
        data: Book | null;
        error: Error | null;
    }>;
    getBookWithChapters(bookId: BookId): Promise<{
        data: BookWithChapters | null;
        error: Error | null;
    }>;
    getChapters(bookId: BookId): Promise<{
        data: Chapter[] | null;
        error: Error | null;
    }>;
    getSections(chapterId: ChapterId): Promise<{
        data: Section[] | null;
        error: Error | null;
    }>;
    getSection(sectionId: SectionId): Promise<{
        data: Section | null;
        error: Error | null;
    }>;
    getSectionsForPage(bookId: BookId, pageNumber: number): Promise<{
        data: SectionWithChapter[] | null;
        error: Error | null;
    }>;
    getReadingProgress(userId: UserId, bookId: BookId): Promise<{
        data: ReadingProgress[] | null;
        error: Error | null;
    }>;
    updateReadingProgress(progress: Partial<ReadingProgress>): Promise<{
        data: ReadingProgress | null;
        error: Error | null;
    }>;
    getReadingStats(userId: UserId, bookId: BookId): Promise<{
        data: ReadingStats | null;
        error: Error | null;
    }>;
    updateReadingStats(stats: Partial<ReadingStats>): Promise<{
        data: ReadingStats | null;
        error: Error | null;
    }>;
    getUserFeedback(userId: UserId, bookId: BookId): Promise<{
        data: UserFeedback[] | null;
        error: Error | null;
    }>;
    createUserFeedback(feedback: Omit<UserFeedback, 'id' | 'created_at'>): Promise<{
        data: UserFeedback | null;
        error: Error | null;
    }>;
    getHelpRequests(userId: UserId): Promise<{
        data: HelpRequest[] | null;
        error: Error | null;
    }>;
    createHelpRequest(request: Omit<HelpRequest, 'id' | 'created_at' | 'updated_at'>): Promise<{
        data: HelpRequest | null;
        error: Error | null;
    }>;
    updateHelpRequestStatus(requestId: string, status: string, assignToSelf?: boolean): Promise<{
        data: boolean | null;
        error: Error | null;
    }>;
    getConsultantTriggers(consultantId: UserId): Promise<{
        data: ConsultantTrigger[] | null;
        error: Error | null;
    }>;
    createConsultantTrigger(trigger: Omit<ConsultantTrigger, 'id' | 'created_at'>): Promise<{
        data: ConsultantTrigger | null;
        error: Error | null;
    }>;
    logConsultantAction(action: Omit<ConsultantAction, 'id' | 'created_at'>): Promise<{
        data: ConsultantAction | null;
        error: Error | null;
    }>;
}
declare const dbClient: DatabaseClient;

/**
 * Type definitions for entity IDs
 *
 * Using branded types to ensure type safety when working with different ID types
 */
type EntityId = string & {
    readonly _brand: unique symbol;
};

declare function isUuid(id: string): boolean;
declare function asUserId(id: string): UserId;
declare function asBookId(id: string): BookId;
declare function asChapterId(id: string): ChapterId;
declare function asSectionId(id: string): SectionId;
declare function asProfileId(id: string): ProfileId;
declare function asDictionaryId(id: string): DictionaryId;
declare function asReadingProgressId(id: string): ReadingProgressId;
declare function asReadingStatsId(id: string): ReadingStatsId;
declare function asHelpRequestId(id: string): HelpRequestId;
declare function asFeedbackId(id: string): FeedbackId;
declare function asConsultantTriggerId(id: string): ConsultantTriggerId;
declare function asConsultantActionId(id: string): ConsultantActionId;
/**
 * Converts a string book ID to a UUID format
 * @param bookId String ID of the book
 * @returns UUID string as BookId type
 */
declare function getBookUuid(bookId: string): BookId;
/**
 * Gets the string ID for a book UUID
 * @param uuid UUID of the book
 * @returns String ID or the original UUID if no mapping exists
 */
declare function getBookStringId(uuid: string): string;
/**
 * Validates a UUID string
 * @param id The ID to validate
 * @returns True if the ID is a valid UUID, false otherwise
 */
declare function validateUuid(id: string): boolean;
/**
 * Generates a new UUID v4
 * @returns A new UUID v4 string
 */
declare function generateUuid(): string;
declare const ALICE_BOOK_ID_STRING = "alice-in-wonderland";
declare const ALICE_BOOK_ID_UUID: string;

export { ALICE_BOOK_ID_STRING, ALICE_BOOK_ID_UUID, type AuthError, type AuthSession, type AuthStateChangeEvent, type AuthUser, type Book, type BookId, type BookProgress, type BookStats, type BookWithChapters, type Chapter, type ChapterId, type ConsultantAction, type ConsultantActionId, type ConsultantTrigger, type ConsultantTriggerId, type Database, type DictionaryId, type EntityId, type FeedbackId, FeedbackType, type HelpRequest, type HelpRequestId, HelpRequestStatus, type HelpRequestWithRelations, type Profile, type ProfileId, type ReadingProgress, type ReadingProgressId, type ReadingStats, type ReadingStatsId, type Section, type SectionId, type SectionWithChapter, type SignInCredentials, type SignUpCredentials, type SupabaseClient, TriggerType, type UserFeedback, type UserFeedbackWithRelations, type UserId, asBookId, asChapterId, asConsultantActionId, asConsultantTriggerId, asDictionaryId, asFeedbackId, asHelpRequestId, asProfileId, asReadingProgressId, asReadingStatsId, asSectionId, asUserId, authClient, createSupabaseClient, dbClient, generateUuid, getBookStringId, getBookUuid, getSupabaseClient, initializeSupabase, isUuid, supabase, validateSupabaseConfig, validateUuid };
