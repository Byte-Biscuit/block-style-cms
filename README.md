# block-style-cms

[繁体中文](./README.zh-TW.md) | [简体中文](README.zh-CN.md)

🚧 A rapidly evolving, block-based open-source CMS for personal blogs & SME websites, focused on **structured content + rich media + multilingual delivery + lightweight deployment + AI-assisted authoring**.

## ✨ Overview

`block-style-cms` aims to provide a creation experience more flexible than traditional rich text and more approachable than pure headless architectures. Content is composed from reusable blocks (text, media, code, embedded elements, etc.), with an evolution path toward visual layouting, pluggable extensions, and adaptive page structures.

> 📘 If you are familiar with **Notion**, the block-first content model here will feel natural. The philosophy is similar—everything is a composable block—but this project emphasizes openness, self-hostability, and developer extensibility.

## 🔧 Tech Stack

| Area       | Technology               | Notes                                                                                         |
| ---------- | ------------------------ | --------------------------------------------------------------------------------------------- |
| Framework  | Next.js (App Router)     | SSR / RSC / dynamic routing / middleware                                                      |
| Editor     | BlockNote                | Block-style rich content editor (extensible)                                                  |
| UI         | MUI + Tailwind CSS       | Design system + utility-first styles                                                          |
| Auth       | better-auth              | GitHub / Google OAuth + SQLite persistence                                                    |
| Storage    | better-sqlite3           | Lightweight local DB (currently only for better-auth integration; pluggable adapters planned) |
| i18n       | next-intl                | Multi-language & dynamic translation                                                          |
| Validation | zod                      | Schema-driven validation & typing                                                             |
| Testing    | Vitest + Testing Library | Unit & component tests                                                                        |
| Lint/Format | Biome                   | Lint and format (replaces ESLint / Prettier)                                                  |
| Deployment | PM2 / Nginx (optional)   | Process management + reverse proxy                                                            |
| Others     | Mermaid / Media handling | Diagrams, images, audio, video, files                                                         |

## ✅ Current Features

- 🚀 Next.js App Router architecture (clear server/client separation)
- 🧩 Core BlockNote blocks: paragraph, headings, lists, code, quote, image, video, file, audio, Mermaid charts
- 🖼 Media management organized by type under `/data/*`
- 🌐 Multilingual (zh-CN / zh-TW / en-US) with translation abstraction
- 🔐 OAuth authentication (GitHub / Google) via better-auth + SQLite
- 🧪 Testing scaffold (Vitest)
- 📦 Deployment support (PM2 scripts, incremental deploy workflow)
- 🕒 Unified locale-aware time formatting (Intl)
- 🛡 Schema-driven validation for inputs & API (Zod factory pattern)
- 🤖 AI assisted generation: slug / summary / keywords / improvement suggestion / batch output (OpenAI & Gemini; extensible)

## 🗺️ Roadmap (Excerpt)

- [ ] Additional blocks: divider, columns, callouts, drag sorting
- [ ] Enhanced taxonomy (nested categories / SEO meta)
- [ ] Comment system (self-hosted or external adapters)
- [ ] Content search (full-text / indexing)
- [ ] Theme system & pluggable presentation layer
- [ ] Docker image & one-click deployment

Community input via Issues / PRs is welcome 🙌

## 📂 Directory Structure (Simplified)

```
block-style-cms/
├─ src/
│  ├─ app/                 # Next.js App Router
│  ├─ components/          # UI & block components
│  ├─ lib/                 # Business logic, services, auth, utilities
│  ├─ i18n/                # i18n config & message catalogs
│  ├─ types/               # Types & Zod schemas
│  └─ middleware.ts        # Middleware (locale, etc.)
├─ data/                   # Media & SQLite DB (better-auth.db)
├─ public/                 # Static assets
├─ ecosystem.config.js     # PM2 configuration
├─ package.json
└─ README.md
```

## ⚙️ Environment Variables

