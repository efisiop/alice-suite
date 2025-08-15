# Alice Suite - Technical Stack

## 🏗️ **Architecture Overview**

Alice Suite is built as a **monorepo** using pnpm workspaces, containing two main applications and shared packages:

```
alice-suite-monorepo/
├── apps/
│   ├── alice-reader/              # Reader application
│   └── alice-consultant-dashboard/ # Consultant dashboard
├── packages/
│   └── api-client/               # Shared API client
└── package.json                  # Root workspace config
```

## 🛠️ **Core Technologies**

### **Frontend Framework**
- **React 18+** - Modern React with hooks and concurrent features
- **TypeScript 5.0+** - Type-safe development across all applications
- **Vite 4.0+** - Fast build tool and development server

### **UI Framework**
- **Material-UI (MUI) 5.0+** - Comprehensive component library
- **Emotion** - CSS-in-JS styling solution
- **Notistack** - Snackbar notifications management

### **Backend & Database**
- **Supabase** - Backend-as-a-Service platform
  - **PostgreSQL** - Primary database
  - **Row Level Security (RLS)** - Data access control
  - **Real-time Subscriptions** - Live data updates
  - **Edge Functions** - Serverless compute
  - **Authentication** - Built-in auth system
  - **Storage** - File storage solution

### **Package Management**
- **pnpm 10.7+** - Fast, disk space efficient package manager
- **Workspaces** - Monorepo management
- **Workspace Protocol** - Internal package linking

## 📦 **Shared Packages**

### **@alice-suite/api-client**
**Purpose**: Centralized API client for database and authentication operations

**Features**:
- Shared TypeScript types for database schema
- Authentication client with full auth functionality
- Database client with common CRUD operations
- Supabase client utilities with environment validation

**Structure**:
```
packages/api-client/
├── src/
│   ├── types/
│   │   ├── database.ts    # Database schema types
│   │   └── auth.ts        # Authentication types
│   ├── utils/
│   │   └── supabase.ts    # Supabase client setup
│   ├── auth/
│   │   └── auth-client.ts # Authentication operations
│   ├── database/
│   │   └── database-client.ts # Database operations
│   └── index.ts           # Main exports
├── dist/                  # Built package
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript config
└── tsup.config.ts         # Build configuration
```

**Build Tools**:
- **tsup** - Fast TypeScript bundler
- **TypeScript** - Type checking and compilation
- **ESLint** - Code linting

## 🏢 **Application Architecture**

### **Alice Reader Application**
**Purpose**: Main reading interface for users

**Key Features**:
- Reading interface with progress tracking
- AI-powered vocabulary assistance
- Quiz system for comprehension
- Real-time progress updates
- User feedback collection

**Technologies**:
- React 18 + TypeScript
- Material-UI components
- Vite build system
- Shared API client integration

### **Alice Consultant Dashboard**
**Purpose**: Management interface for consultants

**Key Features**:
- Reader management and monitoring
- Help request handling
- Real-time analytics
- Progress tracking
- Communication tools

**Technologies**:
- React 18 + TypeScript
- Material-UI components
- Vite build system
- Shared API client integration

## 🔧 **Development Tools**

### **Code Quality**
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

### **Testing**
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing (planned)

### **Build & Deployment**
- **Vite** - Frontend build tool
- **GitHub Actions** - CI/CD pipeline
- **Vercel/Netlify** - Hosting platforms

### **Development Experience**
- **VS Code** - Primary IDE
- **Cursor** - AI-powered code editor
- **pnpm** - Package management
- **TypeScript** - Type safety

## 🌐 **Environment & Configuration**

### **Environment Variables**
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Service Configuration
VITE_AI_SERVICE_URL=your_ai_service_url
VITE_AI_SERVICE_KEY=your_ai_service_key

# Application Configuration
VITE_APP_ENV=development|staging|production
VITE_APP_VERSION=1.0.0
```

### **Development Scripts**
```bash
# Root workspace commands
pnpm dev              # Run both apps in parallel
pnpm dev:reader       # Run reader app only
pnpm dev:dashboard    # Run dashboard app only
pnpm build            # Build all packages
pnpm type-check       # Type checking across monorepo
pnpm lint             # Lint all packages

# Package-specific commands
pnpm --filter @alice-suite/api-client build    # Build shared package
pnpm --filter alice-reader dev                 # Run specific app
```

## 🔒 **Security & Performance**

### **Security Features**
- **Row Level Security (RLS)** - Database-level access control
- **JWT Authentication** - Secure token-based auth
- **Environment Variable Protection** - Secure configuration
- **CORS Configuration** - Cross-origin request control

### **Performance Optimizations**
- **Code Splitting** - Lazy loading of components
- **Tree Shaking** - Unused code elimination
- **Bundle Optimization** - Minimized bundle sizes
- **Caching Strategies** - Browser and CDN caching

## 📱 **Browser Support**

### **Supported Browsers**
- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### **Mobile Support**
- **iOS Safari** 14+
- **Chrome Mobile** 90+
- **Samsung Internet** 15+

## 🚀 **Deployment**

### **Production Environment**
- **Vercel** - Frontend hosting
- **Supabase** - Backend services
- **GitHub Actions** - Automated deployment

### **Staging Environment**
- **Vercel Preview** - Automatic preview deployments
- **Supabase** - Staging database

### **Development Environment**
- **Local Development** - Vite dev server
- **Supabase Local** - Local database (optional)

---

*This technical stack is designed for scalability, maintainability, and developer experience. The monorepo structure enables code sharing while maintaining clear separation of concerns.* 