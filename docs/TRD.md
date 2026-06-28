# Technical Requirements Document (TRD)

## Jira Teams — Project Management Platform

**Project:** Alice (Jira Teams)  
**Version:** 1.2  
**Last Updated:** June 28, 2026  
**Status:** In development

## 1. Purpose

This document describes the technical architecture and implementation of Alice (branded as Jira Teams) based on the current codebase. The API is described in `apps/api/package.json` as a Jira clone.

## 2. System Overview

Alice is a pnpm + Turborepo monorepo. The browser loads the Next.js web app (`apps/web`). Users authenticate via Supabase Auth (email/password). The web app calls the Express API (`apps/api`) using `NEXT_PUBLIC_API_URL` with a Supabase JWT. Application data is stored in Supabase (PostgreSQL).

Both apps deploy to Vercel. The API runs as Vercel Serverless Functions. Protected API routes validate the Supabase access token via `requireApiAuth`.

## 3. Repository Structure

**Root**

- `package.json` — workspace scripts (`dev`, `build`, `lint`, `test`, `commit`, `ui:add`, `db`, `types`)
- `turbo.json` — Turborepo task configuration
- `pnpm-workspace.yaml` — workspace packages under `apps/*` and `packages/*`
- `tsconfig.json` — root path alias for `@repo/ui/*`
- `.github/workflows/deploy.yml` — CI/CD pipeline
- `.devcontainer/devcontainer.json` — Dev Container for Node.js and TypeScript
- `docs/` — project documentation

**apps/api**

- `src/index.ts` — Express app entry, CORS, JSON parsing, route mounting
- `src/config/preload.ts` — loads `.env` and validates env via `src/config/env.ts`
- `src/config/server.ts` — port detection for local development
- `src/routes/api/health/health.route.ts` — health check router
- `src/routes/api/users/users.route.ts` — users router with protected endpoint
- `src/routes/api/files/files.route.ts` — file upload router
- `src/routes/api/notifications/notifications.route.ts` — Novu notifications router
- `src/middlewares/auth/index.ts` — `requireApiAuth` (Supabase JWT verification)
- `src/lib/supabase.ts` — service-role Supabase client for server tasks
- `vercel.json` — Vercel serverless routing (all requests to `src/index.ts`)

**apps/web**

- `app/page.tsx` — home page with auth controls
- `app/login/page.tsx` — email/password sign-in form
- `app/signup/page.tsx` — registration form
- `app/auth/actions.ts` — Server Actions: `login`, `signUp`, `signOut`
- `app/dashboard/page.tsx` — authenticated dashboard hub
- `app/admin/page.tsx`, `app/manager/page.tsx`, `app/member/page.tsx` — role dashboards (RBAC guards planned)
- `app/instruments/page.tsx` — typed Supabase data example
- `lib/auth.ts` — `getUser()` via `supabase.auth.getUser()`
- `lib/supabase/server.ts` — SSR Supabase client (`createServerClient` + `@repo/types`)
- `lib/supabase/client.ts` — browser Supabase client
- `lib/supabase/middleware.ts` — session refresh in middleware
- `lib/env.ts` — Zod env validation (loaded from `next.config.js` at build)
- `proxy.ts` — Next.js middleware entry (`updateSession`); replaces traditional `middleware.ts`
- `sample.env` — environment variable template

**packages/ui**

- Shared React components under `src/components/ui/`: Button, Card, Field, Input, Label, Separator
- Utility: `src/lib/utils.ts` (`cn` helper)
- Styles: `src/globals.css` (exported as `@repo/ui/globals.css`)

**packages/db** (`@repo/db`)

