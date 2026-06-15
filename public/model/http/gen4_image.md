```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "gen4_image",
    "function": "image",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo",
      "aspect_ratio": "1:1",
      "resolution": "1080p",
      "reference_image_urls": [],
      "reference_tags": []
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
