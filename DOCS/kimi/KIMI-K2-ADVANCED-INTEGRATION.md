# Kimi K2 Advanced Integration Guide

## 🎯 **Overview**

This guide provides multiple integration methods for Kimi K2, including Cloud Code CLI, Repo Prompt, and enhanced environment configurations. These integrations offer different capabilities and use cases for AI-assisted development.

## 🚀 **Integration Methods**

### **Method 1: Claude Code CLI Integration** (Previously Setup)
- **Use Case**: Agentic coding with full codebase awareness
- **API Endpoint**: `https://api.moonshot.ai/anthropic`
- **Environment Variables**: `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_BASE_URL`

### **Method 2: Cloud Code CLI Integration** (New)
- **Use Case**: Direct Kimi K2 access with custom CLI wrapper
- **API Endpoint**: `https://api.moonshot.cn/v1`
- **Environment Variables**: `KIMI_API_KEY`, `KIMI_API_BASE_URL`

### **Method 3: Repo Prompt Integration** (New)
- **Use Case**: AI-powered repository analysis and code review
- **API Provider**: Open Router
- **Model**: "moonshot Kimmy K2"

## 🔧 **Method 2: Cloud Code CLI Integration**

### **Prerequisites**
- **Moonshot AI Account**: https://platform.moonshot.ai/
- **Credit Card**: Required for API access
- **Minimum Deposit**: $10 required
- **API Key**: Generated from Moonshot AI platform

### **Step-by-Step Setup**

#### **1. Generate Moonshot API Key**
```bash
# Navigate to Moonshot AI Console
# URL: https://platform.moonshot.ai/console/api-keys

# Steps:
# 1. Sign in to your Moonshot AI account
# 2. Add credit card and make minimum $10 deposit
# 3. Navigate to API Keys section
# 4. Create new API key
# 5. Copy the API key (starts with 'sk-')
```

#### **2. Configure Shell Environment**
```bash
# Open your shell configuration file
nano ~/.zshrc  # or ~/.bashrc for bash users

# Add the following configuration:
export KIMI_API_KEY="xsk-SLf0f54faLNchFDFuryRbnZWqmWEhzdM2h6hWXWhNnhDHhUO"
export KIMI_API_BASE_URL="https://api.moonshot.cn/v1"

function Kimmy() {
  claude --api-key "$KIMI_API_KEY" --api-base-url "$KIMI_API_BASE_URL" "$@"
}

# Save and reload configuration
source ~/.zshrc
```

#### **3. Usage Examples**
```bash
# Start Cloud Code with Kimi K2
Kimmy

# Use with specific commands
Kimmy "Explain the concept of recursion in Python"

# Initialize project context
Kimmy init

# Check configuration
Kimmy /config
```

### **Enhanced Shell Configuration**
```bash
# Advanced configuration with additional functions
export KIMI_API_KEY="YOUR_API_KEY"
export KIMI_API_BASE_URL="https://api.moonshot.cn/v1"

# Main Kimi function
function Kimmy() {
  claude --api-key "$KIMI_API_KEY" --api-base-url "$KIMI_API_BASE_URL" "$@"
}

# Quick access functions
function kimi-init() {
  Kimmy init
}

function kimi-config() {
  Kimmy /config
}

function kimi-cost() {
  Kimmy /cost
}

function kimi-think() {
  Kimmy think "$@"
}

function kimi-think-hard() {
  Kimmy "think hard" "$@"
}

# Project-specific functions
function kimi-review() {
  Kimmy "Review the current codebase and suggest improvements"
}

function kimi-refactor() {
  Kimmy "Refactor the code for better performance and maintainability"
}

function kimi-test() {
  Kimmy "Generate comprehensive unit tests for the current module"
}
```

## 🔌 **Method 3: Repo Prompt Integration**

### **Prerequisites**
- **Open Router Account**: https://openrouter.ai/
- **API Key**: Generated from Open Router
- **Repo Prompt**: Installed and configured

### **Step-by-Step Setup**

#### **1. Get Open Router API Key**
```bash
# Navigate to Open Router
# URL: https://openrouter.ai

# Steps:
# 1. Sign in to Open Router
# 2. Navigate to "Keys" section
# 3. Create new API key
# 4. Copy the API key
```

#### **2. Configure Repo Prompt**
```bash
# In Repo Prompt:
# 1. Go to Settings > API settings
# 2. Paste your Open Router API key
# 3. Refresh the model list
# 4. Search for "Kimmy"
# 5. Add "moonshot Kimmy K2" model
```

#### **3. Usage in Repo Prompt**
```bash
# Select "moonshot Kimmy K2" from model dropdown
# Use for:
# - Repository analysis
# - Code review
# - Documentation generation
# - Bug detection
# - Performance optimization
```

