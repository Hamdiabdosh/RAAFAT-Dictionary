#!/bin/sh
set -e

if [ "${SKIP_MIGRATE:-false}" != "true" ] && [ -n "${DATABASE_URL:-}" ]; then
  echo "==> Running database migrations..."
  node ./node_modules/prisma/build/index.js migrate deploy
  echo "==> Migrations complete."
else
  echo "==> Skipping migrations (SKIP_MIGRATE=${SKIP_MIGRATE:-false})."
fi

if [ "${RUN_DB_SEED:-false}" = "true" ] && [ -n "${DATABASE_URL:-}" ]; then
  echo "==> Seeding database (RUN_DB_SEED=true)..."
  node ./prisma/seed.bundle.cjs
  echo "==> Seed complete."
fi

echo "==> Starting Next.js server on port ${PORT:-3000}..."
exec node server.js
