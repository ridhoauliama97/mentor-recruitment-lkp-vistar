# SPK Rekrutmen Mentor AI Engineer — PSI Method

Sistem Pendukung Keputusan (SPK) untuk rekrutmen mentor AI Engineer menggunakan metode **Preference Selection Index (PSI)**.

Domain: **LKP Academy Vistar — SPK Rekrutmen Mentor AI Engineer**

---

## ✨ Fitur

- **Manajemen Kandidat** — CRUD, upload foto, pendidikan (SMA/D3/S1/S2/S3), jurusan, keahlian
- **Manajemen Kriteria** — 5 kriteria penilaian dengan sub-kriteria dan bobot referensi
- **Input Skor** — Nilai 1–5 dengan label kualitatif (Sangat Kurang → Sangat Baik)
- **PSI Calculation** — Perhitungan otomatis tanpa bobot dari pengguna (Φⱼ dihitung dari variasi data)
- **Ranking & Rekomendasi** — Kandidat terbaik berdasarkan PSI Score tertinggi
- **Detail Perhitungan** — Normalisasi, Mean, PV, DPV, Φ, PSI Score (4 desimal)
- **Heatmap** — Color gradient hijau (tertinggi) → merah (terendah) per kolom
- **Export** — PDF (Noto Serif), CSV, Excel (.xlsx)
- **Backup/Restore** — Export/Import JSON seluruh data
- **Multiple Sesi** — Hasil perhitungan immutable, buat sesi baru untuk kalkulasi ulang
- **Dashboard** — Statistik jumlah kandidat, kriteria, sesi
- **Autentikasi** — JWT login, ganti password

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v3, shadcn/ui |
| State Management | Zustand |
| Backend | Express 5 (ESM), TypeScript |
| Database | MySQL 8.0 (mysql2/promise — connection pool) |
| PSI Algorithm | Duplikasi identik client (`psi.ts`) & server (`psiCalculator.ts`) |
| PDF Export | @react-pdf/renderer + Noto Serif (font lokal) |
| File Upload | multer |
| Autentikasi | JWT (jsonwebtoken, 7 hari exp) |
| Icons | Lucide React |
| Charts | Recharts |
| Drag & Drop | @dnd-kit |

## 📋 Prasyarat

- **Node.js** 18+ (recommended 22+)
- **pnpm** 9+ — install: `npm install -g pnpm`
- **MySQL 8.0** — running sebagai Windows service
- Git

## 🚀 Cara Memulai

```bash
# 1. Clone repository
git clone <repo-url>
cd mentor-recruitment

# 2. Install semua dependensi
pnpm install

# 3. Setup konfigurasi database
cp server/.env.example server/.env
# Edit server/.env — sesuaikan DB_PASSWORD dengan password MySQL Anda

# 4. Buat database (pertama kali)
mysql -u root -ppassword -e "CREATE DATABASE IF NOT EXISTS rekrutmen_mentor_psi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. Jalankan mode development
pnpm dev
```

- **Client**: http://localhost:5173
- **Server**: http://localhost:3001

### Login Default

| Username | Password |
|----------|----------|
| `admin` | `password` |

> Database, schema, dan seed data (5 kriteria, 20 kandidat, 100 nilai) dibuat otomatis saat server pertama kali dijalankan.

## 📁 Struktur Proyek

```
mentor-recruitment/
├── client/                          # React 19 + Vite 8
│   └── src/
│       ├── components/
│       │   ├── ui/                  # shadcn/ui primitives
│       │   └── layout/              # Sidebar, Layout
│       ├── pages/                   # Dashboard, Criteria, Candidates, Results, Settings
│       ├── lib/                     # psi.ts, api.ts, pdf.tsx, utils.ts
│       ├── stores/                  # Zustand: candidateStore, criteriaStore, psiStore
│       └── types/                   # TypeScript interfaces
├── server/                          # Express 5 + mysql2
│   └── src/
│       ├── db/                      # database.ts, schema.ts, seed.ts
│       ├── routes/                  # Auth, Candidates, Criteria, PSI, Export, Upload, Settings
│       ├── services/                # psiCalculator.ts
│       └── middleware/              # JWT auth
├── docs/                            # Dokumentasi lengkap
│   ├── Panduan Menjalankan Server dan Client.md
│   ├── Seeder.md
│   └── Reset-Database.md
├── pnpm-workspace.yaml
└── package.json                     # Root orchestrator
```

