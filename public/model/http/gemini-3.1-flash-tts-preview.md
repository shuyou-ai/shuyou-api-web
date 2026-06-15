```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "gemini-3.1-flash-tts-preview",
    "function": "textToSpeech",
    "input": {
      "prompt": "Say cheerfully: Have a wonderful day!",
      "style_instructions": "Say the following.",
      "voice": "Kore",
      "language_code": "English (US)",
      "output_format": "mp3"
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
