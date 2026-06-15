```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "gemini-3.1-flash-image-preview",
    "function": "image",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo",
      "image_urls": [],
      "aspect_ratio": "1:1",
      "resolution": "1K",
      "google_search": false,
      "image_search": false,
      "output_format": "png"
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
