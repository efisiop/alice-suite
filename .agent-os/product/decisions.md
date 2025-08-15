# Alice Suite - Technical Decisions Log

## Architecture Decisions

### ADR-001: Monorepo Structure
**Date**: 2025-01-27  
**Status**: ✅ Implemented  
**Decision**: Adopted pnpm workspaces for monorepo structure  
**Rationale**: 
- Code sharing between alice-reader and alice-consultant-dashboard
- Single source of truth for types and utilities
- Simplified dependency management
- Better development experience with shared tooling

**Implementation**:
- Root workspace with `apps/` and `packages/` directories
- Shared `@alice-suite/api-client` package
- pnpm workspace configuration
- TypeScript path mapping for shared packages

### ADR-002: Supabase as Backend
**Date**: 2024-12-01  
**Status**: ✅ Implemented  
**Decision**: Use Supabase for backend services  
**Rationale**: 
- Rapid development with built-in auth, database, and real-time features
- PostgreSQL database with real-time subscriptions
- Built-in Row Level Security (RLS)
- Edge Functions for serverless compute

### ADR-003: React Context + Custom Hooks
**Date**: 2024-12-01  
**Status**: ✅ Implemented  
**Decision**: Use React Context for state management  
**Rationale**: 
- Lightweight state management for current scale
- Easy to understand and maintain
- Good integration with TypeScript
- No external dependencies

### ADR-004: Material-UI (MUI)
**Date**: 2024-12-01  
**Status**: ✅ Implemented  
**Decision**: Use Material-UI for UI components  
**Rationale**: 
- Comprehensive component library
- Good TypeScript support
- Consistent design system
- Accessibility features built-in

### ADR-005: Vite Build Tool
**Date**: 2024-12-01  
**Status**: ✅ Implemented  
**Decision**: Use Vite for build tooling  
**Rationale**: 
- Fast development server
- Optimized production builds
- Good TypeScript support
- Modern ES modules approach

### ADR-006: WebSocket for Real-time Features
**Date**: 2024-12-01  
**Status**: ✅ Implemented  
**Decision**: Use WebSocket for real-time communication  
**Rationale**: 
- Real-time updates for consultant dashboard
- Live progress tracking
- Instant notifications
- Better user experience

### ADR-007: TypeScript for Type Safety
**Date**: 2024-12-01  
**Status**: ✅ Implemented  
**Decision**: Use TypeScript throughout the project  
**Rationale**: 
- Type safety across the entire codebase
- Better developer experience
- Reduced runtime errors
- Better IDE support

### ADR-008: Modular Services Architecture
**Date**: 2024-12-01  
**Status**: ✅ Implemented  
**Decision**: Use modular service architecture  
**Rationale**: 
- Separation of concerns
- Easy to test and maintain
- Reusable across applications
- Clear API boundaries

### ADR-009: Quiz System Implementation
**Date**: 2024-12-15  
**Status**: ✅ Implemented  
**Decision**: Implement AI-powered quiz system  
**Rationale**: 
- Enhances reading comprehension
- Provides immediate feedback
- Tracks learning progress
- Engages users actively

### ADR-010: Shared API Client Package
**Date**: 2025-01-27  
**Status**: ✅ Implemented  
**Decision**: Create shared `@alice-suite/api-client` package  
**Rationale**: 
- Eliminates code duplication between apps
- Centralized database and auth logic
- Consistent API patterns
- Better type safety across applications

## Technical Decisions

### TD-001: Database Schema Design
**Date**: 2024-12-01  
**Status**: ✅ Implemented  
**Decision**: Comprehensive PostgreSQL schema with RLS  
**Tables**: profiles, books, chapters, sections, reading_progress, reading_stats, ai_interactions, help_requests, user_feedback, consultant_triggers, consultant_actions_log

### TD-002: Authentication Flow
**Date**: 2024-12-01  
**Status**: ✅ Implemented  
**Decision**: Supabase Auth with custom profile management  
**Features**: Email/password auth, role-based access, profile management, password reset

### TD-003: AI Integration Strategy
**Date**: 2024-12-01  
**Status**: ✅ Implemented  
**Decision**: Edge Functions for AI processing  
**Features**: Vocabulary lookup, quiz generation, chat assistance, context-aware responses

### TD-004: Real-time Data Strategy
**Date**: 2024-12-01  
**Status**: ✅ Implemented  
**Decision**: Supabase real-time subscriptions  
**Features**: Live progress updates, consultant notifications, real-time chat

### TD-005: Quiz Component Architecture
**Date**: 2024-12-15  
**Status**: ✅ Implemented  
**Decision**: Modular quiz system with AI integration  
**Components**: QuizGenerator, QuizDisplay, QuizResults, AI-powered question generation

### TD-006: Monorepo Package Structure
**Date**: 2025-01-27  
**Status**: ✅ Implemented  
**Decision**: Organized package structure for shared code  
**Structure**:
```
packages/api-client/
├── src/
│   ├── types/          # Shared TypeScript types
│   ├── utils/          # Supabase client utilities
│   ├── auth/           # Authentication client
│   └── database/       # Database operations
└── dist/               # Built package
```

### TD-007: TypeScript Configuration
**Date**: 2025-01-27  
**Status**: ✅ Implemented  
**Decision**: Unified TypeScript configuration across monorepo  
**Features**: 
- Path mapping for shared packages
- Strict type checking
- Declaration file generation
- Build optimization

## Future Considerations

### FC-001: State Management Evolution
**Consideration**: Evaluate Redux Toolkit or Zustand for complex state  
**Timeline**: When state complexity increases  
**Criteria**: Multiple complex state slices, performance issues

### FC-002: Testing Strategy
**Consideration**: Implement comprehensive testing strategy  
**Timeline**: Next development phase  
**Tools**: Jest, React Testing Library, Playwright for E2E

### FC-003: Performance Optimization
**Consideration**: Implement advanced performance optimizations  
**Timeline**: When user base grows  
**Areas**: Code splitting, lazy loading, caching strategies

### FC-004: Mobile App Development
**Consideration**: Native mobile applications  
**Timeline**: Long-term vision  
**Options**: React Native, Flutter, or native iOS/Android

---

*This document tracks all major technical decisions and their rationale. Each decision includes the date, status, and reasoning behind the choice.* 