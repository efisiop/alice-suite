# Claude Session Instructions - Alice Suite

## 🎯 **Current Project Status**

**Alice Suite** is now a **monorepo** with shared packages and comprehensive documentation. The project has been successfully transformed from separate applications to a unified workspace structure.

### **🏗️ Current Architecture**
```
alice-suite-monorepo/
├── apps/
│   ├── alice-reader/              # Reader application
│   └── alice-consultant-dashboard/ # Consultant dashboard
├── packages/
│   └── api-client/               # Shared API client
└── .agent-os/                    # Agent OS configuration
```

### **✅ Recently Completed**
- **Monorepo Implementation** - pnpm workspaces with shared packages
- **Shared API Client** - `@alice-suite/api-client` package created
- **Type Safety** - Comprehensive TypeScript types across applications
- **Documentation Update** - All Agent OS documentation updated
- **Build System** - Optimized build process for monorepo

## 📚 **Documentation Integration**

### **Agent OS Documentation**
Before starting any new work, **ALWAYS** read these files to understand the current state:

1. **`.agent-os/product/mission.md`** - Product mission and goals
2. **`.agent-os/product/roadmap.md`** - Current status and upcoming features
3. **`.agent-os/product/tech-stack.md`** - Technical architecture and tools
4. **`.agent-os/product/decisions.md`** - Technical decisions and rationale

### **Existing Project Files**
- **`planning.md`** - High-level project vision and architecture
- **`tasks.md`** - Current milestone-based task tracking
- **`AGENT_OS_INTEGRATION_GUIDE.md`** - How Agent OS integrates with workflow

## 🚀 **Available Commands & Tools**

### **Agent OS Commands**
Use these commands for structured development:

- **`@create-spec`** - Create detailed feature specifications
- **`@execute-tasks`** - Implement features based on specifications
- **`@analyze-product`** - Analyze product requirements and current state

### **Kimi K2 Integration**
For technical guidance and AI assistance:

- **Terminal**: `./kimi_api.sh chat "Your question here"`
- **Cursor**: `@kimi-assist` (when command is working)
- **API Status**: `./kimi_api.sh status`
- **Available Models**: `./kimi_api.sh models`

### **Enhanced Claude Integration**
For production-ready coding with Kimi-inspired patterns:

- **Custom Commands**: `@complete_implementation`, `@refactor_robust`, `@kimi_style`
- **MCP Servers**: Context 7 (web browsing), Firecrawl (web scraping), Playwright (automation), Supabase (database)
- **Knowledge Base**: `.ai-knowledge/` with Kimi-inspired coding patterns
- **Enhanced Prompts**: Production-ready code with comprehensive error handling
- **Configuration**: `.cursorrules` with expert coding guidelines

### **Claude Code CLI + Kimi K2 Integration**
For agentic coding with Kimi K2 model:

- **Claude Code CLI**: `npm install -g @anthropic-ai/claude-code`
- **Kimi K2 Backend**: Redirect Claude Code to use Kimi K2 via environment variables
- **Agentic Capabilities**: Full codebase awareness, file manipulation, Git operations
- **IDE Integration**: Seamless integration with Cursor and VS Code
- **Setup Script**: `setup-kimi-claude-code.sh` for easy configuration

### **Advanced Kimi K2 Multi-Integration**
For comprehensive AI-assisted development:

- **Cloud Code CLI**: Direct Kimi K2 access with custom `Kimmy()` function
- **Repo Prompt**: Repository analysis using Open Router + Kimi K2
- **Multiple API Endpoints**: `api.moonshot.ai/anthropic` and `api.moonshot.cn/v1`
- **Enhanced Shell Functions**: `kimi-help`, `kimi-init`, `kimi-review`, `kimi-refactor`
- **Project-Specific Shortcuts**: `kimi-alice`, `kimi-monorepo`
- **Setup Script**: `setup-kimi-multi-integration.sh` for complete setup

### **Development Commands**
```bash
# Run both applications
pnpm dev

# Run individual applications
pnpm dev:reader
pnpm dev:dashboard

# Build all packages
pnpm build

# Type checking
pnpm type-check
```

## 🛠️ **Development Workflow**

### **For New Features**
1. **Read Documentation** - Review Agent OS product docs first
2. **Create Specification** - Use `@create-spec` for detailed requirements
3. **Consult Kimi** - Use `./kimi_api.sh chat` for technical guidance
4. **Implement** - Follow Agent OS standards and best practices
5. **Test** - Ensure compatibility with both applications
6. **Document** - Update relevant documentation

### **For Bug Fixes**
1. **Identify Issue** - Use existing debugging tools
2. **Consult Kimi** - Use `./kimi_api.sh chat` for troubleshooting
3. **Fix** - Follow established patterns in shared package
4. **Test** - Verify fix works in both applications
5. **Update** - Modify documentation if needed

