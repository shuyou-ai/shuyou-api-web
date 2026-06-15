```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "hy-video-1.5",
    "function": "video",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo",
      "resolution": "1080P",
      "first_frame_url": "https://cdn.shuyoutech.com/20260303%2F2028714507317628929.jpeg"
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
