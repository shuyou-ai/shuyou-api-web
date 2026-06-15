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
| `model` | string | 是 | `gemini-3.1-flash-tts-preview` | 模型 ID。 |
| `function` | string | 是 | `textToSpeech` | 须与本模型能力一致。 |
| `input` | object | 是 | 见下文 | 参数结构见下一节。 |
| `webhook` | string | 否 | （可选） | 回调地址；可不传，详见参考文档。 |

---

## 本模型 **input** 字段（语音合成：`function` 为 `textToSpeech`）

下列字段位于请求体中的 **`input`** 对象内（写法与 **create-a-prediction.md** 各能力章节一致，以下为 **本模型** 实际支持的子集与约束）。

### input.prompt `string` <font color="red">必填</font>

The text to convert to speech. Supports markup tags like [sigh], [laughing], [whispering], [shouting], [extremely fast] for expressive delivery.

- 默认值：`"Say cheerfully: Have a wonderful day!"`
- 最大长度：32000

### input.style_instructions `string` <font color="gray">可选</font>

Style instructions to control how the text is spoken. Use natural language to describe the desired tone, pace, accent, and emotion. 

- 默认值：`"Say the following."`
- 最大长度：1000

### input.voice `string` <font color="gray">可选</font>

Voice to use for speech generation

- 默认值：`"Kore"`
- 取值：`Achernar`、`Achird`、`Algenib`、`Algieba`、`Alnilam`、`Aoede`、`Autonoe`、`Callirrhoe`、`Charon`、`Despina`、`Enceladus`、`Erinome`、`Fenrir`、`Gacrux`、`Iapetus`、`Kore`、`Laomedeia`、`Leda`、`Orus`、`Pulcherrima`、`Puck`、`Rasalgethi`、`Sadachbia`、`Sadaltager`、`Schedar`、`Sulafat`、`Umbriel`、`Vindemiatrix`、`Zephyr`、`Zubenelgenubi`

### input.language_code `string` <font color="gray">可选</font>

Language for the speech output

- 默认值：`"English (US)"`
- 取值：`af-ZA`、`am-ET`、`ar-001`、`ar-EG`、`az-AZ`、`be-BY`、`bg-BG`、`bn-BD`、`ca-ES`、`ceb-PH`、`cmn-CN`、`cmn-tw`、`cs-CZ`、`da-DK`、`de-DE`、`el-GR`、`en-AU`、`en-GB`、`en-IN`、`en-US`、`es-419`、`es-ES`、`es-MX`、`et-EE`、`eu-ES`、`fa-IR`、`fi-FI`、`fil-PH`、`fr-CA`、`fr-FR`、`gl-ES`、`gu-IN`、`he-IL`、`hi-IN`、`hr-HR`、`ht-HT`、`hu-HU`、`hy-AM`、`id-ID`、`is-IS`、`it-IT`、`ja-JP`、`jv-JV`、`ka-GE`、`kn-IN`、`ko-KR`、`kok-IN`、`la-VA`、`lb-LU`、`lo-LA`、`lt-LT`、`lv-LV`、`mai-IN`、`mg-MG`、`mk-MK`、`ml-IN`、`mn-MN`、`mr-IN`、`ms-MY`、`my-MM`、`nb-NO`、`ne-NP`、`nl-NL`、`nn-NO`、`or-IN`、`pa-IN`、`pl-PL`、`ps-AF`、`pt-BR`、`pt-PT`、`ro-RO`、`ru-RU`、`sd-IN`、`si-LK`、`sk-SK`、`sl-SI`、`sq-AL`、`sr-RS`、`sv-SE`、`sw-KE`、`ta-IN`、`te-IN`、`th-TH`、`tr-TR`、`uk-UA`、`ur-PK`、`vi-VN`

### input.output_format `string` <font color="gray">可选</font>

Audio output format

- 默认值：`"mp3"`
- 取值：`mp3`、`wav`、`ogg_opus`


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
    "model": "gemini-3.1-flash-tts-preview",
    "function": "textToSpeech",
    "input": {
      "prompt": "Say cheerfully: Have a wonderful day!",
      "style_instructions": "Say the following.",
      "voice": "Kore",
      "language_code": "English (US)",
      "output_format": "mp3"
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
