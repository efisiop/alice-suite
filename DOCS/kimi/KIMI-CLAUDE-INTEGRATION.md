# Kimi-Claude Integration Guide

## Overview
This guide documents the integration between Kimi's expert coding capabilities and Claude in Cursor, allowing you to leverage Kimi's comprehensive coding approach within your IDE.

## What We've Set Up

### 1. Enhanced Cursor Rules (`.cursorrules`)
- **Complete Implementation Guidelines**: Always provide full, working code
- **Production-Ready Standards**: Error handling, logging, monitoring
- **Custom Commands**: `@complete_implementation`, `@refactor_robust`, `@kimi_style`
- **Expert Coding Assistant**: Structured response format

### 2. Knowledge Base (`.ai-knowledge/`)
- **Coding Patterns**: Templates and best practices
- **Robust Service Template**: Production-ready service structure
- **Error Handling Patterns**: Retry logic and error management
- **Response Structure**: How to format code responses

### 3. MCP Servers
- **Context 7**: Web browsing and search
- **Firecrawl**: Web scraping and data extraction
- **Playwright**: Browser automation and testing
- **Supabase**: Database operations

## How to Use

### In Cursor with Claude

#### Basic Usage
```
"Following Kimi's expert coding practices, implement a user authentication service"
```

#### Using Custom Commands
- `@complete_implementation` - Full production-ready implementation
- `@refactor_robust` - Robust refactoring with error handling
- `@kimi_style` - Kimi-inspired coding approach

#### Enhanced Prompts
```
"Implement a robust API client with:
- Complete, production-ready code
- Comprehensive error handling
- Proper logging and monitoring
- Unit tests
- Usage examples
- Consider edge cases like network failures and rate limiting

Reference the patterns in .ai-knowledge/ for style and structure."
```

### MCP Server Usage

#### Web Browsing (Context 7)
```
"Browse to example.com and summarize the main features"
```

#### Web Scraping (Firecrawl)
```
"Scrape the latest news from techcrunch.com"
```

#### Browser Automation (Playwright)
```
"Automate filling out a contact form on my website"
```

#### Database Operations (Supabase)
```
"Query my Supabase database for user data and create a summary"
```

## Workflow Integration

### Hybrid Approach (Recommended)
1. **Use Kimi** for initial complex problem-solving and architecture
2. **Copy solutions** to Cursor/Claude for iteration
3. **Use Claude** for IDE-specific tasks and refactoring

### Template System
- Save Kimi's detailed responses as templates
- Reference patterns from `.ai-knowledge/`
- Use consistent structure across projects

## Benefits

### What You Get from Kimi
- Extremely detailed, complete implementations
- Comprehensive error handling and edge case consideration
- Production-ready code with logging and monitoring
- Deep architectural insights

### What You Get from Claude in Cursor
- Superior IDE integration
- Real-time file context
- Better refactoring capabilities
- MCP server access for web browsing, scraping, and automation

## Limitations

### Kimi Cannot Access
- MCP servers directly
- Your local file system
- Real-time IDE context

### Claude Cannot Provide
- Kimi's extremely long, detailed implementations
- Some of Kimi's specific knowledge about Chinese tech ecosystems

## Best Practices

### 1. Use the Right Tool for the Job
- **Kimi**: Complex problem-solving, architecture, complete implementations
- **Claude**: IDE tasks, refactoring, MCP operations, quick iterations

### 2. Maintain Knowledge Base
- Save valuable Kimi responses to `.ai-knowledge/`
- Update patterns and templates regularly
- Share insights across team members

### 3. Leverage MCP Servers
- Use Context 7 for research and documentation
- Use Firecrawl for data gathering
- Use Playwright for testing and automation
- Use Supabase for database operations

## Troubleshooting

### Custom Commands Not Working
- Ensure `.cursorrules` is in your project root
- Restart Cursor after making changes
- Check Cursor's AI Rules settings

### MCP Servers Not Available
- Verify `~/.cursor/mcp.json` configuration
- Check server status with `/mcp` in Cursor
- Restart Cursor to reload MCP configuration

### Knowledge Base Not Referenced
- Ensure `.ai-knowledge/` directory exists
- Include specific references in your prompts
- Update knowledge base with new patterns

## Future Enhancements

### Potential Improvements
1. **Automated Template Generation**: Scripts to convert Kimi responses to templates
2. **Enhanced MCP Integration**: More sophisticated MCP server configurations
3. **Team Knowledge Sharing**: Centralized knowledge base for team collaboration
4. **Custom Prompt Libraries**: Specialized prompts for different project types

## Conclusion

This integration provides the best of both worlds:
- **Kimi's comprehensive coding expertise** for complex problems
- **Claude's IDE integration** for day-to-day development
- **MCP servers** for enhanced capabilities

Use this setup to significantly improve your coding productivity and code quality! 🚀 