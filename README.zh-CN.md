# Block Style CMS (BlockCMS)

> 基于 [BlockNote](https://github.com/TypeCellOS/BlockNote) 构建的轻量级、零外部数据库依赖开源块式内容管理系统（简称 **BlockCMS**）。

<p align="center">
  <a href="./README.md">English</a> •
  <a href="./README.zh-TW.md">繁體中文</a> •
  <a href="https://hub.docker.com/r/biscuit6/block-style-cms">Docker Hub 镜像</a> •
  <a href="https://studio.xiyue.space/en-US/channel/cms">📖 使用经验与专栏</a>
</p>

---

## 🌟 核心特性

### 1. 积木式块级创作 (Block-First Editing)
本项目深度基于现代开源富文本项目 [BlockNote](https://github.com/TypeCellOS/BlockNote)（[官网](https://www.blocknotejs.org/)）构建，所有内容均采用积木式的 **Block（块）** 形式进行组织与管理，提供媲美 Notion 的直观创作体验：
* **丰富的排版块**：段落、多级标题（H1/H2/H3）、有序/无序列表、引用、分割线、表格等；
* **全能多媒体支持**：图片、音视频播放与文件附件下载，并支持视频封面图生成；
* **数学公式排版**：内置 LaTeX 数学公式引擎（基于 KaTeX），完整支持行内公式（`$...$`、`\(...\)`）与独立公式块；
* **技术图表与代码**：内置语法高亮代码块、Mermaid 流程图/时序图可视化渲染以及 SVG 矢量图表展示。

### 2. 灵活多元的应用场景
* **个人技术博客 / 创作者空间**：轻量灵动无负担，专注于纯粹写作与多媒体知识分享；
* **企业官网 / 团队知识库 / 产品文档中心**：模块化页面搭建、统一品牌展示与低门槛内容运维。

### 3. 纯本地文件系统落地，零数据库维护负担
* **彻底告别数据库运维**：无需安装、配置或维护 MySQL、PostgreSQL、MongoDB 或 Redis 等任何外部数据库服务；
* **无需云对象存储**：不依赖外部云端对象存储（如 AWS S3、阿里云 OSS 等），所有文章内容、媒体资源、系统设置与评论均持久化保存在本地文件系统中；
* **极简备份与迁移**：全站所有资产都存放在同一个目录下，数据迁移与备份只需复制该文件夹即可，真正做到数据自主可控。

### 4. 单核心参数驱动：`CMS_DATA_PATH`
系统采用极其简化的配置理念，核心仅依赖一个环境变量：
* **`CMS_DATA_PATH`**：指定本地数据持久化根路径。
* 系统首次启动时会自动在此路径下初始化全部分类目录（文章 `articles`、图片 `images`、音视频 `videos`/`audios`、附件 `files`、评论 `comments` 以及站点配置 `settings.json` 等）。

### 5. 开箱即用的 AI 创作辅助
内置轻量级 AI 辅助生成模块，支持接入 **OpenAI**（及任何兼容其 API 规范的模型端点）与 **Google Gemini**：
* **智能生成**：一键生成文章英文 URL 别名（Slug）、内容摘要（Summary）与 SEO 关键词提取；
* **多语言适配**：支持基于目标语种直接输出对应语言的摘要与关键词。

### 6. 丰富的外部服务集成
* **Pexels 免版权图库**：无缝打通 Pexels 官方 API，写作时可直接在线检索海量高清无版权图片，一键插入正文或作为文章封面；
* **Umami 访问统计**：开箱即用支持集成轻量、注重隐私保护的 Umami 网站统计分析；
* **Algolia 全文搜索**：可选接入 Algolia 搜索引擎，文章发布时自动增量同步索引，支持海量内容毫秒级检索。

### 7. 原生多语言国际化 (i18n)
* 内置完整支持 **简体中文（`zh-CN`）**、**繁体中文（`zh-TW`）** 与 **英文（`en-US`）**；
* 基于标准 URL 路径前缀路由，支持多语言自动协商与实时语言切换；
* 支持本地文案覆盖：可在 `CMS_DATA_PATH/locales/` 目录下放置同名 JSON 文件，按需重载或扩展系统翻译文案。

---

## 🚀 如何使用与部署

> ⚠️ **关于部署平台的特别说明**：  
> 很遗憾，虽然本项目采用 Next.js 技术构建，但由于所有内容和数据均直接保存在本地文件系统中，因此**不支持**在 Vercel 等 Serverless 平台环境中一键部署。请使用 VPS、独立服务器、家用服务器 / NAS 或本地主机，通过 **Docker** 或 **PM2** 进行部署。

本项目提供两种主要运行方式：**Docker 容器化部署（开箱即用，强烈推荐）** 与 **本地环境 Node.js + PM2 守护进程部署**。无论采用哪种方式，核心都只需要提供一个可写的数据目录 `CMS_DATA_PATH`。

### 方式一：Docker 部署（推荐，开箱即用）

本项目生产镜像已构建并推送至 Docker Hub：[`biscuit6/block-style-cms`](https://hub.docker.com/r/biscuit6/block-style-cms)。

#### 1. Docker CLI 单命令快速启动
```bash
# 1. 创建宿主机数据持久化目录
mkdir -p /opt/cms-data

# 2. 启动容器：挂载宿主机目录至容器内 /data，并指定 CMS_DATA_PATH
docker run -d \
  --name block-style-cms \
  -p 3000:3000 \
  -e CMS_DATA_PATH=/data \
  -v /opt/cms-data:/data \
  --restart unless-stopped \
  biscuit6/block-style-cms:latest
```

#### 2. Docker Compose 编排启动
创建 `docker-compose.yml` 文件：
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

在同级目录下执行启动命令：
```bash
docker compose up -d
```

---

### 方式二：本地运行与 PM2 守护进程部署

适用于具备 Node.js 运行环境的物理机、虚拟机或本地开发测试。

#### 1. 环境准备与依赖安装
```bash
# 克隆代码仓库
git clone https://github.com/Byte-Biscuit/block-style-cms.git
cd block-style-cms

# 建议使用 Node.js >= 24（与生产 Docker 基础镜像环境保持一致）
npm install
```

#### 2. 配置环境变量
在项目根目录下创建 `.env.local` 文件，配置数据存储路径：
```env
CMS_DATA_PATH=/your/custom/data/path
```

#### 3. 编译构建
```bash
npm run build
```

#### 4. 使用 PM2 常驻守护运行
在生产环境下，推荐使用 PM2 保证进程的高可用与异常自愈：
```bash
# 方式 A：直接通过 npm 脚本启动
pm2 start npm --name "block-style-cms" -- start

# 方式 B：使用项目自带的 PM2 配置文件启动
pm2 start pm2/ecosystem.config.js --env production

# 保存当前进程列表以实现开机自启
pm2 save
```
> 💡 若仅需在本地进行功能调试开发，配置好 `.env.local` 后直接执行 `npm run dev` 即可。

---

### 首次初始化向导 (Install Wizard)

无论采用 Docker 还是 PM2 启动服务，容器或进程就绪后，使用浏览器访问：

👉 **`http://localhost:3000/zh-CN/install`** （或您的服务器 IP / 域名）

根据图形化安装向导提示，设置管理员账户与站点基本信息，即可完成初始化并开始内容创作！

---

## 📖 使用经验与最佳实践

关于本 CMS 的详细使用技巧、功能玩法与生产部署实战经验，请参阅作者长期维护的经验专栏：

👉 **[Block Style CMS 使用经验与专栏文章](https://studio.xiyue.space/en-US/channel/cms)**

---

## 📄 开源协议

本项目采用 [MIT License](./LICENSE) 开源协议，欢迎广大开发者与创作者自由使用、进行商业应用或参与社区共建。
