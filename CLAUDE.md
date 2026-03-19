# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Server

```bash
npm run dev      # Development server with hot reload
npm run build    # Production build
npm start        # Production server
```

Dev server runs on port 3000 by default. Requires a `.env.local` file — copy `.env.example` and fill in `DATABASE_URL`.

## Environment Setup

`.env.local` requires:
```
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
NODE_ENV=development
```

The database is hosted on [Neon](https://neon.tech) (serverless PostgreSQL).

## Architecture

**Tech Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4

**Backend:** API routes in `app/api/` handle data fetching, rate limiting, and database queries. Server components (RSC) reduce client-side bundle.

**Frontend:** Page/layout components in `app/` are React Server Components by default. Client components marked with `'use client'` for interactivity (search, theme toggle, comments). Reusable components in `components/` directory.

**Styling:** Tailwind CSS v4 with custom theme tokens. Dark mode via `data-theme` attribute on `<html>`, stored in `localStorage` under key `blogeletricista-theme`.

**Database schema (PostgreSQL):**
- `posts` — slug, title, excerpt, content, author_name/avatar/bio, image, featured, read_time, date, category_id
- `categories` — slug, name, color
- `tags` + `post_tags` — many-to-many join
- `comments` — post_id, author, email, content, date
- `subscribers` — email, name
- `contact_messages` — name, email, message, created_at

**Migrations:** registered in `migrations.sql`. No ORM — execute manually in Neon SQL Editor when adding tables/columns.

## API Routes

| Method | Path | Rate limit | Description |
|--------|------|-----------|-------------|
| GET | `/api/posts` | — | List with pagination (`page`, `limit`), category filter (`category`), search (`q`) |
| GET | `/api/posts/:slug` | — | Single post with full content + related posts |
| GET | `/api/categories` | — | All categories with post counts |
| GET | `/api/stats` | — | Blog statistics (posts, categories, comments, community) |
| GET | `/api/search` | — | Full-text search (Portuguese), falls back to LIKE |
| POST | `/api/newsletter` | 5/hour | Subscribe email (`name`, `email`) |
| POST | `/api/contact` | 5/hour | Contact form (`name`, `email`, `message`) → saved in `contact_messages` |
| GET | `/api/posts/:slug/comments` | — | Comments for a post (email **not** returned) |
| POST | `/api/posts/:slug/comments` | 10/15min | Add a comment |
| POST | `/api/admin/login` | — | Admin login (session-based) |
| GET/DELETE | `/api/admin/subscribers` | — | Manage subscribers |
| GET/DELETE | `/api/admin/contacts` | — | Manage contact messages |

## Pages and Routes

| URL | Component |
|-----|-----------|
| `/` | `app/page.tsx` |
| `/post/:slug` | `app/post/[slug]/page.tsx` |
| `/categorias` | `app/categorias/page.tsx` |
| `/categoria/:slug` | `app/categoria/[slug]/page.tsx` |
| `/sobre` | `app/sobre/page.tsx` |
| `/newsletter` | `app/newsletter/page.tsx` |
| `/busca` | `app/busca/page.tsx` |
| `/admin` | `app/admin/page.tsx` |

## Security

- **HTML content in posts** is sanitized server-side before storage and client-side via React's built-in XSS protection
- **Dynamic text fields** (comments, titles, names) escaped before rendering
- **Commenter email** not exposed in API `GET /api/posts/:slug/comments`
- **Rate limiting** via `express-rate-limit`: newsletter and contact (5/hour), comments (10/15min)
- **SQL injection** impossible — all queries use prepared statements (`$1`, `$2`, ...)
- **Admin routes** protected by session-based authentication

## Directory Structure

```
app/              # Next.js App Router pages and layouts
├── api/          # API routes (Route Handlers)
├── admin/        # Admin dashboard (protected)
├── post/         # Post detail page with SSG
├── categoria/    # Category pages with SSG
├── categorias/   # Categories list
├── busca/        # Search page
├── sobre/        # About page
├── newsletter/   # Newsletter signup
└── layout.tsx    # Root layout (HTML, headers, footer)

components/       # Reusable React components
├── PostCard.tsx
├── CommentForm.tsx
├── SearchBox.tsx
└── ...

lib/              # Utility functions (database, formatting, etc.)

public/           # Static assets (images, favicons)

styles/           # Global CSS (Tailwind CSS)
```
