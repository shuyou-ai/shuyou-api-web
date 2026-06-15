```bash
curl https://api.shuyou.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "moonshot-v1-32k-vision-preview",
    "messages": [
      {
        "role": "user",
        "content": "What is the meaning of life?"
      }
    ]
  }'
```
