```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "glm-tts",
    "function": "textToSpeech",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo",
      "voice": "tongtong",
      "speed": 1,
      "volume": 1,
      "response_format": "wav"
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
