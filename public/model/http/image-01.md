```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "image-01",
    "function": "image",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo"
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
