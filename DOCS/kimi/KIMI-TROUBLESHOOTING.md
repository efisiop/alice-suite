# 🔧 Kimi API + Claude Code Troubleshooting Guide

## Quick Issue Resolution

### ✅ **First Steps - Always Try These**

1. **Test basic functionality**
   ```bash
   claude "What model are you using?"
   ```

2. **Check configuration**
   ```bash
   claude /config
   claude /cost
   ```

3. **Verify environment**
   ```bash
   echo "ANTHROPIC_AUTH_TOKEN: ${ANTHROPIC_AUTH_TOKEN:0:10}..."
   echo "ANTHROPIC_BASE_URL: ${ANTHROPIC_BASE_URL}"
   ```

## Common Issues & Solutions

### 🕒 **Timeouts / Slow Responses**

**Symptoms:** Commands hang or timeout after 2 minutes

**Solutions:**
```bash
# 1. Check network connectivity
ping api.moonshot.ai

# 2. Test with shorter prompt
claude "hi" --timeout 30

# 3. Check API key validity
claude /config | grep "API Key"

# 4. Restart terminal session
exec $SHELL
```

### 🔑 **API Key Issues**

**Symptoms:** "Invalid API key" or authentication errors

**Solutions:**
```bash
# 1. Verify key format (should start with 'sk-')
echo ${ANTHROPIC_AUTH_TOKEN} | grep "^sk-"

# 2. Check key in Moonshot dashboard
# Visit: https://platform.moonshot.ai/

# 3. Reset environment variables
export ANTHROPIC_AUTH_TOKEN="your_actual_key_here"
export ANTHROPIC_BASE_URL="https://api.moonshot.ai/anthropic"

# 4. Make persistent
echo 'export ANTHROPIC_AUTH_TOKEN="your_key"' >> ~/.zshrc
source ~/.zshrc
```

### 🌐 **Network Issues**

**Symptoms:** "Connection refused" or DNS errors

**Solutions:**
```bash
# 1. Test endpoint connectivity
curl -I https://api.moonshot.ai/anthropic

# 2. Check DNS resolution
nslookup api.moonshot.ai

# 3. Use alternative endpoint (if available)
export ANTHROPIC_BASE_URL="https://api.moonshot.cn/v1"
```

### 🔧 **Installation Issues**

**Symptoms:** "claude: command not found"

**Solutions:**
```bash
# 1. Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# 2. Verify installation
which claude
claude --version

# 3. Check PATH
echo $PATH | grep -o "/usr/local/bin\|/opt/homebrew/bin"
```

### ⚡ **Performance Issues**

**Symptoms:** Very slow responses (>30 seconds)

**Solutions:**
```bash
# 1. Use simpler prompts
claude "list files"

# 2. Avoid large file operations
claude "analyze small_file.ts"  # instead of whole directory

# 3. Check system resources
top -p $(pgrep -f claude)
```

## Advanced Debugging

### 📊 **Debug Mode**
```bash
# Enable debug output
export DEBUG=claude:*
claude "test debug mode"

# Check response times
time claude "simple test"
```

### 📝 **Log Analysis**
```bash
# Check Claude logs (if available)
ls -la ~/.claude/
cat ~/.claude/logs/latest.log | tail -20
```

### 🔍 **Network Debugging**
```bash
# Test with curl directly
curl -H "Authorization: Bearer $ANTHROPIC_AUTH_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"model":"claude-3-sonnet-20240229","messages":[{"role":"user","content":"test"}],"max_tokens":10}' \
     https://api.moonshot.ai/anthropic/v1/messages
```

## Emergency Reset

If nothing works, reset everything:

```bash
# 1. Reset environment
unset ANTHROPIC_AUTH_TOKEN
unset ANTHROPIC_BASE_URL

# 2. Re-run setup
./setup-kimi-claude-code.sh

# 3. Reconfigure
export ANTHROPIC_AUTH_TOKEN="your_actual_key"
export ANTHROPIC_BASE_URL="https://api.moonshot.ai/anthropic"

# 4. Test integration
claude "Confirm integration works"
```

## Getting Help

### 📞 **Support Channels**

1. **Moonshot AI Support**: https://platform.moonshot.ai/support
2. **Claude Code Docs**: https://docs.anthropic.com/claude/docs/claude-code
3. **Community**: Check GitHub issues for similar problems

### 📧 **Issue Reporting**

When reporting issues, include:
```bash
# Run diagnostics
claude /config > diagnostics.txt 2>&1
echo "Environment: $(uname -a)" >> diagnostics.txt
echo "Node: $(node --version)" >> diagnostics.txt
echo "NPM: $(npm --version)" >> diagnostics.txt
echo "Claude: $(claude --version)" >> diagnostics.txt
```

## Quick Reference

### 🔍 **Diagnostic Commands**
```bash
# System check
claude --version && echo "✅ Claude installed"
echo ${ANTHROPIC_AUTH_TOKEN:0:10}... && echo "✅ API key set"
ping -c 1 api.moonshot.ai && echo "✅ Network OK"

# Integration test
claude "echo 'Integration working'" 2>/dev/null && echo "✅ Integration OK" || echo "❌ Integration failed"
```

---

**Still stuck?** Try the emergency reset or check the Moonshot AI dashboard for API usage and limits.