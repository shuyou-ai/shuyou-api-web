# Create a prediction

```
POST https://api.shuyou.ai/v1/predictions
```

**Create a prediction** 是 ShuYou 提供的**异步多媒体生成**统一入口：同一路径下通过 **`function`** 区分任务类型（图片 / 视频 / 音频），由 **`model`** 与结构化 **`input`** 指定具体能力与参数。创建成功后，响应中的 **`data.task_id`** 即为异步任务 ID，可配合轮询 [Get a prediction](./get-a-prediction.md)（或配置的 **`webhook`**）查询进度与获取产物。

## Request headers

### Authorization `string` <font color="red">必填</font>

Bearer Token 鉴权。

### Content-Type `string` <font color="red">必填</font>

`application/json`。

---

## 通用请求体结构

所有能力共用下列顶层字段；**`input` 的形状随 `function` 变化**。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型 ID，如各模型详情页所示（可与平台约定的 `<供应商>/<模型名>` 形式一致）。 |
| `function` | string | 是 | 任务类型：`image`（图片）、`video`（视频）、`audio`（音频）。 |
| `input` | object | 是 | 与当前 `function` 对应的输入参数，见下文各节。 |
| `webhook` | string | 否 | 任务状态或结果更新时，服务端回调的 HTTPS URL（如 `https://api.shuyou.ai/api/callback`）。 |

---

## 一、图片生成（`function`: `image`）

用于文生图、参考图生图等场景。下列字段位于请求体中的 **`input`** 对象内。

### input.prompt `string` <font color="red">必填</font>

图像生成的文本描述（提示词）。

### input.aspect_ratio `string` <font color="gray">可选</font>

画幅比例，如 `1:1`、`16:9`、`9:16` 等。具体取值以所选模型文档为准。

### input.resolution `string` <font color="gray">可选</font>

输出分辨率档位，如 `1K`、`2K` 等。具体取值以所选模型文档为准。

### input.image_urls `array` <font color="gray">可选</font>

参考图或输入图 URL 列表（字符串数组），用于图生图或风格参考；不需要时可传空数组 `[]`。

### input.num_images `integer` <font color="gray">可选</font>

生成图片张数；默认为 `1`。实际上限取决于模型与配额。

### input.output_format `string` <font color="gray">可选</font>

输出编码格式，如 `png`、`jpeg`、`webp` 等；未传时由平台或模型使用默认格式。

::: tip
不同 **`model`** 对上述字段的支持范围可能不同，请以模型详情页为准；未支持的字段可能被忽略或返回参数错误。
:::

### 请求示例（图片）

```json
{
  "model": "gemini-2.5-flash-image",
  "function": "image",
  "input": {
    "prompt": "生成一个ShuYou AI logo",
    "aspect_ratio": "1:1",
    "resolution": "1K",
    "image_urls": [],
    "num_images": 1,
    "output_format": "png"
  },
  "webhook": "https://api.shuyou.ai/api/callback"
}
```

下列 **`api-request` / `api-response` 代码块用于右侧浮动示例面板**；宽屏下固定在页面右侧，**窄屏下会出现在正文下方**。

::: api-request POST /v1/predictions

```cURL
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "gemini-2.5-flash-image",
    "function": "image",
    "input": {
      "prompt": "生成一个ShuYou AI logo",
      "aspect_ratio": "1:1",
      "resolution": "1K",
      "image_urls": [],
      "num_images": 1,
      "output_format": "png"
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```

```TypeScript
const res = await fetch("https://api.shuyou.ai/v1/predictions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SHUYOU_API_KEY!}`,
  },
  body: JSON.stringify({
    model: "gemini-2.5-flash-image",
    function: "image",
    input: {
      prompt: "生成一个ShuYou AI logo",
      aspect_ratio: "1:1",
      resolution: "1K",
      image_urls: [],
      num_images: 1,
      output_format: "png",
    },
    webhook: "https://api.shuyou.ai/api/callback",
  }),
});

console.log(await res.json());
```

```Python
import json
import os
import urllib.request

req = urllib.request.Request(
    "https://api.shuyou.ai/v1/predictions",
    data=json.dumps(
        {
            "model": "gemini-2.5-flash-image",
            "function": "image",
            "input": {
                "prompt": "生成一个ShuYou AI logo",
                "aspect_ratio": "1:1",
                "resolution": "1K",
                "image_urls": [],
                "num_images": 1,
                "output_format": "png",
            },
            "webhook": "https://api.shuyou.ai/api/callback",
        }
    ).encode("utf-8"),
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {os.environ['SHUYOU_API_KEY']}",
    },
    method="POST",
)

with urllib.request.urlopen(req) as resp:
    print(resp.read().decode())
