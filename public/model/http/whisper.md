```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "whisper",
    "function": "audio",
    "input": {
      "task": "transcribe",
      "language": "zh",
      "audio_url": "https://cdn.shuyoutech.com/example-audio.mp3"
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
