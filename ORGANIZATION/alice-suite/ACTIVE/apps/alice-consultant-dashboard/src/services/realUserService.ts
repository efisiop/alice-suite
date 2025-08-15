import { getSupabaseClient } from './supabaseClient';
import { appLog } from '../components/LogViewer';

export interface RealUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_consultant: boolean;
  book_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithStats {
  user: RealUser;
  readingStats: {
    total_books: number;
    total_reading_time: number;
    total_pages_read: number;
    last_activity: string | null;
  };
  currentBooks: Array<{
    book_id: string;
    book_title: string;
    progress_percentage: number;
    last_read_at: string;
  }>;
}

export interface UserWithAssignments {
  user: RealUser;
  assignments: Array<{
    id: string;
    book_id: string;
    book_title: string;
    active: boolean;
    created_at: string;
  }>;
}

export const realUserService = {
  async getAllUsers(): Promise<{ data: RealUser[] | null; error: any }> {
    try {
      appLog('RealUserService', 'Fetching all real users from database', 'info');
      
      const client = await getSupabaseClient();
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        appLog('RealUserService', 'Error fetching users', 'error', error);
        return { data: null, error };
      }

      appLog('RealUserService', `Successfully fetched ${data?.length || 0} users`, 'success');
      return { data: data as RealUser[], error: null };
    } catch (error) {
      appLog('RealUserService', 'Unexpected error fetching users', 'error', error);
      return { data: null, error };
    }
  },

  async getAllReaders(): Promise<{ data: RealUser[] | null; error: any }> {
    try {
      appLog('RealUserService', 'Fetching all readers (non-consultants)', 'info');
      
      const client = await getSupabaseClient();
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('is_consultant', false)
        .order('created_at', { ascending: false });

      if (error) {
        appLog('RealUserService', 'Error fetching readers', 'error', error);
        return { data: null, error };
      }

      appLog('RealUserService', `Successfully fetched ${data?.length || 0} readers`, 'success');
      return { data: data as RealUser[], error: null };
    } catch (error) {
      appLog('RealUserService', 'Unexpected error fetching readers', 'error', error);
      return { data: null, error };
    }
  },

  async getReadersWithStats(): Promise<{ data: UserWithStats[] | null; error: any }> {
    try {
      appLog('RealUserService', 'Fetching readers with detailed statistics', 'info');
      
      const client = await getSupabaseClient();
      
      // Get all readers
      const { data: readers, error: readersError } = await client
        .from('profiles')
        .select('*')
        .eq('is_consultant', false)
        .order('created_at', { ascending: false });

      if (readersError) {
        appLog('RealUserService', 'Error fetching readers', 'error', readersError);
        return { data: null, error: readersError };
      }

      if (!readers || readers.length === 0) {
        return { data: [], error: null };
      }

      // Get reading stats for each reader
      const readersWithStats = await Promise.all(
        readers.map(async (reader) => {
          // Get reading statistics
          const { data: readingStats, error: statsError } = await client
            .from('reading_stats')
            .select('*')
            .eq('user_id', reader.id);

          if (statsError) {
            appLog('RealUserService', `Error fetching stats for user ${reader.id}`, 'error', statsError);
          }

          // Calculate aggregated stats
          const totalBooks = readingStats?.length || 0;
          const totalReadingTime = readingStats?.reduce((sum, stat) => sum + (stat.total_reading_time || 0), 0) || 0;
          const totalPagesRead = readingStats?.reduce((sum, stat) => sum + (stat.pages_read || 0), 0) || 0;
          const lastActivity = readingStats?.length > 0 
            ? readingStats.reduce((latest, stat) => 
                new Date(stat.last_session_date || 0) > new Date(latest || 0) 
                  ? stat.last_session_date 
                  : latest, 
                readingStats[0]?.last_session_date
              )
            : null;

          // Get current books with progress
          const { data: currentBooks, error: booksError } = await client
            .from('reading_progress')
            .select(`
              book_id,
              last_read_at,
              books!inner(title)
            `)
            .eq('user_id', reader.id)
            .order('last_read_at', { ascending: false })
            .limit(5);

          if (booksError) {
            appLog('RealUserService', `Error fetching books for user ${reader.id}`, 'error', booksError);
          }

          const booksWithProgress = currentBooks?.map(book => {
            const bookStats = readingStats?.find(stat => stat.book_id === book.book_id);
            return {
              book_id: book.book_id,
              book_title: book.books?.title || 'Unknown Book',
              progress_percentage: bookStats?.percentage_complete || 0,
              last_read_at: book.last_read_at
            };
          }) || [];

          return {
            user: reader as RealUser,
            readingStats: {
              total_books: totalBooks,
              total_reading_time: totalReadingTime,
              total_pages_read: totalPagesRead,
              last_activity: lastActivity
            },
            currentBooks: booksWithProgress
          };
        })
      );

      appLog('RealUserService', `Successfully fetched ${readersWithStats.length} readers with stats`, 'success');
      return { data: readersWithStats, error: null };
    } catch (error) {
      appLog('RealUserService', 'Unexpected error fetching readers with stats', 'error', error);
      return { data: null, error };
    }
  },

  async getReadersForConsultant(consultantId: string): Promise<{ data: UserWithAssignments[] | null; error: any }> {
    try {
      appLog('RealUserService', `Fetching readers assigned to consultant ${consultantId}`, 'info');
      
      const client = await getSupabaseClient();
      
      // Get consultant assignments
      const { data: assignments, error: assignmentsError } = await client
        .from('consultant_assignments')
        .select(`
          *,
          profiles!user_id(*),
          books!inner(title)
        `)
        .eq('consultant_id', consultantId)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (assignmentsError) {
        appLog('RealUserService', 'Error fetching consultant assignments', 'error', assignmentsError);
        return { data: null, error: assignmentsError };
      }

      if (!assignments || assignments.length === 0) {
        return { data: [], error: null };
      }

      // Group assignments by user
      const usersMap = new Map();
      assignments.forEach(assignment => {
        const userId = assignment.user_id;
        if (!usersMap.has(userId)) {
          usersMap.set(userId, {
            user: assignment.profiles as RealUser,
            assignments: []
          });
        }
        usersMap.get(userId).assignments.push({
          id: assignment.id,
          book_id: assignment.book_id,
          book_title: assignment.books?.title || 'Unknown Book',
          active: assignment.active,
          created_at: assignment.created_at
        });
      });

      const result = Array.from(usersMap.values());
      
      appLog('RealUserService', `Successfully fetched ${result.length} users with ${assignments.length} assignments`, 'success');
      return { data: result, error: null };
    } catch (error) {
      appLog('RealUserService', 'Unexpected error fetching readers for consultant', 'error', error);
      return { data: null, error };
    }
  },

  async getUserById(userId: string): Promise<{ data: RealUser | null; error: any }> {
    try {
      appLog('RealUserService', `Fetching user ${userId}`, 'info');
      
      const client = await getSupabaseClient();
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        appLog('RealUserService', 'Error fetching user', 'error', error);
        return { data: null, error };
      }

      return { data: data as RealUser, error: null };
    } catch (error) {
      appLog('RealUserService', 'Unexpected error fetching user', 'error', error);
      return { data: null, error };
    }
  },

  async searchReaders(query: string): Promise<{ data: RealUser[] | null; error: any }> {
    try {
      appLog('RealUserService', `Searching readers with query: ${query}`, 'info');
      
      const client = await getSupabaseClient();
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('is_consultant', false)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        appLog('RealUserService', 'Error searching readers', 'error', error);
        return { data: null, error };
      }

      appLog('RealUserService', `Found ${data?.length || 0} matching readers`, 'success');
      return { data: data as RealUser[], error: null };
    } catch (error) {
      appLog('RealUserService', 'Unexpected error searching readers', 'error', error);
      return { data: null, error };
    }
  }
};