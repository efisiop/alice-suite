#!/usr/bin/env python3
"""
Test script for Kimi K2 API integration
Usage: python test_kimi_k2.py [your-api-key]
"""

import os
import sys
import requests
import json
from typing import Optional

# Configuration
API_BASE_URL = "https://api.moonshot.ai/v1"
MODEL = "kimi-k2-0711-preview"

def test_kimi_k2_api(api_key: str) -> bool:
    """Test the Kimi K2 API with the provided key"""
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": "Hello! Can you tell me a short story about Alice in Wonderland?"
            }
        ],
        "temperature": 0.7,
        "max_tokens": 500
    }
    
    try:
        print(f"Testing Kimi K2 API with model: {MODEL}")
        print(f"API URL: {API_BASE_URL}/chat/completions")
        print("-" * 50)
        
        response = requests.post(
            f"{API_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            print("✅ API test successful!")
            print(f"Response: {content}")
            return True
        else:
            print(f"❌ API test failed with status code: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing API: {str(e)}")
        return False

def list_available_models(api_key: str) -> bool:
    """List available models"""
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/models",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            models = response.json()
            print("Available models:")
            for model in models.get('data', []):
                if 'kimi' in model.get('id', '').lower():
                    print(f"  - {model['id']}")
            return True
        else:
            print(f"Failed to list models: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Error listing models: {str(e)}")
        return False

def main():
    # Get API key from command line argument or environment variable
    api_key = None
    
    if len(sys.argv) > 1:
        api_key = sys.argv[1]
    else:
        api_key = os.getenv("MOONSHOT_API_KEY") or os.getenv("KIMI_API_KEY")
    
    if not api_key:
        print("❌ No API key provided!")
        print("Usage: python test_kimi_k2.py [your-api-key]")
        print("Or set environment variable: MOONSHOT_API_KEY or KIMI_API_KEY")
        sys.exit(1)
    
    print("🧪 Testing Kimi K2 API Integration")
    print("=" * 50)
    
    # Test the API
    if test_kimi_k2_api(api_key):
        print("\n" + "=" * 50)
        print("✅ Kimi K2 API is working correctly!")
        print("\nNext steps:")
        print("1. Set your API key in the shell scripts:")
        print("   ./kimi_api.sh set-key 'your-api-key'")
        print("2. Test the shell script:")
        print("   ./kimi_api.sh test-key")
        print("3. Start interactive chat:")
        print("   ./kemi-claude-cli.sh")
    else:
        print("\n❌ Kimi K2 API test failed!")
        print("Please check your API key and try again.")

if __name__ == "__main__":
    main() 