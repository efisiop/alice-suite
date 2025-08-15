#!/bin/bash

# Kimi API Shell Script
# Handles API key management and requests to Kimi API

set -euo pipefail

# Configuration
KIMI_API_URL="https://api.moonshot.ai/v1"
CONFIG_FILE="$HOME/.kimi_api_config"
KIMI_API_KEY="sk-SLf0f54faLNchFDFuryRbnZWqmWEhzdM2h6hWXWhNnhDHhUO"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored output
print_error() {
    echo -e "${RED}Error: $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}Success: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}Warning: $1${NC}"
}

print_info() {
    echo -e "$1"
}

# Show usage information
show_usage() {
    cat << EOF
Usage: $0 [OPTION] [COMMAND]

API Key Management:
  set-key KEY         Set the API key (saves to config file)
  get-key            Display the current API key
  remove-key         Remove the stored API key
  test-key           Test if the API key is valid

API Requests:
  chat MESSAGE       Send a chat message to Kimi API
  models             List available models
  status             Check API status

Options:
  -h, --help         Show this help message
  -v, --verbose      Enable verbose output
  -k, --key KEY      Use specific API key for this request (doesn't save)

Examples:
  $0 set-key "your-api-key-here"
  $0 chat "Hello, how are you?"
  $0 -k "temp-key" chat "Test message"
  $0 models

Environment Variables:
  KIMI_API_KEY       API key (overrides config file)
  KIMI_API_URL       API base URL (default: https://api.moonshot.cn/v1)
EOF
}

# Get API key from various sources
get_api_key() {
    local api_key=""
    
    # Priority: command line > environment variable > config file
    if [[ -n "${TEMP_API_KEY:-}" ]]; then
        api_key="$TEMP_API_KEY"
    elif [[ -n "${KIMI_API_KEY:-}" ]]; then
        api_key="$KIMI_API_KEY"
    elif [[ -f "$CONFIG_FILE" ]]; then
        api_key=$(cat "$CONFIG_FILE" 2>/dev/null || true)
    fi
    
    if [[ -z "$api_key" ]]; then
        print_error "No API key found. Set one using: $0 set-key YOUR_KEY"
        exit 1
    fi
    
    echo "$api_key"
}

# Set API key in config file
set_api_key() {
    local key="$1"
    
    if [[ -z "$key" ]]; then
        print_error "API key cannot be empty"
        exit 1
    fi
    
    # Create config directory if it doesn't exist
    mkdir -p "$(dirname "$CONFIG_FILE")"
    
    # Save API key with secure permissions
    echo "$key" > "$CONFIG_FILE"
    chmod 600 "$CONFIG_FILE"
    
    print_success "API key saved to $CONFIG_FILE"
}

# Display current API key (masked)
display_api_key() {
    local key
    key=$(get_api_key)
    local masked_key="${key:0:8}...${key: -4}"
    print_info "Current API key: $masked_key"
}

# Remove stored API key
remove_api_key() {
    if [[ -f "$CONFIG_FILE" ]]; then
        rm "$CONFIG_FILE"
        print_success "API key removed"
    else
        print_warning "No stored API key found"
    fi
}

# Test API key validity
test_api_key() {
    local key
    key=$(get_api_key)
    
    print_info "Testing API key..."
    
    local response
    response=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer $key" \
        -H "Content-Type: application/json" \
        "$KIMI_API_URL/models" \
        -o /tmp/kimi_test_response.json)
    
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        print_success "API key is valid"
        return 0
    else
        print_error "API key test failed (HTTP $http_code)"
        if [[ -f /tmp/kimi_test_response.json ]]; then
            cat /tmp/kimi_test_response.json
        fi
        return 1
    fi
}

# Send chat message to Kimi API
send_chat_message() {
    local message="$1"
    local key
    key=$(get_api_key)
    
    if [[ -z "$message" ]]; then
        print_error "Message cannot be empty"
        exit 1
    fi
    
    local payload
    payload=$(cat << EOF
{
    "model": "kimi-k2-0711-preview",
    "messages": [
        {
            "role": "user",
            "content": "$message"
        }
    ],
    "temperature": 0.3
}
EOF
)
    
    print_info "Sending message to Kimi API..."
    
    local response
    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $key" \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "$KIMI_API_URL/chat/completions" \
        -o /tmp/kimi_chat_response.json)
    
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        print_success "Message sent successfully"
        
        # Extract and display the response
        if command -v jq >/dev/null 2>&1; then
            local chat_response
            chat_response=$(jq -r '.choices[0].message.content' /tmp/kimi_chat_response.json 2>/dev/null || echo "Could not parse response")
            print_info "\nKimi's response:"
            print_info "$chat_response"
        else
            print_info "\nRaw response (install 'jq' for formatted output):"
            cat /tmp/kimi_chat_response.json
        fi
    else
        print_error "Chat request failed (HTTP $http_code)"
        if [[ -f /tmp/kimi_chat_response.json ]]; then
            cat /tmp/kimi_chat_response.json
        fi
        exit 1
    fi
}

# List available models
list_models() {
    local key
    key=$(get_api_key)
    
    print_info "Fetching available models..."
    
    local response
    response=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer $key" \
        -H "Content-Type: application/json" \
        "$KIMI_API_URL/models" \
        -o /tmp/kimi_models_response.json)
    
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        print_success "Models retrieved successfully"
        
        if command -v jq >/dev/null 2>&1; then
            print_info "\nAvailable models:"
            jq -r '.data[] | "- \(.id) (\(.created | strftime("%Y-%m-%d")))"' /tmp/kimi_models_response.json 2>/dev/null || cat /tmp/kimi_models_response.json
        else
            print_info "\nRaw response (install 'jq' for formatted output):"
            cat /tmp/kimi_models_response.json
        fi
    else
        print_error "Failed to retrieve models (HTTP $http_code)"
        if [[ -f /tmp/kimi_models_response.json ]]; then
            cat /tmp/kimi_models_response.json
        fi
        exit 1
    fi
}

# Check API status
check_status() {
    print_info "Checking Kimi API status..."
    
    local response
    response=$(curl -s -w "%{http_code}" \
        -H "Content-Type: application/json" \
        "$KIMI_API_URL/models" \
        -o /tmp/kimi_status_response.json)
    
    local http_code="${response: -3}"
    
    case "$http_code" in
        200)
            print_success "Kimi API is operational"
            ;;
        401)
            print_warning "API is operational but authentication required"
            ;;
        *)
            print_error "API may be down or experiencing issues (HTTP $http_code)"
            ;;
    esac
}

# Cleanup function
cleanup() {
    rm -f /tmp/kimi_*_response.json 2>/dev/null || true
}

# Set cleanup trap
trap cleanup EXIT

# Parse command line arguments
VERBOSE=false
TEMP_API_KEY=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -k|--key)
            if [[ -n "${2:-}" ]]; then
                TEMP_API_KEY="$2"
                shift 2
            else
                print_error "Option -k requires an argument"
                exit 1
            fi
            ;;
        set-key)
            if [[ -n "${2:-}" ]]; then
                set_api_key "$2"
                exit 0
            else
                print_error "set-key requires an API key argument"
                exit 1
            fi
            ;;
        get-key)
            display_api_key
            exit 0
            ;;
        remove-key)
            remove_api_key
            exit 0
            ;;
        test-key)
            test_api_key
            exit 0
            ;;
        chat)
            if [[ -n "${2:-}" ]]; then
                send_chat_message "$2"
                exit 0
            else
                print_error "chat requires a message argument"
                exit 1
            fi
            ;;
        models)
            list_models
            exit 0
            ;;
        status)
            check_status
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# If no arguments provided, show usage
show_usage