```

:::

::: api-response

```json
{
  "data": {
    "task_id": "2c4d50261173430290971a2395a3b607",
    "task_status": "processing"
  }
}
```

:::


---

## 二、视频生成（`function`: `video`）

用于文生视频等场景。下列字段位于请求体中的 **`input`** 对象内；不同 **`model`** 支持的取值范围可能不同（如分辨率档位、可选时长），请以模型详情页为准。

### input.prompt `string` <font color="red">必填</font>

视频内容与镜头的文本描述（提示词）。

### input.aspect_ratio `string` <font color="gray">可选</font>

画幅比例，如 `16:9`、`9:16`、`1:1` 等。具体取值以所选模型文档为准。

### input.resolution `string` <font color="gray">可选</font>

输出视频分辨率档位，如 `720P`、`1080P` 等。具体取值以所选模型文档为准。

### input.duration `string` <font color="gray">可选</font>

生成视频时长，一般以**字符串形式**传入秒数或模型约定的枚举（例如 `"4"` 表示 4 秒）。支持的档位因模型而异。

::: tip
若某字段对当前 **`model`** 无效，可能被忽略或触发参数校验错误；扩展字段（如首帧图 URL）以各模型文档为准。
:::

### 请求示例（视频）

```json
{
  "model": "veo-3.1-lite-generate-preview",
  "function": "video",
  "input": {
    "prompt": "A cinematic shot of a majestic lion in the savannah.",
    "aspect_ratio": "16:9",
    "resolution": "720P",
    "duration": "4"
  },
  "webhook": "https://api.shuyou.ai/api/callback"
}
```

::: details cURL / TypeScript / Python（视频）

```bash
curl https://api.shuyou.ai/v1/predictions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SHUYOU_API_KEY" \
  -d '{
    "model": "veo-3.1-lite-generate-preview",
    "function": "video",
    "input": {
      "prompt": "A cinematic shot of a majestic lion in the savannah.",
      "aspect_ratio": "16:9",
      "resolution": "720P",
      "duration": "4"
    },
    "webhook": "https://api.shuyou.ai/api/callback"
  }'
```

```typescript
const res = await fetch("https://api.shuyou.ai/v1/predictions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SHUYOU_API_KEY!}`,
  },
  body: JSON.stringify({
    model: "veo-3.1-lite-generate-preview",
    function: "video",
    input: {
      prompt: "A cinematic shot of a majestic lion in the savannah.",
      aspect_ratio: "16:9",
      resolution: "720P",
      duration: "4",
    },
    webhook: "https://api.shuyou.ai/api/callback",
  }),
});

console.log(await res.json());
```

```python
import json
import os
import urllib.request

req = urllib.request.Request(
    "https://api.shuyou.ai/v1/predictions",
    data=json.dumps(
        {
            "model": "veo-3.1-lite-generate-preview",
            "function": "video",
            "input": {
                "prompt": "A cinematic shot of a majestic lion in the savannah.",
                "aspect_ratio": "16:9",
                "resolution": "720P",
                "duration": "4",
            },
            "webhook": "https://api.shuyou.ai/api/callback",
        }
    ).encode("utf-8"),
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {os.environ['SHUYOU_API_KEY']}",
    },
    method="POST",
)

with urllib.request.urlopen(req) as resp:
    print(resp.read().decode())
```

:::

---

## 三、音频生成（`function`: `audio`）

音频能力的 **`input`** 字段（如文本转语音的音色、语速、采样率等）因模型而异。**本节参数说明与示例将在后续版本补充**；接入时请优先查阅对应 **`model`** 的详情页或控制台说明。

---

## Response（创建任务）

成功创建异步任务时，响应体为 JSON，顶层包含 **`data`** 对象，字段说明如下。

### data `object`

任务摘要载体。

### data.task_id `string`

异步任务的唯一标识。后续调用 [Get a prediction](./get-a-prediction.md)、或对 **`webhook`** 回调做关联时，均以该 ID 为准。

### data.task_status `string`

任务当前状态。例如 **`processing`** 表示任务已受理、正在处理；其他取值（如已完成、失败等）以接口实际枚举及 [Get a prediction](./get-a-prediction.md) 为准。

### 响应示例

```json
{
  "data": {
    "task_id": "2c4d50261173430290971a2395a3b607",
    "task_status": "processing"
  }
}
```

若配置了 **`webhook`**，服务端将在任务推进或完成时向该 URL 推送通知；也可使用 [Get a prediction](./get-a-prediction.md)，在路径中传入 **`task_id`** 查询状态与产物链接。

::: warning
请勿将 **`webhook`** 指向不可信的地址；应校验回调来源与载荷签名（若平台提供），避免伪造回调。
:::
