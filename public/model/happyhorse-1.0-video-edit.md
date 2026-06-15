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
| `model` | string | 是 | `happyhorse-1.0-video-edit` | 模型 ID。 |
| `function` | string | 是 | `video` | 须与本模型能力一致。 |
| `input` | object | 是 | 见下文 | 参数结构见下一节。 |
| `webhook` | string | 否 | （可选） | 回调地址；可不传，详见参考文档。 |

---

## 本模型 **input** 字段（视频：`function` 为 `video`）

下列字段位于请求体中的 **`input`** 对象内（写法与 **create-a-prediction.md** 各能力章节一致，以下为 **本模型** 实际支持的子集与约束）。

### input.prompt `string` <font color="red">必填</font>

The text prompt describing the video you want to generate

- 最大长度：2500

### input.reference_image_urls `array<string>（元素 uri）` <font color="gray">可选</font>

URLs of the reference images to use for consistent subject appearance

- 默认值：`[]`

### input.reference_video_urls `array<string>（元素 uri）` <font color="gray">可选</font>

URLs of the reference videos to use for consistent subject appearance

- 默认值：`[]`

### input.resolution `string` <font color="gray">可选</font>

The resolution of the generated video. Default value: 1080P

- 默认值：`"1080P"`
- 取值：`720P`、`1080P`

### input.watermark `boolean` <font color="gray">可选</font>

Whether to add a watermark. The watermark will be placed at the bottom right corner of the image with the fixed text "Happy Horse".

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
    "model": "happyhorse-1.0-video-edit",
    "function": "video",
    "input": {
      "prompt": "参考图片生成一个ShuYou AI logo",
      "reference_image_urls": [],
      "reference_video_urls": [],
      "resolution": "1080P",
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
