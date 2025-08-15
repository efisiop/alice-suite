// src/services/index.ts
// This file ensures all services are loaded and registered

import { appLog } from '../components/LogViewer';

// Export service registry and initializers
export * from './serviceRegistry';
export * from './serviceInitializers';

// Enhanced initialization function with real/fake data mode selection
export const initializeServices = async () => {
  appLog('Services', 'Initializing services with data service manager', 'info');
  console.log('Services: Initializing services with data service manager');

  try {
    // First, register all service initializers
    const { initializeServices: registerServices } = await import('./serviceInitializers');
    registerServices();
    
    // Initialize data service manager
    const { dataServiceManager } = await import('./dataServiceManager');
    
    const mode = dataServiceManager.getMode();
    appLog('Services', `Data service mode: ${mode}`, 'info');
    console.log(`Services: Data service mode: ${mode}`);

    if (mode === 'fake') {
      // Initialize fake data
      dataServiceManager.initializeFakeData();
      console.log('Services: Fake data service initialized');
    } else {
      // Real data mode - services are initialized on-demand
      console.log('Services: Real data service ready');
    }

    appLog('Services', `Services initialized successfully (${mode} data mode)`, 'success');
    console.log(`Services: Services initialized successfully (${mode} data mode)`);
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
