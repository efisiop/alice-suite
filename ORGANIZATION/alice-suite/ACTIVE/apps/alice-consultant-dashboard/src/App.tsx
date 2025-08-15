import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './styles/accessibility.css';

// Components
import { AccessibilityProvider } from './components/common/AccessibilityMenu';
import SnackbarProvider from './components/common/SnackbarProvider';
import SkipToContent from './components/common/SkipToContent';
import EnhancedAppHeader from './components/UI/EnhancedAppHeader';

// Pages
import ConsultantDashboard from './pages/Consultant/ConsultantDashboard';
import ConsultantLoginPage from './pages/Consultant/ConsultantLoginPage';
import SendPromptPage from './pages/Consultant/SendPromptPage';
import HelpRequestsPage from './pages/Consultant/HelpRequestsPage';
import FeedbackManagementPage from './pages/Consultant/FeedbackManagementPage';
import ReaderManagementPage from './pages/Consultant/ReaderManagementPage';
import AnalyticsReportsPage from './pages/Consultant/AnalyticsReportsPage';
import ReaderActivityInsightsPage from './pages/Consultant/ReaderActivityInsightsPage';
import AssignReadersPage from './pages/Consultant/AssignReadersPage';
import ConsultantProtectedRoute from './components/common/ConsultantProtectedRoute';

// Services
import { initializeServices } from './services';
// import { AppError } from './utils/errorHandling';
import { appLog } from './components/LogViewer';
import { ConsultantAuthProvider } from './contexts/ConsultantAuthContext';
import { EnhancedAuthProvider } from './contexts/EnhancedAuthContext';

function App() {
  console.log('App.tsx: Component rendering');
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        appLog('App', 'Initializing services', 'info');
        console.log('App: Initializing services - VERBOSE DEBUG');

        // Log environment variables (without exposing sensitive data)
        console.log('App: Environment check - VITE_SUPABASE_URL exists:', !!import.meta.env.VITE_SUPABASE_URL);
        console.log('App: Environment check - VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

        // Initialize services
        console.log('App: About to call initializeServices()');
        const result = await initializeServices();
        console.log('App: Services initialization result:', result);

        // Even if initializeServices returns false, we'll continue
        // This is to handle the case where services are already initialized
        console.log('App: Setting initialized state to true');
        setInitialized(true);
        appLog('App', 'Services initialized successfully', 'success');
        console.log('App: Services initialized successfully');
      } catch (err: any) {
        console.error('App: Failed to initialize services:', err);
        console.error('App: Error details:', err.stack || 'No stack trace available');
        appLog('App', `Failed to initialize services: ${err.message}`, 'error');
        setError('Failed to initialize application. Please check the console for details.');
      }
    };

    console.log('App: Running init effect');
    init();
  }, []);

  if (error) {
    return (
      <div className="error-container">
        <h2>Initialization Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="loading-container">
        <h2>Initializing Application...</h2>
        <p>Please wait while the services are being initialized.</p>
      </div>
    );
  }

  const AppContent = () => (
    <Router>
      <div className="App">
        <SkipToContent contentId="main-content" />
        <EnhancedAppHeader />
        <main id="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/consultant/login" element={<ConsultantLoginPage />} />
            
            {/* Legacy routes - redirect to login */}
            <Route path="/login" element={<Navigate to="/consultant/login" replace />} />
            <Route path="/register" element={<Navigate to="/consultant/login" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/consultant/login" replace />} />
            <Route path="/bypass" element={<Navigate to="/consultant/login" replace />} />
            <Route path="/verify" element={<Navigate to="/consultant/login" replace />} />
            
            {/* Protected consultant routes */}
            <Route path="/" element={
              <ConsultantProtectedRoute>
                <ConsultantDashboard />
              </ConsultantProtectedRoute>
            } />
            
            <Route path="/consultant/send-prompt" element={
              <ConsultantProtectedRoute>
                <SendPromptPage />
              </ConsultantProtectedRoute>
            } />
            
            <Route path="/consultant/help-requests" element={
              <ConsultantProtectedRoute>
                <HelpRequestsPage />
              </ConsultantProtectedRoute>
            } />
            
            <Route path="/consultant/feedback" element={
              <ConsultantProtectedRoute>
                <FeedbackManagementPage />
              </ConsultantProtectedRoute>
            } />
            
            <Route path="/consultant/readers" element={
              <ConsultantProtectedRoute>
                <ReaderManagementPage />
              </ConsultantProtectedRoute>
            } />
            
            <Route path="/consultant/reports" element={
              <ConsultantProtectedRoute>
                <AnalyticsReportsPage />
              </ConsultantProtectedRoute>
            } />
            
            <Route path="/consultant/reading-insights" element={
              <ConsultantProtectedRoute>
                <ReaderActivityInsightsPage />
              </ConsultantProtectedRoute>
            } />
            
            <Route path="/consultant/assign-readers" element={
              <ConsultantProtectedRoute>
                <AssignReadersPage />
              </ConsultantProtectedRoute>
            } />
            
            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/consultant/login" replace />} />
          </Routes>
        </main>
        {/* <RoleBasedNavigation /> */}
      </div>
    </Router>
  );

  // Wrap with providers
  return (
    <EnhancedAuthProvider>
      <ConsultantAuthProvider>
        <AccessibilityProvider>
          <SnackbarProvider>
            <AppContent />
          </SnackbarProvider>
        </AccessibilityProvider>
      </ConsultantAuthProvider>
    </EnhancedAuthProvider>
  );
}

export default App;