- `prisma/schema.prisma` — schema source of truth (introspected from Supabase; e.g. `instruments`)
- `prisma/migrations/` — versioned SQL migrations (baseline: `0_init_supabase`)
- `prisma.config.ts` — Prisma 7 config (`DIRECT_URL`, migration path, seed command)
- `src/seed.ts` — idempotent seed scripts (Supabase service role)
- `src/env.ts` — Zod validation for db package env vars
- `script_create_migrate.sh` — create migration from schema diff, deploy, regenerate types, seed
- `script_generate_types.sh` — `supabase gen types` into `@repo/types`
- `sample.env` — `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

**packages/types** (`@repo/types`)

- `src/generated/supabase/database.types.ts` — generated Supabase client types (committed, overwritten on `pnpm db generate`)
- `src/index.ts` — re-exports `Database`, `Tables`, `TablesInsert`, `TablesUpdate`, `Enums`
- Consumed by `apps/web` and `apps/api` for typed Supabase SDK clients; apps do not import `@repo/db`

**packages/eslint-config** — shared ESLint configs  
**packages/typescript-config** — shared TypeScript configs

See also: `docs/DATABASE.md` (operational runbook), `docs/DEBUGGING.md` (IDE debug configs), `docs/authorization/` (auth and RBAC plans).

## 4. Technology Stack

**Monorepo and tooling**

- Turborepo ^2.9
- pnpm 9.0.0
- TypeScript 5.9.x
- Prettier, ESLint 9, Husky, lint-staged, Commitizen, Commitlint

**Frontend (`apps/web`)**

- Next.js 16.2 (App Router)
- React 19.2
- Tailwind CSS 4.3
- `@supabase/ssr` + `@supabase/supabase-js`
- `@repo/types` for typed Supabase clients
- shadcn/ui components via `@repo/ui`
- Vitest for tests

**Backend (`apps/api`)**

- Express.js 4.22
- `@supabase/supabase-js` (JWT verification in `requireApiAuth`)
- cors, express.json middleware
- Vitest for tests

**Database**

- Supabase (PostgreSQL) for application data and auth
- Prisma 7 for schema management and SQL migrations (`@repo/db`)
- Supabase CLI for client type generation (`@repo/types`)
- Runtime data access via `@supabase/ssr` (web) and `@supabase/supabase-js` (api) — not Prisma Client in apps

**Hosting and CI**

- Vercel (web and api as separate projects)
- GitHub Actions (lint, test, deploy on `main`)

## 5. Authentication — Supabase Auth

Identity is handled by Supabase Auth. Authorization (roles, permissions) will live in application database tables — not in Supabase Auth user metadata. See `docs/authorization/RBAC_AUTHORIZATION_SKELETON.md`.

### Web app

- `@supabase/ssr` provides browser, server, and middleware clients.
- `proxy.ts` calls `updateSession()` on each request to refresh the session cookie.
- Server-side checks use `supabase.auth.getUser()` (never trust `getSession()` alone).
- `app/auth/actions.ts` Server Actions handle `signInWithPassword`, `signUp`, and `signOut`.
- Typed clients: `createServerClient<Database>()` / `createBrowserClient<Database>()` from `@repo/types`.

**Environment variables (`apps/web/sample.env`):**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL` (server-only)
- `SUPABASE_ANON_KEY` (server-only)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never import in client components)
- `NEXT_PUBLIC_API_URL`

**Planned:** forgot-password flow — see `docs/authorization/FORGOT_PASSWORD_AUTH_PLAN.md`.

### API

- `requireApiAuth` reads `Authorization: Bearer <access_token>`.
- Validates the token with `supabase.auth.getUser(token)` using the anon key.
- Attaches `userId` (`auth.users.id`) to the request for downstream handlers.
- No global auth middleware; protection is per-route via `requireApiAuth`.

### Session and API access

- Web stores session in HTTP-only cookies managed by `@supabase/ssr`.
- API calls from the browser must send the Supabase access token in the `Authorization` header when calling protected endpoints.

## 6. Role-Based Access (planned)

Custom RBAC will be stored in Supabase application tables, not in Supabase Auth metadata.

**Intended roles:**

- `admin` — `/admin`
- `manager` — `/manager`
- `member` — `/member`

**Current state:**

- `getUser()` returns the Supabase user or `null`.
- Dashboard routes (`/dashboard`, `/admin`, `/manager`, `/member`) require authentication only.
- Role guards and `/dashboard` role routing are not yet wired to database RBAC.

Each role page will call a shared authorization helper and redirect unauthorized users once RBAC tables exist.

## 7. Database — Supabase and `@repo/db`

