# 🚀 Kimi API + Claude Code CLI Quick Start Guide

## Quick Setup (30 seconds)

Your environment is **already configured**! Claude Code CLI is ready to use with Kimi K2.

### ✅ Current Status
- **Claude Code CLI**: v1.0.61 ✅
- **Kimi API Key**: Configured ✅
- **Moonshot Endpoint**: Set ✅

### 🎯 Get Started Immediately

```bash
# Test the integration (working now)
claude "What are the key features of TypeScript?"

# Get help with your codebase
claude "What files handle authentication in this project?"

# Analyze code structure
claude "Explain the monorepo architecture"
```

## 📋 Essential Commands

### Basic Usage
```bash
# Simple queries
claude "Explain this codebase structure"

# Code analysis
claude "Find potential bugs in the auth system"

# File operations
claude "Create a new React component for user profiles"
```

### Advanced Features
```bash
# Deep analysis
claude think "How to optimize the build process"
claude think hard "Architectural improvements needed"

# Project context
claude init                    # Initialize project context
claude /config                # Check configuration
claude /cost                  # Monitor usage

# Git integration
claude /add .                # Stage all changes
claude /commit "Add feature"  # Commit with message
```

## 🔧 Configuration Check

Your current setup:
```bash
# Verify it's working
echo $ANTHROPIC_AUTH_TOKEN    # Should show your key
echo $ANTHROPIC_BASE_URL      # Should show Moonshot URL

# Test connectivity
claude "Confirm you're using Kimi K2"
```

## 🎮 Interactive Mode

Start interactive session:
```bash
claude
```

Then use commands like:
- `@kimi-assist` - Get Kimi-specific help
- `/help` - Show all available commands
- `/model` - Check which model is active

## 🚨 Troubleshooting

### If commands timeout:
```bash
# Check network connectivity
ping api.moonshot.ai

# Verify API key is valid
claude /config

# Restart shell if needed
source ~/.zshrc
```

### Quick fixes:
1. **Timeout issues**: Wait 30 seconds, try again
2. **API errors**: Check your Moonshot dashboard for usage
3. **Missing commands**: Ensure Claude Code is updated: `npm update -g @anthropic-ai/claude-code`

## 📚 Next Steps

1. **Explore features**: Try `claude /help` for full command list
2. **Code review**: Use `claude review src/App.tsx` for file analysis
3. **Refactoring**: Try `claude refactor src/components/` for bulk improvements
4. **Testing**: Use `claude test src/` to run tests with AI insights

---
**Ready to go!** Start with `claude "What's in this codebase?"`