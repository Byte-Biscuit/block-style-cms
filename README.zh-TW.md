<p align="center">
  <a href="https://github.com/Byte-Biscuit/block-style-cms">
    <img src="./public/logo.png" width="120" height="120" alt="Block Style CMS Logo" />
  </a>
</p>

# Block Style CMS (BlockCMS)

> 基於 [BlockNote](https://github.com/TypeCellOS/BlockNote) 構建的輕量級、零外部資料庫依賴開源區塊式內容管理系統（簡稱 **BlockCMS**）。

<p align="center">
  <a href="./README.md">English</a> •
  <a href="./README.zh-CN.md">简体中文</a> •
  <a href="https://hub.docker.com/r/biscuit6/block-style-cms">Docker Hub 映像檔</a> •
  <a href="https://studio.xiyue.space/en-US/channel/cms">📖 使用經驗與專欄</a>
</p>

---

## 概覽

https://github.com/user-attachments/assets/f0288ab3-8f1f-4c4c-bc8d-568ca822f352

---

## 🌟 核心特色

### 1. 積木式區塊創作 (Block-First Editing)
本專案深度基於現代開源富文字專案 [BlockNote](https://github.com/TypeCellOS/BlockNote)（[官方網站](https://www.blocknotejs.org/)）構建，所有內容均採用積木式的 **Block（區塊）** 形式進行組織與管理，提供媲美 Notion 的直觀創作體驗：
* **豐富的排版區塊**：段落、多層級標題（H1/H2/H3）、編號/項目符號清單、引言、分隔線、表格等；
* **全方位多媒體支援**：圖片、影片與音訊播放、檔案附件下載，並支援影片封面圖自動產生；
* **數學公式排版**：內建 LaTeX 數學公式引擎（基於 KaTeX），完整支援行內公式（`$...$`、`\(...\)`）與獨立公式區塊；
* **技術圖表與程式碼**：內建語法高亮程式碼區塊、Mermaid 流程圖/循序圖視覺化渲染以及 SVG 向量圖表展示。

### 2. 靈活多元的應用場景
* **個人技術部落格 / 創作者空間**：輕巧靈活無負擔，專注於純粹寫作與多媒體知識分享；
* **企業官網 / 團隊知識庫 / 產品說明文件中心**：模組化頁面搭建、統一品牌展示與低維護門檻內容運維。

### 3. 純本機檔案系統落地，零資料庫維護負擔
* **徹底告別資料庫維運**：無需安裝、設定或維護 MySQL、PostgreSQL、MongoDB 或 Redis 等任何外部資料庫服務；
* **無需雲端物件儲存**：不依賴外部雲端物件儲存（如 AWS S3、Google Cloud Storage 等），所有文章內容、媒體資源、系統設定與留言均持久化保存在本機檔案系統中；
* **極簡備份與移轉**：全站所有資產均存放在同一個目錄下，資料移轉與備份只需複製該資料夾即可，真正做到資料自主可控。

### 4. 單一核心參數驅動：`CMS_DATA_PATH`
系統採用極致簡化的設定理念，核心僅依賴一個環境變數：
* **`CMS_DATA_PATH`**：指定本機資料持久化根路徑。
* 系統首次啟動時會自動在此路徑下初始化全部分類目錄（文章 `articles`、圖片 `images`、影片 `videos`、音訊 `audios`、附件 `files`、留言 `comments` 以及站台設定 `settings.json` 等）。

### 5. 開箱即用的 AI 創作輔助
內建輕量級 AI 輔助生成模組，支援接入 **OpenAI**（及任何相容其 API 規範的模型端點）與 **Google Gemini**：
* **智慧生成**：一鍵生成文章英文網址代稱（Slug）、內容摘要（Summary）與 SEO 關鍵字擷取；
* **多語言適配**：支援根據目標語系直接輸出對應語言的摘要與關鍵字。

### 6. 豐富的外部服務整合
* **Pexels 免版權圖庫**：無縫整合 Pexels 官方 API，寫作時可直接線上檢索海量高畫質免版權圖片，一鍵插入正文或作為文章封面；
* **Umami 流量統計**：開箱即用支援整合輕量、注重隱私保護的 Umami 網站流量統計分析；
* **Algolia 全文搜尋**：可選接入 Algolia 搜尋引擎，文章發布時自動增量同步索引，支援海量內容毫秒級檢索。

### 7. 原生多語言國際化 (i18n)
* 內建完整支援 **繁體中文（`zh-TW`）**、**簡體中文（`zh-CN`）** 與 **英文（`en-US`）**；
* 基於標準 URL 路徑前綴路由，支援多語言自動協商與即時語系切換；
* 支援本機文案自訂覆蓋：可在 `CMS_DATA_PATH/locales/` 目錄下放置同名 JSON 檔案，依需求覆寫或擴充系統翻譯文案。

---

## 🚀 如何使用與部署

> ⚠️ **關於部署平台的特別說明**：  
> 很遺憾，雖然本專案採用 Next.js 技術構建，但由於所有內容和資料均直接保存在本機檔案系統中，因此**不支援**在 Vercel 等 Serverless 平台環境中一鍵部署。請使用 VPS、獨立伺服器、家用伺服器 / NAS 或本機主機，透過 **Docker** 或 **PM2** 進行部署。

本專案提供兩種主要運作方式：**Docker 容器化部署（開箱即用，強烈推薦）** 與 **本機環境 Node.js + PM2 常駐程序部署**。無論採用哪種方式，核心都只需要提供一個可寫入的資料目錄 `CMS_DATA_PATH`。

### 方式一：Docker 部署（推薦，開箱即用）

本專案正式環境映像檔已建置並發布至 Docker Hub：[`biscuit6/block-style-cms`](https://hub.docker.com/r/biscuit6/block-style-cms)。

#### 1. Docker CLI 單一指令快速啟動
```bash
# 1. 建立主機端資料持久化目錄
mkdir -p /opt/cms-data

# 2. 啟動容器：掛載主機端目錄至容器內 /data，並指定 CMS_DATA_PATH
docker run -d \
  --name block-style-cms \
  -p 3000:3000 \
  -e CMS_DATA_PATH=/data \
  -v /opt/cms-data:/data \
  --restart unless-stopped \
  biscuit6/block-style-cms:latest
```

#### 2. Docker Compose 編排啟動
建立 `docker-compose.yml` 檔案：
```yaml
services:
  cms:
    image: biscuit6/block-style-cms:latest
    ports:
      - "3000:3000"
    environment:
      CMS_DATA_PATH: /data
    volumes:
      - ./cms-data:/data
    restart: unless-stopped
```

在同層目錄下執行啟動指令：
```bash
docker compose up -d
```

---

### 方式二：本機執行與 PM2 常駐程序部署

適用於具備 Node.js 執行環境的實體伺服器、虛擬機或本機開發測試。

#### 1. 環境準備與相依套件安裝
```bash
# 複製程式碼儲存庫
git clone https://github.com/Byte-Biscuit/block-style-cms.git
cd block-style-cms

# 建議使用 Node.js >= 24（與正式環境 Docker 基礎映像檔環境保持一致）
npm install
```

#### 2. 設定環境變數
在專案根目錄下建立 `.env.local` 檔案，設定資料儲存路徑：
```env
CMS_DATA_PATH=/your/custom/data/path
```

#### 3. 編譯建置
```bash
npm run build
```

#### 4. 使用 PM2 常駐守護行程運作
在正式環境下，推薦使用 PM2 確保程序的可用性與自動重啟修復：
```bash
# 方式 A：直接透過 npm 腳本啟動
pm2 start npm --name "block-style-cms" -- start

# 方式 B：使用專案內建的 PM2 設定檔啟動
pm2 start pm2/ecosystem.config.js --env production

# 儲存目前程序清單以啟用開機自啟動
pm2 save
```
> 💡 若僅需在本機進行功能除錯開發，設定好 `.env.local` 後直接執行 `npm run dev` 即可。

---

### 首次初始化安裝精靈 (Install Wizard)

無論採用 Docker 還是 PM2 啟動服務，容器或程序就緒後，使用瀏覽器造訪：

👉 **`http://localhost:3000/zh-TW/install`** （或您的伺服器 IP / 網域名稱）

依照圖形化安裝精靈引導，設定管理員帳號與站台基本資訊，即可完成初始化並開始內容創作！

---

## 📖 使用經驗與最佳實踐

關於本 CMS 的詳細使用技巧、進階玩法與生產部署實戰經驗，請參閱作者長期維護的經驗專欄：

👉 **[Block Style CMS 使用經驗與專欄文章](https://studio.xiyue.space/en-US/channel/cms)**

---

## 📄 開源授權協議

本專案採用 [MIT License](./LICENSE) 開源授權協議，歡迎廣大開發者與創作者自由使用、進行商業應用或參與社群共建。
