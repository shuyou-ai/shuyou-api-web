```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "happyhorse-1.0-video-edit",
    "function": "video",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo",
      "reference_image_urls": [],
      "reference_video_urls": [],
      "resolution": "1080P",
      "watermark": false
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
