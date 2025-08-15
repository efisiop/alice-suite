# Kimi K2 Assistant Instructions

Use Kimi K2 AI assistant for development tasks, code review, and technical discussions within your Alice Suite project.

## Quick Commands

### Basic Usage
```
@kimi-assist "Your question or request"
```

### Development Examples
```
@kimi-assist "Review this React component for best practices"
@kimi-assist "Help me debug this TypeScript error in AuthContext"
@kimi-assist "Suggest improvements for this Supabase query"
@kimi-assist "Explain how the three-tier assistance system works"
@kimi-assist "Review this Agent OS specification for completeness"
```

### Code Review Examples
```
@kimi-assist "Review this QuizGenerator component for performance"
@kimi-assist "Check this database migration for potential issues"
@kimi-assist "Analyze this service architecture for scalability"
@kimi-assist "Review this error handling approach"
```

## Integration with Your Workflow

### With Agent OS
1. **Spec Review**: `@kimi-assist "Review this Agent OS spec for technical feasibility"`
2. **Implementation Review**: `@kimi-assist "Review this code implementation against the spec"`
3. **Architecture Decisions**: `@kimi-assist "Evaluate this architectural decision for our React/TypeScript/Supabase stack"`

### With Existing System
1. **Task Analysis**: `@kimi-assist "Help me break down this milestone task"`
2. **Bug Investigation**: `@kimi-assist "Help me debug this authentication issue"`
3. **Performance Review**: `@kimi-assist "Analyze this component for performance bottlenecks"`

## Context Awareness

Kimi will have access to:
- Current file content and project structure
- Agent OS documentation (`.agent-os/product/`)
- Existing codebase patterns and standards
- Your React/TypeScript/Supabase stack specifics
- Session history and current development focus

## Technical Integration

### API Configuration
- Uses your existing `kimi_api.sh` setup
- API Key: Stored in `~/.kimi_api_config`
- Model: `kimi-k2-0711-preview`
- Endpoint: `https://api.moonshot.ai/v1`

### Available Commands
```bash
# Test Kimi integration
./kimi_api.sh test-key
./kimi_api.sh chat "Hello from Alice Suite"

# Interactive mode
./kemi-claude-cli.sh
```

## Best Practices

### For Development
- Be specific about the context (file, component, feature)
- Include relevant code snippets when asking questions
- Ask for explanations of complex technical concepts
- Request code reviews with specific focus areas

### For Architecture
- Ask for second opinions on technical decisions
- Request analysis of trade-offs between approaches
- Seek guidance on scalability and performance
- Consult on security and best practices

### For Integration
- Use Kimi to review Agent OS specifications
- Ask for validation of technical approaches
- Request explanations of complex patterns
- Seek guidance on testing strategies

## Example Workflows

### Feature Development
1. Create Agent OS spec: `@create-spec "Feature description"`
2. Review with Kimi: `@kimi-assist "Review this spec for technical completeness"`
3. Implement: `@execute-tasks`
4. Code review: `@kimi-assist "Review this implementation against the spec"`

### Bug Fixing
1. Identify issue in code
2. Ask Kimi: `@kimi-assist "Help me debug this authentication error"`
3. Implement fix
4. Verify: `@kimi-assist "Review this fix for potential issues"`

### Architecture Decisions
1. Document decision in `.agent-os/product/decisions.md`
2. Validate with Kimi: `@kimi-assist "Review this architectural decision"`
3. Update documentation based on feedback

## Troubleshooting

### If Kimi doesn't respond
1. Check API key: `./kimi_api.sh test-key`
2. Verify API status: `./kimi_api.sh status`
3. Test basic chat: `./kimi_api.sh chat "Test"`

### For complex questions
- Break down into smaller, specific questions
- Provide relevant context and code snippets
- Ask for step-by-step explanations
- Request examples when appropriate 