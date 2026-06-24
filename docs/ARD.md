# Agile Requirements Document (ARD)

## Alice — Project Management Platform

**Project:** Alice  
**Version:** 1.0  
**Last Updated:** June 23, 2026  
**Status:** Early development

## 1. Executive Summary

Alice is a Jira-inspired project management application. Teams will use it to organize work into projects and track issues such as tasks, bugs, and stories.

The project is a Turborepo monorepo with a Next.js frontend (`apps/web`), an Express API backend (`apps/api`), and a shared UI package (`packages/ui`). Supabase (PostgreSQL) is the database.

## 2. Product Vision

**Vision:** Give teams a simple way to plan, track, and deliver software work.

**Goals:**

- Authenticated users can manage projects and issues in one place.
- Role-based access controls who can view and change data.
- A responsive web UI built with shared components from `@repo/ui`.
- Automated lint, test, and deployment pipelines on merge to `main`.

## 3. Current Scope

The following exists in the codebase today:

- Monorepo setup with Turborepo and pnpm workspaces.
- Express API with a `GET /api/health` endpoint.
- Next.js home page at `/` with a welcome card.
- Login page at `/login` with a static login form (email, password, Google button — not yet connected to auth).
- Shared UI components: Button, Card, Field, Input, Label, Separator.
- GitHub Actions workflow for lint, test, and Vercel deployment.
- Conventional Commits enforced via Husky, Commitlint, and Commitizen.

The following is not yet implemented:

- User authentication and session management.
- Supabase database schema, migrations, and API data access.
- Project and issue CRUD.
- Role-based permissions.

## 4. User Roles

The project is intended to support three roles:

- **ADMINISTRATOR** — Full access; manage users, roles, and all projects.
- **PROJECT_MANAGER** — Create and manage projects, issues, and assignments within assigned projects.
- **MEMBER** — View assigned projects; create and update issues; add comments on accessible issues.

## 5. User Stories

### Authentication

- **AUTH-1:** As a user, I want to sign in with email and password so that I can access my workspace.
  - Login page is available at `/login`.
  - Form includes email, password, and a Google login option.
  - Status: UI only; backend auth not wired.

### Platform

- **OPS-1:** As a developer, I want a health-check endpoint so that deployments can be verified.
  - `GET /api/health` returns `{ "status": "ok", "runtime": "express" }`.
  - Status: Done.

- **OPS-2:** As a developer, I want lint and test gates in CI so that broken code is not merged.
  - GitHub Actions runs `pnpm turbo lint` and `pnpm turbo test` on push and pull requests to `main`.
  - Status: Done.

- **OPS-3:** As a developer, I want automated deployment to Vercel on merge to `main`.
  - Separate Vercel projects for `apps/api` and `apps/web`.
  - Status: Done.

### Planned (not yet in codebase)

- **PROJ-1:** As a project manager, I want to create a project so that work is grouped.
- **ISSUE-1:** As a team member, I want to create an issue with title, description, type, and priority so that work is tracked.
- **ISSUE-2:** As a team member, I want to update issue status so that progress is visible.

## 6. Functional Requirements

- **FR-1:** The system shall store application data in Supabase (PostgreSQL).
- **FR-2:** The system shall expose a REST API from `apps/api` consumed by the Next.js frontend.
- **FR-3:** The system shall provide a web UI at `apps/web` using shared `@repo/ui` components.
- **FR-4:** The API shall expose a health check at `GET /api/health`.
- **FR-5:** The login page shall be reachable at `/login`.

## 7. Non-Functional Requirements

- **NFR-1:** TypeScript is used across all packages with strict typing.
- **NFR-2:** ESLint runs on CI via `pnpm turbo lint`.
- **NFR-3:** Tests run on CI via `pnpm turbo test`.
- **NFR-4:** Secrets are stored in environment variables, not in source control.
- **NFR-5:** The API is deployed as Vercel Serverless Functions (stateless; no in-memory persistence).
- **NFR-6:** Commits follow Conventional Commits via `pnpm commit`.

## 8. Assumptions & Dependencies

- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel (separate projects for `web` and `api`)
- **Package manager:** pnpm 9.x
- **Node.js:** ≥ 18 (CI uses Node 20)
- **Build system:** Turborepo
- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Express.js 4

## 9. Definition of Done

A story is done when:

1. Acceptance criteria are met.
2. UI uses shared components from `@repo/ui` where applicable.
3. `pnpm turbo lint` and `pnpm turbo test` pass.
4. Changes are committed with Conventional Commits (`pnpm commit`).
5. CI passes and deploys successfully on merge to `main`.
