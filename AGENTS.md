# AGENTS.md — SPK Rekrutmen Mentor AI Engineer (PSI)

## Purpose for AI coding agents

This file is the repo-specific guide for AI coding agents working on `mentor-recruitment`. Use it to understand the architecture, key decisions, and high-risk areas before editing code.

- Focus on the `client/` React frontend and `server/` Express backend as two separate packages in a `pnpm` workspace.
- Preserve the PSI algorithm parity between frontend and backend.
- Prefer links to documentation instead of duplicating detailed setup steps.
- Use `pnpm typecheck` as the primary validation check; there is no dedicated test framework installed yet.

## What this repo is

A full-stack assessment app for mentor recruitment using the Preference Selection Index (PSI) decision-making method.

## Architecture

```
mentor-recruitment/
├── client/              # Vite + React 19 + TypeScript
│   └── src/
│       ├── components/  # UI components, app pages, shared primitives
│       ├── lib/         # algorithm, API client, PDF helpers, utilities
│       ├── stores/      # Zustand state stores
│       └── types/       # shared TS interfaces
├── server/              # Express 5 + TypeScript + MySQL
│   └── src/
│       ├── db/          # database connection, schema, seed data
│       ├── routes/      # REST API endpoints
│       ├── services/    # business logic (PSI calculator, suggestion engine)
│       └── middleware/  # auth
├── docs/                 # local developer docs and setup guides
└── prompt.md             # original assessment specification
```

## Key files for AI agents

- `package.json` — root workspace scripts
- `client/package.json` — frontend dependencies and scripts
- `server/package.json` — backend dependencies and scripts
- `client/src/lib/psi.ts` — frontend PSI calculation logic
- `server/src/services/psiCalculator.ts` — backend PSI calculation logic
- `server/src/db/schema.ts` — database schema definitions
- `server/src/db/seed.ts` — seed data and initial DB state
- `server/src/routes/` — API contract and endpoints
- `client/src/components/` — UI patterns and page implementations
- `docs/Panduan Menjalankan Server dan Client.md` — setup and environment instructions

## Build and run commands

From the repo root:

```sh
pnpm install
pnpm dev          # starts client + server concurrently
pnpm build        # builds both packages
pnpm typecheck    # TypeScript validation for client and server
```

## Important conventions

- `client` and `server` are separate `pnpm` packages in the same workspace.
- Use `pnpm dev` from the root for development; it runs both packages in parallel.
- The backend uses MySQL 8.0 with credentials from `server/.env`.
- The frontend communicates with the backend through `/api/*` proxied to `http://localhost:3001`.
- `client/src/lib/psi.ts` and `server/src/services/psiCalculator.ts` must remain behaviorally identical whenever PSI logic changes.
- Do not treat `weight_ref` as algorithm input. It is display-only, and PSI weight (`Φ_j`) is computed automatically from data variation.
- Candidate scores are integer values `1–5`; the server validates this range.
- PSI results are immutable once saved; recalculating creates a new session.
- All criteria are Benefit-type in this domain.
- Use `toLocaleString('id-ID')` for currency formatting.

## PSI-specific guidance

- Algorithm is based on Preference Selection Index (PSI).
- Normalization is `r_ij = x_ij / max(x_j)` for all criteria.
- If all values are identical for a criterion, set `DPV = 1` and divide weights equally.
- The backend and frontend both compute PSI values and should remain consistent.

## Validation and quality checks

- There is no dedicated automated test framework in this repo yet.
- Use `pnpm typecheck` to validate TypeScript across client and server.
- Use `pnpm build` to verify production build correctness.

## Helpful local docs

- [`README.md`](README.md)
- [`docs/Panduan Menjalankan Server dan Client.md`](docs/Panduan Menjalankan Server dan Client.md)
- [`docs/Seeder.md`](docs/Seeder.md)
- [`docs/Reset-Database.md`](docs/Reset-Database.md)

## Known points of caution

- The frontend is React 19 with Tailwind CSS and shadcn/ui. Changes to shared UI primitives should be reviewed for style and accessibility impact.
- The backend uses JWT auth and expects `Authorization: Bearer <token>` on protected endpoints.
- The server is currently configured for MySQL, not SQLite.
- Because the PSI algorithm is duplicated, refactors often require correspondence between `client/src/lib/psi.ts` and `server/src/services/psiCalculator.ts`.

## Recommended next customization

Consider adding a dedicated agent instruction file or skill for PSI algorithm changes, React frontend UI work, or backend API route updates. This would help AI agents focus on the repo's highest-risk maintenance areas.
