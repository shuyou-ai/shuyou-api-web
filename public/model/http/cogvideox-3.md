```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "cogvideox-3",
    "function": "video",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo",
      "aspect_ratio": "16:9"
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