Supabase (PostgreSQL) stores application data. Identity uses Supabase Auth. Structural changes are owned by `@repo/db`; compile-time contracts live in `@repo/types`; runtime queries use the Supabase SDK in apps.

### Package responsibilities

| Package | Role |
|---------|------|
| `@repo/db` | Prisma schema, SQL migrations, seeds, type-generation scripts, env validation |
| `@repo/types` | Generated Supabase `Database` types only (no Prisma client types) |
| `apps/web`, `apps/api` | Supabase SDK for reads/writes; import `@repo/types` for typing only |

Apps must not import `@repo/db`. Prisma is a migration and data-engineering tool, not the application ORM.

### Schema and migrations

- **Schema:** `packages/db/prisma/schema.prisma`
- **Migrations:** `packages/db/prisma/migrations/` (forward-only SQL)
- **Baseline:** `0_init_supabase` captures the existing `instruments` table imported from Supabase
- **Connection:** `DIRECT_URL` (non-pooled, port 5432) for `migrate` and `generate`; configured in `prisma.config.ts`
- **Create flow:** edit `schema.prisma` → `pnpm db create:migrate <name>` → review SQL → commits include migration + regenerated types

`script_create_migrate.sh` diffs `--from-migrations` to `schema.prisma`, runs `migrate deploy`, regenerates types, and runs seed.

### Type generation

- Command: `pnpm db generate` (root shorthand for `@repo/db`)
- Output: `packages/types/src/generated/supabase/database.types.ts` (fully overwritten each run)
- Tool: `supabase gen types typescript --db-url "$DIRECT_URL"`
- Apps use `createClient<Database>()` and `Tables<'table_name'>` from `@repo/types`

### Seeding

- Script: `packages/db/src/seed.ts` (registered in `prisma.config.ts`)
- Command: `pnpm db seed`
- Pattern: idempotent check-before-insert (safe on the shared dev/prod database)
- Auth: `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` from `packages/db/.env`

### Validation and status checks

| Command | Purpose | DB connection |
|---------|---------|---------------|
| `pnpm db validate` | `prisma validate` — schema syntax and consistency | No |
| `pnpm db checktypes` | Zod env check + TypeScript on db package | No (env mock in CI) |
| `pnpm db migrate:status` | Pending vs applied migrations | Yes (`DIRECT_URL`) |
| `pnpm db migrate:deploy` | Apply pending migrations | Yes (`DIRECT_URL`) |

Env vars for `@repo/db` are validated in `packages/db/src/env.ts` (Zod). CI skips strict env validation when `GITHUB_ACTIONS=true`.

### Environment variables (`packages/db/sample.env`)

- `DATABASE_URL` — pooled Postgres URL (runtime / future use)
- `DIRECT_URL` — direct Postgres URL for migrations and type generation
- `SUPABASE_URL` — Supabase project URL (seeding)
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (seeding only; never exposed to web client)

Application-level Supabase vars remain in `apps/web/sample.env` and `apps/api/sample.env`.

### Single-database constraint

One Supabase project serves both development and production. Migrations must be additive. Seeds must remain idempotent. Avoid destructive `db push` or truncate-and-reload patterns.


## 8. API

**Conventions**

- Base path: `/api`
- JSON request and response bodies
- CORS enabled globally
- Supabase JWT validation on protected routes via `requireApiAuth`

**Implemented endpoints**

- `GET /api/health` — public. Returns `{ "status": "ok", "runtime": "express" }`.
- `GET /api/users/api/secure` — protected by `requireApiAuth`. Returns `{ "message": "Welcome to your private dashboard!" }`. Returns 401 when the Bearer token is missing or invalid.

**Route mounting (`src/index.ts`)**

- `/api/health` → `healthRouter`
- `/api/users` → `usersRouter`

**Local development**

- Default port: 3001 (auto-increments if occupied via `detect-port` in `server.ts`)

**Backend patterns (from project rules, partially applied)**

- Routes are organized in modular routers under `src/routes/api/`.
- Auth middleware is extracted to `src/middlewares/auth/`.
- Planned: service/repository pattern, `catchAsync`, `AppError`, Zod validation.

## 9. Frontend

**Routes**

