# AGENTS.md — Penilaian Calon Coach AI Engineer (PSI)

## What this repo is

A full-stack Coach AI Engineer assessment app using the PSI (Preference Selection Index) decision-making method. Domain: **LKP Academy Vistar — Penilaian Calon Coach AI Engineer**.

## Architecture

```
mentor-psi/
├── client/              # Vite + React 19 + TypeScript
│   └── src/
│       ├── components/
│       │   ├── ui/      # shadcn/ui primitives (Button, Card, Badge, Progress)
│       │   └── layout/  # Sidebar, Layout
│       ├── pages/       # Dashboard, Criteria, Candidates, CandidateDetail, Calculation, Results, Settings
│       ├── lib/         # psi.ts (algorithm), api.ts (fetch wrapper), utils.ts (cn)
│       ├── stores/      # Zustand: candidateStore, criteriaStore, psiStore
│       └── types/       # TypeScript interfaces
├── server/              # Express + sql.js (SQLite via WASM)
│   └── src/
│       ├── db/          # database.ts, schema.ts, seed.ts
│       ├── routes/      # candidates, criteria, psi, dashboard
│       └── services/    # psiCalculator.ts (mirror of client/lib/psi.ts)
└── prompt.md            # Original specification
```

## Commands

```sh
# Terminal 1 — Client
cd client && pnpm dev    # Vite dev server (port 5173+, otomatis geser)

# Terminal 2 — Server
cd server && pnpm start  # tsc build + Express (port 3001)

# Dari root (opsional):
pnpm build               # Build client + server
pnpm typecheck           # TypeScript check kedua package
```

Client → Vite, Server → Express. Vite proxies `/api/*` ke `http://localhost:3001`.

## Key conventions

- **PSI algorithm** is duplicated in `client/src/lib/psi.ts` and `server/src/services/psiCalculator.ts` — they must stay identical.
- **PSI does NOT use user-supplied weights** — weights (`Φ_j`) are computed automatically from data variation. The reference weights from the assessment document (30%, 25%, 20%, 15%, 10%) are stored in the DB as `weight_ref` for display only, never fed into PSI math.
- **Edge case**: if all values for a criterion are identical (PV = 0), set DPV = 1 and divide equally.
- **All criteria are Benefit type** — no Cost-type criteria exist in this domain. The normalization formula used is always `r_ij = x_ij / max(x_j)`. The Cost-type path in `psi.ts` remains for completeness.
- **Scoring scale**: integer values **1–5** only. Validated on input server-side.
- **Score labels**: map 1→"Sangat Kurang", 2→"Kurang", 3→"Cukup", 4→"Baik", 5→"Sangat Baik" shown in UI.
- **Number formatting**: 4 decimal places for display, 6+ for internal calculation.
- **Rupiah**: use `toLocaleString('id-ID')`.
- **Heatmap**: highest value in column = green, lowest = red (gradient via `rgb()` interpolation).
- **PSI results are immutable** once saved — create a new session to recalculate.
- **Colors**: Primary `#1E3A5F`, Secondary `#2E86AB`, Accent `#F0A500`.

## Database

SQLite via `sql.js` (WASM-based, no native compilation). File stored at `server/data/mentor-psi.db`. Schema auto-created on first run with seed data (5 criteria, 6 candidates, 30 scores). Criteria have `code`, `weight_ref`, and `status` columns in addition to the base schema.

## Tests

No test framework installed yet. Add tests when implementing new features.

## Known quirks

- `@tailwindcss` PostCSS plugin requires `tailwind.config.js` to map shadcn CSS variables to Tailwind color classes (`border`, `background`, `foreground`, etc.)
- On Windows, `better-sqlite3` requires VS Build Tools — switched to `sql.js` instead
- Bundle size warning from recharts (706KB) — acceptable for now, can code-split later
