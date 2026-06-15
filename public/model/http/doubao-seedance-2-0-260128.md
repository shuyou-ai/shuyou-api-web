```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "doubao-seedance-2-0-260128",
    "function": "video",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo",
      "aspect_ratio": "16:9",
      "resolution": "720P",
      "duration": "5",
      "generate_audio": false,
      "first_frame_url": "https://cdn.shuyoutech.com/20260303%2F2028714507317628929.jpeg",
      "last_frame_url": "https://cdn.shuyoutech.com/20260303%2F2028714507317628929.jpeg",
      "reference_image_urls": [],
      "reference_video_urls": [],
      "reference_audio_urls": []
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```
