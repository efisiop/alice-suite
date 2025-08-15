import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './styles/accessibility.css';

// Components
import { AccessibilityProvider } from './components/common/AccessibilityMenu';
import SnackbarProvider from './components/common/SnackbarProvider';
import SkipToContent from './components/common/SkipToContent';
import { RouteGuard } from './components/common/RouteGuard';
import EnhancedAppHeader from './components/UI/EnhancedAppHeader';

// Pages

import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import VerifyPage from './pages/Auth/VerifyPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ConsultantDashboard from './pages/Consultant/ConsultantDashboard';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import ConsultantLayout from './components/Consultant/ConsultantLayout';

// Services
import { initializeServices } from './services';
// import { AppError } from './utils/errorHandling';
import { appLog } from './components/LogViewer';
import { AuthProvider } from './contexts/AuthContext';

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
            {/* Public Routes */}
            <Route path="/login" element={<RouteGuard routeType="public"><LoginPage /></RouteGuard>} />
            <Route path="/register" element={<RouteGuard routeType="public"><RegisterPage /></RouteGuard>} />
            <Route path="/forgot-password" element={<RouteGuard routeType="public"><ForgotPasswordPage /></RouteGuard>} />

            {/* Auth Routes */}
            <Route path="/verify" element={<RouteGuard routeType="auth"><VerifyPage /></RouteGuard>} />

            {/* Consultant Dashboard - Main functionality */}
            <Route 
              path="/consultant"
              element={
                <Navigate to="/" replace />
              }
            />
            <Route 
              path="/consultant/profile"
              element={
                <RouteGuard routeType="verified">
                  <ProtectedRoute requiredRole="consultant">
                    <ConsultantLayout>
                      <div>PROFILE PAGE</div>
                    </ConsultantLayout>
                  </ProtectedRoute>
                </RouteGuard>
              }
            />
            <Route 
              path="/"
              element={
                <RouteGuard routeType="verified">
                  <ProtectedRoute requiredRole="consultant">
                    <ConsultantLayout>
                      <ConsultantDashboard />
                    </ConsultantLayout>
                  </ProtectedRoute>
                </RouteGuard>
              } 
            />
          </Routes>
        </main>
        {/* <RoleBasedNavigation /> */}
      </div>
    </Router>
  );

  // Wrap with providers
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <SnackbarProvider>
          <AppContent />
        </SnackbarProvider>
      </AccessibilityProvider>
    </AuthProvider>
  );
}

export default App;
