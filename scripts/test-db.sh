#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Teste les migrations et la sécurité de la base sur un PostgreSQL JETABLE.
#
#   DATABASE_ADMIN_URL=postgres://postgres@localhost:5432/postgres npm run test:db
#
# Prérequis : PostgreSQL 15+ avec l'extension pgvector installée.
# Le script crée une base temporaire « digital_twin_test », y applique une
# émulation minimale de Supabase, toutes les migrations, puis les tests.
# ⚠️ Ne JAMAIS pointer vers la base de production.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ADMIN_URL="${DATABASE_ADMIN_URL:?Définissez DATABASE_ADMIN_URL (base PostgreSQL locale jetable)}"
DB_NAME="digital_twin_test"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEST_URL="$(echo "$ADMIN_URL" | sed -E "s#/[^/?]+(\?|$)#/${DB_NAME}\1#")"

psql "$ADMIN_URL" -qX -v ON_ERROR_STOP=1 -c "drop database if exists ${DB_NAME}" -c "create database ${DB_NAME}"
trap 'psql "$ADMIN_URL" -qX -c "drop database if exists ${DB_NAME}" >/dev/null 2>&1 || true' EXIT

psql "$TEST_URL" -qX -v ON_ERROR_STOP=1 -f "$ROOT/tests/db/supabase-shim.sql"
for migration in "$ROOT"/supabase/migrations/*.sql; do
  echo "→ $(basename "$migration")"
  psql "$TEST_URL" -qX -v ON_ERROR_STOP=1 -f "$migration"
done

psql "$TEST_URL" -qtAX -v ON_ERROR_STOP=1 -f "$ROOT/tests/db/security.test.sql" 2>&1 \
  | sed -E 's/^psql:[^ ]+ //; s/^NOTICE: +//' | grep -v '^$'
