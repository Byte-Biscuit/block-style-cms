# block-style-cms

[English](./README.md) | [简体中文](README.zh-CN.md)

🚧 一個快速演進中的 _模組化（Block 風格）開源 CMS_，面向個人部落格與中小企業網站，聚焦 **內容結構化 + 富媒體 + 多語系 + 輕量部署 + AI 協助創作**。

## ✨ 專案簡介

`block-style-cms` 致力於提供比傳統富文字更靈活、又比純 Headless 架構更親民的內容創作體驗：以積木式內容區塊（Block）組合文章 / 頁面 / 模組化片段，支援文字、媒體、程式碼、嵌入、圖表等類型，未來將邁向視覺化排版、動態布局與可插拔擴充。

> 📘 若你使用過 **Notion**，會很快適應此專案的 Block 式內容模式。理念相近：一切皆為可組合的內容單元，但本專案更強調開放原始碼、自架與開發擴充彈性。

## 🔧 技術堆疊

| 領域   | 技術                     | 說明                                                          |
| ------ | ------------------------ | ------------------------------------------------------------- |
| 框架   | Next.js (App Router)     | SSR / RSC / 動態路由 / 中介層                                 |
| 編輯器 | BlockNote                | 區塊式內容編輯（可擴充）                                      |
| UI     | MUI + Tailwind CSS       | 設計系統 + 原子化樣式並存                                     |
| 認證   | better-auth              | GitHub / Google OAuth 與 SQLite 儲存                          |
| 儲存   | better-sqlite3           | 輕量本機資料庫（目前僅供 better-auth 使用；後續將抽象化適配） |
| 多語   | next-intl                | 多語系與動態翻譯                                              |
| 驗證   | zod                      | Schema 驅動驗證與型別                                         |
| 測試   | Vitest + Testing Library | 單元 / 元件測試                                               |
| 部署   | PM2 / Nginx（選用）      | 行程守護 + 反向代理                                           |
| 其他   | Mermaid / 媒體處理       | 圖表、影音、檔案管理                                          |

## ✅ 目前功能

- 🚀 Next.js App Router 架構（清晰的 Server / Client 分層）
- 🧩 BlockNote 基礎內容區塊：段落、標題、列表、程式碼、引用、圖片、影片、檔案、音訊、Mermaid 圖表
- 🖼 媒體資源分類管理：`/data/*`
- 🌐 多語系（zh-CN / zh-TW / en-US）與抽象化翻譯層
- 🔐 第三方登入（GitHub / Google）+ SQLite 儲存
- 🧪 測試腳手架（Vitest）
- 📦 部署支援（PM2 流程、增量更新）
- 🕒 地區化時間格式（Intl）
- 🛡 Schema 驅動輸入與 API 驗證（Zod Factory）
- 🤖 AI 協助：Slug / 摘要 / 關鍵詞 / 優化建議 / 批量輸出（OpenAI、Gemini，可擴充）

## 🗺️ Roadmap（節錄）

- [ ] 更多內建 Blocks：分隔線、欄位布局、提示框、拖曳排序
- [ ] 進階分類 / 標籤（階層 / SEO Meta）
- [ ] 評論系統（自架或外部服務）
- [ ] 內容全文檢索與索引
- [ ] 主題 / 佈景切換與前端渲染層替換
- [ ] Docker 映像與一鍵部署

歡迎透過 Issue / PR 提出想法 🙌

## 📂 專案結構（簡化）

```
block-style-cms/
├─ src/
│  ├─ app/                 # Next.js App Router 入口
│  ├─ components/          # UI 與 Block 元件
│  ├─ lib/                 # 商業邏輯、服務、auth、工具
│  ├─ i18n/                # 多語設定與訊息來源
│  ├─ types/               # 型別與 Zod Schemas
│  └─ middleware.ts        # 中介功能（語系等）
├─ data/                   # 媒體與 SQLite DB（better-auth.db）
├─ public/                 # 靜態資源
├─ ecosystem.config.js     # PM2 設定
├─ package.json
└─ README.md
```

## ⚙️ 環境變數

