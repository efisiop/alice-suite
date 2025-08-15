#!/bin/bash

# Kimi Claude CLI - Launches Claude Code with Kimi K2 Backend
# This script configures the environment to use Kimi K2 and then runs the Claude Code CLI.

set -euo pipefail

# 1. Configure Kimi K2 Backend
# Unset old/conflicting variables to ensure a clean environment
unset KIMI_API_KEY KIMI_API_URL ANTHROPIC_API_KEY

# Set the correct environment variables for Claude Code to use Kimi K2
# IMPORTANT: Replace with your actual Moonshot API key if not already set in your shell profile
export ANTHROPIC_AUTH_TOKEN="${KIMI_API_KEY:-$ANTHROPIC_AUTH_TOKEN}"
export ANTHROPIC_BASE_URL="https://api.moonshot.ai/anthropic"

# 2. Verify Environment
if [[ -z "$ANTHROPIC_AUTH_TOKEN" ]]; then
  echo "❌ Error: ANTHROPIC_AUTH_TOKEN is not set."
  echo "Please set your Kimi API key using:"
  echo "export ANTHROPIC_AUTH_TOKEN="sk-YOUR_MOONSHOT_API_KEY""
  exit 1
fi

# 3. Launch Claude Code CLI
# Pass all script arguments directly to the claude command
echo "🚀 Launching Claude Code CLI with Kimi K2 backend..."
echo "   (Using endpoint: $ANTHROPIC_BASE_URL)"
claude "$@"