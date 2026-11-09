<p align="center">
  <a href="https://github.com/Byte-Biscuit/block-style-cms">
    <img src="./public/logo.png" width="120" height="120" alt="Block Style CMS Logo" />
  </a>
</p>

# Block Style CMS (BlockCMS)

> A lightweight, zero-external-database, open-source block-style content management system built on [BlockNote](https://github.com/TypeCellOS/BlockNote) (abbreviated as **BlockCMS**).

<p align="center">
  <a href="./README.zh-CN.md">简体中文</a> •
  <a href="./README.zh-TW.md">繁體中文</a> •
  <a href="https://hub.docker.com/r/biscuit6/block-style-cms">Docker Hub Image</a> •
  <a href="https://studio.xiyue.space/en-US/channel/cms">📖 Articles & Guides</a>
</p>

---

## 🌟 Key Features

### 1. Block-First Content Creation
BlockCMS is deeply integrated with the modern open-source rich text project [BlockNote](https://github.com/TypeCellOS/BlockNote) ([official site](https://www.blocknotejs.org/)). All content is organized and managed as modular **Blocks**, offering an intuitive, Notion-like authoring experience:
* **Rich Typography**: Paragraphs, multi-level headings (H1/H2/H3), bulleted & numbered lists, blockquotes, horizontal dividers, and tables.
* **Full Multimedia Suite**: Embedded images, audio, and video playback with automatic video thumbnail generation, plus downloadable file attachments.
* **First-Class Math Support**: Native LaTeX math typesetting powered by KaTeX, supporting both inline formulas (`$...$`, `\(...\)`) and standalone formula blocks.
* **Diagrams & Code**: Syntax-highlighted code blocks, Mermaid diagrams (flowcharts, sequence diagrams, state charts), and SVG vector rendering.

### 2. Versatile Application Scenarios
* **Personal Blogs & Tech Portfolios**: Lightweight and clutter-free, designed for focused technical writing and multimedia sharing.
* **Enterprise Portals & Documentation Hubs**: Modular page layouts, unified branding, and low-maintenance team knowledge bases.

### 3. Pure Local Filesystem Persistence (Zero-DB Architecture)
* **Zero Database Maintenance**: No need to install, configure, or maintain external databases like MySQL, PostgreSQL, MongoDB, or Redis.
* **No Cloud Object Storage Required**: Works completely independently of external cloud buckets (AWS S3, Google Cloud Storage, Cloudflare R2, etc.). All articles, media files, comments, and configurations are stored directly in your local filesystem.
* **Effortless Backups & Migration**: Your entire site is housed within a single directory. Backing up or moving servers is as simple as copying that one folder—giving you true data sovereignty.

### 4. Single Configuration Anchor: `CMS_DATA_PATH`
Configuration is streamlined down to a single essential environment variable:
* **`CMS_DATA_PATH`**: Specifies the root path for local data persistence.
* On initial launch, the system automatically initializes all necessary subdirectories (`articles`, `images`, `videos`, `audios`, `files`, `comments`, and `settings.json`).

### 5. Out-of-the-Box AI Authoring Assistance
Built-in AI generation capabilities supporting **OpenAI** (including any OpenAI-compatible API gateway) and **Google Gemini**:
* **Smart Generation**: One-click generation of URL slugs, concise summaries, and SEO keywords.
* **Multilingual Output**: Automatically produces summaries and tags tailored to the target publication language.

### 6. Seamless Third-Party Integrations
* **Pexels Stock Photos**: Integrated directly with Pexels API. Search millions of high-resolution, royalty-free images within the editor and insert them or set as post covers with a single click.
* **Umami Analytics**: Out-of-the-box support for lightweight, privacy-respecting website traffic analytics.
* **Algolia Search**: Optional search indexing to enable millisecond-speed full-text article searches.

### 7. Native Multilingual Support (i18n)
* Built-in support for **English (`en-US`)**, **Simplified Chinese (`zh-CN`)**, and **Traditional Chinese (`zh-TW`)**.
* Standard URL-prefix routing with automatic locale negotiation and seamless language switching.
* Custom localized text overrides: drop custom JSON translation files into `CMS_DATA_PATH/locales/` to override or extend system strings.

---

## 🚀 Getting Started & Deployment

> ⚠️ **Important Note on Hosting Platforms**:  
> Unfortunately, although BlockCMS is built with Next.js, all data, media, and configurations are stored directly in the local filesystem. As a result, it **does not support** one-click deployment on serverless environments like Vercel. Please deploy on a VPS, dedicated cloud server, home server/NAS, or local machine using **Docker** or **PM2**.

BlockCMS can be run via **Docker (recommended for instant setup)** or natively with **Node.js + PM2 process management**. Regardless of the method chosen, you only need to supply one writable directory for `CMS_DATA_PATH`.

### Method 1: Docker Deployment (Recommended)

Production-ready images are published on Docker Hub: [`biscuit6/block-style-cms`](https://hub.docker.com/r/biscuit6/block-style-cms).

#### 1. Single Docker CLI Command
```bash
# 1. Create a local persistent storage directory
mkdir -p /opt/cms-data

# 2. Run the container: mount host directory to /data and set CMS_DATA_PATH
docker run -d \
  --name block-style-cms \
  -p 3000:3000 \
  -e CMS_DATA_PATH=/data \
  -v /opt/cms-data:/data \
  --restart unless-stopped \
  biscuit6/block-style-cms:latest
```

#### 2. Docker Compose
Create a `docker-compose.yml` file:
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

Start the service:
```bash
docker compose up -d
```

---

### Method 2: Local Deployment with PM2

Ideal for bare-metal servers, VPS instances, or local development environments.

#### 1. Prerequisites & Dependencies
```bash
# Clone the repository
git clone https://github.com/Byte-Biscuit/block-style-cms.git
cd block-style-cms

# Node.js >= 24 recommended (matches the production Docker environment)
npm install
```

#### 2. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
CMS_DATA_PATH=/your/custom/data/path
```

#### 3. Build for Production
```bash
npm run build
```

#### 4. Run with PM2 Daemon
For production reliability and auto-restart capabilities, use PM2:
```bash
# Option A: Start using npm script
pm2 start npm --name "block-style-cms" -- start

# Option B: Start using the bundled PM2 configuration
pm2 start pm2/ecosystem.config.js --env production

# Save process list for startup on system reboot
pm2 save
```
> 💡 For local development with hot reload, configure `.env.local` and simply run `npm run dev`.

---

### Initial Setup Wizard

Once the Docker container or PM2 process is running, open your browser and navigate to:

👉 **`http://localhost:3000/en-US/install`** (or your server's IP / domain)

Follow the guided setup wizard to create your administrator account and configure your site settings. You'll be ready to write in minutes!

---

## 📖 Best Practices & Tutorials

For detailed walkthroughs, practical tips, and deployment insights, check out the author's official guides column:

👉 **[Block Style CMS Guides & Articles](https://studio.xiyue.space/en-US/channel/cms)**

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE). You are welcome to use, modify, distribute, and build commercial applications upon it.
