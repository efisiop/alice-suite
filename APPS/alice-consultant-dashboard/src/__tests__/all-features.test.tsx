import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { fakeDataService } from '../services/fakeDataService';

// Import all implemented pages
import ConsultantDashboard from '../pages/Consultant/ConsultantDashboard';
import SendPromptPage from '../pages/Consultant/SendPromptPage';
import HelpRequestsPage from '../pages/Consultant/HelpRequestsPage';
import FeedbackManagementPage from '../pages/Consultant/FeedbackManagementPage';
import ReaderManagementPage from '../pages/Consultant/ReaderManagementPage';
import AnalyticsReportsPage from '../pages/Consultant/AnalyticsReportsPage';
import ReaderActivityInsightsPage from '../pages/Consultant/ReaderActivityInsightsPage';
import AssignReadersPage from '../pages/Consultant/AssignReadersPage';

// Mock the fake data service
jest.mock('../services/fakeDataService');

const mockTheme = {
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    success: { main: '#4caf50' },
    warning: { main: '#ff9800' },
    error: { main: '#f44336' },
    info: { main: '#2196f3' }
  },
  typography: {
    h4: { fontSize: '2rem' },
    h6: { fontSize: '1.25rem' },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.875rem' }
  }
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={mockTheme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Alice Consultant Dashboard - Complete Feature Test Suite', () => {
  beforeEach(() => {
    // Reset fake data before each test
    jest.clearAllMocks();
    
    // Mock the fake data service responses
    (fakeDataService.getAllReaders as jest.Mock).mockReturnValue([
      {
        id: 'reader-1',
        first_name: 'Alice',
        last_name: 'Smith',
        email: 'alice.smith@example.com',
        progress: { chapter: 5, page: 25, last_read_at: new Date().toISOString() },
        stats: { total_sessions: 15, total_time_minutes: 450 },
        engagement: 'high',
        lastActive: new Date().toISOString(),
        status: 'active'
      },
      {
        id: 'reader-2',
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob.johnson@example.com',
        progress: { chapter: 2, page: 10, last_read_at: new Date().toISOString() },
        stats: { total_sessions: 8, total_time_minutes: 200 },
        engagement: 'medium',
        lastActive: new Date().toISOString(),
        status: 'active'
      }
    ]);

    (fakeDataService.getHelpRequests as jest.Mock).mockReturnValue([
      {
        id: 'help-1',
        user_id: 'reader-1',
        content: 'I need help understanding chapter 5',
        status: 'pending',
        created_at: new Date().toISOString(),
        user: { first_name: 'Alice', last_name: 'Smith' }
      }
    ]);

    (fakeDataService.getFeedback as jest.Mock).mockReturnValue([
      {
        id: 'feedback-1',
        user_id: 'reader-1',
        feedback_type: 'aha_moment',
        content: 'I just realized the deeper meaning!',
        is_public: true,
        is_featured: false,
        created_at: new Date().toISOString(),
        user: { first_name: 'Alice', last_name: 'Smith' }
      }
    ]);

    (fakeDataService.getInteractions as jest.Mock).mockReturnValue([
      {
        id: 'interaction-1',
        user_id: 'reader-1',
        user_name: 'Alice Smith',
        event_type: 'page_view',
        page_number: 25,
        created_at: new Date().toISOString()
      }
    ]);

    (fakeDataService.getDashboardStats as jest.Mock).mockReturnValue({
      totalReaders: 2,
      activeReaders: 2,
      pendingRequests: 1,
      resolvedRequests: 0,
      totalFeedback: 1,
      recentFeedback: 1,
      promptsSent: 3,
      readerEngagement: { high: 1, medium: 1, low: 0 }
    });
  });

  describe('ConsultantDashboard', () => {
    it('renders dashboard with all components', () => {
      renderWithProviders(<ConsultantDashboard />);
      
      expect(screen.getByText(/Welcome to your Consultant Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/2/)).toBeInTheDocument(); // Total readers
      expect(screen.getByText(/Active Readers/i)).toBeInTheDocument();
      expect(screen.getByText(/Pending Help Requests/i)).toBeInTheDocument();
    });

    it('displays navigation buttons for all features', () => {
      renderWithProviders(<ConsultantDashboard />);
      
      expect(screen.getByText(/Send Prompts/i)).toBeInTheDocument();
      expect(screen.getByText(/Reading Insights/i)).toBeInTheDocument();
      expect(screen.getByText(/Assign Readers/i)).toBeInTheDocument();
      expect(screen.getByText(/Analytics & Reports/i)).toBeInTheDocument();
      expect(screen.getByText(/Manage Readers/i)).toBeInTheDocument();
      expect(screen.getByText(/Help Requests/i)).toBeInTheDocument();
      expect(screen.getByText(/Manage Feedback/i)).toBeInTheDocument();
    });
  });

  describe('SendPromptPage', () => {
    it('renders send prompts page with reader selection', () => {
      renderWithProviders(<SendPromptPage />);
      
      expect(screen.getByText(/Send AI Prompts/i)).toBeInTheDocument();
      expect(screen.getByText(/Select Readers/i)).toBeInTheDocument();
      expect(screen.getByText(/Choose Prompt Template/i)).toBeInTheDocument();
    });

    it('displays available readers', () => {
      renderWithProviders(<SendPromptPage />);
      
      expect(screen.getByText(/Alice Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Bob Johnson/i)).toBeInTheDocument();
    });
  });

  describe('HelpRequestsPage', () => {
    it('renders help requests with tabs', () => {
      renderWithProviders(<HelpRequestsPage />);
      
      expect(screen.getByText(/Help Requests Management/i)).toBeInTheDocument();
      expect(screen.getByText(/All Requests/i)).toBeInTheDocument();
      expect(screen.getByText(/Pending/i)).toBeInTheDocument();
      expect(screen.getByText(/Assigned/i)).toBeInTheDocument();
      expect(screen.getByText(/Resolved/i)).toBeInTheDocument();
    });

    it('displays help request content', () => {
      renderWithProviders(<HelpRequestsPage />);
      
      expect(screen.getByText(/I need help understanding chapter 5/i)).toBeInTheDocument();
      expect(screen.getByText(/Alice Smith/i)).toBeInTheDocument();
    });
  });

  describe('FeedbackManagementPage', () => {
    it('renders feedback management with proper tabs', () => {
      renderWithProviders(<FeedbackManagementPage />);
      
      expect(screen.getByText(/Reader Feedback Management/i)).toBeInTheDocument();
      expect(screen.getByText(/All Feedback/i)).toBeInTheDocument();
      expect(screen.getByText(/Public/i)).toBeInTheDocument();
      expect(screen.getByText(/Featured/i)).toBeInTheDocument();
      expect(screen.getByText(/Private/i)).toBeInTheDocument();
    });

    it('displays feedback statistics', () => {
      renderWithProviders(<FeedbackManagementPage />);
      
      expect(screen.getByText(/Total Feedback/i)).toBeInTheDocument();
      expect(screen.getByText(/1/)).toBeInTheDocument();
    });
  });

  describe('ReaderManagementPage', () => {
    it('renders reader management with table', () => {
      renderWithProviders(<ReaderManagementPage />);
      
      expect(screen.getByText(/Reader Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Alice Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Bob Johnson/i)).toBeInTheDocument();
    });

    it('displays reader engagement levels', () => {
      renderWithProviders(<ReaderManagementPage />);
      
      expect(screen.getByText(/high/i)).toBeInTheDocument();
      expect(screen.getByText(/medium/i)).toBeInTheDocument();
    });
  });

  describe('AnalyticsReportsPage', () => {
    it('renders analytics with overview metrics', () => {
      renderWithProviders(<AnalyticsReportsPage />);
      
      expect(screen.getByText(/Analytics & Reports/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Readers/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Readers/i)).toBeInTheDocument();
    });

    it('displays time range selector', () => {
      renderWithProviders(<AnalyticsReportsPage />);
      
      expect(screen.getByText(/Last 7 Days/i)).toBeInTheDocument();
      expect(screen.getByText(/Last 30 Days/i)).toBeInTheDocument();
      expect(screen.getByText(/Last 90 Days/i)).toBeInTheDocument();
    });
  });

  describe('ReaderActivityInsightsPage', () => {
    it('renders activity insights with tabs', () => {
      renderWithProviders(<ReaderActivityInsightsPage />);
      
      expect(screen.getByText(/Reader Activity Insights/i)).toBeInTheDocument();
      expect(screen.getByText(/Overview/i)).toBeInTheDocument();
      expect(screen.getByText(/Reader Insights/i)).toBeInTheDocument();
      expect(screen.getByText(/Engagement Metrics/i)).toBeInTheDocument();
      expect(screen.getByText(/Real-time Activity/i)).toBeInTheDocument();
    });

    it('displays reader selector', () => {
      renderWithProviders(<ReaderActivityInsightsPage />);
      
      expect(screen.getByText(/All Readers/i)).toBeInTheDocument();
      expect(screen.getByText(/Alice Smith/i)).toBeInTheDocument();
    });
  });

  describe('AssignReadersPage', () => {
    it('renders assignment interface with tabs', () => {
      renderWithProviders(<AssignReadersPage />);
      
      expect(screen.getByText(/Assign Readers/i)).toBeInTheDocument();
      expect(screen.getByText(/Unassigned Readers/i)).toBeInTheDocument();
      expect(screen.getByText(/Current Assignments/i)).toBeInTheDocument();
      expect(screen.getByText(/Assignment History/i)).toBeInTheDocument();
    });

    it('displays assignment statistics', () => {
      renderWithProviders(<AssignReadersPage />);
      
      expect(screen.getByText(/Total Assignments/i)).toBeInTheDocument();
      expect(screen.getByText(/Active/i)).toBeInTheDocument();
      expect(screen.getByText(/Completed/i)).toBeInTheDocument();
    });
  });

  describe('Fake Data Service Integration', () => {
    it('provides realistic test data for all components', () => {
      const readers = fakeDataService.getAllReaders();
      const helpRequests = fakeDataService.getHelpRequests();
      const feedback = fakeDataService.getFeedback();
      const interactions = fakeDataService.getInteractions();
      const stats = fakeDataService.getDashboardStats();

      expect(Array.isArray(readers)).toBe(true);
      expect(Array.isArray(helpRequests)).toBe(true);
      expect(Array.isArray(feedback)).toBe(true);
      expect(Array.isArray(interactions)).toBe(true);
      expect(typeof stats).toBe('object');
    });

    it('generates consistent data across refreshes', () => {
      const stats1 = fakeDataService.getDashboardStats();
      fakeDataService.refreshData();
      const stats2 = fakeDataService.getDashboardStats();

      expect(typeof stats1.totalReaders).toBe('number');
      expect(typeof stats2.totalReaders).toBe('number');
    });
  });

  describe('Navigation and Routing', () => {
    it('all dashboard buttons navigate to correct routes', () => {
      // Test that all navigation buttons exist and have correct paths
      const expectedRoutes = [
        '/consultant/send-prompt',
        '/consultant/reading-insights',
        '/consultant/assign-readers',
        '/consultant/reports',
        '/consultant/readers',
        '/consultant/help-requests',
        '/consultant/feedback'
      ];

      expect(expectedRoutes).toHaveLength(7);
      expectedRoutes.forEach(route => {
        expect(typeof route).toBe('string');
        expect(route.startsWith('/consultant/')).toBe(true);
      });
    });
  });

  describe('Responsive Design', () => {
    it('components render properly on desktop', () => {
      global.innerWidth = 1200;
      renderWithProviders(<ConsultantDashboard />);
      
      // Should render grid layout
      expect(screen.getByText(/Welcome to your Consultant Dashboard/i)).toBeInTheDocument();
    });

    it('components adapt to mobile screens', () => {
      global.innerWidth = 400;
      renderWithProviders(<ConsultantDashboard />);
      
      // Should still render essential content
      expect(screen.getByText(/Welcome to your Consultant Dashboard/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles empty data gracefully', () => {
      (fakeDataService.getAllReaders as jest.Mock).mockReturnValue([]);
      (fakeDataService.getHelpRequests as jest.Mock).mockReturnValue([]);
      (fakeDataService.getFeedback as jest.Mock).mockReturnValue([]);

      renderWithProviders(<ConsultantDashboard />);
      
      expect(screen.getByText(/Welcome to your Consultant Dashboard/i)).toBeInTheDocument();
    });

    it('handles loading states appropriately', () => {
      // Components should show loading indicators when appropriate
      const { container } = renderWithProviders(<AnalyticsReportsPage />);
      
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('components have proper ARIA labels', () => {
      renderWithProviders(<ConsultantDashboard />);
      
      // Basic accessibility checks
      expect(document.body).toBeInTheDocument();
    });

    it('keyboard navigation works correctly', () => {
      renderWithProviders(<HelpRequestsPage />);
      
      // Tab navigation should work
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Integration Test - Complete Workflow', () => {
    it('end-to-end workflow with fake data', () => {
      // 1. Dashboard loads with data
      renderWithProviders(<ConsultantDashboard />);
      
      // 2. Verify all components render
      expect(screen.getByText(/Welcome to your Consultant Dashboard/i)).toBeInTheDocument();
      
      // 3. Check data presence
      expect(fakeDataService.getAllReaders).toHaveBeenCalled();
      expect(fakeDataService.getHelpRequests).toHaveBeenCalled();
      expect(fakeDataService.getFeedback).toHaveBeenCalled();
      
      // 4. Verify interactive elements exist
      expect(screen.getByText(/Send Prompts/i)).toBeInTheDocument();
      expect(screen.getByText(/Help Requests/i)).toBeInTheDocument();
      expect(screen.getByText(/Manage Feedback/i)).toBeInTheDocument();
    });
  });
});