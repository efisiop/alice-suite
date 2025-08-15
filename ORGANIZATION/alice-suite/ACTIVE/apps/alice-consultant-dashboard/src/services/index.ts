// src/services/index.ts
// This file ensures all services are loaded and registered

import { appLog } from '../components/LogViewer';

// Export service registry and initializers
export * from './serviceRegistry';
export * from './serviceInitializers';

// Simplified initialization function for fake data mode
export const initializeServices = async () => {
  appLog('Services', 'Initializing services (fake data mode)', 'info');
  console.log('Services: Initializing services (fake data mode)');

  try {
    // Initialize fake data service instead of Supabase
    console.log('Services: Initializing fake data service');
    const { fakeDataService } = await import('./fakeDataService');
    
    // Initialize fake data
    fakeDataService.initializeFakeData();
    console.log('Services: Fake data service initialized');

    appLog('Services', 'Services initialized successfully (fake data mode)', 'success');
    console.log('Services: Services initialized successfully (fake data mode)');
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
