```bash
curl https://api.shuyou.ai/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "text-embedding-v4",
    "input": "The quick brown fox jumps over the lazy dog."
  }'
```
