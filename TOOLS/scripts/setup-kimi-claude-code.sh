#!/bin/bash

# Kimi K2 + Claude Code CLI Integration Setup Script
# Based on the comprehensive guide provided

echo "🚀 Setting up Kimi K2 integration with Claude Code CLI"
echo "=================================================="

# Check if Claude Code CLI is installed
if ! command -v claude &> /dev/null; then
    echo "❌ Claude Code CLI is not installed."
    echo "Please install it first: npm install -g @anthropic-ai/claude-code"
    exit 1
fi

echo "✅ Claude Code CLI is installed: $(claude --version)"

# Check current environment variables
echo ""
echo "📋 Current Environment Variables:"
echo "ANTHROPIC_AUTH_TOKEN: ${ANTHROPIC_AUTH_TOKEN:-'Not set'}"
echo "ANTHROPIC_BASE_URL: ${ANTHROPIC_BASE_URL:-'Not set'}"

echo ""
echo "🔧 Configuration Steps:"
echo "1. Get your Moonshot AI API key from: https://platform.moonshot.ai/"
echo "2. The API key should start with 'sk-'"
echo "3. Run the following commands to set up the integration:"
echo ""

# Generate the configuration commands
echo "# Set environment variables for Kimi K2 integration"
echo "export ANTHROPIC_AUTH_TOKEN=\"sk-YOUR_MOONSHOT_API_KEY\""
echo "export ANTHROPIC_BASE_URL=\"https://api.moonshot.ai/anthropic\""
echo ""
echo "# To make them persistent, add to your shell profile (~/.zshrc, ~/.bashrc, etc.):"
echo "echo 'export ANTHROPIC_AUTH_TOKEN=\"sk-YOUR_MOONSHOT_API_KEY\"' >> ~/.zshrc"
echo "echo 'export ANTHROPIC_BASE_URL=\"https://api.moonshot.ai/anthropic\"' >> ~/.zshrc"
echo ""
echo "# Test the integration:"
echo "claude \"Explain the concept of recursion in Python with a simple code example.\""
echo ""
echo "# Check configuration:"
echo "claude /config"
echo "claude /cost"

echo ""
echo "📚 Available Claude Code CLI Commands:"
echo "- claude init          # Initialize project context"
echo "- claude /config       # View configuration"
echo "- claude /cost         # Check usage/costs"
echo "- claude /model        # Check current model"
echo "- claude think         # Deep problem-solving mode"
echo "- claude think hard    # Even deeper analysis"
echo "- claude ultrathink    # Maximum analysis depth"

echo ""
echo "🎯 Integration Benefits:"
echo "✅ Access Kimi K2 through Claude Code CLI"
echo "✅ Full codebase awareness and file manipulation"
echo "✅ Git operations and multi-step workflows"
echo "✅ Context preservation across sessions"
echo "✅ IDE integration (Cursor, VS Code)"
echo "✅ Test-Driven Development (TDD) support"

echo ""
echo "🔗 Useful Links:"
echo "- Moonshot AI Platform: https://platform.moonshot.ai/"
echo "- Claude Code CLI Docs: https://docs.anthropic.com/claude/docs/claude-code"
echo "- Integration Guide: See KIMI-CLAUDE-CODE-INTEGRATION.md"

echo ""
echo "⚠️  Important Notes:"
echo "- Keep your API key secure and never commit it to version control"
echo "- Monitor your usage in the Moonshot AI dashboard"
echo "- The integration redirects all Claude Code requests to Kimi K2"
echo "- You can switch back to native Claude by unsetting the environment variables"

echo ""
echo "🎉 Setup complete! Follow the steps above to configure your API key." 