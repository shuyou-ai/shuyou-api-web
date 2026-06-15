```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "imagen-4.0-generate-001",
    "function": "image",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo",
      "aspect_ratio": "1:1",
      "resolution": "1K",
      "output_format": "png",
      "num_images": 1
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
