# Software Architecture Document (SAD)

**Project:** RAAFAT-Dictionary  
**Subtitle:** Harari Collaborative Dictionary & Language Preservation Platform  
**Version:** 1.0  
**Status:** Draft — Pre-development

---

## Table of Contents

1. [Architecture Style](#1-architecture-style)
2. [Technology Stack](#2-technology-stack)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Module Design](#4-module-design)
5. [Database Design](#5-database-design)
6. [API Design](#6-api-design)
7. [PWA Architecture](#7-pwa-architecture)
8. [Security Architecture](#8-security-architecture)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Future Modules](#10-future-modules)

---

## 1. Architecture Style

**Pattern:** Modular Monolith

```
Browser
   ↓
Next.js (Frontend + API Routes)
   ↓
PostgreSQL
```

### Rationale

- Single deployable unit — simpler for a small team
- Shared types between frontend and backend (TypeScript end-to-end)
- No microservices overhead at launch
- Modules are separated by domain inside the monolith, enabling future extraction if needed

**Do not start with microservices.**

---

## 2. Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| [Next.js](https://nextjs.org) (App Router) | React framework, SSR/SSG, API routes |
| TypeScript | Type safety across the stack |
| Tailwind CSS | Utility-first styling |
| PWA (`next-pwa` or Workbox) | Offline support, installability |

### Backend

| Technology | Purpose |
|------------|---------|
| Next.js API Routes | RESTful API layer |
| Prisma | ORM, migrations, type-safe queries |
| PostgreSQL | Primary data store |

### Authentication

| Technology | Purpose |
|------------|---------|
| [Better Auth](https://www.better-auth.com) or [Auth.js](https://authjs.dev) | Session management, OAuth providers |

Providers for V1:

- Email + password
- Google OAuth
- GitHub OAuth

### Storage

| Technology | Purpose |
|------------|---------|
| [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) | Object storage (exports, future audio files) |

### Hosting & Infrastructure

| Technology | Purpose |
|------------|---------|
| [Coolify](https://coolify.io) | Self-hosted PaaS — application deployment |
| Namecheap | Domain registrar |
| PostgreSQL (via Coolify) | Managed database service on same server or dedicated instance |

### Why Coolify

- Self-hosted — full control over data and costs
- Docker-based deployments with automatic SSL
- Built-in PostgreSQL, Redis, and backup support
- Git-push or webhook-triggered deploys
- Suitable for a community project with a limited budget

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│              (PWA — Service Worker + Cache)             │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Namecheap DNS                         │
│              → A/CNAME record → Coolify server          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Coolify (Reverse Proxy)               │
│              Traefik — SSL termination                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Application Container              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Pages /    │  │  API Routes  │  │   Prisma     │  │
│  │   App Router │  │  /api/*      │  │   Client     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────┬───────────────────────────────┬──────────┘
             │                               │
             ▼                               ▼
┌────────────────────────┐    ┌─────────────────────────┐
│      PostgreSQL        │    │    Cloudflare R2        │
│   (Coolify service)    │    │   (exports, assets)     │
└────────────────────────┘    └─────────────────────────┘
```

---

## 4. Module Design

The monolith is organized into domain modules. Each module owns its routes, services, and Prisma queries.

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Search, entry view
│   ├── (auth)/             # Login, register
│   ├── review/             # Review queue
│   └── profile/            # Contributor profiles
├── modules/
│   ├── dictionary/         # Search, entries, import
│   ├── suggestions/        # Corrections, voting
│   ├── review/             # Approval workflow
│   ├── users/              # Profiles, reputation
│   ├── notifications/      # In-app alerts
│   └── export/             # Admin data export
├── lib/
│   ├── auth/               # Auth configuration
│   ├── db/                 # Prisma client
│   └── pwa/                # Service worker helpers
└── prisma/
    └── schema.prisma
```

### Module Responsibilities

| Module | Responsibility | V1 |
|--------|---------------|-----|
| `dictionary` | CRUD, search, seed import | Yes |
| `suggestions` | Propose edits, track diffs | Yes |
| `review` | Queue, approve/reject, voting | Yes |
| `users` | Profiles, reputation points | Yes |
| `notifications` | In-app notification feed | Yes |
| `export` | Admin JSON/CSV export | Yes |

---

## 5. Database Design

### Entity Relationship Overview

```
Users ──────────────┬──────────── Suggestions
  │                 │                  │
  │                 │                  │
  ├──── Entries ────┼──── Discussions  │
  │                 │                  │
  │                 └──── Votes ───────┘
  │
  └──── Notifications
```

### 5.1 Users

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL DEFAULT 'contributor'
              CHECK (role IN ('contributor', 'reviewer', 'admin')),
  reputation  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.2 Entries

```sql
CREATE TABLE entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  harari          TEXT NOT NULL DEFAULT '',
  english         TEXT NOT NULL DEFAULT '',
  amharic         TEXT NOT NULL DEFAULT '',
  oromo           TEXT NOT NULL DEFAULT '',
  category        TEXT,
  part_of_speech  TEXT,
  example_harari  TEXT,
  example_english TEXT,
  status          TEXT NOT NULL DEFAULT 'pending_review'
                  CHECK (status IN ('verified', 'pending_review', 'rejected')),
  source          TEXT,
  import_ref      INTEGER,          -- original meshia_dictionary.json id
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_entries_harari  ON entries USING gin (harari gin_trgm_ops);
CREATE INDEX idx_entries_english ON entries USING gin (english gin_trgm_ops);
CREATE INDEX idx_entries_status  ON entries (status);
```

> Requires `pg_trgm` extension for fast partial-match search.

### 5.3 Suggestions

```sql
CREATE TABLE suggestions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id    UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  field_name  TEXT NOT NULL,
  old_value   TEXT NOT NULL,
  new_value   TEXT NOT NULL,
  user_id     UUID NOT NULL REFERENCES users(id),
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id)
);

CREATE INDEX idx_suggestions_status ON suggestions (status);
CREATE INDEX idx_suggestions_entry  ON suggestions (entry_id);
```

### 5.4 Votes

```sql
CREATE TABLE votes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id),
  vote_type     TEXT NOT NULL
                CHECK (vote_type IN ('correct', 'incorrect', 'needs_discussion')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (suggestion_id, user_id)
);
```

### 5.5 Discussions

```sql
CREATE TABLE discussions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id    UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  content     TEXT NOT NULL,
  parent_id   UUID REFERENCES discussions(id),  -- for replies
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_discussions_entry ON discussions (entry_id);
```

### 5.6 Notifications

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  message     TEXT NOT NULL,
  link        TEXT,
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, read);
```

---

## 6. API Design

RESTful endpoints under `/api/v1/`.

### Dictionary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/entries` | Search entries (`?q=&lang=&page=`) | Public |
| `GET` | `/api/v1/entries/:id` | Get single entry | Public |
| `POST` | `/api/v1/entries` | Submit new entry | Contributor+ |

### Suggestions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/suggestions` | Propose edit | Contributor+ |
| `GET` | `/api/v1/suggestions` | List suggestions (`?status=pending`) | Reviewer+ |
| `PATCH` | `/api/v1/suggestions/:id` | Approve or reject | Reviewer+ |

### Votes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/suggestions/:id/votes` | Cast vote | Reviewer+ |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/users/:id` | Public profile | Public |
| `GET` | `/api/v1/users/me` | Current user profile | Authenticated |

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/admin/export` | Export data (`?format=json\|csv`) | Admin |

---

## 7. PWA Architecture

### Cache Strategy

| Asset Type | Strategy | TTL |
|------------|----------|-----|
| Static assets (JS, CSS, fonts) | Cache-first | Long (versioned) |
| Dictionary entries (search results) | Stale-while-revalidate | 24 hours |
| Entry detail pages | Network-first, fallback to cache | 7 days |
| User drafts | IndexedDB | Until submitted |

### Offline Capabilities (V1)

| Feature | Offline Support |
|---------|----------------|
| Search | Yes — cached entries |
| Browse entries | Yes — cached entries |
| View entry detail | Yes — if previously visited |
| Submit suggestion | Draft saved locally; syncs on reconnect |
| Review / vote | No — requires network |

### Sync

- **Background Sync API** for queued suggestion submissions
- On reconnect: flush IndexedDB draft queue → POST to API
- Conflict resolution: server wins; user notified if draft was rejected

### Service Worker Lifecycle

```
Install → Pre-cache app shell + recent search results
Activate → Clean old caches
Fetch   → Route to appropriate cache strategy
Sync    → Flush offline draft queue
```

---

## 8. Security Architecture

### Authentication Flow

```
User → OAuth provider / email+password
     → Better Auth / Auth.js issues JWT
     → HTTP-only cookie stored in browser
     → API routes validate session on each request
```

### Authorization (RBAC)

| Role | Middleware Check |
|------|-----------------|
| Guest | No session required for public routes |
| Contributor | `session.user.role >= contributor` |
| Reviewer | `session.user.role >= reviewer` |
| Admin | `session.user.role === admin` |

### Security Checklist

| Concern | Mitigation |
|---------|-----------|
| Password storage | Argon2 hashing via auth library |
| Session hijacking | HTTP-only, Secure, SameSite cookies |
| CSRF | Built into Next.js + auth library |
| SQL injection | Prisma parameterized queries |
| XSS | React auto-escaping; CSP headers via Coolify/Traefik |
| Rate limiting | API route middleware (per-IP, per-user) |
| HTTPS | Enforced by Coolify Traefik (Let's Encrypt) |

---

## 9. Deployment Architecture

### Infrastructure Overview

```
Namecheap Domain
      │
      ▼ (A record → server IP)
Coolify Server (VPS)
      │
      ├── Traefik (reverse proxy, SSL)
      ├── Next.js App (Docker container)
      ├── PostgreSQL (Coolify-managed service)
      └── Optional: Redis (sessions/cache, post-V1)
```

### Environment Configuration

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Session signing secret |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth |
| `R2_ACCOUNT_ID` | Cloudflare R2 account |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 credentials |
| `R2_BUCKET_NAME` | Storage bucket |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` |

### Coolify Setup Steps

1. **Provision VPS** — any provider (Hetzner, DigitalOcean, etc.)
2. **Install Coolify** — `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`
3. **Add PostgreSQL service** in Coolify dashboard
4. **Create application** — connect Git repository, set build pack to Dockerfile or Nixpacks
5. **Configure environment variables** in Coolify UI
6. **Point Namecheap DNS** — A record to VPS IP (or CNAME if using Coolify's domain proxy)
7. **Enable SSL** — Coolify auto-provisions Let's Encrypt certificate
8. **Deploy** — push to `main` triggers production deploy; `staging` branch for staging

### Environments

| Environment | Branch | URL |
|-------------|--------|-----|
| Production | `main` | `https://yourdomain.com` |
| Staging | `staging` | `https://staging.yourdomain.com` |

### CI/CD Flow

```
Developer pushes to Git
        │
        ▼
Coolify webhook triggers build
        │
        ▼
Docker image built (Next.js standalone output)
        │
        ▼
Database migrations run (prisma migrate deploy)
        │
        ▼
Container deployed with zero-downtime rolling update
        │
        ▼
Health check passes → traffic routed to new container
```

### Backup Strategy

| Resource | Method | Frequency |
|----------|--------|-----------|
| PostgreSQL | Coolify scheduled backup → R2 | Daily |
| R2 exports | Versioned objects | On each export |
| Application | Git is source of truth | Continuous |

### Seed Data Import

One-time migration script to import `meshia_dictionary.json`:

```
npm run db:seed
  → reads meshia_dictionary.json
  → maps fields to entries table
  → bulk inserts with import_ref preserved
  → sets status based on verified flag
```

---

## 10. Future Modules

Explicitly deferred. Do not implement in V1.

| Module | Description | Dependency |
|--------|-------------|------------|
| Audio pronunciation | Record native speakers; store in R2 | R2, media upload pipeline |
| Example sentence corpus | Community-generated usage at scale | Mature contributor base |
| Language learning | Flashcards, quizzes, spaced repetition | Large verified entry set |
| AI assistant | Harari translation, grammar help | Verified corpus, LLM integration |
| Email notifications | Digest and real-time alerts | SMTP or transactional email service |
| Redis caching | Session store, search cache | Traffic growth |

---

## Appendix: Key Architectural Decisions

| Decision | Choice | Alternatives Considered | Rationale |
|----------|--------|------------------------|-----------|
| Architecture | Modular monolith | Microservices | Small team, faster iteration |
| Framework | Next.js | Remix, SvelteKit | Full-stack TypeScript, PWA support |
| Database | PostgreSQL | SQLite, MongoDB | Relational data, full-text search, proven at scale |
| Hosting | Coolify (self-hosted) | Vercel, Cloudflare Pages | Cost control, data sovereignty |
| Domain | Namecheap | — | Already owned |
| Object storage | Cloudflare R2 | S3, local storage | Low cost, no egress fees |
| Auth | Better Auth / Auth.js | Clerk, Supabase Auth | Open source, self-hosted compatible |

---

*See [SRS.md](./SRS.md) for functional requirements and V1 scope.*