- `/` — home page ("Jira Teams") with Sign In / Sign Up controls
- `/login` — email/password sign-in (Server Action)
- `/signup` — registration (Server Action)
- `/dashboard` — authenticated dashboard hub
- `/admin`, `/manager`, `/member` — role dashboards (auth required; RBAC guards planned)
- `/instruments` — example typed Supabase query page

**Shared UI**

Components are imported from `@repo/ui`:

```typescript
import { Button } from '@repo/ui/components/ui/button';
import { cn } from '@repo/ui/lib/utils';
```

**Local development**

- Default port: 3000 (Next.js dev server)

## 10. Deployment

**Vercel projects**

- Web frontend: `apps/web`
- API backend: `apps/api` (Node.js Serverless, configured in `vercel.json`)

**Serverless constraints**

- No WebSockets
- No in-memory storage that must persist between requests
- All durable state must live in Supabase once integrated

**CI/CD (`.github/workflows/deploy.yml`)**

On push and pull request to `main` and `dev`:

- `pnpm checktypes`
- `pnpm turbo lint`
- `pnpm turbo test`
- `pnpm db validate` (Prisma schema — no database secret required)

On push to `main` only (after validation passes):

- `validate_database` job — `pnpm db migrate:status` (requires `DIRECT_URL` secret)
- Deploy `apps/api` to Vercel
- Deploy `apps/web` to Vercel

SonarCloud quality gate runs on `dev` branch after validation.

**Required GitHub secrets**

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID_API`
- `VERCEL_PROJECT_ID_WEB`
- `DIRECT_URL` (migration status check on `main` deploy)
- `SONAR_TOKEN` (SonarCloud on `dev`)

## 11. Development Workflow

**Prerequisites**

- Node.js ≥ 18
- pnpm 9.x
- Supabase project (URL, anon key, service role key for server tasks)
- Optional: Dev Container (`.devcontainer/devcontainer.json`)

**Commands (run from repository root)**

```bash
pnpm install              # install dependencies
pnpm dev                  # start web and api concurrently
pnpm api dev              # api only
pnpm web dev              # web only
pnpm turbo lint           # lint all packages
pnpm turbo test           # run all tests
pnpm turbo checktypes
pnpm turbo build
pnpm ui:add <component>   # add shadcn component to @repo/ui
pnpm db validate          # validate Prisma schema (no DB)
pnpm db migrate:deploy    # apply pending migrations
pnpm db migrate:status    # check migration sync with database
pnpm db generate          # regenerate Supabase types into @repo/types
pnpm db seed              # run idempotent seeds
pnpm db create:migrate <name>  # create + deploy migration, generate types, seed
pnpm commit               # conventional commit (interactive)
```

## 12. Testing

- Vitest is configured in `apps/web`, `apps/api`, and `packages/ui`.
- CI runs `pnpm turbo test` on every push and pull request to `main`.
- The Turborepo `test` task depends on `build`.

## 13. Current Implementation Status

**Implemented**

- Turborepo monorepo with pnpm workspaces
- Supabase Auth on web (login, signup, sign-out, session middleware)
- Supabase JWT verification on API (`requireApiAuth`)
- Dashboard shell and role route scaffolding (admin, manager, member)
- Express API with modular routes and auth middleware
- Next.js frontend with home page and role dashboards
- Shared UI package (`@repo/ui`)
- Database engineering packages (`@repo/db`, `@repo/types`)
- Prisma schema, baseline migration, and migration scripts for Supabase
- Supabase client type generation and typed SDK usage in web (`@repo/types`)
- Idempotent database seeding (`pnpm db seed`)
- Prisma schema validation in CI (`pnpm db validate`)
- Migration status gate on `main` deploy (`pnpm db migrate:status`)
- Dev Container configuration
- ESLint, Prettier, Husky, Commitlint, Commitizen
- GitHub Actions CI and Vercel deployment

**Not yet implemented**

- Forgot-password / password-reset flow (see `docs/authorization/FORGOT_PASSWORD_AUTH_PLAN.md`)
- Project and issue domain routes and services
- Admin UI for role assignment
- Zod request validation on API routes
- Full custom RBAC in database tables (see `docs/authorization/RBAC_AUTHORIZATION_SKELETON.md`)
