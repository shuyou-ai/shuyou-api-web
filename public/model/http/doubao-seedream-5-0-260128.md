```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "doubao-seedream-5-0-260128",
    "function": "image",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo",
      "reference_image_urls": [],
      "aspect_ratio": "1:1",
      "resolution": "2K",
      "output_format": "png"
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
