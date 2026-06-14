# Mentor Recruitment PSI
## Panduan Menjalankan Server & Client

Preference Selection Index (PSI) — Decision Support System

---

## 1. Prasyarat

- **Node.js** **v18+** (direkomendasikan v22+)
- **pnpm** **v9+** — instal dengan: `npm install -g pnpm`
- Git (opsional)

## 2. Struktur Proyek

Proyek ini menggunakan **pnpm workspaces** dengan dua paket terpisah:

```
mentor-psi/
├── client/         # React 19 + Vite 8 (frontend, port :5173)
├── server/         # Express 5 + sql.js (API, port :3001)
└── package.json    # Root orchestrator (concurrently)
```

## 3. Memulai Cepat

Jalankan perintah berikut dari direktori `mentor-psi/`:

### Langkah 1: Instal dependensi

```
pnpm install
```

### Langkah 2: Jalankan mode development

```
pnpm dev
```

- Client: **http://localhost:5173**
- Server: **http://localhost:3001**

### Langkah 3: Build & start production

```
pnpm start
```

## 4. Daftar Perintah Lengkap

Semua perintah dijalankan dari root proyek (`mentor-psi/`):

| Perintah | Fungsi | Keterangan |
|----------|--------|------------|
| `pnpm dev` | Jalankan kedua server (dev mode) | Client :5173, Server :3001, hot-reload |
| `pnpm start` | Build + jalankan production | Compile client & server, lalu start Express |
| `pnpm build` | Compile client & server | tsc + Vite build |
| `pnpm typecheck` | Cek tipe TypeScript | tsc --noEmit pada client & server |
| `pnpm lint` | Alias typecheck | Belum ada ESLint terkonfigurasi |

## 5. Mode Development

**`pnpm dev`** menjalankan **concurrently** yang memicu dua proses:

- **Client (Vite)** — HMR aktif, proxy /api/* ke :3001, TypeScript via esbuild (tanpa tsc)
- **Server (tsx watch)** — tsx watch src/index.ts, restart otomatis saat file berubah, database SQLite dibuat otomatis saat pertama kali

## 6. Mode Production

**`pnpm start`** menjalankan dua tahap:

1. **`pnpm build`** — compile client (tsc + vite build) dan server (tsc ke dist/)
2. **`pnpm --filter server start`** — jalankan `node dist/index.js` pada port :3001

> **Catatan:** Build output client berada di `client/dist/` dan server di `server/dist/`. Database SQLite tersimpan di `server/data/mentor-psi.db`.

## 7. Arsitektur

Proyek ini menggunakan **monorepo** dengan dua workspace independen:

| Layer | Client (React 19) | Server (Express 5) |
|-------|-------------------|-------------------|
| Frontend | Vite 8, shadcn/ui, Tailwind v3, Zustand, Recharts | N/A |
| API | Proxy /api/* ke :3001 (via Vite config) | REST endpoints: candidates, criteria, scores, psi, dashboard |
| Database | N/A (via API) | SQLite (sql.js WASM), file: server/data/mentor-psi.db |
| PSI Algo | client/src/lib/psi.ts (mirror server) | server/src/services/psiCalculator.ts (mirror client) |

## 8. Komunikasi Client-Server

Pada mode development, Vite bertindak sebagai **reverse proxy**. Semua request ke `/api/*` diteruskan ke Express pada port :3001.

```
Client (Vite :5173)  ---/api/*-->  Server (Express :3001)  ---->  SQLite
```

Pada mode production, Vite tidak berjalan. Client sudah di-build menjadi file statis di `client/dist/`. Express bisa dikonfigurasi untuk serve file statis tersebut (belum diimplementasikan — saat ini server API-only).

## 9. Endpoint API

Semua endpoint tersedia di `http://localhost:3001/api/`:

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/criteria` | GET/POST | List semua / tambah kriteria |
| `/api/criteria/:id` | PUT/DELETE | Ubah / hapus kriteria |
| `/api/candidates` | GET/POST | List semua / tambah kandidat |
| `/api/candidates/:id` | PUT/DELETE | Ubah / hapus kandidat |
| `/api/scores/:candidateId` | GET/PUT | Ambil / simpan skor kandidat |
| `/api/psi/calculate` | POST | Hitung PSI (simpan sesi baru) |
| `/api/psi/sessions` | GET | List semua sesi PSI |
| `/api/psi/sessions/:id` | GET | Detail sesi + hasil ranking |
| `/api/dashboard/stats` | GET | Statistik dashboard |

## 10. Alur PSI (Preference Selection Index)

PSI adalah metode decision support yang tidak memerlukan bobot dari pengguna. Bobot (Φⱼ) dihitung secara otomatis dari variasi data.

```
Normalisasi → Rata-rata (R̄ⱼ) → PVⱼ → DPVⱼ → Φⱼ (bobot) → PSI Score → Ranking
```

## 11. Troubleshooting

### Port sudah terpakai
Ubah port di `server/src/index.ts` (server) atau `client/vite.config.ts` (client).

### Build server gagal
Pastikan `server/tsconfig.json` memiliki `"module": "nodenext"` dan `"moduleResolution": "nodenext"` tanpa `"noEmit": true`.

### Database tidak tersedia
Database SQLite dibuat otomatis saat server pertama kali dijalankan. Hapus `server/data/mentor-psi.db` untuk mereset data ke seed awal.

---

*Dokumen ini dibuat secara otomatis — lihat AGENTS.md untuk informasi lebih lanjut.*
