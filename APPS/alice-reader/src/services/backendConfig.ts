// src/services/backendConfig.ts
// This file provides configuration for backend services

/**
 * BACKEND CONFIGURATION
 *
 * Configuration for backend services - always use real Supabase backend
 * Mock data has been disabled to ensure only real data flows through the system
 */
export const useMockBackend = false;

// For backward compatibility (used in other parts of the codebase)
export const isBackendAvailable = !useMockBackend;

// Log the backend status for debugging
console.log(`Backend status: Using ${useMockBackend ? 'MOCK' : 'REAL Supabase'} backend`);
