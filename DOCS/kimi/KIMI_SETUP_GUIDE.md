# Kimi K2 API Setup and Integration Guide

This guide provides complete documentation for setting up and using Kimi K2 API with the alice-suite project.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [API Key Setup](#api-key-setup)
4. [Configuration Files](#configuration-files)
5. [Testing and Validation](#testing-and-validation)
6. [Usage Examples](#usage-examples)
7. [Integration with Alice Suite](#integration-with-alice-suite)
8. [Troubleshooting](#troubleshooting)
9. [API Reference](#api-reference)

## Overview

Kimi K2 is an advanced AI model from Moonshot AI that provides intelligent conversational capabilities. This project integrates Kimi K2 to enhance the Alice Reader experience with AI-powered assistance.

### Key Features
- **Interactive Chat**: Real-time conversation with Kimi K2
- **Contextual Help**: AI assistance for readers
- **Learning Support**: Educational explanations and guidance
- **Integration Ready**: Seamless connection with Alice Reader app

## Prerequisites

- macOS/Linux system with bash shell
- Valid Moonshot AI API key
- Internet connection for API access
- Basic command line knowledge

## API Key Setup

### Step 1: Obtain API Key

#### Option A: Direct from Moonshot Console
1. Visit [platform.moonshot.ai](https://platform.moonshot.ai)
2. Sign in or create an account
3. Navigate to Console → API Keys section
4. Click "Create API Key"
5. Name it (e.g., "Kimi-K2-Key")
6. Copy the key immediately (starts with `sk-`)

#### Option B: Via OpenRouter (Free)
1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up for a free account
3. Get API key
4. Use model: `moonshotai/kimi-k2:free`

### Step 2: Configure API Key

```bash
# Set your API key
./kimi_api.sh set-key "your-api-key-here"

# Verify the key is set
./kimi_api.sh get-key

# Test the key
./kimi_api.sh test-key
```

## Configuration Files

### Main Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `kimi_api.sh` | Main API interaction script | Project root |
| `kemi-claude-cli.sh` | Interactive CLI interface | Project root |
| `test_kimi_k2.py` | Python test script | Project root |
| `.kimi_api_config` | API key storage | `$HOME/.kimi_api_config` |

### Configuration Details

#### API Endpoint
- **URL**: `https://api.moonshot.ai/v1`
- **Model**: `kimi-k2-0711-preview`
- **Authentication**: Bearer token

#### Environment Variables
```bash
export KIMI_API_KEY="your-api-key"
export KIMI_API_URL="https://api.moonshot.ai/v1"
```

## Testing and Validation

### 1. API Key Validation
```bash
./kimi_api.sh test-key
```
**Expected Output**: `Success: API key is valid`

### 2. API Status Check
```bash
./kimi_api.sh status
```
**Expected Output**: `Kimi API is operational`

### 3. Available Models
```bash
./kimi_api.sh models
```
**Expected Output**: List of available models including Kimi variants

### 4. Chat Functionality Test
```bash
./kimi_api.sh chat "Hello, how are you?"
```
**Expected Output**: AI response from Kimi K2

### 5. Interactive CLI Test
```bash
./kemi-claude-cli.sh -m "Test message"
```
**Expected Output**: Formatted conversation with Kimi

## Usage Examples

### Basic Chat Commands

```bash
# Send a single message
./kimi_api.sh chat "Tell me about Alice in Wonderland"

# Interactive session
./kemi-claude-cli.sh

# Single message with CLI
./kemi-claude-cli.sh -m "What is the meaning of life?"

# Check available models
./kimi_api.sh models

# Test API status
./kimi_api.sh status
```

### Advanced Usage

```bash
# Use temporary API key for single request
./kimi_api.sh -k "temp-key" chat "Test message"

# Verbose output
./kimi_api.sh -v chat "Detailed message"

# Python test script
python3 test_kimi_k2.py "your-api-key"
```

### Interactive Session Example

```bash
$ ./kemi-claude-cli.sh
Welcome to Kemi Claude CLI!
Type 'quit' or 'exit' to end the session.

You: Hello Kimi!
Kemi Claude: Hello! How can I help you today?

You: Can you tell me a story?
Kemi Claude: Of course! Here's a short story about...

You: quit
Goodbye! Thanks for chatting with Kemi Claude.
```

## Integration with Alice Suite

### Current Integration Status

✅ **API Configuration**: Updated to use Kimi K2
✅ **Model Selection**: Using `kimi-k2-0711-preview`
✅ **Authentication**: Bearer token authentication
✅ **Error Handling**: Comprehensive error management
✅ **Response Parsing**: JSON response processing

### Integration Points

#### 1. Alice Reader App
- AI assistant functionality uses Kimi K2
- Contextual help for readers
- Question answering about text content
- Interactive learning support

#### 2. Consultant Dashboard
- AI-powered insights for consultants
- Reader progress analysis
- Automated assistance suggestions

### Future Integration Plans

- [ ] Real-time chat integration
- [ ] Voice interaction capabilities
- [ ] Multi-language support
- [ ] Advanced analytics integration

## Troubleshooting

### Common Issues and Solutions

#### 1. API Key Issues

**Problem**: `Error: API key test failed (HTTP 401)`
**Solution**: 
```bash
# Check current key
./kimi_api.sh get-key

# Set new key
./kimi_api.sh set-key "your-new-api-key"

# Test again
./kimi_api.sh test-key
```

#### 2. Model Not Found

**Problem**: `Not found the model kimi-k2-instruct`
**Solution**: 
```bash
# Check available models
./kimi_api.sh models

# Update model in configuration
# (Already done - using kimi-k2-0711-preview)
```

#### 3. Network Issues

**Problem**: Connection timeout or network errors
**Solution**:
```bash
# Check internet connection
ping api.moonshot.ai

# Test API status
./kimi_api.sh status

# Check firewall settings
```

#### 4. Permission Issues

**Problem**: Script execution denied
**Solution**:
```bash
# Make scripts executable
chmod +x kimi_api.sh
chmod +x kemi-claude-cli.sh
chmod +x test_kimi_k2.py
```

### Debug Mode

Enable verbose output for debugging:
```bash
./kimi_api.sh -v chat "Test message"
```

### Log Files

Temporary response files are created in `/tmp/`:
- `/tmp/kimi_chat_response.json`
- `/tmp/kimi_models_response.json`
- `/tmp/kimi_test_response.json`

## API Reference

### Available Commands

#### API Key Management
```bash
./kimi_api.sh set-key KEY        # Set API key
./kimi_api.sh get-key            # Display current key
./kimi_api.sh remove-key         # Remove stored key
./kimi_api.sh test-key           # Test key validity
```

#### API Requests
```bash
./kimi_api.sh chat MESSAGE       # Send chat message
./kimi_api.sh models             # List available models
./kimi_api.sh status             # Check API status
```

#### CLI Options
```bash
./kemi-claude-cli.sh             # Interactive mode
./kemi-claude-cli.sh -m TEXT     # Single message
./kemi-claude-cli.sh -p          # Print mode
./kemi-claude-cli.sh -h          # Help
```

### Request Format

#### Chat Completion Request
```json
{
    "model": "kimi-k2-0711-preview",
    "messages": [
        {
            "role": "user",
            "content": "Your message here"
        }
    ],
    "temperature": 0.3,
    "max_tokens": 1000
}
```

#### Response Format
```json
{
    "choices": [
        {
            "message": {
                "role": "assistant",
                "content": "Kimi's response"
            }
        }
    ]
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KIMI_API_KEY` | API key for authentication | None |
| `KIMI_API_URL` | API base URL | `https://api.moonshot.ai/v1` |

## Security Considerations

### API Key Security
- API keys are stored in `~/.kimi_api_config` with 600 permissions
- Keys are masked when displayed (shows first 8 and last 4 characters)
- Temporary keys can be used for single requests

### Best Practices
- Never commit API keys to version control
- Use environment variables for production deployments
- Regularly rotate API keys
- Monitor API usage and costs

## Performance Optimization

### Response Time
- Average response time: 2-5 seconds
- Depends on message length and complexity
- Network latency affects performance

### Rate Limiting
- Monitor API usage to avoid rate limits
- Implement retry logic for failed requests
- Use appropriate temperature settings for faster responses

## Support and Maintenance

### Regular Maintenance
- [ ] Monitor API key expiration
- [ ] Update model versions as needed
- [ ] Review and update documentation
- [ ] Test integration after updates

### Getting Help
- Check this documentation first
- Review troubleshooting section
- Test with simple commands
- Check API status and models

---

## Quick Start Checklist

- [ ] Obtain API key from Moonshot Console
- [ ] Set API key: `./kimi_api.sh set-key "your-key"`
- [ ] Test API key: `./kimi_api.sh test-key`
- [ ] Check models: `./kimi_api.sh models`
- [ ] Test chat: `./kimi_api.sh chat "Hello"`
- [ ] Test CLI: `./kemi-claude-cli.sh -m "Test"`
- [ ] Verify integration with Alice Suite

---

*Last updated: $(date)*
*Version: 1.0* 

## ✅ What's Been Implemented

### 1. **Activity Tracking Service** (Both Apps)
- Created `activityTrackingService.ts` for both alice-reader and consultant-dashboard
- Handles login/logout tracking and activity queries
- Uses the existing `interactions` table in Supabase

### 2. **Login/Logout Tracking** (alice-reader)
- Modified `AuthContext.tsx` to automatically track login and logout events
- Events are stored in the database when users sign in/out
- Non-intrusive - doesn't affect user experience

### 3. **Real-time Dashboard** (consultant-dashboard)
- Added "Currently Logged In" summary card to main dashboard
- Created `CurrentlyLoggedInUsers.tsx` component showing active users
- Added new tab in Reader Activity Dashboard
- Auto-refreshes every 30 seconds

### 4. **Database Integration**
- Uses existing `interactions` table with proper RLS policies
- Tracks user events with timestamps and context
- Shared between both applications

## 🎯 Key Features

1. **Real-time Monitoring**: Consultants can see who's currently logged in
2. **Automatic Tracking**: No user action required - tracking happens seamlessly
3. **Privacy Respectful**: Only shows aggregated data to consultants
4. **Scalable**: Easy to add more activity types in the future

##  How to Test

1. **Start both apps**:
   ```bash
   # Terminal 1 - alice-reader
   cd alice-reader && npm run dev
   
   # Terminal 2 - consultant-dashboard  
   cd alice-consultant-dashboard && npm run dev
   ```

2. **Login to alice-reader** with any user account

3. **Check consultant dashboard** - you should see:
   - "Currently Logged In" card showing 1 user
   - "Currently Logged In" tab with user details
   - Real-time updates every 30 seconds

4. **Test the tracking**:
   ```bash
   cd alice-reader
   node scripts/test-activity-tracking.js
   ```

## 📈 Next Steps

This foundation makes it easy to add more activity tracking:

1. **Page Navigation**: Track when users move between pages
2. **AI Interactions**: Track when users ask AI for help
3. **Reading Progress**: Track time spent reading
4. **Help Requests**: Track when users request assistance
5. **Real-time Notifications**: Alert consultants when users need help

The system is now ready to track any type of user activity and display it in the consultant dashboard. Would you like me to implement the next activity type, such as tracking page navigation or AI interactions? 