## 🧮 Algoritma PSI (Preference Selection Index)

PSI adalah metode Multi-Criteria Decision Making (MCDM) yang **tidak memerlukan bobot dari pengguna**. Bobot (Φⱼ) dihitung secara otomatis dari variasi data penilaian.

### Langkah-langkah:

```
1. Matriks Keputusan (X)        — Nilai mentah tiap kandidat per kriteria
2. Normalisasi (r_ij)           — Benefit: r = x / max(x)
3. Mean (R̄ⱼ)                   — Rata-rata nilai normalisasi per kriteria
4. PVⱼ                         — Preference Variation Value (Σ(r - R̄)²)
5. DPVⱼ                        — Deviation in Preference Value (1 - PV)
6. Φⱼ (Bobot)                  — DPVⱼ / Σ(DPV)
7. PSI Score                   — Σ(Φⱼ × r_ij) per kandidat
8. Ranking                     — Urutkan PSI Score tertinggi ke terendah
```

> Semua kriteria menggunakan tipe **Benefit** (semakin tinggi semakin baik).
> Edge case: Jika semua nilai identik (PV = 0), DPV = 1 dan bobot dibagi rata.

## 📄 Perintah

Semua perintah dijalankan dari root proyek:

| Perintah | Fungsi |
|----------|--------|
| `pnpm install` | Instal semua dependensi |
| `pnpm dev` | Jalankan dev mode (client + server) |
| `pnpm build` | Build production (client + server) |
| `pnpm typecheck` | TypeScript check (client + server) |

## 🔌 API Endpoints

Semua endpoint di bawah `/api/`, memerlukan header `Authorization: Bearer <token>` kecuali `/api/auth/login`.

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/auth/login` | POST | Login |
| `/api/auth/me` | GET | Profile |
| `/api/auth/password` | PUT | Ganti password |
| `/api/criteria` | GET/POST | List/tambah kriteria |
| `/api/criteria/:id` | PUT/DELETE | Ubah/hapus kriteria |
| `/api/criteria/:id/sub-criteria` | GET/POST | List/tambah sub-kriteria |
| `/api/sub-criteria/:id` | PUT/DELETE | Ubah/hapus sub-kriteria |
| `/api/candidates` | GET/POST | List/tambah kandidat |
| `/api/candidates/:id` | GET/PUT/DELETE | Detail/ubah/hapus kandidat |
| `/api/candidates/:id/scores` | GET/POST | Ambil/simpan skor |
| `/api/psi/calculate` | POST | Hitung PSI (simpan sesi baru) |
| `/api/psi/sessions` | GET | List sesi |
| `/api/psi/sessions/latest` | GET | Sesi terakhir |
| `/api/psi/sessions/:id` | GET/DELETE | Detail/hapus sesi |
| `/api/dashboard/stats` | GET | Statistik |
| `/api/settings` | GET/PUT | Pengaturan aplikasi |
| `/api/export` | GET/POST | Export/Import JSON |
| `/api/upload` | POST | Upload foto |

## 🎨 Kode Warna

| Warna | Hex | Penggunaan |
|-------|:---:|------------|
| Primary | `#1E3A5F` | Header, sidebar, tombol utama |
| Secondary | `#2E86AB` | Aksen, badge, link |
| Accent | `#F0A500` | Highlight, peringatan |
| Success | `#27AE60` | Status aktif, nilai tinggi |
| Destructive | `#E74C3C` | Hapus, status nonaktif |

## 📄 Lisensi

Proyek ini dibuat untuk keperluan assessment LKP Academy Vistar.
