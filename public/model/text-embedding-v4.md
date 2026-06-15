# Create embeddings

```
POST https://api.shuyou.ai/v1/embeddings
```

兼容 OpenAI **Embeddings** 请求形态。**鉴权与 Content-Type** 与 [create-chat-completion.md](/model/create-chat-completion.md) 中 **Request headers** 一致；请求体字段如下（若本模型在元数据中有 schema，则以下字段说明优先）。

## Request headers

### Authorization `string` <font color="red">必填</font>

Bearer Token 鉴权。

### Content-Type `string` <font color="red">必填</font>

`application/json`。

## Request（本模型相关字段）

### input.text `string` <font color="red">必填</font>

Enter the text to be processed.

- 最大长度：6000


## 请求示例

```bash
curl https://api.shuyou.ai/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "text-embedding-v4",
    "input": "The quick brown fox jumps over the lazy dog."
  }'
```

## 返回示例

成功时与 OpenAI Embeddings 响应形态兼容；**向量维度与长度**以具体模型为准：

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [
        0.0123,
        -0.0456,
        0.0089,
        0.021,
        -0.0033
      ]
    }
  ],
  "model": "text-embedding-v4",
  "usage": {
    "prompt_tokens": 8,
    "total_tokens": 8
  }
}
```
