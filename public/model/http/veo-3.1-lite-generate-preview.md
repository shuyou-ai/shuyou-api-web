```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "veo-3.1-lite-generate-preview",
    "function": "video",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo",
      "aspect_ratio": "16:9",
      "resolution": "1080P",
      "duration": "8",
      "generate_audio": false,
      "negative_prompt": "示例",
      "first_frame_url": "https://cdn.shuyoutech.com/20260303%2F2028714507317628929.jpeg",
      "last_frame_url": "https://cdn.shuyoutech.com/20260303%2F2028714507317628929.jpeg"
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
