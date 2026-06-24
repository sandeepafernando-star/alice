# Technical Requirements Document (TRD)

## Alice — Project Management Platform

**Project:** Alice  
**Version:** 1.0  
**Last Updated:** June 23, 2026  
**Status:** Early development

## 1. Purpose

This document describes the technical architecture and implementation of Alice based on the current codebase. Alice is described in `apps/api/package.json` as a Jira clone.

## 2. System Overview

Alice is a pnpm + Turborepo monorepo. The browser loads the Next.js web app (`apps/web`). The web app calls the Express API (`apps/api`) using `NEXT_PUBLIC_API_URL`. Application data is stored in Supabase (PostgreSQL).

Both apps deploy to Vercel. The API runs as Vercel Serverless Functions.

## 3. Repository Structure

**Root**

- `package.json` — workspace scripts (`dev`, `build`, `lint`, `test`, `commit`)
- `turbo.json` — Turborepo task configuration
- `pnpm-workspace.yaml` — workspace packages under `apps/*` and `packages/*`
- `.github/workflows/deploy.yml` — CI/CD pipeline
- `docs/` — project documentation

**apps/api**

- `src/index.ts` — Express app entry, middleware, routes
- `src/server.ts` — port detection for local development
- `vercel.json` — Vercel serverless routing (all requests to `src/index.ts`)

**apps/web**

- `app/page.tsx` — home page
- `app/login/page.tsx` — login page
- `components/login-form.tsx` — login form component
- `sample.env` — environment variable template

**packages/ui**

- Shared React components: Button, Card, Field, Input, Label, Separator
- Utility: `lib/utils.ts` (`cn` helper)

**packages/eslint-config** — shared ESLint configs  
**packages/typescript-config** — shared TypeScript configs

## 4. Technology Stack

**Monorepo & tooling**

- Turborepo ^2.9
- pnpm 9.0.0
- TypeScript 5.9.x
- Prettier, ESLint 9, Husky, lint-staged, Commitizen, Commitlint

**Frontend (`apps/web`)**

- Next.js 16.2 (App Router)
- React 19.2
- Tailwind CSS 4.3
- shadcn/ui components via `@repo/ui`
- Vitest for tests

**Backend (`apps/api`)**

- Express.js 4.19
- cors, express.json middleware
- Zod ^4.4 (installed; not yet used in routes)
- Vitest for tests

**Database**

- Supabase (PostgreSQL)

**Hosting & CI**

- Vercel (web and api as separate projects)
- GitHub Actions (lint, test, deploy on `main`)

## 5. Database — Supabase

Supabase provides the managed PostgreSQL database for Alice.

Environment variables (local `.env` and Vercel; not committed to source control):

- `DATABASE_URL` — connection string for the API
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — public key for client-side use (if needed)
- `SUPABASE_SERVICE_ROLE_KEY` — server-only key for API operations

Database schema, migrations, and API data access are not yet implemented in the codebase.

## 6. API

**Conventions**

- Base path: `/api`
- JSON request and response bodies
- CORS enabled globally

**Implemented endpoints**

- `GET /api/health` — returns `{ "status": "ok", "runtime": "express" }`. No authentication required.

**Local development**

- Default port: 3001 (auto-increments if occupied via `detect-port` in `server.ts`)

**Backend patterns (from project rules)**

- Domain modules use router, service, and repository files (e.g. `users.router.ts`, `users.service.ts`, `users.repository.ts`).
- Async routes should use a `catchAsync` wrapper.
- Explicit failures should throw `AppError(message, statusCode)`.
- Request payloads should be validated with Zod via a `validate` middleware.

These patterns are defined in project rules but not yet present in the API source.

## 7. Frontend

**Routes**

- `/` — home page with a Card and "Get started" Button (`app/page.tsx`)
- `/login` — login form with email, password, Google login button, and sign-up link (`app/login/page.tsx`)

**Shared UI**

Components are imported from `@repo/ui`:

```typescript
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
```

**Environment variables**

- `NEXT_PUBLIC_API_URL` — base URL for API requests (see `apps/web/sample.env`)

**Local development**

- Default port: 3000 (Next.js dev server)

## 8. Deployment

**Vercel projects**

- Web frontend: `apps/web`
- API backend: `apps/api` (Node.js Serverless, configured in `vercel.json`)

**Serverless constraints**

- No WebSockets
- No in-memory storage that must persist between requests
- All durable state must live in Supabase

**CI/CD (`.github/workflows/deploy.yml`)**

On push and pull request to `main`:

- `pnpm turbo lint`
- `pnpm turbo test`

On push to `main` only (after validation passes):

- Deploy `apps/api` to Vercel
- Deploy `apps/web` to Vercel

**Required GitHub secrets**

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID_API`
- `VERCEL_PROJECT_ID_WEB`

## 9. Development Workflow

**Prerequisites**

- Node.js ≥ 18
- pnpm 9.x

**Commands (run from repository root)**

```bash
pnpm install          # install dependencies
pnpm dev              # start web and api concurrently
pnpm turbo lint       # lint all packages
pnpm turbo test       # run all tests
pnpm turbo check-types
pnpm turbo build
pnpm --filter web dev # web only
pnpm --filter api dev # api only
pnpm commit           # conventional commit (interactive)
```

## 10. Testing

- Vitest is configured in `apps/web`, `apps/api`, and `packages/ui`.
- CI runs `pnpm turbo test` on every push and pull request to `main`.
- The Turborepo `test` task depends on `build`.

## 11. Current Implementation Status

**Implemented**

- Turborepo monorepo with pnpm workspaces
- Express API with health check endpoint
- Next.js frontend with home and login pages
- Shared UI package (`@repo/ui`)
- ESLint, Prettier, Husky, Commitlint, Commitizen
- GitHub Actions CI and Vercel deployment

**Not yet implemented**

- Supabase schema and data access from the API
- Authentication (login form is UI only)
- Project and issue domain routes and services
- Role-based access control