## 🔄 **Multi-Method Integration Setup**

### **Unified Configuration Script**
```bash
#!/bin/bash

# Kimi K2 Multi-Integration Setup Script

echo "🚀 Setting up Kimi K2 Multi-Integration"
echo "======================================"

# Check if Claude Code CLI is installed
if command -v claude &> /dev/null; then
    echo "✅ Claude Code CLI is installed: $(claude --version)"
else
    echo "❌ Claude Code CLI not found. Installing..."
    npm install -g @anthropic-ai/claude-code
fi

# Configuration options
echo ""
echo "📋 Available Integration Methods:"
echo "1. Claude Code CLI (Agentic coding)"
echo "2. Cloud Code CLI (Direct Kimi access)"
echo "3. Repo Prompt (Repository analysis)"

echo ""
echo "🔧 Configuration Commands:"

# Method 1: Claude Code CLI
echo ""
echo "# Method 1: Claude Code CLI Integration"
echo "export ANTHROPIC_AUTH_TOKEN=\"sk-YOUR_MOONSHOT_API_KEY\""
echo "export ANTHROPIC_BASE_URL=\"https://api.moonshot.ai/anthropic\""

# Method 2: Cloud Code CLI
echo ""
echo "# Method 2: Cloud Code CLI Integration"
echo "export KIMI_API_KEY=\"YOUR_API_KEY\""
echo "export KIMI_API_BASE_URL=\"https://api.moonshot.cn/v1\""
echo ""
echo "function Kimmy() {"
echo "  claude --api-key \"\$KIMI_API_KEY\" --api-base-url \"\$KIMI_API_BASE_URL\" \"\$@\""
echo "}"

# Method 3: Repo Prompt
echo ""
echo "# Method 3: Repo Prompt Integration"
echo "# 1. Get Open Router API key from https://openrouter.ai"
echo "# 2. Configure in Repo Prompt Settings > API settings"
echo "# 3. Add 'moonshot Kimmy K2' model"

echo ""
echo "🎯 Usage Examples:"
echo "# Claude Code CLI"
echo "claude \"Explain recursion in Python\""
echo ""
echo "# Cloud Code CLI"
echo "Kimmy \"Generate a React component\""
echo ""
echo "# Repo Prompt"
echo "# Select 'moonshot Kimmy K2' from model dropdown"

echo ""
echo "📚 Documentation:"
echo "- Claude Code Integration: KIMI-CLAUDE-CODE-INTEGRATION.md"
echo "- Advanced Integration: KIMI-K2-ADVANCED-INTEGRATION.md"
echo "- Setup Script: setup-kimi-multi-integration.sh"
```

### **Enhanced Shell Profile Configuration**
```bash
# Add to ~/.zshrc or ~/.bashrc

# Kimi K2 Multi-Integration Configuration
export KIMI_API_KEY="YOUR_API_KEY"
export KIMI_API_BASE_URL="https://api.moonshot.cn/v1"
export ANTHROPIC_AUTH_TOKEN="sk-YOUR_MOONSHOT_API_KEY"
export ANTHROPIC_BASE_URL="https://api.moonshot.ai/anthropic"

# Cloud Code CLI Function
function Kimmy() {
  claude --api-key "$KIMI_API_KEY" --api-base-url "$KIMI_API_BASE_URL" "$@"
}

# Claude Code CLI Function (with Kimi backend)
function ClaudeKimi() {
  claude "$@"
}

# Quick Access Functions
function kimi-help() {
  echo "🎯 Kimi K2 Integration Commands:"
  echo ""
  echo "Cloud Code CLI (Direct Kimi):"
  echo "  Kimmy                    # Start Cloud Code with Kimi"
  echo "  Kimmy \"your prompt\"      # Execute specific command"
  echo "  kimi-init               # Initialize project"
  echo "  kimi-config             # Check configuration"
  echo "  kimi-cost               # Check usage/costs"
  echo ""
  echo "Claude Code CLI (Agentic):"
  echo "  ClaudeKimi              # Start Claude Code with Kimi backend"
  echo "  claude \"your prompt\"     # Execute with agentic capabilities"
  echo ""
  echo "Repo Prompt:"
  echo "  # Use 'moonshot Kimmy K2' model in Repo Prompt"
  echo ""
  echo "Direct API:"
  echo "  ./kimi_api.sh chat \"message\"  # Direct Kimi API access"
}

# Initialize project context
function kimi-init() {
  Kimmy init
}

# Check configuration
function kimi-config() {
  Kimmy /config
}

# Check usage and costs
function kimi-cost() {
  Kimmy /cost
}

# Thinking modes
function kimi-think() {
  Kimmy think "$@"
}

function kimi-think-hard() {
  Kimmy "think hard" "$@"
}

# Project-specific functions
function kimi-review() {
  Kimmy "Review the current codebase and suggest improvements"
}

function kimi-refactor() {
  Kimmy "Refactor the code for better performance and maintainability"
}

function kimi-test() {
  Kimmy "Generate comprehensive unit tests for the current module"
}

function kimi-docs() {
  Kimmy "Generate documentation for the current module"
}
```

