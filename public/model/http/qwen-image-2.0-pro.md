```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "qwen-image-2.0-pro",
    "function": "image",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo",
      "image_urls": [],
      "n": 1,
      "negative_prompt": "示例",
      "aspect_ratio": "1:1",
      "prompt_extend": false,
      "watermark": false
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
