# Write Neko

AI-powered writing assistant. Built with Next.js App Router, Tailwind, and OpenRouter.

## Stack
- Next.js 16 (App Router)
- React 19
- better-sqlite3 + local `.md` files for storage
- OpenRouter API (`/api/generate`, `/api/rewrite`, `/api/seo`, `/api/settings`, `/api/history`)

## Pages
- `/generate` — create articles with presets: Artikel Blog, Blog Casual, Script Video Short, LinkedIn Post
- `/rewrite` — rewrite existing article with tone + keyword overrides
- `/history` — search, sort, preview, copy, download, delete saved articles
- `/settings` — save OpenRouter API key + model to `.env.local`

## Shared UI
- Reusable components live in `src/app/(main)/components/shared-ui.tsx`
- Pages import shared components/styles from `../components/shared-ui`

## Storage
- SQLite DB: `saved_articles/articles.db`
- Article body: `saved_articles/{id}.md`
- Settings: `.env.local`

## Run
```bash
npm install
npm run dev
# http://localhost:3000
```

## Notes
- Local-first: everything is stored in the repo workspace.
- UI uses dark minimal theme.
- No external auth yet.