## 🎯 **Use Case Comparison**

### **Claude Code CLI Integration**
- **Best For**: Agentic coding, file manipulation, Git operations
- **Strengths**: Full codebase awareness, multi-step workflows
- **Use Cases**: Complex development tasks, project setup, refactoring

### **Cloud Code CLI Integration**
- **Best For**: Direct Kimi K2 access, quick queries, custom workflows
- **Strengths**: Direct API access, custom functions, flexibility
- **Use Cases**: Quick code generation, debugging, analysis

### **Repo Prompt Integration**
- **Best For**: Repository analysis, code review, documentation
- **Strengths**: Repository context, code quality analysis
- **Use Cases**: Code review, documentation generation, bug detection

## 🔧 **Advanced Configuration**

### **Environment-Specific Setup**
```bash
# Development Environment
export KIMI_DEV_API_KEY="sk-dev-key"
export KIMI_DEV_BASE_URL="https://api.moonshot.cn/v1"

# Production Environment
export KIMI_PROD_API_KEY="sk-prod-key"
export KIMI_PROD_BASE_URL="https://api.moonshot.cn/v1"

# Function to switch environments
function kimi-env() {
  case $1 in
    "dev")
      export KIMI_API_KEY="$KIMI_DEV_API_KEY"
      export KIMI_API_BASE_URL="$KIMI_DEV_BASE_URL"
      echo "Switched to development environment"
      ;;
    "prod")
      export KIMI_API_KEY="$KIMI_PROD_API_KEY"
      export KIMI_API_BASE_URL="$KIMI_PROD_BASE_URL"
      echo "Switched to production environment"
      ;;
    *)
      echo "Usage: kimi-env [dev|prod]"
      ;;
  esac
}
```

### **Project-Specific Configuration**
```bash
# Project-specific Kimi functions
function kimi-alice() {
  cd /Users/efisiopittau/Project_1/alice-suite
  Kimmy "$@"
}

function kimi-monorepo() {
  cd /Users/efisiopittau/Project_1/alice-suite/alice-suite-monorepo
  Kimmy "$@"
}
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **API Key Not Working**
```bash
# Verify API key format
echo $KIMI_API_KEY | head -c 10  # Should start with 'sk-'

# Check API endpoint
echo $KIMI_API_BASE_URL  # Should be https://api.moonshot.cn/v1

# Test API connection
curl -H "Authorization: Bearer $KIMI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"kimi-v2","messages":[{"role":"user","content":"Hello"}]}' \
     "$KIMI_API_BASE_URL/chat/completions"
```

#### **Function Not Found**
```bash
# Reload shell configuration
source ~/.zshrc

# Check function definition
type Kimmy

# Verify PATH includes npm global bin
echo $PATH | grep npm
```

#### **Repo Prompt Model Not Available**
```bash
# Verify Open Router API key
# Check model availability in Open Router dashboard
# Refresh model list in Repo Prompt
# Ensure "moonshot Kimmy K2" is added to favorites
```

## 📊 **Monitoring and Analytics**

### **Usage Tracking**
```bash
# Check usage across different methods
kimi-cost                    # Cloud Code CLI usage
claude /cost                 # Claude Code CLI usage
# Repo Prompt usage available in Open Router dashboard
```

### **Performance Monitoring**
```bash
# Monitor response times
time Kimmy "Simple test query"
time claude "Simple test query"

# Track token usage
kimi-cost | grep "tokens"
claude /cost | grep "tokens"
```

## 🎉 **Conclusion**

This advanced integration setup provides multiple ways to access Kimi K2's capabilities:

1. **Claude Code CLI**: For agentic coding with full codebase awareness
2. **Cloud Code CLI**: For direct Kimi K2 access with custom workflows
3. **Repo Prompt**: For repository analysis and code review
4. **Direct API**: For programmatic access and custom integrations

Each method offers unique advantages and can be used together for comprehensive AI-assisted development.

## 📚 **Additional Resources**

- **Moonshot AI Platform**: https://platform.moonshot.ai/
- **Open Router**: https://openrouter.ai/
- **Claude Code CLI Docs**: https://docs.anthropic.com/claude/docs/claude-code
- **Repo Prompt**: Available in your IDE extensions

---

*This advanced integration guide provides comprehensive access to Kimi K2's capabilities through multiple interfaces and use cases.* 