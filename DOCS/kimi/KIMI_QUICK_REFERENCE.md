# Kimi K2 Quick Reference

## 🚀 Quick Start

```bash
# Set your API key
./kimi_api.sh set-key "your-api-key-here"

# Test everything is working
./kimi_api.sh test-key
./kimi_api.sh chat "Hello Kimi!"
```

## 📋 Essential Commands

### API Key Management
```bash
./kimi_api.sh set-key "key"     # Set API key
./kimi_api.sh get-key           # Show current key
./kimi_api.sh test-key          # Test key validity
./kimi_api.sh remove-key        # Remove stored key
```

### Chat & Interaction
```bash
./kimi_api.sh chat "message"    # Send single message
./kemi-claude-cli.sh            # Start interactive chat
./kemi-claude-cli.sh -m "msg"   # Send single message via CLI
```

### System Status
```bash
./kimi_api.sh status            # Check API status
./kimi_api.sh models            # List available models
```

## ⚙️ Configuration

| Setting | Value |
|---------|-------|
| API URL | `https://api.moonshot.ai/v1` |
| Model | `kimi-k2-0711-preview` |
| Config File | `~/.kimi_api_config` |

## 🔧 Troubleshooting

### Common Issues

**API Key Invalid (401)**
```bash
./kimi_api.sh set-key "new-key"
./kimi_api.sh test-key
```

**Model Not Found (404)**
```bash
./kimi_api.sh models  # Check available models
```

**Permission Denied**
```bash
chmod +x kimi_api.sh kemi-claude-cli.sh
```

## 📁 Key Files

- `kimi_api.sh` - Main API script
- `kemi-claude-cli.sh` - Interactive CLI
- `test_kimi_k2.py` - Python test script
- `~/.kimi_api_config` - API key storage

## 🎯 Usage Examples

### Basic Chat
```bash
./kimi_api.sh chat "Tell me about Alice in Wonderland"
```

### Interactive Session
```bash
./kemi-claude-cli.sh
# Type your messages, use 'quit' to exit
```

### Test Integration
```bash
./kimi_api.sh test-key
./kimi_api.sh chat "Hello"
./kemi-claude-cli.sh -m "Test message"
```

## 🔗 Integration Status

✅ API Key configured  
✅ Model updated to Kimi K2  
✅ Chat functionality working  
✅ Interactive CLI working  
✅ Integration with Alice Suite ready  

## 📞 Support

- Check `KIMI_SETUP_GUIDE.md` for detailed documentation
- Use `./kimi_api.sh -h` for help
- Test with simple commands first
- Verify API status before troubleshooting

---

*Quick Reference v1.0 - Keep this handy for daily use!* 