| 變數                               | 必填                | 描述                     |
| ---------------------------------- | ------------------- | ------------------------ |
| `APPLICATION_DATA_PATH`            | 否（預設 `./data`） | 資料與 DB 根目錄         |
| `BETTER_AUTH_GITHUB_CLIENT_ID`     | 選填                | GitHub OAuth Client ID   |
| `BETTER_AUTH_GITHUB_CLIENT_SECRET` | 選填                | GitHub OAuth Secret      |
| `BETTER_AUTH_GOOGLE_CLIENT_ID`     | 選填                | Google OAuth Client ID   |
| `BETTER_AUTH_GOOGLE_CLIENT_SECRET` | 選填                | Google OAuth Secret      |
| `BETTER_AUTH_SECRET`               | 建議                | 簽章金鑰                 |
| `OPENAI_API_KEY`                   | 選填（使用 OpenAI） | OpenAI API Key           |
| `OPENAI_BASE_URL`                  | 選填                | 自訂 OpenAI 相容 Gateway |
| `OPENAI_MODEL`                     | 選填                | 預設 `gpt-3.5-turbo`     |
| `GEMINI_API_KEY`                   | 選填（使用 Gemini） | Gemini API Key           |
| `GEMINI_MODEL`                     | 選填                | 預設 `gemini-2.0-flash`  |

> 正式環境請確保 `APPLICATION_DATA_PATH` 可寫並已建立。更多範例見 `.env.example`。

## 🛠 本地開發

```bash
git clone https://github.com/your-org/block-style-cms.git
cd block-style-cms
npm install   # 或 pnpm install / yarn

npm run dev
# 開啟 http://localhost:3000
```

## ✅ 指令

| 指令            | 說明                      |
| --------------- | ------------------------- |
| `npm run dev`   | 開發（熱重載）            |
| `npm run build` | 建立正式版本              |
| `npm start`     | 正式啟動（非 standalone） |
| `npm test`      | 執行測試                  |
| `npm run lint`  | 程式碼檢查                |

## 🚀 部署（PM2 範例）

```bash
npm ci
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
```

更新部署：

```bash
git pull
npm ci
npm run build
pm2 reload ecosystem.config.js --env production
```

> 若使用 `output: 'standalone'`，請改執行 `.next/standalone/server.js` 並複製 `public` 與 `.next/static`。

## 🗃 資料與儲存

- 預設 SQLite DB：`data/better-auth.db`
- 媒體目錄：`data/images`, `data/videos`, `data/files`, `data/audios`
- 可用 `APPLICATION_DATA_PATH` 覆寫根目錄

## 🔐 認證

內建 GitHub / Google OAuth；規劃新增：本地帳號、更多第三方供應商。

## 🧱 BlockNote 區塊（部分）

| 區塊               | 用途                      |
| ------------------ | ------------------------- |
| 段落 / 標題        | 基礎文字結構              |
| 列表（有序/無序）  | 內容組織                  |
| 程式碼區塊         | 語法高亮（可擴充）        |
| 圖片 / 影片 / 音訊 | 富媒體展示                |
| 檔案               | 附件下載                  |
| Mermaid            | 圖表（流程 / 序列 / UML） |
| 引用               | 排版強化                  |

> 即將加入：分隔線、欄位佈局、可收折、提示框、自訂插件。

## 🤖 AI 能力（精簡）

位於 `src/lib/ai.ts`：

- 生成：Slug / 摘要 / 關鍵詞 / 改善建議 / 批次結果
- 支援：OpenAI（預設）、Gemini（可擴充其他）
- 錯誤回傳空值，不中斷流程
- 透過環境變數控制模型與端點

## 🧪 測試

```bash
npm test
vitest --watch
```

## 🤝 貢獻

1. 分支命名：`feat/xxx`、`fix/xxx`
2. PR 前：`npm run lint && npm test`
3. 描述內容：動機 / 變更 / 兼容性 / 截圖（可選）
4. Issue：請附復現或使用場景

## 📬 回饋

歡迎 Issue / PR，若專案對你有幫助，歡迎點個 ⭐ 支持！

---

> 初衷：讓內容創作 **結構化、組合化、可擴充**，並保持部署簡單與開發友善。

## 🧾 License

MIT 授權，詳見 `LICENSE`。

祝開發順利 ✨
