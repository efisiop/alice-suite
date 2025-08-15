// src/services/dictionaryService.ts
import { registry } from '@services/serviceRegistry';
import { appLog } from '../components/LogViewer';
import { handleServiceError } from '../utils/errorHandling';
import { getSupabaseClient } from './supabaseClient';

/**
 * Dictionary Service Interface
 */
export interface DictionaryServiceInterface {
  lookupWord: (word: string) => Promise<DictionaryEntry | null>;
  searchWords: (query: string) => Promise<DictionaryEntry[]>;
  getWordHistory: (userId: string) => Promise<DictionaryEntry[]>;
  addToHistory: (userId: string, word: string, definition: string) => Promise<void>;
}

/**
 * Dictionary Entry Interface
 */
export interface DictionaryEntry {
  word: string;
  definition: string;
  partOfSpeech?: string;
  examples?: string[];
  synonyms?: string[];
  antonyms?: string[];
}

/**
 * Create Dictionary Service
 * 
 * Factory function to create the dictionary service implementation
 */
const createDictionaryService = async (): Promise<DictionaryServiceInterface> => {
  appLog('DictionaryService', 'Creating dictionary service', 'info');
  
  // Create service implementation
  const dictionaryService: DictionaryServiceInterface = {
    lookupWord: async (word: string): Promise<DictionaryEntry | null> => {
      try {
        appLog('DictionaryService', `Looking up word: ${word}`, 'info');
        
        // Try to get from database first
        const client = await getSupabaseClient();
        const { data, error } = await client
          .from('dictionary')
          .select('*')
          .eq('word', word.toLowerCase())
          .single();
        
        if (error || !data) {
          appLog('DictionaryService', `Word ${word} not found in database`, 'warning');
          return null;
        }
        
        return data as DictionaryEntry;
      } catch (error) {
        throw handleServiceError(error, 'dictionaryService', 'lookupWord');
      }
    },
    
    searchWords: async (query: string): Promise<DictionaryEntry[]> => {
      try {
        appLog('DictionaryService', `Searching words: ${query}`, 'info');
        
        // Try to search in database
        const client = await getSupabaseClient();
        const { data, error } = await client
          .from('dictionary')
          .select('*')
          .ilike('word', `%${query}%`)
          .limit(10);
        
        if (error || !data) {
          appLog('DictionaryService', `Search failed in database`, 'warning');
          return [];
        }
        
        return data as DictionaryEntry[];
      } catch (error) {
        throw handleServiceError(error, 'dictionaryService', 'searchWords');
      }
    },
    
    getWordHistory: async (userId: string): Promise<DictionaryEntry[]> => {
      try {
        appLog('DictionaryService', `Getting word history for user: ${userId}`, 'info');
        
        // Try to get from database
        const client = await getSupabaseClient();
        const { data, error } = await client
          .from('user_dictionary_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error || !data) {
          appLog('DictionaryService', `No word history found`, 'warning');
          return [];
        }
        
        return data as DictionaryEntry[];
      } catch (error) {
        throw handleServiceError(error, 'dictionaryService', 'getWordHistory');
      }
    },
    
    addToHistory: async (userId: string, word: string, definition: string): Promise<void> => {
      try {
        appLog('DictionaryService', `Adding word to history: ${word}`, 'info');
        
        // Add to database
        const client = await getSupabaseClient();
        const { error } = await client
          .from('user_dictionary_history')
          .insert({
            user_id: userId,
            word: word.toLowerCase(),
            definition,
            created_at: new Date().toISOString()
          });
        
        if (error) throw error;
      } catch (error) {
        throw handleServiceError(error, 'dictionaryService', 'addToHistory');
      }
    }
  };
  
  return dictionaryService;
};

// Register the service
registry.register('dictionaryService', createDictionaryService);

// Export convenience functions
export const lookupWord = async (word: string): Promise<DictionaryEntry | null> => {
  const service = await registry.get('dictionaryService') as DictionaryServiceInterface;
  return service.lookupWord(word);
};

export const searchWords = async (query: string): Promise<DictionaryEntry[]> => {
  const service = await registry.get('dictionaryService') as DictionaryServiceInterface;
  return service.searchWords(query);
};

export const getWordHistory = async (userId: string): Promise<DictionaryEntry[]> => {
  const service = await registry.get('dictionaryService') as DictionaryServiceInterface;
  return service.getWordHistory(userId);
};

export const addToHistory = async (userId: string, word: string, definition: string): Promise<void> => {
  const service = await registry.get('dictionaryService') as DictionaryServiceInterface;
  return service.addToHistory(userId, word, definition);
}; 