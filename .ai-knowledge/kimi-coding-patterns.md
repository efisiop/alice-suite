# Kimi Coding Patterns & Best Practices

## Overview
This document contains coding patterns and best practices inspired by Kimi's expert coding approach. Use these patterns when implementing features in the Alice Suite project.

## Core Principles

### 1. Complete Implementations
- Always provide full, working code
- Include all necessary imports and dependencies
- Assume the user wants a complete solution, not snippets

### 2. Production-Ready Code
- Comprehensive error handling
- Proper logging and monitoring
- Configuration management
- Defensive programming practices

### 3. Modern Best Practices
- Use modern language features
- Follow SOLID principles
- Include unit tests
- Consider edge cases

## Template Patterns

### Robust Service Template
```typescript
class RobustService {
  private config: ServiceConfig;
  private logger: Logger;
  private metrics: Metrics;

  constructor(config: ServiceConfig) {
    this.config = this.validateConfig(config);
    this.logger = this.setupLogging();
    this.metrics = this.setupMetrics();
  }

  private validateConfig(config: ServiceConfig): ServiceConfig {
    // Implementation with proper validation
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    return config;
  }

  private setupLogging(): Logger {
    // Structured logging setup
    return new Logger({
      level: 'info',
      format: 'json'
    });
  }

  private setupMetrics(): Metrics {
    // Metrics setup
    return new Metrics();
  }

  async execute(...args: any[]): Promise<any> {
    try {
      const timer = this.metrics.startTimer('operation');
      
      const result = await this.executeSafe(...args);
      
      timer.stop();
      this.logger.info('Operation completed', { result });
      
      return result;
    } catch (error) {
      this.logger.error('Operation failed', { error: error.message });
      throw error;
    }
  }

  private async executeSafe(...args: any[]): Promise<any> {
    // Actual implementation
  }
}
```

### Error Handling Pattern
```typescript
class ErrorHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw new Error(`Operation failed after ${maxRetries} attempts: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError!;
  }
}
```

## Response Structure

### 1. Overview
Brief explanation of the approach and why it's chosen

### 2. Implementation
Complete code with inline comments explaining the "why"

### 3. Usage
How to use the code with examples

### 4. Testing
Unit tests or usage examples

### 5. Edge Cases
What to watch out for and how to handle them

## Usage in Cursor

When asking Claude for code, use this enhanced prompt structure:

```
Following Kimi's expert coding practices, implement a [feature]. Requirements:
- Complete, production-ready code
- Comprehensive error handling
- Proper logging and monitoring
- Unit tests
- Usage examples
- Consider edge cases like [specific scenarios]

Reference the patterns in .ai-knowledge/ for style and structure.
```

## Custom Commands

Use these commands in Cursor:

- `@complete_implementation` - Full production-ready implementation
- `@refactor_robust` - Robust refactoring with error handling
- `@kimi_style` - Kimi-inspired coding approach 