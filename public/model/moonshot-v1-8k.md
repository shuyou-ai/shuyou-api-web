# Create Chat Completion

```
POST https://api.shuyou.ai/v1/chat/completions
```

本文档仅描述 **与本模型相关** 的请求字段要点。**messages** 各角色与 content 多模态结构、以及未在下文单独列出的参数，均以 [**create-chat-completion.md**](/model/create-chat-completion.md) 为准。

## Request headers

### Authorization `string` <font color="red">必填</font>

Bearer Token 鉴权。

### Content-Type `string` <font color="red">必填</font>

请求内容类型，默认值为 `application/json`。

## Request

### model `string` <font color="red">必选</font>

调用时请填写本模型 ID：`moonshot-v1-8k`。

### messages `array` <font color="red">必选</font>

对话消息列表；结构与多模态片段说明见 [create-chat-completion.md](/model/create-chat-completion.md) 中 **Request → messages** 章节。

### stream `boolean` <font color="gray">可选</font>

是否流式返回；默认 `false`。

## 本模型额外支持的请求参数

下列参数在本模型元数据中标记为可用（语义仍受供应商实现约束；细节请对照参考文档同名小节）。

### frequency_penalty

频率惩罚，抑制重复用词。

### include_reasoning

是否在响应中包含推理过程片段。

### logit_bias

兼容 OpenAI Chat Completion 同名字段；语义与取值请以 [create-chat-completion.md](/model/create-chat-completion.md) 全文为准。

### logprobs

是否返回 token 的对数概率。

### max_tokens

生成的最大 token 数（上限受模型 context 约束）。

### min_p

兼容 OpenAI Chat Completion 同名字段；语义与取值请以 [create-chat-completion.md](/model/create-chat-completion.md) 全文为准。

### parallel_tool_calls

是否允许并行工具调用。

### presence_penalty

存在惩罚，鼓励谈论新话题。

### reasoning

推理/思维链相关配置（依供应商语义）。

### repetition_penalty

兼容 OpenAI Chat Completion 同名字段；语义与取值请以 [create-chat-completion.md](/model/create-chat-completion.md) 全文为准。

### response_format

响应格式约束，例如 JSON 模式。

### seed

随机种子，用于可复现输出（若供应商支持）。

### stop

停止生成的字符串或字符串数组。

### structured_outputs

是否启用结构化输出约束。

### temperature

采样温度；数值越大输出越随机。

### tool_choice

工具调用策略，如 `auto` / `none` / 指定 function。

### tools

模型可调用的工具（函数）定义列表。

### top_k

兼容 OpenAI Chat Completion 同名字段；语义与取值请以 [create-chat-completion.md](/model/create-chat-completion.md) 全文为准。

### top_logprobs

每个位置返回的 top logprobs 数量。

### top_p

核采样（nucleus sampling）。


## 模型能力与上下文

| 项 | 说明 |
|------|------|
| 上下文长度（tokens） | 8192 |
| 最大输出 tokens | 8192 |
| 输入模态 | text |
| 输出模态 | text |

## 请求示例

```bash
curl https://api.shuyou.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "moonshot-v1-8k",
    "messages": [
      {
        "role": "user",
        "content": "What is the meaning of life?"
      }
    ]
  }'
```

## 返回示例

成功时响应与 [create-chat-completion.md](/model/create-chat-completion.md) 中 **Response** 形态一致；以下为非流式示例（字段以实际供应商为准）：

```json
{
  "id": "chatcmpl-example",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "moonshot-v1-8k",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The question of life’s meaning has been explored by philosophy, religion, and science; many frameworks emphasize purpose, connection, and conscious experience."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 48,
    "total_tokens": 60
  }
}
```
