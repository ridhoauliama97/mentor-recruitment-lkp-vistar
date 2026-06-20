# Mentor Recruitment PSI
## Panduan Menjalankan Server & Client

Preference Selection Index (PSI) — Decision Support System

---

## 1. Prasyarat

- **Node.js** **v18+** (direkomendasikan v22+)
- **pnpm** **v9+** — instal dengan: `npm install -g pnpm`
- **MySQL 8.0** — sudah berjalan sebagai service
- Git (opsional)

## 2. Struktur Proyek

Proyek ini menggunakan **pnpm workspaces** dengan dua paket terpisah:

```
mentor-psi/
├── client/         # React 19 + Vite 8 (frontend, port :5173)
├── server/         # Express 5 + mysql2 (API, port :3001)
└── package.json    # Root orchestrator (concurrently)
```

## 3. Database

### Konfigurasi MySQL

Database diatur di `server/.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=rekrutmen_mentor_psi
```

### Membuat database (pertama kali)

```bash
mysql -u root -ppassword -e "CREATE DATABASE IF NOT EXISTS rekrutmen_mentor_psi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Database, schema, dan seed data dibuat otomatis saat server pertama kali dijalankan.

## 4. Memulai Cepat

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

## 5. Daftar Perintah Lengkap

Semua perintah dijalankan dari root proyek (`mentor-psi/`):

| Perintah | Fungsi | Keterangan |
|----------|--------|------------|
| `pnpm dev` | Jalankan kedua server (dev mode) | Client :5173, Server :3001, hot-reload |
| `pnpm start` | Build + jalankan production | Compile client & server, lalu start Express |
| `pnpm build` | Compile client & server | tsc + Vite build |
| `pnpm typecheck` | Cek tipe TypeScript | tsc --noEmit pada client & server |
| `pnpm lint` | Alias typecheck | Belum ada ESLint terkonfigurasi |

## 6. Mode Development

**`pnpm dev`** menjalankan **concurrently** yang memicu dua proses:

- **Client (Vite)** — HMR aktif, proxy /api/* ke :3001, TypeScript via esbuild (tanpa tsc)
- **Server (tsx watch)** — tsx watch src/index.ts, restart otomatis saat file berubah, koneksi ke MySQL saat pertama kali

## 7. Mode Production

**`pnpm start`** menjalankan dua tahap:

1. **`pnpm build`** — compile client (tsc + vite build) dan server (tsc ke dist/)
2. **`pnpm --filter server start`** — jalankan `node dist/index.js` pada port :3001

> **Catatan:** Build output client berada di `client/dist/` dan server di `server/dist/`.

## 8. Arsitektur

Proyek ini menggunakan **monorepo** dengan dua workspace independen:

| Layer | Client (React 19) | Server (Express 5) |
|-------|-------------------|-------------------|
| Frontend | Vite 8, shadcn/ui, Tailwind v3, Zustand, Recharts | N/A |
| API | Proxy /api/* ke :3001 (via Vite config) | REST endpoints: candidates, criteria, scores, psi, dashboard |
| Database | N/A (via API) | MySQL 8.0 (mysql2 pool connection) |
| PSI Algo | client/src/lib/psi.ts (mirror server) | server/src/services/psiCalculator.ts (mirror client) |

## 9. Komunikasi Client-Server

Pada mode development, Vite bertindak sebagai **reverse proxy**. Semua request ke `/api/*` diteruskan ke Express pada port :3001.

```
Client (Vite :5173)  ---/api/*-->  Server (Express :3001)  ---->  MySQL 8.0
```

Pada mode production, Vite tidak berjalan. Client sudah di-build menjadi file statis di `client/dist/`. Express bisa dikonfigurasi untuk serve file statis tersebut (belum diimplementasikan — saat ini server API-only).

## 10. Endpoint API

Semua endpoint tersedia di `http://localhost:3001/api/`:

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/auth/login` | POST | Login (return JWT token) |
| `/api/auth/me` | GET | Profile user saat ini |
| `/api/auth/password` | PUT | Ubah password |
| `/api/criteria` | GET/POST | List semua / tambah kriteria |
| `/api/criteria/:id` | PUT/DELETE | Ubah / hapus kriteria |
| `/api/criteria/:id/sub-criteria` | GET/POST | List / tambah sub-kriteria |
| `/api/sub-criteria/:id` | PUT/DELETE | Ubah / hapus sub-kriteria |
| `/api/candidates` | GET/POST | List semua / tambah kandidat |
| `/api/candidates/:id` | GET/PUT/DELETE | Detail / ubah / hapus kandidat |
| `/api/candidates/:id/scores` | GET/POST | Ambil / simpan skor kandidat |
| `/api/psi/calculate` | POST | Hitung PSI (simpan sesi baru) |
| `/api/psi/sessions` | GET | List semua sesi PSI |
| `/api/psi/sessions/latest` | GET | Sesi PSI terakhir |
| `/api/psi/sessions/:id` | GET/DELETE | Detail / hapus sesi PSI |
| `/api/dashboard/stats` | GET | Statistik dashboard |
| `/api/settings` | GET/PUT | Pengaturan aplikasi |
| `/api/export` | GET/POST | Export / Import data |
| `/api/upload` | POST | Upload foto kandidat |

## 11. Alur PSI (Preference Selection Index)

PSI adalah metode decision support yang tidak memerlukan bobot dari pengguna. Bobot (Φⱼ) dihitung secara otomatis dari variasi data.

```
Normalisasi → Rata-rata (R̄ⱼ) → PVⱼ → DPVⱼ → Φⱼ (bobot) → PSI Score → Ranking
```

## 12. Troubleshooting

### Port sudah terpakai
Ubah port di `server/src/index.ts` (server) atau `client/vite.config.ts` (client).

### Build server gagal
Pastikan `server/tsconfig.json` memiliki `"module": "nodenext"` dan `"moduleResolution": "nodenext"` tanpa `"noEmit": true`.

### Koneksi database ditolak
1. Pastikan MySQL 8.0 sudah berjalan: `net start MySQL80`
2. Verifikasi kredensial di `server/.env` cocok dengan konfigurasi MySQL
3. Coba koneksi manual: `mysql -u root -ppassword -e "SHOW DATABASES;"`

### Database sudah ada data tapi ingin reset
Lihat `docs/Seeder.md` → bagian Reset Data.

---

*Dokumen ini dibuat secara otomatis — lihat AGENTS.md untuk informasi lebih lanjut.*