| Variable                           | Required              | Description                                |
| ---------------------------------- | --------------------- | ------------------------------------------ |
| `APPLICATION_DATA_PATH`            | No (default `./data`) | Data & DB root path                        |
| `BETTER_AUTH_GITHUB_CLIENT_ID`     | Optional              | GitHub OAuth client id                     |
| `BETTER_AUTH_GITHUB_CLIENT_SECRET` | Optional              | GitHub OAuth client secret                 |
| `BETTER_AUTH_GOOGLE_CLIENT_ID`     | Optional              | Google OAuth client id                     |
| `BETTER_AUTH_GOOGLE_CLIENT_SECRET` | Optional              | Google OAuth client secret                 |
| `BETTER_AUTH_SECRET`               | Recommended           | Auth signing secret                        |
| `OPENAI_API_KEY`                   | Optional (OpenAI)     | OpenAI API key                             |
| `OPENAI_BASE_URL`                  | Optional              | Custom OpenAI-compatible gateway           |
| `OPENAI_MODEL`                     | Optional              | Default `gpt-3.5-turbo` (override allowed) |
| `GEMINI_API_KEY`                   | Optional (Gemini)     | Google Gemini API key                      |
| `GEMINI_MODEL`                     | Optional              | Default `gemini-2.0-flash`                 |

> In production ensure `APPLICATION_DATA_PATH` is explicitly set and writable. See `.env.example` for details.

## 🛠 Local Development

```bash
git clone https://github.com/your-org/block-style-cms.git
cd block-style-cms
npm install   # or pnpm install / yarn

npm run dev
# open http://localhost:3000
```

## ✅ Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Dev server (HMR)                     |
| `npm run build` | Production build                     |
| `npm start`     | Start in production (non-standalone) |
| `npm test`      | Run Vitest suite                     |
| `npm run lint`  | Biome check (lint + format)          |
| `npm run format` | Format with Biome                   |

## 🚀 Deployment (PM2 Example)

```bash
npm ci
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
```

Update deployment:

```bash
git pull
npm ci
npm run build
pm2 reload ecosystem.config.js --env production
```

> If using `output: 'standalone'`, run `.next/standalone/server.js` and copy `public` + `.next/static`.

## 🗃 Data & Storage

- SQLite (better-sqlite3) default DB at `data/better-auth.db`
- Media folders: `data/images`, `data/videos`, `data/files`, `data/audios`
- Override root via `APPLICATION_DATA_PATH`

## 🔐 Authentication

GitHub & Google OAuth included; roadmap will add: local email/password, more providers.

## 🧱 BlockNote Block Set (Partial)

| Block                 | Purpose                          |
| --------------------- | -------------------------------- |
| Paragraph / Heading   | Basic text structure             |
| Lists (ol/ul)         | Content organization             |
| Code Block            | Highlighted code (extensible)    |
| Image / Video / Audio | Rich media                       |
| File                  | Download / attachment            |
| Mermaid               | Diagrams (flow / sequence / UML) |
| Quote                 | Typography enhancement           |

> Coming: divider, columns, collapsible, callouts, custom plugin registration.

## 🤖 AI Capabilities (Brief)

Located in `src/lib/ai.ts`:

- Generate: slug / summary / keywords / improvement / combined batch
- Providers: OpenAI (default) & Gemini, pluggable design
- Graceful fallback: returns empty string/null on failure
- Configurable via environment variables

## 🧪 Testing

```bash
npm test
vitest --watch
```

## 🤝 Contributing

1. Branch naming: `feat/xxx`, `fix/xxx`
2. Run: `npm run lint && npm test` before PR
3. Describe: motivation / changes / compatibility / optional screenshots
4. Issues: feature / bug / optimization with reproducible context

## 📬 Feedback

Issues & PRs welcome. If this project helps you, a ⭐ is appreciated.

---

> Vision: Structured, composable, extensible content with minimal operational overhead.

## 🧾 License

MIT License. See `LICENSE`.

Enjoy building! ✨
