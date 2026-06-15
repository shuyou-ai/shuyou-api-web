```bash
curl https://api.shuyou.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "<your-model-id>",
    "messages": [
      {
        "role": "user",
        "content": "Hello"
      }
    ]
  }'
```
