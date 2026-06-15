```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "wan2.7-image-pro",
    "function": "image",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo",
      "reference_image_urls": [],
      "n": 1,
      "resolution": "2K",
      "prompt_extend": false,
      "watermark": false
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
