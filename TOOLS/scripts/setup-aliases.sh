#!/bin/bash

# Alice Suite - Setup Aliases
# This script sets up convenient aliases for Alice Suite

echo "🔧 Setting up Alice Suite aliases..."
echo "==================================="

# Get the current directory
ALICE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create aliases
echo "alias alice='cd $ALICE_DIR && ./start-both-apps.sh'" >> ~/.zshrc
echo "alias alice-status='cd $ALICE_DIR && ./check-status.sh'" >> ~/.zshrc
echo "alias alice-stop='cd $ALICE_DIR && ./kill-all.sh'" >> ~/.zshrc

echo "✅ Aliases added to ~/.zshrc:"
echo "   - alice        → Start both apps"
echo "   - alice-status → Check if apps are running"
echo "   - alice-stop   → Kill all apps"
echo ""
echo "🔄 To use the aliases immediately, run:"
echo "   source ~/.zshrc"
echo ""
echo "💡 Or just restart your terminal"
echo ""
echo "🎯 Quick start:"
echo "   alice         # Start both apps"
echo "   alice-status  # Check status"
echo "   alice-stop    # Stop all apps" 