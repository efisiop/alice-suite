#!/usr/bin/env python3

import os
import litellm

# Set environment variables
os.environ["MOONSHOT_API_KEY"] = "sk-57vLbjxCsuGIqd3SjQp72Psn6RuZdLtCz3x9rU8UhzKm0ue5"
os.environ["LITELLM_API_BASE"] = "https://api.moonshot.cn/v1"

# Test the connection
try:
    response = litellm.completion(
        model="moonshot/moonshot-v1-8k",
        messages=[
            {"role": "user", "content": "Explain the concept of a 'for loop' in Python in two sentences."}
        ],
        api_base="https://api.moonshot.cn/v1",
        api_key="sk-57vLbjxCsuGIqd3SjQp72Psn6RuZdLtCz3x9rU8UhzKm0ue5"
    )
    
    print("✅ Connection successful!")
    print("Response:")
    print(response.choices[0].message.content)
    
except Exception as e:
    print(f"❌ Error: {e}") 