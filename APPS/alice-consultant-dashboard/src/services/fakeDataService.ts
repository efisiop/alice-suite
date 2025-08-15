// MOCK DATA DISABLED - This file is disabled to ensure only real data flows
// 2025-08-09T10:46:38.786Z

import { 
  HelpRequest, 
  HelpRequestStatus, 
  UserFeedback,
  ConsultantTrigger,
  TriggerType
} from '@alice-suite/api-client';
import { ReaderProfile, ReaderInteraction } from './consultantService';

// Generate realistic fake data for the consultant dashboard

export interface FakeReader extends ReaderProfile {
  progress: {
    chapter: number;
    page: number;
    last_read_at: string;
    time_spent_minutes: number;
  };
  stats: {
    total_sessions: number;
    total_time_minutes: number;
    average_session_duration: number;
    last_activity_date: string;
  };
  engagement: 'high' | 'medium' | 'low';
  lastActive: string;
  status: 'active' | 'inactive';
}

export class FakeDataService {
  private static instance: FakeDataService;
  private readers: FakeReader[] = [];
  private helpRequests: HelpRequest[] = [];
  private feedback: UserFeedback[] = [];
  private interactions: ReaderInteraction[] = [];
  private triggers: ConsultantTrigger[] = [];

  static getInstance(): FakeDataService {
    if (!FakeDataService.instance) {
      FakeDataService.instance = new FakeDataService();
    }
    return FakeDataService.instance;
  }

  constructor() {
    this.generateAllFakeData();
  }

  private generateAllFakeData() {
    this.generateFakeReaders();
    this.generateFakeHelpRequests();
    this.generateFakeFeedback();
    this.generateFakeInteractions();
    this.generateFakeTriggers();
  }

  private generateFakeReaders(): void {
    const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    this.readers = Array.from({ length: 15 }, (_, i) => {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const daysAgo = Math.floor(Math.random() * 30);
      const lastActive = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      
      return {
        id: `reader-${i + 1}`,
        first_name: firstName,
        last_name: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        book_verified: Math.random() > 0.2,
        is_verified: Math.random() > 0.1,
        is_consultant: false,
        updated_at: lastActive,
        progress: {
          chapter: Math.floor(Math.random() * 12) + 1,
          page: Math.floor(Math.random() * 50) + 1,
          last_read_at: lastActive,
          time_spent_minutes: Math.floor(Math.random() * 120) + 15
        },
        stats: {
          total_sessions: Math.floor(Math.random() * 50) + 5,
          total_time_minutes: Math.floor(Math.random() * 1000) + 100,
          average_session_duration: Math.floor(Math.random() * 45) + 15,
          last_activity_date: lastActive
        },
        engagement: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
        lastActive: lastActive,
        status: Math.random() > 0.3 ? 'active' : 'inactive'
      };
    });
  }

  private generateFakeHelpRequests(): void {
    const questions = [
      "I'm confused about the Cheshire Cat's role in the story",
      "What does 'curiouser and curiouser' really mean?",
      "Can you explain the Queen of Hearts' personality?",
      "I'm struggling to understand the Mad Hatter's tea party",
      "Why does Alice keep changing size?",
      "What's the significance of the white rabbit?",
      "I don't understand the caterpillar's advice",
      "Can you help me interpret the croquet game?",
      "What does the Duchess represent?",
      "I'm lost in the garden of live flowers"
    ];

    this.helpRequests = Array.from({ length: 12 }, (_, i) => {
      const reader = this.readers[i % this.readers.length];
      const daysAgo = Math.floor(Math.random() * 7);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      
      return {
        id: `help-${i + 1}`,
        user_id: reader.id,
        book_id: 'alice-in-wonderland',
        section_id: `section-${Math.floor(Math.random() * 12) + 1}`,
        content: questions[i % questions.length],
        status: ['pending', 'assigned', 'resolved'][Math.floor(Math.random() * 3)] as HelpRequestStatus,
        created_at: createdAt,
        updated_at: createdAt,
        consultant_id: Math.random() > 0.5 ? 'consultant-1' : null,
        response: Math.random() > 0.5 ? 'This is a helpful response to guide the reader.' : null,
        user: {
          id: reader.id,
          first_name: reader.first_name,
          last_name: reader.last_name,
          email: reader.email
        }
      };
    });
  }

