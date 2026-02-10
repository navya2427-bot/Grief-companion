import requests
from backend.config import PERPLEXITY_API_KEY

PPLX_URL = "https://api.perplexity.ai/chat/completions"

def call_perplexity(system_prompt: str, user_prompt: str) -> str:
    if not PERPLEXITY_API_KEY:
        return "AI is temporarily unavailable. Please try again later."

    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "sonar-pro",  # ✅ safer model name
        "messages": [
            {
                "role": "system",
                "content": system_prompt.strip()
            },
            {
                "role": "user",
                "content": user_prompt.strip()
            }
        ],
        "temperature": 0.4,
        "max_tokens": 200
    }

    try:
        response = requests.post(
            PPLX_URL,
            headers=headers,
            json=payload,
            timeout=30
        )

        # 🔍 Log error details if any
        if response.status_code != 200:
            print("PERPLEXITY ERROR:", response.status_code, response.text)
            return "I’m here with you. I’m having trouble responding right now."

        data = response.json()
        return data["choices"][0]["message"]["content"]

    except Exception as e:
        print("PERPLEXITY EXCEPTION:", str(e))
        return "I’m here with you. Let’s take a slow breath together."
