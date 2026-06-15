```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "qwen3-asr-flash",
    "function": "audio",
    "input": {
      "audio_url": []
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
