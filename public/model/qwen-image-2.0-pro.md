# Create a prediction

```
POST https://api.shuyou.ai/v1/predictions
```

本文档仅描述 **本模型** 在 **`input`** 中的字段。**顶层请求体、`webhook`、任务轮询与各 `function` 通用约定** 必须以 [**create-a-prediction.md**](/model/create-a-prediction.md) 为准。

## Request headers

### Authorization `string` <font color="red">必填</font>

Bearer Token 鉴权。

### Content-Type `string` <font color="red">必填</font>

`application/json`。

---

## 通用请求体结构

与 [create-a-prediction.md](/model/create-a-prediction.md) **「通用请求体结构」** 一致；下表补充 **本模型** 应使用的取值。

| 字段 | 类型 | 必填 | 本模型取值 | 说明 |
|------|------|------|------------|------|
| `model` | string | 是 | `qwen-image-2.0-pro` | 模型 ID。 |
| `function` | string | 是 | `image` | 须与本模型能力一致。 |
| `input` | object | 是 | 见下文 | 参数结构见下一节。 |
| `webhook` | string | 否 | （可选） | 回调地址；可不传，详见参考文档。 |

---

## 本模型 **input** 字段（图片：`function` 为 `image`）

下列字段位于请求体中的 **`input`** 对象内（写法与 **create-a-prediction.md** 各能力章节一致，以下为 **本模型** 实际支持的子集与约束）。

### input.prompt `string` <font color="red">必填</font>

A text description of the image you want to generate

- 最大长度：800

### input.image_urls `array<string>（元素 uri）` <font color="gray">可选</font>

Input images to transform or use as reference (supports up to 3 images)

- 默认值：`[]`

### input.n `integer` <font color="gray">可选</font>

The number of images to generate. Must be between 1 and 4.

- 默认值：`1`

### input.negative_prompt `string` <font color="gray">可选</font>

Negative prompt, used to describe content you do not wish to appear in the image, imposing constraints on the visual output.

- 最大长度：500

### input.aspect_ratio `string` <font color="gray">可选</font>

Aspect ratio of the generated image

- 取值：`1:1`、`16:9`、`9:16`、`4:3`、`3:4`

### input.prompt_extend `boolean` <font color="gray">可选</font>

Whether to enable intelligent prompt (text) rewriting. When enabled, a large language model will be used to optimize the prompt and output the reasoning process.

- 默认值：`false`

### input.watermark `boolean` <font color="gray">可选</font>

Whether to add a watermark. The watermark will be placed at the bottom right corner of the image with the fixed text "AI generated".

- 默认值：`false`


## 响应字段说明（摘要）

创建任务后的响应字段含义与 **create-a-prediction.md** 一致，常见项如下：

| 字段 | 说明 |
|------|------|
| `data.task_id` | 异步任务 ID。 |
| `data.task_status` | 任务状态。 |
| `data.output` | 产物列表（如媒体 URL）。 |
| `usage` | 用量与计费相关字段。 |

## 请求示例

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

## 返回示例

创建任务成功时的响应体与 [create-a-prediction.md](/model/create-a-prediction.md) **Response（创建任务）** 一致，示例：

```json
{
  "data": {
    "task_id": "2c4d50261173430290971a2395a3b607",
    "task_status": "processing"
  }
}
```
