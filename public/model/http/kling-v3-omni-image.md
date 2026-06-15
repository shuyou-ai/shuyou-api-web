```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "kling-v3-omni-image",
    "function": "image",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo",
      "reference_image_urls": [],
      "aspect_ratio": "16:9",
      "resolution": "1K",
      "num_images": 1
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