  private generateFakeFeedback(): void {
    const feedbackContent = {
      'aha_moment': [
        "I just realized Alice's journey represents growing up!",
        "The wordplay is so clever - I finally get the puns!",
        "The Queen of Hearts is a metaphor for authority figures"
      ],
      'positive_experience': [
        "This chapter was absolutely delightful!",
        "I love how imaginative this story is",
        "The characters are so well-developed"
      ],
      'suggestion': [
        "Could we have more context about Victorian England?",
        "I'd love to see character relationship maps",
        "More historical background would be helpful"
      ],
      'confusion': [
        "I'm not sure who all these characters are",
        "The timeline seems confusing",
        "I don't understand why certain events happen"
      ],
      'general': [
        "This is a fascinating story",
        "I'm really enjoying this reading experience",
        "Looking forward to the next chapter"
      ]
    };

    this.feedback = Array.from({ length: 20 }, (_, i) => {
      const reader = this.readers[i % this.readers.length];
      const types = ['aha_moment', 'positive_experience', 'suggestion', 'confusion', 'general'];
      const type = types[i % types.length];
      const contentArray = feedbackContent[type];
      const daysAgo = Math.floor(Math.random() * 14);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      
      return {
        id: `feedback-${i + 1}`,
        user_id: reader.id,
        book_id: 'alice-in-wonderland',
        section_id: `section-${Math.floor(Math.random() * 12) + 1}`,
        feedback_type: type,
        content: contentArray[i % contentArray.length],
        is_public: Math.random() > 0.3,
        is_featured: Math.random() > 0.8,
        created_at: createdAt,
        user: {
          id: reader.id,
          first_name: reader.first_name,
          last_name: reader.last_name
        }
      };
    });
  }

  private generateFakeInteractions(): void {
    const eventTypes = ['page_view', 'dictionary_lookup', 'highlight', 'note_added', 'help_request', 'feedback_submitted', 'chapter_complete', 'book_started'];
    
    this.interactions = Array.from({ length: 50 }, (_, i) => {
      const reader = this.readers[i % this.readers.length];
      const hoursAgo = Math.floor(Math.random() * 72);
      const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      return {
        id: `interaction-${i + 1}`,
        user_id: reader.id,
        user_name: `${reader.first_name} ${reader.last_name}`,
        event_type: eventType,
        book_id: 'alice-in-wonderland',
        section_id: `section-${Math.floor(Math.random() * 12) + 1}`,
        page_number: Math.floor(Math.random() * 200) + 1,
        content: `User performed ${eventType} action`,
        context: {
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          referrer: 'dashboard',
          timestamp: createdAt
        },
        created_at: createdAt
      };
    });
  }

  private generateFakeTriggers(): void {
    const triggerMessages = [
      "Great progress! Consider exploring the symbolism in this chapter.",
      "You've been stuck on this section for a while. Would you like some guidance?",
      "Excellent insight! Keep thinking about character motivations.",
      "Consider how this relates to Victorian society.",
      "Take a moment to reflect on Alice's emotional journey."
    ];

    this.triggers = Array.from({ length: 8 }, (_, i) => {
      const reader = this.readers[i % this.readers.length];
      const daysAgo = Math.floor(Math.random() * 3);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      
      return {
        id: `trigger-${i + 1}`,
        user_id: reader.id,
        book_id: 'alice-in-wonderland',
        trigger_type: TriggerType.CONSULTANT_MESSAGE,
        message: triggerMessages[i % triggerMessages.length],
        consultant_id: 'consultant-1',
        is_processed: Math.random() > 0.5,
        processed_at: Math.random() > 0.5 ? createdAt : null,
        created_at: createdAt,
        consultant: {
          id: 'consultant-1',
          first_name: 'Dr.',
          last_name: 'Consultant'
        }
      };
    });
  }

