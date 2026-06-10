# Deployment Guide

Deploy RAAFAT-Dictionary with **Docker** (recommended) or **Coolify** on any VPS.

## Prerequisites

- VPS with Docker (2 GB+ RAM recommended)
- Domain pointed to server (A record → VPS IP)
- PostgreSQL 16+ (Coolify-managed or external)

## Quick start (Docker Compose)

```bash
cp .env.production.example .env
# Edit .env — set passwords and your domain

docker compose up -d --build
```

First deploy with empty database:

```bash
# In .env set once:
RUN_DB_SEED=true

docker compose up -d --build
# After seed completes, set RUN_DB_SEED=false and redeploy
```

Health check: `curl https://your-domain.com/api/health`

---

## Coolify deployment

### 1. PostgreSQL

In Coolify → **Resources** → **New Database** → PostgreSQL 16.

Note the internal connection string, e.g.:

```
postgresql://user:pass@postgres-container:5432/raafat
```

### 2. Application

- **New Resource** → **Application** → connect Git repo
- **Build pack:** Dockerfile
- **Port:** 3000
- **Health check path:** `/api/health`
- **Health check port:** 3000

### 3. Environment variables

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | PostgreSQL connection string from step 1 |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://your-domain.com` |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` |
| `NODE_ENV` | `production` |
| `RUN_DB_SEED` | `true` (first deploy only) |

Optional OAuth:

| Variable | Value |
|----------|-------|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Console |
| `NEXT_PUBLIC_GOOGLE_ENABLED` | `true` |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth App |
| `NEXT_PUBLIC_GITHUB_ENABLED` | `true` |

### 4. Domain & SSL

- Add domain in Coolify → enable **Let's Encrypt**
- Ensure `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` use `https://`

### 5. First deploy

1. Deploy — container runs `prisma migrate deploy` automatically on start
2. With `RUN_DB_SEED=true`, imports ~8,800 Meshia dictionary entries
3. Set `RUN_DB_SEED=false` and redeploy (prevents re-seeding)

### 6. Create admin user

Register via the app, then in PostgreSQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Container behaviour

On every start the entrypoint (`scripts/docker-entrypoint.sh`):

1. Runs `prisma migrate deploy` (unless `SKIP_MIGRATE=true`)
2. Optionally seeds if `RUN_DB_SEED=true`
3. Starts Next.js on port 3000

## Manual operations

```bash
# Run migrations only
docker compose exec app node ./node_modules/prisma/build/index.js migrate deploy

# Seed manually
docker compose exec app node ./prisma/seed.bundle.cjs

# View logs
docker compose logs -f app
```

## Production checklist

- [ ] Strong `BETTER_AUTH_SECRET` (32+ random bytes)
- [ ] `BETTER_AUTH_URL` matches public HTTPS URL exactly
- [ ] `NEXT_PUBLIC_APP_URL` matches public HTTPS URL
- [ ] PostgreSQL not exposed publicly (internal network only)
- [ ] `RUN_DB_SEED=false` after initial import
- [ ] Admin user promoted via SQL
- [ ] OAuth redirect URIs configured for production domain
- [ ] Health check passing at `/api/health`
- [ ] Coolify/Traefik SSL certificate active

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 403 on sign-in | `BETTER_AUTH_URL` must match browser URL (scheme + host) |
| Database connection failed | Check `DATABASE_URL`; ensure app can reach Postgres on internal network |
| Migrations fail | Run `prisma migrate deploy` manually; check migration history |
| Empty dictionary | Set `RUN_DB_SEED=true` once, or run seed bundle manually |
| Health check 503 | Database unreachable — verify `DATABASE_URL` |
