# RAAFAT-Dictionary

**Harari Collaborative Dictionary & Language Preservation Platform**

A Progressive Web Application (PWA) that enables the Harari community to search, contribute to, review, and preserve a verified multilingual dictionary.

## Documentation

| Document | Description |
|----------|-------------|
| [Software Requirements Specification (SRS)](docs/SRS.md) | Functional and non-functional requirements, user roles, V1 scope |
| [Software Architecture Document (SAD)](docs/SAD.md) | System design, tech stack, database schema, deployment |

## V1 Features

- Dictionary search (Harari, English, Amharic, Oromo)
- Entry detail pages with correction suggestions
- Email/password auth (+ optional Google/GitHub OAuth)
- Review queue with voting (reviewer/admin)
- Contributor profiles with reputation
- In-app notifications
- Admin CSV/JSON export
- PWA with offline search cache
- **Learn mode:** flashcards, quizzes, alphabet topics, shareable study lists

## Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma 6
- **Auth:** Better Auth
- **Hosting:** Docker / Coolify (self-hosted)

## Local Development

### Prerequisites

- Node.js 22+
- PostgreSQL 16+
- `meshia_dictionary.json` in project root (for seeding)

### Setup

```bash
cp .env.example .env.local
# Edit DATABASE_URL and BETTER_AUTH_SECRET

npm install
npx prisma migrate deploy   # or: npx prisma db push (dev)
npm run db:seed             # imports ~8,800 Meshia entries
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker Postgres (optional)

```bash
docker run -d --name raafat-postgres \
  -e POSTGRES_USER=raafat \
  -e POSTGRES_PASSWORD=raafat \
  -e POSTGRES_DB=raafat \
  -p 5435:5432 \
  postgres:16
```

### Promote a reviewer

```sql
UPDATE users SET role = 'reviewer' WHERE email = 'your@email.com';
```

### OAuth (optional)

Set in `.env.local`:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_GOOGLE_ENABLED=true
```

## Production Deployment

See **[docs/DEPLOY.md](docs/DEPLOY.md)** for the full guide.

### Quick reference

```bash
cp .env.production.example .env   # edit values
docker compose up -d --build
```

**Coolify:** Dockerfile build, port `3000`, health check `/api/health`.

**Required env vars:**

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/raafat` |
| `BETTER_AUTH_SECRET` | output of `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://dictionary.example.com` |
| `NEXT_PUBLIC_APP_URL` | `https://dictionary.example.com` |

**First deploy only:** set `RUN_DB_SEED=true` to import dictionary data, then disable.

Migrations run automatically on container start.

## API Routes

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/v1/entries` | Public |
| POST | `/api/v1/entries` | Contributor |
| GET | `/api/v1/entries/:id` | Public |
| POST | `/api/v1/suggestions` | Contributor |
| GET/PATCH | `/api/v1/suggestions` | Reviewer+ |
| GET/PATCH | `/api/v1/notifications` | Authenticated |
| GET | `/api/v1/admin/export` | Admin |
| GET | `/api/v1/admin/stats` | Admin |
| GET/PATCH | `/api/v1/admin/users` | Admin |
| GET/PATCH/DELETE | `/api/v1/admin/entries` | Admin |
| GET | `/api/v1/users/me` | Authenticated |

## Status

**V1 complete** — core dictionary, auth, review workflow, notifications, export, and PWA are implemented.