  // Public API methods
  getAllReaders(): FakeReader[] {
    return [...this.readers];
  }

  getActiveReaders(): FakeReader[] {
    return this.readers.filter(reader => reader.status === 'active');
  }

  getHelpRequests(status?: HelpRequestStatus): HelpRequest[] {
    if (status) {
      return this.helpRequests.filter(request => request.status === status);
    }
    return [...this.helpRequests];
  }

  getFeedback(type?: string): UserFeedback[] {
    if (type) {
      return this.feedback.filter(f => f.feedback_type === type);
    }
    return [...this.feedback];
  }

  getInteractions(eventType?: string): ReaderInteraction[] {
    if (eventType) {
      return this.interactions.filter(i => i.event_type === eventType);
    }
    return [...this.interactions];
  }

  getTriggers(): ConsultantTrigger[] {
    return [...this.triggers];
  }

  getReaderById(id: string): FakeReader | undefined {
    return this.readers.find(reader => reader.id === id);
  }

  addHelpRequest(request: Partial<HelpRequest>): HelpRequest {
    const newRequest: HelpRequest = {
      id: `help-${Date.now()}`,
      user_id: request.user_id || this.readers[0].id,
      book_id: 'alice-in-wonderland',
      content: request.content || 'New help request',
      status: HelpRequestStatus.PENDING,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...request
    } as HelpRequest;
    
    this.helpRequests.unshift(newRequest);
    return newRequest;
  }

  addFeedback(newFeedback: Partial<UserFeedback>): UserFeedback {
    const feedback: UserFeedback = {
      id: `feedback-${Date.now()}`,
      user_id: newFeedback.user_id || this.readers[0].id,
      book_id: 'alice-in-wonderland',
      feedback_type: newFeedback.feedback_type || 'general',
      content: newFeedback.content || 'New feedback',
      is_public: newFeedback.is_public ?? true,
      created_at: new Date().toISOString(),
      ...newFeedback
    } as UserFeedback;
    
    this.feedback.unshift(feedback);
    return feedback;
  }

  refreshData(): void {
    this.generateAllFakeData();
  }

  // Statistics methods
  getDashboardStats() {
    const totalReaders = this.readers.length;
    const activeReaders = this.readers.filter(r => r.status === 'active').length;
    const pendingRequests = this.helpRequests.filter(r => r.status === 'pending').length;
    const resolvedRequests = this.helpRequests.filter(r => r.status === 'resolved').length;
    const totalFeedback = this.feedback.length;
    const recentFeedback = this.feedback.filter(f => 
      new Date(f.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      totalReaders,
      activeReaders,
      pendingRequests,
      resolvedRequests,
      totalFeedback,
      recentFeedback,
      promptsSent: this.triggers.length,
      readerEngagement: {
        high: this.readers.filter(r => r.engagement === 'high').length,
        medium: this.readers.filter(r => r.engagement === 'medium').length,
        low: this.readers.filter(r => r.engagement === 'low').length
      },
      recentActivity: this.interactions.slice(0, 10).map(i => ({
        id: i.id,
        type: 'interaction' as const,
        userId: i.user_id,
        userName: i.user_name,
        timestamp: i.created_at,
        description: `${i.user_name} ${i.event_type.replace('_', ' ')}`
      }))
    };
  }

  // Initialize fake data for bypass mode
  public initializeFakeData(): void {
    console.log('FakeDataService: Initializing fake data...');
    this.generateAllFakeData();
    console.log('FakeDataService: Fake data initialized');
  }
}

// Export singleton instance
export const fakeDataService = FakeDataService.getInstance();

// Helper functions for quick access
export const getFakeReaders = () => fakeDataService.getAllReaders();
export const getFakeHelpRequests = (status?: HelpRequestStatus) => fakeDataService.getHelpRequests(status);
export const getFakeFeedback = (type?: FeedbackType) => fakeDataService.getFeedback(type);
export const getFakeInteractions = (eventType?: string) => fakeDataService.getInteractions(eventType);
export const refreshFakeData = () => fakeDataService.refreshData();