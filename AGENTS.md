# AGENTS.md — SPK Rekrutmen Mentor (PSI)

## Purpose

Repo-specific guide for AI coding agents. Every line here cost multiple reads to verify — don't skip it.

## Architecture

Two packages in a `pnpm` workspace:

```
mentor-recruitment/
├── client/              # Vite 8 + React 19 + TypeScript (~6.0)
│   └── src/
│       ├── components/  # pages/, ui/ (shadcn), layout/
│       ├── lib/         # psi.ts, api.ts, pdf.tsx, utils.ts
│       ├── stores/      # Zustand stores
│       └── types/       # shared TS interfaces
├── server/              # Express 5 + TypeScript (~5.8), ESM
│   └── src/
│       ├── db/          # database.ts (mysql2 pool), schema.ts, seed.ts
│       ├── routes/      # auth, candidates, criteria, scores, psi, chat, ...
│       ├── services/    # psiCalculator.ts (mirrors client), suggestionEngine
│       └── middleware/  # auth (JWT, 7d expiry)
├── docs/                # setup, seeder, reset-database guides
└── prompt.md            # original spec (outdated — trust code, not prompt)
```

## Commands (all from root)

| Command | What it does |
|---------|-------------|
| `pnpm install` | Install all deps |
| `pnpm dev` | Client (Vite :5173) + server (tsx watch :3001) concurrently |
| `pnpm build` | `tsc && vite build` (client) + `tsc` (server → `dist/`) |
| `pnpm start` | `pnpm build` then `node dist/index.js` (server-only) |
| `pnpm typecheck` | `tsc --noEmit` on both packages |
| `pnpm lint` | Same as typecheck — **no ESLint/Prettier configured** |

**Prerequisite:** copy `server/.env.example` → `server/.env` before running.

## Key conventions

- **No test framework, no CI/CD** (`pnpm typecheck` is the only gate).
- **Server is ESM:** imports must use `.js` extension (e.g. `from "./db/database.js"`).
- **Server dev** uses `tsx watch` (not `ts-node`). Auto-restarts on file change.
- **Schema + seed auto-run** on every server start (`runSchema()` → `seed()` → `seedSettings()`). No migration tooling.
- **Database:** MySQL 8.0 via `mysql2/promise` pool. The `exec()` function auto-converts `snake_case` columns → `camelCase` in results.
- **Vite proxy** forwards `/api/*` **and** `/uploads/*` → `http://localhost:3001`.
- **Client `@/` alias** maps to `./src/` (both tsconfig and vite config).
- **JWT:** all routes under `/api` except `/api/auth/login` require `Authorization: Bearer <token>`. Token expires in 7 days.
- **Scores** validated as integer `1–5` server-side.
- **`weight_ref`** in `criteria` table is display-only. PSI weight (`Φ_j`) is computed from data variation.
- **PSI results are immutable** once saved; recalculate by creating a new session.
- **Currency formatting:** `toLocaleString('id-ID')`.

## PSI algorithm

- Benefit normalization: `r_ij = x_ij / max(x_j)`
- Cost normalization: `r_ij = min(x_j) / x_ij`
- Edge case (all same): DPV = 1 → weights divided equally.
- **Duplicated identically** in `client/src/lib/psi.ts` and `server/src/services/psiCalculator.ts` — keep in sync.
- **`extractDetail()`** in `server/src/routes/psi.ts` re-implements PSI from stored DB values (same logic, different code shape).

## Watch points

- Client TS is `~6.0`, server is `~5.8` — version mismatch is intentional, don't unify.
- PSI changes require **two files**: `client/src/lib/psi.ts` and `server/src/services/psiCalculator.ts`.
- No ORM, no migration framework — schema changes go in `server/src/db/schema.ts`.
- The `sub_criteria` table exists; they carry `weight` (1–5) linked to a `criteria`.
