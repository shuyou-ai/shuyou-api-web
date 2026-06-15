```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "happyhorse-1.0-r2v",
    "function": "video",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo",
      "reference_image_urls": [],
      "aspect_ratio": "16:9",
      "resolution": "1080P",
      "duration": "5",
      "watermark": false
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
