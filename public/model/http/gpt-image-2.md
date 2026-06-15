```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "gpt-image-2",
    "function": "image",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo",
      "image_urls": [],
      "aspect_ratio": "1:1",
      "resolution": "high",
      "output_format": "png",
      "num_images": 1,
      "output_compression": 90
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
