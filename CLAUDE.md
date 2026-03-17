# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Server

```bash
npm start        # or: node server.js
```

Server runs on port 3457 by default (configurable via `PORT` env var). Requires a `.env` file — copy `.env.example` and fill in `DATABASE_URL`.

## Environment Setup

`.env` requires:
```
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
PORT=3457
NODE_ENV=development
```

The database is hosted on [Neon](https://neon.tech) (serverless PostgreSQL).

## Architecture

**Backend:** Express.js (`server.js`) serving static HTML files + a JSON REST API. No build step — everything is vanilla HTML/CSS/JS.

**Frontend:** Each HTML page has inline `<script>` that fetches from the API and renders cards/content dynamically. `script.js` contains shared logic: theme toggle, mobile nav, scroll reveal animations, back-to-top button, and the home page post loader.

**Database schema (PostgreSQL):**
- `posts` — slug, title, excerpt, content, author_name/avatar/bio, image, featured, read_time, date, category_id
- `categories` — slug, name, color
- `tags` + `post_tags` — many-to-many join
- `comments` — post_id, author, email, content, date
- `subscribers` — email, name
- `contact_messages` — name, email, message, created_at

**Migrations:** registradas em `migrations.sql`. Não há ORM — execute manualmente no SQL Editor do Neon ao adicionar tabelas/colunas.

## API Routes

| Method | Path | Rate limit | Description |
|--------|------|-----------|-------------|
| GET | `/api/posts` | — | List with pagination (`page`, `limit`), category filter (`category`), search (`q`) |
| GET | `/api/posts/:slug` | — | Single post with full content + related posts |
| GET | `/api/categories` | — | All categories with post counts |
| GET | `/api/stats` | — | Blog statistics (posts, categories, comments, community) |
| GET | `/api/search` | — | Full-text search (Portuguese), falls back to LIKE |
| POST | `/api/newsletter` | 5/hora | Subscribe email (`name`, `email`) |
| POST | `/api/contact` | 5/hora | Contact form (`name`, `email`, `message`) → salva em `contact_messages` |
| GET | `/api/posts/:slug/comments` | — | Comments for a post (email **não** é retornado) |
| POST | `/api/posts/:slug/comments` | 10/15min | Add a comment |

## Pages and Routes

| URL | HTML file |
|-----|-----------|
| `/` | `index.html` |
| `/post/:slug` | `post.html` |
| `/categorias` | `category.html` |
| `/categoria/:slug` | `category.html` |
| `/sobre` | `about.html` |
| `/newsletter` | `newsletter.html` |
| `/busca` or `/buscar` | `search.html` |

## Security

- **HTML do conteúdo de posts** é sanitizado via `sanitizeHTML()` em `post.html` antes de ser inserido no DOM (remove `script`, `iframe`, atributos `on*` e `javascript:` hrefs)
- **Campos de texto dinâmicos** (comentários, títulos, nomes) usam `escapeHTML()` antes de `innerHTML`
- **Email dos comentaristas** não é exposto na API `GET /api/posts/:slug/comments`
- **Rate limiting** via `express-rate-limit`: newsletter e contato (5/hora), comentários (10/15min)
- **SQL injection** impossível — todas as queries usam prepared statements (`$1`, `$2`, ...)

## Styling

`styles.css` uses CSS custom properties for theming. Theme is stored in `localStorage` under key `blogeletricista-theme` and toggled via `data-theme` attribute on `<html>`. Fonts: **Instrument Serif** (headings) + **DM Sans** (body) from Google Fonts.

Post page (`post.html`) has additional inline `<style>` blocks for page-specific components (breadcrumb, post header, sidebar, content typography) since it has the most complex layout.
