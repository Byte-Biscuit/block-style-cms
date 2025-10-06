# block-style-cms

[English](./README.md) | [繁体中文](README.zh-TW.md)

## ✨ 项目简介

`block-style-cms` 旨在提供一种比传统富文本更灵活、比纯 Headless 更易用的内容管理体验：通过积木式内容块（Block）组合出文章 / 页面 / 内容段落，同时支持图片、音视频、文件、嵌入、代码、高级展示等多类型组件，并逐步向可视化排版、按需布局与可插拔扩展演进。

> 📘 如果你熟悉 **Notion**，那么你会很快适应本 CMS 的块式内容组织方式。理念相似：一切皆可重组，但这里更强调开源、自托管与面向开发者的可扩展能力。

## 🔧 技术栈

| 领域     | 采用技术                 | 说明                                                       |
| -------- | ------------------------ | ---------------------------------------------------------- |
| 前端框架 | Next.js (App Router)     | SSR / RSC / 动态路由 / 中间件                              |
| 编辑器   | BlockNote                | Block 风格富内容编辑（支持扩展）                           |
| UI 组件  | MUI + Tailwind CSS       | 设计体系 + 原子化样式并存                                  |
| 认证     | better-auth              | 支持 GitHub / Google OAuth & SQLite 存储                   |
| 数据存储 | better-sqlite3           | 轻量本地数据库（当前仅用于 better-auth；后续会抽象适配层） |
| 国际化   | next-intl                | 多语言 + 动态翻译                                          |
| 校验     | zod                      | Schema 驱动的类型与后端请求验证                            |
| 测试     | Vitest + Testing Library | 单元 / 组件测试                                            |
| 部署     | PM2 / Nginx (可选)       | 进程守护 + 反向代理                                        |
| 其他     | Mermaid / 媒体处理       | 图表、音视频、文件、图片管理                               |

## ✅ 已实现功能（Current）

- 🚀 Next.js App Router 架构，服务端/客户端合理分层
- 🧩 BlockNote 基础富内容块：段落、标题、列表、代码、引用、图片、视频、文件、音频、Mermaid 图表等
- 🖼 媒体管理：图片 / 视频 / 音频 / 文件分类存储（`/data/*`）
- 🌐 多语言支持（简体中文 / 繁体中文 / 英文）+ 翻译抽象
- 🔐 用户认证（GitHub / Google）基于 better-auth + SQLite 存储
- 🧪 基础测试脚手架（Vitest）
- 📦 部署支持：PM2 + 构建脚本（支持增量部署）
- 🕒 统一时间格式与本地化展示（Intl）
- 🛡 基础输入校验与后端请求校验（Zod schema factory）
- 🤖 AI 辅助生成：文章 slug / 摘要 / 关键词 / 优化建议 / 批量生成（支持 OpenAI 与 Gemini，可拓展）

## 🗺️ 规划路线（Roadmap）

- [ ] 更多内置 Block：分割线、分栏布局、提示/警告框、拖拽排序
- [ ] 标签 / 分类体系增强（层级 / SEO Meta）
- [ ] 评论系统（可选自托管 / 外部适配）
- [ ] 内容搜索（全文 / 索引优化）
- [ ] 多主题与可替换前端呈现层
- [ ] Docker 镜像 & 一键部署脚本

欢迎通过 Issue / PR 补充你的需求 🙌

## 📂 目录结构（简化示例）

```
block-style-cms/
├─ src/
│  ├─ app/                 # Next.js App Router 入口
│  ├─ components/          # UI 与 Block 相关组件
│  ├─ lib/                 # 业务逻辑、服务、工具、auth
│  ├─ i18n/                # 国际化配置与文案
│  ├─ types/               # 类型与 Zod Schema
│  └─ middleware.ts        # 中间件（多语言等）
├─ data/                   # 媒体与数据库（better-auth.db）
├─ public/                 # 公共静态资源
├─ ecosystem.config.js     # PM2 配置
├─ package.json
└─ README.md
```

## ⚙️ 环境变量（Environment Variables）

