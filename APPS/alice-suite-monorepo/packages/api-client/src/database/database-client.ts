// Database client for Alice Suite applications

import { getSupabaseClient } from '../utils/supabase'
import type { 
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
  UserId,
  BookId,
  ChapterId,
  SectionId
} from '../types/database'

export class DatabaseClient {
  private get supabase() {
    return getSupabaseClient()
  }
  // Profile operations
  async getProfile(userId: UserId): Promise<{ data: Profile | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { data, error }
  }

  async updateProfile(userId: UserId, updates: Partial<Profile>): Promise<{ data: Profile | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  }

  // Book operations
  async getBook(bookId: BookId): Promise<{ data: Book | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single()
    
    return { data, error }
  }

  async getBookWithChapters(bookId: BookId): Promise<{ data: BookWithChapters | null; error: Error | null }> {
    const { data: book, error: bookError } = await this.supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single()

    if (bookError) return { data: null, error: bookError }

    const { data: chapters, error: chaptersError } = await this.supabase
      .from('chapters')
      .select(`
        *,
        sections (*)
      `)
      .eq('book_id', bookId)
      .order('number')

    if (chaptersError) return { data: null, error: chaptersError }

    const bookWithChapters: BookWithChapters = {
      ...book,
      chapters: chapters || []
    }

    return { data: bookWithChapters, error: null }
  }

  // Chapter operations
  async getChapters(bookId: BookId): Promise<{ data: Chapter[] | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('number')
    
    return { data, error }
  }

  // Section operations
  async getSections(chapterId: ChapterId): Promise<{ data: Section[] | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('sections')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('number')
    
    return { data, error }
  }

  async getSection(sectionId: SectionId): Promise<{ data: Section | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('sections')
      .select('*')
      .eq('id', sectionId)
      .single()
    
    return { data, error }
  }

  async getSectionsForPage(bookId: BookId, pageNumber: number): Promise<{ data: SectionWithChapter[] | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .rpc('get_sections_for_page', {
        book_id_param: bookId,
        page_number_param: pageNumber
      })
    
    return { data, error }
  }

  // Reading progress operations
  async getReadingProgress(userId: UserId, bookId: BookId): Promise<{ data: ReadingProgress[] | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .order('last_read_at', { ascending: false })
    
    return { data, error }
  }

  async updateReadingProgress(progress: Partial<ReadingProgress>): Promise<{ data: ReadingProgress | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('reading_progress')
      .upsert({ 
        ...progress, 
        updated_at: new Date().toISOString() 
      })
      .select()
      .single()
    
    return { data, error }
  }

  // Reading stats operations
  async getReadingStats(userId: UserId, bookId: BookId): Promise<{ data: ReadingStats | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('reading_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single()
    
    return { data, error }
  }

  async updateReadingStats(stats: Partial<ReadingStats>): Promise<{ data: ReadingStats | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('reading_stats')
      .upsert({ 
        ...stats, 
        updated_at: new Date().toISOString() 
      })
      .select()
      .single()
    
    return { data, error }
  }

  // User feedback operations
  async getUserFeedback(userId: UserId, bookId: BookId): Promise<{ data: UserFeedback[] | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('user_feedback')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  }

  async createUserFeedback(feedback: Omit<UserFeedback, 'id' | 'created_at'>): Promise<{ data: UserFeedback | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('user_feedback')
      .insert({ 
        ...feedback, 
        created_at: new Date().toISOString() 
      })
      .select()
      .single()
    
    return { data, error }
  }

  // Help request operations
  async getHelpRequests(userId: UserId): Promise<{ data: HelpRequest[] | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('help_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  }

  async createHelpRequest(request: Omit<HelpRequest, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: HelpRequest | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('help_requests')
      .insert({ 
        ...request, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    return { data, error }
  }

  async updateHelpRequestStatus(requestId: string, status: string, assignToSelf?: boolean): Promise<{ data: boolean | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .rpc('update_help_request_status', {
        p_request_id: requestId,
        p_status: status,
        p_assign_to_self: assignToSelf
      })
    
    return { data, error }
  }

  // Consultant operations
  async getConsultantTriggers(consultantId: UserId): Promise<{ data: ConsultantTrigger[] | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('consultant_triggers')
      .select('*')
      .eq('consultant_id', consultantId)
      .eq('is_processed', false)
      .order('created_at', { ascending: false })
    
    return { data, error }
  }

  async createConsultantTrigger(trigger: Omit<ConsultantTrigger, 'id' | 'created_at'>): Promise<{ data: ConsultantTrigger | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .rpc('create_consultant_trigger', {
        p_user_id: trigger.user_id,
        p_book_id: trigger.book_id,
        p_trigger_type: trigger.trigger_type,
        p_message: trigger.message
      })
    
    if (error) return { data: null, error }
    
    // Fetch the created trigger
    const { data: createdTrigger, error: fetchError } = await this.supabase
      .from('consultant_triggers')
      .select('*')
      .eq('id', data)
      .single()
    
    return { data: createdTrigger, error: fetchError }
  }

  async logConsultantAction(action: Omit<ConsultantAction, 'id' | 'created_at'>): Promise<{ data: ConsultantAction | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .rpc('log_consultant_action', {
        p_user_id: action.user_id,
        p_action_type: action.action_type,
        p_details: action.details
      })
    
    if (error) return { data: null, error }
    
    // Fetch the created action
    const { data: createdAction, error: fetchError } = await this.supabase
      .from('consultant_actions_log')
      .select('*')
      .eq('id', data)
      .single()
    
    return { data: createdAction, error: fetchError }
  }
}

export const dbClient = new DatabaseClient() 