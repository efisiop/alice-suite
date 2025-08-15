// src/services/bookService.ts
import { registry } from '@services/serviceRegistry';
import { appLog } from '../components/LogViewer';
import { handleServiceError } from '../utils/errorHandling';
import { dbClient } from '@alice-suite/api-client';
import { fallbackBookData, BookSection, BookData } from '../data/fallbackBookData';

/**
 * Book Service Interface
 */
export interface BookServiceInterface {
  getBookData: (bookId: string) => Promise<BookData>;
  getBookSection: (bookId: string, sectionId: string) => Promise<BookSection | null>;
  getAllBookSections: (bookId: string) => Promise<BookSection[]>;
  searchBookContent: (bookId: string, query: string) => Promise<BookSection[]>;
}

/**
 * Create Book Service
 * 
 * Factory function to create the book service implementation
 */
const createBookService = async (): Promise<BookServiceInterface> => {
  appLog('BookService', 'Creating book service', 'info');
  
  // Create service implementation
  const bookService: BookServiceInterface = {
    getBookData: async (bookId: string): Promise<BookData> => {
      try {
        appLog('BookService', `Getting book data for ${bookId}`, 'info');
        
        const result = await dbClient.getBook(bookId);
        if (result.error || !result.data) {
          appLog('BookService', `Book ${bookId} not found in database, using fallback`, 'warning');
          return fallbackBookData;
        }
        
        return result.data as BookData;
      } catch (error) {
        appLog('BookService', `Error getting book data, using fallback: ${error}`, 'warning');
        return fallbackBookData;
      }
    },
    
    getBookSection: async (bookId: string, sectionId: string): Promise<BookSection | null> => {
      try {
        appLog('BookService', `Getting book section ${sectionId} for ${bookId}`, 'info');
        
        const result = await dbClient.getBookSection(bookId, sectionId);
        if (result.error || !result.data) {
          appLog('BookService', `Section ${sectionId} not found in database, using fallback`, 'warning');
          return fallbackBookData.sections.find(section => section.id === sectionId) || null;
        }
        
        return result.data as BookSection;
      } catch (error) {
        appLog('BookService', `Error getting book section, using fallback: ${error}`, 'warning');
        return fallbackBookData.sections.find(section => section.id === sectionId) || null;
      }
    },
    
    getAllBookSections: async (bookId: string): Promise<BookSection[]> => {
      try {
        appLog('BookService', `Getting all sections for ${bookId}`, 'info');
        
        const result = await dbClient.getBookSections(bookId);
        if (result.error || !result.data) {
          appLog('BookService', `Sections not found in database, using fallback`, 'warning');
          return fallbackBookData.sections;
        }
        
        return result.data as BookSection[];
      } catch (error) {
        appLog('BookService', `Error getting book sections, using fallback: ${error}`, 'warning');
        return fallbackBookData.sections;
      }
    },
    
    searchBookContent: async (bookId: string, query: string): Promise<BookSection[]> => {
      try {
        appLog('BookService', `Searching book content for "${query}" in ${bookId}`, 'info');
        
        const result = await dbClient.searchBookContent(bookId, query);
        if (result.error || !result.data) {
          appLog('BookService', `Search failed in database, using fallback`, 'warning');
          return fallbackBookData.sections.filter(section => 
            section.content.toLowerCase().includes(query.toLowerCase()) ||
            section.title.toLowerCase().includes(query.toLowerCase())
          );
        }
        
        return result.data as BookSection[];
      } catch (error) {
        appLog('BookService', `Error searching book content, using fallback: ${error}`, 'warning');
        return fallbackBookData.sections.filter(section => 
          section.content.toLowerCase().includes(query.toLowerCase()) ||
          section.title.toLowerCase().includes(query.toLowerCase())
        );
      }
    }
  };
  
  return bookService;
};

// Register the service
registry.register('bookService', createBookService);

// Export convenience functions
export const getBookData = async (bookId: string): Promise<BookData> => {
  const service = await registry.get('bookService') as BookServiceInterface;
  return service.getBookData(bookId);
};

export const getBookSection = async (bookId: string, sectionId: string): Promise<BookSection | null> => {
  const service = await registry.get('bookService') as BookServiceInterface;
  return service.getBookSection(bookId, sectionId);
};

export const getAllBookSections = async (bookId: string): Promise<BookSection[]> => {
  const service = await registry.get('bookService') as BookServiceInterface;
  return service.getAllBookSections(bookId);
};

export const searchBookContent = async (bookId: string, query: string): Promise<BookSection[]> => {
  const service = await registry.get('bookService') as BookServiceInterface;
  return service.searchBookContent(bookId, query);
}; 