| 变量                               | 必需                | 示例 / 说明                                              |
| ---------------------------------- | ------------------- | -------------------------------------------------------- |
| `APPLICATION_DATA_PATH`            | 否（默认 `./data`） | `/root/data/block-style-cms/app/data` 数据与 DB 存放路径 |
| `BETTER_AUTH_GITHUB_CLIENT_ID`     | 可选                | GitHub OAuth Client ID                                   |
| `BETTER_AUTH_GITHUB_CLIENT_SECRET` | 可选                | GitHub OAuth Secret                                      |
| `BETTER_AUTH_GOOGLE_CLIENT_ID`     | 可选                | Google OAuth Client ID                                   |
| `BETTER_AUTH_GOOGLE_CLIENT_SECRET` | 可选                | Google OAuth Secret                                      |
| `BETTER_AUTH_SECRET`               | 建议                | Auth 签名密钥（未设可能回退不安全随机）                  |
| `OPENAI_API_KEY`                   | 可选 (使用 OpenAI)  | OpenAI API Key                                           |
| `OPENAI_BASE_URL`                  | 可选                | 自定义 OpenAI 兼容网关（如代理服务）                     |
| `OPENAI_MODEL`                     | 可选                | 默认 `gpt-3.5-turbo` 或自定义模型                        |
| `GEMINI_API_KEY`                   | 可选 (使用 Gemini)  | Google Gemini API Key                                    |
| `GEMINI_MODEL`                     | 可选                | 默认 `gemini-2.0-flash`                                  |

> 生产环境请显式设置 `APPLICATION_DATA_PATH` 并确保目录可写。详细的配置参数请参考.env.example.

## 🛠 安装与本地开发

```bash
git clone https://github.com/your-org/block-style-cms.git
cd block-style-cms
npm install   # 或 pnpm install / yarn

# 启动开发
npm run dev

# 打开浏览器
http://localhost:3000
```

## ✅ 运行脚本

| 命令            | 说明                                       |
| --------------- | ------------------------------------------ |
| `npm run dev`   | 本地开发（热更新）                         |
| `npm run build` | 生成生产构建                               |
| `npm start`     | 使用 Next.js 内建生产启动（非 standalone） |
| `npm test`      | 运行 Vitest 测试                           |
| `npm run lint`  | 代码质量检查                               |

## 🚀 生产部署（示例：PM2）

1. 安装依赖并构建：

```bash
npm ci
npm run build
```

2. 使用 PM2（标准模式）：

```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

3. 更新部署（简易）：

```bash
git pull
npm ci
npm run build
pm2 reload ecosystem.config.js --env production
```

> 如果使用 `output: 'standalone'`，需改为运行 `.next/standalone/server.js` 并复制 `public` 与 `.next/static` 资源；默认推荐标准模式降低复杂度。

## 🗃 数据 & 存储

- 默认使用 **SQLite (better-sqlite3)**，数据库文件：`data/better-auth.db`
- 媒体文件按类型分类：`data/images`, `data/videos`, `data/files`, `data/audios`
- 可通过 `APPLICATION_DATA_PATH` 自定义根目录

## 🔐 认证说明

当前接入 GitHub / Google OAuth；更多提供商可通过 better-auth 配置扩展。后续会：

- [ ] 支持本地邮箱 / 密码注册登录
- [ ] 支持微信登录

## 🧱 BlockNote 体系（部分）

| 类型               | 说明                |
| ------------------ | ------------------- |
| 段落 / 标题        | 基本文字结构        |
| 列表（有序/无序）  | 内容组织            |
| 代码块             | 语法高亮（可扩展）  |
| 图片 / 视频 / 音频 | 富媒体展示          |
| 文件上传/下载      | 附件分发            |
| Mermaid 图         | UML / 流程 / 序列图 |
| 引用               | 排版增强            |

> 未来将加入：表格 /分割线/ 分栏布局 / 可折叠区域 / 提示框 / 自定义插件注册。

## 🤖 AI 生成能力说明

内置轻量 AI 辅助创作能力（位于 `src/lib/ai.ts`）：

- 支持生成：Slug / 摘要 / 关键词 / 优化建议 / 批量组合结果
- 支持模型：OpenAI（默认）与 Gemini，可扩展适配更多 LLM
- 失败自动降级：出错返回空结果，不中断主流程
- 可通过环境变量切换 API Key、模型与代理网关

## 🧪 测试

```bash
npm test           # 运行全部测试
vitest --watch    # 持续监听
```

## 🤝 贡献指南

1. Fork & 新建分支：`feat/xxx` / `fix/xxx`
2. 提交前执行：`npm run lint && npm test`
3. PR 描述请包含：动机 / 变更点 / 兼容性 / 截图（可选）
4. Issue 模板：**需求 / Bug / 优化建议** 尽量复现清晰

## 📬 联系 & 反馈

欢迎提交 Issue / PR，或通过讨论区分享你的使用场景。如果你对这个方向感兴趣，也可以 star ⭐ 支持一下！

---

> 初衷：让内容创作 **结构化、组合化、可扩展**，同时保留部署简单与足够的可黑客性。希望它能成为你的下一套博客 / 官网 / 知识库底座。

## 🧾 License

本项目采用 MIT License，详见 `LICENSE` 文件。

祝使用愉快 🙌
