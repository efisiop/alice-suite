// src/services/index.ts
// This file ensures all services are loaded and registered

import { appLog } from '../components/LogViewer';

// Export service registry and initializers
export * from './serviceRegistry';
export * from './serviceInitializers';

// Export service interfaces - commented out to avoid circular dependencies
// export * from '../types/serviceInterfaces';
// Import interfaces directly from their source files instead

// Simplified initialization function
export const initializeServices = async () => {
  appLog('Services', 'Initializing services (simplified)', 'info');
  console.log('Services: Initializing services (simplified)');

  try {
    // Just ensure Supabase client is ready
    console.log('Services: Initializing Supabase client');
    const { getSupabaseClient } = await import('./supabaseClient');
    await getSupabaseClient();
    console.log('Services: Supabase client initialized');

    appLog('Services', 'Services initialized successfully', 'success');
    console.log('Services: Services initialized successfully');
    return true;
  } catch (error: any) {
    appLog('Services', `Error initializing services: ${error.message}`, 'error');
    console.error('Services: Error initializing services:', error);
    return false;
  }
};

// For backward compatibility
import { initManager } from './initManager';
export { initManager };
