import { FakeDataService } from './fakeDataService';
import { RealDataService } from './realDataService';
import { appLog } from '../components/LogViewer';

export type DataServiceMode = 'fake' | 'real';

export class DataServiceManager {
  private static instance: DataServiceManager;
  private mode: DataServiceMode = 'real'; // Always use real data
  private fakeService: FakeDataService;
  private realService: RealDataService;

  static getInstance(): DataServiceManager {
    if (!DataServiceManager.instance) {
      DataServiceManager.instance = new DataServiceManager();
    }
    return DataServiceManager.instance;
  }

  constructor() {
    this.fakeService = FakeDataService.getInstance();
    this.realService = RealDataService.getInstance();
    
    // Always use real data - mock data has been disabled
    this.mode = 'real';
    appLog('DataServiceManager', `Initialized with mode: ${this.mode}`);
  }

  getMode(): DataServiceMode {
    return this.mode;
  }

  setMode(mode: DataServiceMode): void {
    this.mode = mode;
    appLog('DataServiceManager', `Switched to mode: ${mode}`);
    localStorage.setItem('useRealData', mode === 'real' ? 'true' : 'false');
  }

  isUsingRealData(): boolean {
    return this.mode === 'real';
  }

  // Unified interface methods
  async getAllReaders() {
    if (this.mode === 'real') {
      // For real data, we need a consultant ID - this should be passed from context
      // For now, return empty array as we don't have consultant context here
      appLog('DataServiceManager', 'getAllReaders called in real mode - need consultant ID');
      return [];
    }
    return this.fakeService.getAllReaders();
  }

  async getAssignedReaders(consultantId?: string) {
    if (this.mode === 'real' && consultantId) {
      return this.realService.getAssignedReaders(consultantId);
    }
    return this.fakeService.getAllReaders();
  }

  async getHelpRequests(consultantId?: string, status?: any) {
    if (this.mode === 'real') {
      const requests = await this.realService.getHelpRequests(consultantId);
      return status ? requests.filter(r => r.status === status) : requests;
    }
    return this.fakeService.getHelpRequests(status);
  }

  async getFeedback(consultantId?: string, type?: any) {
    if (this.mode === 'real') {
      const feedback = await this.realService.getFeedback(consultantId);
      return type ? feedback.filter(f => f.feedback_type === type) : feedback;
    }
    return this.fakeService.getFeedback(type);
  }

  async getInteractions(consultantId?: string, eventType?: string) {
    if (this.mode === 'real') {
      return this.realService.getReaderInteractions(consultantId, eventType);
    }
    return this.fakeService.getInteractions(eventType);
  }

  async getTriggers(consultantId?: string) {
    if (this.mode === 'real' && consultantId) {
      return this.realService.getTriggers(consultantId);
    }
    return this.fakeService.getTriggers();
  }

  async getDashboardStats(consultantId?: string) {
    if (this.mode === 'real' && consultantId) {
      const data = await this.realService.getDashboardData(consultantId);
      return {
        totalReaders: data.analytics.totalReaders,
        activeReaders: data.analytics.activeReaders,
        pendingHelpRequests: data.analytics.pendingHelpRequests,
        resolvedHelpRequests: data.helpRequests.filter(h => h.status === 'RESOLVED').length,
        feedbackCount: data.feedback.length,
        promptsSent: data.triggers.length
      };
    }
    return this.fakeService.getDashboardStats();
  }

  async getDashboardData(consultantId?: string) {
    if (this.mode === 'real' && consultantId) {
      return this.realService.getDashboardData(consultantId);
    }
    
    // Fake data fallback
    return {
      readers: this.fakeService.getAllReaders(),
      helpRequests: this.fakeService.getHelpRequests(),
      feedback: this.fakeService.getFeedback(),
      triggers: this.fakeService.getTriggers(),
      interactions: this.fakeService.getInteractions(),
      analytics: this.fakeService.getDashboardStats()
    };
  }

  // Action methods
  async updateHelpRequestStatus(requestId: string, status: any, consultantId?: string) {
    if (this.mode === 'real' && consultantId) {
      return this.realService.updateHelpRequestStatus(requestId, status, consultantId);
    }
    return this.fakeService.updateHelpRequestStatus(requestId, status);
  }

  async toggleFeedbackPublic(feedbackId: string, isPublic: boolean) {
    if (this.mode === 'real') {
      return this.realService.toggleFeedbackPublic(feedbackId, isPublic);
    }
    return this.fakeService.toggleFeedbackPublic(feedbackId, isPublic);
  }

  async addHelpRequestResponse(requestId: string, response: string, consultantId?: string) {
    if (this.mode === 'real' && consultantId) {
      return this.realService.addHelpRequestResponse(requestId, response, consultantId);
    }
    return this.fakeService.addHelpRequestResponse(requestId, response);
  }

  async createTrigger(trigger: any, consultantId?: string) {
    if (this.mode === 'real' && consultantId) {
      return this.realService.createTrigger({
        ...trigger,
        consultant_id: consultantId
      });
    }
    return this.fakeService.addTrigger(trigger);
  }

  async getReaderById(readerId: string) {
    if (this.mode === 'real') {
      // Would need to implement this in real service
      appLog('DataServiceManager', 'getReaderById not implemented for real data yet');
      return null;
    }
    return this.fakeService.getReaderById(readerId);
  }

  // Fake data specific methods (only work in fake mode)
  refreshData() {
    if (this.mode === 'fake') {
      this.fakeService.refreshData();
    }
  }

  initializeFakeData() {
    this.fakeService.initializeFakeData();
  }

  // Additional methods that components might expect
  async getVerifiedReaders() {
    if (this.mode === 'real') {
      // For real mode, this would need consultant context
      appLog('DataServiceManager', 'getVerifiedReaders called in real mode - need consultant ID');
      return [];
    }
    return this.fakeService.getAllReaders().filter(reader => reader.is_verified);
  }

  async getReaders() {
    return this.getAllReaders();
  }

  async getAllReadersWithStats() {
    if (this.mode === 'real') {
      appLog('DataServiceManager', 'getAllReadersWithStats called in real mode - need consultant ID');
      return [];
    }
    return this.fakeService.getAllReaders();
  }

  // Service interface methods for compatibility
  getConsultantService() {
    return {
      getVerifiedReaders: () => this.getVerifiedReaders(),
      getAllReaders: () => this.getAllReaders(),
      getReaders: () => this.getReaders(),
      getAssignedReaders: (consultantId?: string) => this.getAssignedReaders(consultantId),
      getDashboardData: (consultantId?: string) => this.getDashboardData(consultantId),
    };
  }

  getAnalyticsService() {
    return {
      getDashboardStats: (consultantId?: string) => this.getDashboardStats(consultantId),
    };
  }

  getRealtimeAuthService() {
    return {
      // Placeholder for real-time auth service methods
    };
  }

  getActivityTrackingService() {
    return {
      // Placeholder for activity tracking service methods
    };
  }
}

// Export singleton instance
export const dataServiceManager = DataServiceManager.getInstance();
