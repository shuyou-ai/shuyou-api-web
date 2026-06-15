```bash
curl https://api.shuyou.ai/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "qwen3-vl-embedding",
    "input": "The quick brown fox jumps over the lazy dog."
  }'
```