## 📦 **Shared Package Usage**

### **Importing from Shared Package**
```typescript
// Import shared types and clients
import { 
  authClient, 
  dbClient, 
  type AuthUser, 
  type Book 
} from '@alice-suite/api-client'

// Use shared authentication
const { user, error } = await authClient.getCurrentUser()

// Use shared database operations
const { data: book, error } = await dbClient.getBook(bookId)
```

### **Key Benefits**
- **Type Safety** - Consistent types across applications
- **Code Reuse** - No duplication of database/auth logic
- **Maintainability** - Single source of truth for API operations
- **Consistency** - Unified patterns across both apps

## 🔄 **Current Priorities**

### **🔄 In Progress**
- **Code Migration** - Updating existing code to use shared package
- **Type Consolidation** - Removing duplicate types from individual apps
- **Service Refactoring** - Updating services to use shared database client

### **🚀 Next Steps**
- **Enhanced AI Features** - Advanced AI interactions and recommendations
- **Mobile Optimization** - Responsive design improvements
- **Testing Strategy** - Comprehensive testing implementation
- **Performance Optimization** - Bundle and runtime optimization

## 📊 **Key Metrics & Goals**

### **Technical Goals**
- **Build Time**: <30 seconds for full monorepo build
- **Bundle Size**: <2MB for main app bundles
- **Type Coverage**: 95%+ TypeScript coverage
- **Code Duplication**: Minimized with shared packages

### **Development Goals**
- **Development Speed**: Improved with shared tooling
- **Code Quality**: Enhanced with unified standards
- **Maintenance**: Simplified with centralized logic
- **Onboarding**: Streamlined with comprehensive documentation

## 🎯 **Session Guidelines**

### **When Starting a New Session**
1. **Read Current Status** - Review this file and Agent OS documentation
2. **Understand Context** - Know what's been completed and what's next
3. **Follow Standards** - Use Agent OS standards and best practices
4. **Leverage Tools** - Use Kimi K2 for technical guidance
5. **Update Documentation** - Keep documentation current

### **When Working on Features**
1. **Use Agent OS Commands** - `@create-spec` and `@execute-tasks`
2. **Consult Kimi** - For technical decisions and implementation guidance
3. **Follow Monorepo Patterns** - Use shared packages appropriately
4. **Maintain Type Safety** - Leverage shared TypeScript types
5. **Test Both Apps** - Ensure changes work in both applications

### **When Completing Work**
1. **Update Documentation** - Reflect changes in relevant docs
2. **Test Thoroughly** - Verify functionality in both apps
3. **Follow Standards** - Ensure code meets Agent OS standards
4. **Document Decisions** - Update decisions log if needed

## 🔗 **Integration Points**

### **With Agent OS**
- **Standards**: Located in `~/.agent-os/standards/`
- **Product Docs**: Located in `.agent-os/product/`
- **Commands**: Available in Cursor with `@` prefix

### **With Existing Workflow**
- **`planning.md`** - Aligned with current roadmap
- **`tasks.md`** - Integrated with milestone tracking
- **`AGENT_OS_INTEGRATION_GUIDE.md`** - Detailed integration guide

### **With AI Assistants**
- **Kimi K2** - For technical guidance and implementation
- **Claude** - Enhanced with Agent OS context
- **Cursor** - Configured with custom commands

---

## 📞 **Quick Reference**

### **Key Files**
- **Workspace Config**: `pnpm-workspace.yaml`
- **Root Package**: `package.json`
- **Shared Package**: `packages/api-client/package.json`
- **Agent OS Docs**: `.agent-os/product/`

### **Commands**
- **Development**: `pnpm dev`, `pnpm build`, `pnpm type-check`
- **Agent OS**: `@create-spec`, `@execute-tasks`, `@analyze-product`
- **Kimi K2**: `./kimi_api.sh chat`, `@kimi-assist`
- **Claude Code CLI**: `claude init`, `claude /config`, `claude /cost`
- **Cloud Code CLI**: `Kimmy`, `kimi-init`, `kimi-config`, `kimi-cost`
- **Advanced Functions**: `kimi-help`, `kimi-review`, `kimi-refactor`, `kimi-test`

### **Documentation**
- **Agent OS Guide**: `AGENT_OS_INTEGRATION_GUIDE.md`
- **Kimi Reference**: `KIMI_QUICK_REFERENCE.md`
- **Claude Code Integration**: `KIMI-CLAUDE-CODE-INTEGRATION.md`
- **Advanced Integration**: `KIMI-K2-ADVANCED-INTEGRATION.md`
- **Product Docs**: `.agent-os/product/`

---

*This session configuration ensures Claude has full context of the current Alice Suite monorepo implementation and can provide informed guidance aligned with the established Agent OS framework and development standards.*
