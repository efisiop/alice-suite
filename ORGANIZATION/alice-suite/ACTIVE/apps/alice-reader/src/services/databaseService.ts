import { dbClient } from '@alice-suite/api-client';
import {
  getCurrentSchemaVersion,
  applyMigrations,
  rollbackMigrations,
  verifySchema,
  getMigrationFiles,
  getMigrationSql
} from '../utils/migrationUtils';
import { appLog } from '../components/LogViewer';
import { registry } from '@services/serviceRegistry';
import { initManager } from './initManager';
import { handleServiceError } from '../utils/errorHandling';
import { ErrorCode, AppError } from '../utils/errorHandling';

/**
 * Database Service Interface
 */
export interface DatabaseServiceInterface {
  getCurrentSchemaVersion: () => Promise<number>;
  getAvailableMigrations: () => any[];
  applyMigrations: (targetVersion: number) => Promise<boolean>;
  rollbackMigrations: (targetVersion: number) => Promise<boolean>;
  verifySchema: () => Promise<boolean>;
  getTableInfo: () => Promise<{ data: any; error: any }>;
  executeSQL: (sql: string) => Promise<{ success: boolean; error: any }>;
  checkDatabaseConnection: () => Promise<{ connected: boolean; error: any }>;
  getSchemaVersionHistory: () => Promise<{ data: any; error: any }>;
}

/**
 * Create Database Service
 *
 * Factory function to create the database service implementation
 */
const createDatabaseService = async (): Promise<DatabaseServiceInterface> => {
  appLog('DatabaseService', 'Creating database service', 'info');

  // Create service implementation
  const databaseService: DatabaseServiceInterface = {
    /**
     * Get the current schema version
     */
    getCurrentSchemaVersion: () => dbClient.getSchemaVersion(),

    /**
     * Get all available migrations
     */
    getAvailableMigrations: () => migrations,

    /**
     * Apply migrations up to the target version
     */
    applyMigrations: (targetVersion: number) => dbClient.applyMigrations(targetVersion),

    /**
     * Roll back migrations to the target version
     */
    rollbackMigrations: (targetVersion: number) => dbClient.rollbackMigrations(targetVersion),

    /**
     * Verify the database schema against expected state
     */
    verifySchema: () => dbClient.verifySchema(),

    /**
     * Get information about all tables in the database
     */
    getTableInfo: async () => {
      try {
        appLog('DatabaseService', 'Getting table information', 'info');
        const result = await dbClient.getTableInfo();
        return result;
      } catch (error) {
        appLog('DatabaseService', 'Exception in getTableInfo', 'error', error);
        return { data: null, error };
      }
    },

    /**
     * Execute a SQL query directly
     * WARNING: This is potentially dangerous and should only be used by administrators
     */
    executeSQL: async (sql: string) => {
      try {
        appLog('DatabaseService', 'Executing SQL', 'info');
        const result = await dbClient.executeSQL(sql);
        return result;
      } catch (error) {
        appLog('DatabaseService', 'Exception in executeSQL', 'error', error);
        return { success: false, error };
      }
    },

    /**
     * Check if the database is accessible
     */
    checkDatabaseConnection: async () => {
      try {
        appLog('DatabaseService', 'Checking database connection', 'info');
        const result = await dbClient.checkConnection();
        return result;
      } catch (error) {
        appLog('DatabaseService', 'Exception in checkDatabaseConnection', 'error', error);
        return { connected: false, error };
      }
    },

    /**
     * Get the database schema version history
     */
    getSchemaVersionHistory: async () => {
      try {
        appLog('DatabaseService', 'Getting schema version history', 'info');
        const result = await dbClient.getSchemaVersionHistory();
        return result;
      } catch (error) {
        appLog('DatabaseService', 'Exception in getSchemaVersionHistory', 'error', error);
        return { data: null, error };
      }
    }
  };

  return databaseService;
};

// Register initialization function
// The dependencies are automatically loaded from SERVICE_DEPENDENCIES
initManager.register('databaseService', async () => {
  const service = await createDatabaseService();
  registry.register('databaseService', service);
});

// Create backward-compatible exports
export const getCurrentSchemaVersion = async () => {
  const service = await registry.getOrInitialize<DatabaseServiceInterface>('databaseService', initManager);
  return service.getCurrentSchemaVersion();
};

export const getAvailableMigrations = async () => {
  const service = await registry.getOrInitialize<DatabaseServiceInterface>('databaseService', initManager);
  return service.getAvailableMigrations();
};

export const applyMigrations = async (targetVersion: number) => {
  const service = await registry.getOrInitialize<DatabaseServiceInterface>('databaseService', initManager);
  return service.applyMigrations(targetVersion);
};

export const rollbackMigrations = async (targetVersion: number) => {
  const service = await registry.getOrInitialize<DatabaseServiceInterface>('databaseService', initManager);
  return service.rollbackMigrations(targetVersion);
};

export const verifySchema = async () => {
  const service = await registry.getOrInitialize<DatabaseServiceInterface>('databaseService', initManager);
  return service.verifySchema();
};

export const getTableInfo = async () => {
  const service = await registry.getOrInitialize<DatabaseServiceInterface>('databaseService', initManager);
  return service.getTableInfo();
};

export const executeSQL = async (sql: string) => {
  const service = await registry.getOrInitialize<DatabaseServiceInterface>('databaseService', initManager);
  return service.executeSQL(sql);
};

export const checkDatabaseConnection = async () => {
  const service = await registry.getOrInitialize<DatabaseServiceInterface>('databaseService', initManager);
  return service.checkDatabaseConnection();
};

export const getSchemaVersionHistory = async () => {
  const service = await registry.getOrInitialize<DatabaseServiceInterface>('databaseService', initManager);
  return service.getSchemaVersionHistory();
};

// For backward compatibility
export const getDatabaseService = async () => {
  return registry.getOrInitialize<DatabaseServiceInterface>('databaseService', initManager);
};

// Default export for backward compatibility
export default {
  getCurrentSchemaVersion,
  getAvailableMigrations,
  applyMigrations,
  rollbackMigrations,
  verifySchema,
  getTableInfo,
  executeSQL,
  checkDatabaseConnection,
  getSchemaVersionHistory,
  getDatabaseService
};
