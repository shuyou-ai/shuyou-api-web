# ShuYou API Web

> ShuYou API 统一 AI 大模型 API 平台的前端 Web 应用 —— 面向 AI API 开发者的模型聚合、在线 Studio 与开发者控制台。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)

---

## 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [环境变量](#环境变量)
- [项目结构](#项目结构)
- [路由与页面](#路由与页面)
- [后端对接说明](#后端对接说明)
- [开发命令](#开发命令)
- [部署建议](#部署建议)
- [参与贡献](#参与贡献)
- [许可证](#许可证)
- [相关链接](#相关链接)

---

## 项目简介

**ShuYou API Web**（`shuyou-api-web`）是 [ShuYou AI](https://github.com/shuyou-ai) 生态中的前端项目，为开发者提供：

- **模型市场**：浏览、搜索、筛选数百个 AI 模型，查看定价与 API 文档
- **在线 Studio**：文本 / 图像 / 视频生成工作台，登录后即可体验
- **开发者控制台**：API Key 管理、账单充值、用量统计、调用日志
- **统一接入**：对接后端聚合服务，支持 OpenAI 兼容接口及多种模态端点

本项目为 **纯前端**，业务数据与鉴权由独立后端 API 提供（通过 `API_BASE_URL` 配置）。本地开发时，Next.js 会将 `/api/*` 请求代理到上游服务。

---

## 功能特性

| 模块 | 说明 |
|------|------|
| **首页** | 产品介绍、API Base URL 展示、快速入口 |
| **Models** | 多维度筛选（类型、厂商、计费方式、端点类型）、搜索、模型详情与 Markdown API 文档 |
| **Studio** | 文本对话（流式）、图像生成（WebSocket）、视频生成（WebSocket） |
| **Console** | API Keys 创建/编辑、Stripe / 微信支付充值、用量图表、调用日志 |
| **认证** | 邮箱注册登录、GitHub / Google OAuth 回调 |
| **主题** | 亮色 / 暗色模式切换（`next-themes`） |

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | [Next.js 15](https://nextjs.org/)（App Router） |
| UI | [React 19](https://react.dev/)、[Tailwind CSS 4](https://tailwindcss.com/) |
| 语言 | TypeScript 5 |
| AI SDK | [Vercel AI SDK](https://sdk.vercel.ai/)、`@ai-sdk/openai` |
| 表单 / 校验 | `react-hook-form`、`@hookform/resolvers`、Zod |
| 图表 | Recharts |
| Markdown | `react-markdown`、`remark-gfm`、`rehype-raw` |
| 动画 | GSAP |
| 其他 | `next-themes`、`sonner`、`date-fns` |

---

## 快速开始

### 环境要求

- **Node.js** ≥ 18.18（推荐 20 LTS）
- **npm** / **pnpm** / **yarn** 任选其一
- 可访问的 **ShuYou 后端 API**（或自建兼容后端）

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/shuyou-ai/shuyou-api-web.git
cd shuyou-api-web

# 安装依赖
npm install

# 配置环境变量（见下方「环境变量」章节）
cp .env .env.local
# 编辑 .env.local，填入 API_BASE_URL 等

# 启动开发服务器
npm run dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)。

### 生产构建

```bash
npm run build
npm run start
```

---

## 环境变量

在项目根目录创建 `.env.local`（或复用 `.env` / `.env.production`），常用变量如下：

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `API_BASE_URL` | 是 | 后端 API 根地址（含 `/backend` 前缀），用于 Next.js `rewrites` 代理 |
| `NEXT_PUBLIC_API_BASE_URL` | 是 | 浏览器端直接请求的 API 地址，需与后端 CORS 策略匹配 |
| `OPENAI_API_KEY` | 否 | Studio 文本生成 Route（`/api/chat`）使用的 OpenAI Key |
| `NEXT_PUBLIC_PREDICTIONS_WEBHOOK_URL` | 否 | 模型详情页 Predictions 示例中的 Webhook 地址 |
| `NEXT_DEV_FULL_SITE_PROXY` | 否 | 开发环境设为 `0` 可关闭全站 fallback 代理 |

`NEXT_PUBLIC_WS_UPSTREAM` 由 `next.config.ts` 根据 `API_BASE_URL` 自动注入，供图像/视频 WebSocket 直连上游。

**示例：**

```env
API_BASE_URL=https://your-backend.example.com/backend
NEXT_PUBLIC_API_BASE_URL=https://your-backend.example.com/backend
OPENAI_API_KEY=sk-...
```

> 请勿将含密钥的 `.env.local` 提交到版本库。`.gitignore` 已忽略本地环境文件。

---

## 项目结构

```
shuyou-api-web/
├── public/                          # 静态资源（不经编译，直接对外提供）
│   ├── assets/                      # 通用 SVG 等资源
│   │   └── center/                  # 控制台相关图标（支付宝等）
│   ├── content/                     # 通用 Markdown 内容
│   │   └── chat-completions.md      # Chat Completions 说明文档
│   ├── images/                      # 站点图片资源
│   │   ├── about/                   # 关于页
│   │   ├── benefits/                # 首页优势区块
│   │   ├── brands/                  # 品牌 Logo
│   │   ├── hero/                    # 首页 Hero 装饰
│   │   ├── home/                    # 首页插图
│   │   ├── logo/                    # 站点 Logo 与生成器图标
│   │   ├── model/                   # 模型类型图标（text/image/video 等）
│   │   └── ...                      # dashboard、users、tab-image 等
│   └── model/                       # 模型 API 文档（Markdown，323+ 篇）
│       ├── *.md                     # 各模型文档（与 model id 对应）
│       ├── default.md               # 默认文档模板
│       └── http/                    # HTTP 端点专用文档副本
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # 根布局（主题、Metadata、Toaster）
│   │   ├── globals.css              # 全局样式
│   │   ├── not-found.tsx            # 404 页面
│   │   ├── icon.svg                 # 站点 Favicon
│   │   │
│   │   ├── (site)/                  # 主站路由组（Header + Footer）
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # 首页 /
│   │   │   ├── about/               # 关于页 /about
│   │   │   ├── docs/                # 文档占位 /docs
│   │   │   ├── console/             # 控制台占位 /console
│   │   │   ├── models/              # 模型市场
│   │   │   │   ├── page.tsx         #   /models 列表
│   │   │   │   ├── detail/[id]/     #   /models/detail/:id 详情
│   │   │   │   ├── api.ts           #   模型列表/筛选 API 封装
│   │   │   │   ├── types.ts         #   类型定义
│   │   │   │   └── _components/     #   筛选器、卡片、搜索等
│   │   │   ├── account/             # 开发者控制台
│   │   │   │   ├── layout.tsx       #   侧边栏布局
│   │   │   │   ├── api-keys/        #   /account/api-keys
│   │   │   │   ├── billing/         #   /account/billing
│   │   │   │   ├── usage/           #   /account/usage
│   │   │   │   └── logs/            #   /account/logs
│   │   │   ├── (auth)/              # 认证相关（无主导航样式）
│   │   │   │   ├── signin/          #   /signin
│   │   │   │   ├── signup/          #   /signup
│   │   │   │   └── reset-password/  #   /reset-password
│   │   │   └── auth/callback/       # OAuth 回调页
│   │   │       ├── github/
│   │   │       └── google/
│   │   │
│   │   ├── (generator)/             # Studio 路由组（独立侧边栏布局）
│   │   │   ├── layout.tsx
│   │   │   ├── text-generator/      # /text-generator 文本对话
│   │   │   ├── image-generator/     # /image-generator 图像生成
│   │   │   └── video-generator/     # /video-generator 视频生成
│   │   │
│   │   ├── api/                     # Next.js Route Handlers
│   │   │   ├── chat/route.ts        # 文本流式对话（Vercel AI SDK）
│   │   │   └── auth/callback/       # OAuth 服务端回调
│   │   │       ├── github/route.ts
│   │   │       └── google/route.ts
│   │   │
│   │   └── providers/
│   │       └── toaster.tsx          # Sonner 全局 Toast
│   │
│   ├── components/                  # React 组件
│   │   ├── layout/                  # 布局：Header、Footer、导航
│   │   ├── sections/                # 页面级区块
│   │   │   ├── home-hero/           #   首页 Hero
│   │   │   ├── about/               #   关于页内容
│   │   │   └── model-detail/        #   模型详情与 API 调试面板
│   │   ├── account/                 # 控制台：API Key、用量、日志、支付弹窗
│   │   ├── generator/               # Studio：文本/图像/视频工作台与侧边栏
│   │   └── ui/                      # 通用 UI：Modal、DatePicker、表格等
│   │
│   ├── hooks/                       # 自定义 Hooks
│   │   └── use-reveal-text.ts
│   │
│   ├── icons/                       # SVG 图标组件
│   │   └── icons.tsx
│   │
│   └── lib/                         # 工具库与业务逻辑
│       ├── api/                     # HTTP / WebSocket 客户端
│       │   ├── client.ts            #   apiFetch、鉴权 Header
│       │   ├── query.ts             #   通用查询封装
│       │   ├── ai-image-generate-ws.ts
│       │   ├── ai-video-generate-ws.ts
│       │   ├── model-log-page.ts    #   调用日志分页
│       │   └── ...
│       ├── auth/                    # 客户端鉴权（localStorage + JWT 解析）
│       │   ├── client.ts
│       │   └── session.ts
│       ├── pay/                     # 支付：Stripe、微信支付
│       │   ├── stripe.ts
│       │   ├── wechat.ts
│       │   └── common.ts
│       ├── ai/                      # Studio 文本生成配置
│       │   ├── model.ts
│       │   └── prompts.ts
│       ├── zod/                     # Zod 校验 Schema
│       │   └── auth.schema.ts
│       └── utils.ts                 # 通用工具函数
│
├── next.config.ts                   # Next 配置：API 代理、图片域名、WS 环境变量
├── postcss.config.mjs               # PostCSS（Tailwind v4）
├── eslint.config.mjs                # ESLint 配置
├── tsconfig.json                    # TypeScript 配置
├── package.json
├── LICENSE                          # MIT
└── README.md
```

### 目录职责速查

| 路径 | 职责 |
|------|------|
| `public/model/` | 模型 API 文档源文件，详情页按 model id 加载对应 Markdown |
| `src/app/(site)/` | 面向访客的营销页、模型市场、账户控制台 |
| `src/app/(generator)/` | 需登录的 AI 生成 Studio，独立全屏布局 |
| `src/app/api/` | 少量服务端 Route；大部分业务 API 经 rewrite 转发至后端 |
| `src/lib/api/` | 与后端通信的核心封装，统一 `satoken` 鉴权头 |
| `src/lib/auth/` | 纯客户端 Token 存储与过期处理 |
| `src/lib/pay/` | 充值下单、轮询订单状态 |
| `src/components/ui/` | 可复用的基础 UI  primitives |

---

## 路由与页面

| 路径 | 说明 | 鉴权 |
|------|------|------|
| `/` | 首页 | 否 |
| `/models` | 模型列表与筛选 | 否 |
| `/models/detail/[id]` | 模型详情、定价、API 文档与在线调试 | 否 |
| `/text-generator` | 文本对话 Studio | 是 |
| `/image-generator` | 图像生成 Studio | 是 |
| `/video-generator` | 视频生成 Studio | 是 |
| `/account/api-keys` | API Key 管理 | 是 |
| `/account/billing` | 账单与充值 | 是 |
| `/account/usage` | API 用量统计 | 是 |
| `/account/logs` | 调用日志 | 是 |
| `/signin` `/signup` | 登录 / 注册 | 否 |
| `/about` | 关于与接入说明 | 否 |

外部文档链接（导航栏）：[https://docs.shuyou.ai/](https://docs.shuyou.ai/)

---

## 后端对接说明

```
浏览器  ──fetch──►  NEXT_PUBLIC_API_BASE_URL  ──►  后端 /backend/*
开发代理  ──rewrite──►  API_BASE_URL/api/:path*  ──►  后端
WebSocket  ──直连──►  NEXT_PUBLIC_WS_UPSTREAM/websocket
```

- 客户端请求通过 `src/lib/api/client.ts` 的 `apiFetch` 发起，自动附加 `satoken` Header。
- `401` 或业务码表示未授权时，会触发登出并跳转登录页。
- 开发模式下，`next.config.ts` 可将未匹配路由 fallback 到上游（`NEXT_DEV_FULL_SITE_PROXY` 控制）。

**本项目不包含后端服务**。需配合 ShuYou 后端或兼容实现一同部署。

---

## 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（默认 3000 端口） |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint |
| `npm run stripe:listen` | 本地 Stripe Webhook 转发（需 Stripe CLI） |

---

## 部署建议

1. 将 `API_BASE_URL` 与 `NEXT_PUBLIC_API_BASE_URL` 指向生产后端。
2. 确保后端已配置 CORS，允许前端域名访问。
3. 推荐使用 [Vercel](https://vercel.com/)、Docker 或任意 Node.js 托管平台。
4. 图像/视频 Studio 依赖 WebSocket，需保证 `NEXT_PUBLIC_WS_UPSTREAM` 对应地址可从用户浏览器访问。

---

## 参与贡献

欢迎提交 Issue 与 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feat/your-feature`
3. 提交变更：`git commit -m "feat: describe your change"`
4. 推送分支：`git push origin feat/your-feature`
5. 发起 [Pull Request](https://github.com/shuyou-ai/shuyou-api-web/compare)

**贡献建议：**

- 遵循现有代码风格与目录约定
- 组件放在 `src/components/` 对应子目录
- 新增页面路由置于 `src/app/(site)/` 或 `(generator)/`
- 模型文档新增至 `public/model/{model-id}.md`

---

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

## 相关链接

- **仓库**：[github.com/shuyou-ai/shuyou-api-web](https://github.com/shuyou-ai/shuyou-api-web)
- **API 文档**：[docs.shuyou.ai](https://docs.shuyou.ai/)
- **线上示例**：[coder.shuyou.ai](https://coder.shuyou.ai/) / [api.shuyou.ai](https://api.shuyou.ai/)
