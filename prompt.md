# PROMPT: Aplikasi Rekrutmen Mentor dengan Metode PSI (Preference Selection Index)

## Konteks Proyek
Buat aplikasi web fullstack untuk sistem rekrutmen mentor menggunakan metode pengambilan keputusan **PSI (Preference Selection Index)**. Aplikasi ini membantu panitia atau admin menentukan mentor terbaik dari sekumpulan kandidat berdasarkan beberapa kriteria penilaian secara objektif dan terstandarisasi.

---

## Stack Teknologi
- **Frontend**: React 18+ dengan TypeScript
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Database**: SQLite via `better-sqlite3`
- **Backend/API**: Express.js (REST API sederhana) atau Next.js API Routes
- **State Management**: Zustand atau React Context
- **Tabel & Grafik**: Recharts (untuk visualisasi hasil PSI)
- **Form Validation**: React Hook Form + Zod
- **Icons**: Lucide React

---

## Algoritma PSI (Preference Selection Index) — Wajib Diimplementasikan

Implementasikan perhitungan PSI secara akurat sesuai langkah berikut:

### Langkah 1 — Buat Matriks Keputusan (Decision Matrix)
```
X = [x_ij]  di mana i = alternatif (kandidat), j = kriteria
```

### Langkah 2 — Normalisasi Matriks
- **Kriteria Benefit** (semakin besar semakin baik):
  ```
  r_ij = x_ij / max(x_ij)
  ```
- **Kriteria Cost** (semakin kecil semakin baik):
  ```
  r_ij = min(x_ij) / x_ij
  ```

### Langkah 3 — Hitung Nilai Preferensi Rata-Rata (Mean)
```
R̄_j = (1/m) × Σ r_ij   (m = jumlah alternatif)
```

### Langkah 4 — Hitung Preference Variation Value (PV)
```
PV_j = Σ (r_ij - R̄_j)²
```

### Langkah 5 — Hitung Deviation in Preference Value (DPV)
```
DPV_j = 1 - PV_j
```

### Langkah 6 — Hitung Overall Preference Value (Φ)
```
Φ_j = DPV_j / Σ DPV_j   (bobot otomatis, tidak memerlukan input bobot dari pengguna)
```

### Langkah 7 — Hitung PSI Score (Preference Selection Index)
```
PSI_i = Σ (Φ_j × r_ij)   (untuk setiap alternatif i)
```

### Langkah 8 — Ranking
Urutkan PSI_i dari nilai tertinggi ke terendah. Nilai PSI tertinggi = kandidat terbaik.

> **Catatan penting**: PSI tidak memerlukan bobot dari decision maker. Bobot dihitung secara otomatis dari variasi data.

---

## Struktur Database (SQLite)

```sql
-- Tabel kriteria penilaian
CREATE TABLE criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('benefit', 'cost')),
  unit TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel kandidat mentor
CREATE TABLE candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  education TEXT,
  institution TEXT,
  expertise TEXT,
  bio TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel nilai kandidat per kriteria
CREATE TABLE scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  criteria_id INTEGER NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
  value REAL NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(candidate_id, criteria_id)
);

-- Tabel sesi perhitungan PSI
CREATE TABLE psi_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'completed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  calculated_at DATETIME
);

-- Tabel hasil PSI per sesi
CREATE TABLE psi_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES psi_sessions(id) ON DELETE CASCADE,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id),
  psi_score REAL NOT NULL,
  rank INTEGER NOT NULL,
  is_recommended BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel detail perhitungan (untuk transparansi/audit trail)
CREATE TABLE psi_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES psi_sessions(id) ON DELETE CASCADE,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id),
  criteria_id INTEGER NOT NULL REFERENCES criteria(id),
  raw_value REAL NOT NULL,
  normalized_value REAL NOT NULL,
  pv_contribution REAL,
  dpv_contribution REAL,
  phi_value REAL,
  weighted_score REAL
);
```

---

## Fitur-Fitur Utama

### 1. Dashboard Utama
- **Statistik ringkasan**: Total kandidat aktif, total kriteria, jumlah sesi perhitungan
- **Grafik bar**: Top 5 kandidat berdasarkan skor PSI terakhir (Recharts)
- **Recent activity**: Log aktivitas terbaru (tambah kandidat, hitung PSI, dll.)
- **Quick actions**: Tombol shortcut ke fitur utama

### 2. Manajemen Kriteria (`/criteria`)
- CRUD kriteria penilaian
- Setiap kriteria memiliki: Nama, Deskripsi, Tipe (benefit/cost), Satuan
- Contoh kriteria default yang di-seed:
  - IPK / GPA (benefit, skala 0–4)
  - Pengalaman Mengajar dalam Tahun (benefit)
  - Jumlah Publikasi / Karya (benefit)
  - Tarif Mengajar per Jam (cost, dalam Rupiah)
  - Jam Ketersediaan per Minggu (benefit)
- Toggle aktif/nonaktif kriteria
- Warning jika kriteria dihapus yang sudah punya data nilai

### 3. Manajemen Kandidat Mentor (`/candidates`)
- CRUD data kandidat lengkap
- Form input: Nama, Email, Telepon, Pendidikan, Institusi, Keahlian, Bio singkat
- Upload foto profil (opsional, simpan sebagai base64 atau path lokal)
- Status kandidat: aktif / nonaktif
- **Sub-halaman input nilai** (`/candidates/:id/scores`):
  - Form untuk mengisi nilai kandidat pada setiap kriteria
  - Validasi range nilai sesuai satuan kriteria
  - Tampilkan kriteria yang belum diisi dengan highlight merah
  - Indikator kelengkapan nilai (progress bar)

### 4. Proses Perhitungan PSI (`/calculation`)
**Tampilkan sebagai Wizard 4 langkah:**

**Step 1 — Konfigurasi Sesi**
- Input nama sesi dan deskripsi
- Pilih kandidat mana saja yang akan dihitung (multi-select, default semua aktif)
- Pilih kriteria yang digunakan (multi-select, default semua aktif)
- Validasi: minimal 2 kandidat dan 2 kriteria

**Step 2 — Preview Matriks Keputusan**
- Tampilkan tabel matriks nilai mentah sebelum perhitungan
- Highlight sel yang kosong / belum diisi (merah)
- Tombol "Lanjutkan" disabled jika ada sel kosong

**Step 3 — Preview Perhitungan Langkah per Langkah**
Tampilkan tabel untuk setiap tahap PSI:
  - Tabel matriks normalisasi (r_ij)
  - Tabel nilai rata-rata per kriteria (R̄_j)
  - Tabel PV (Preference Variation)
  - Tabel DPV (Deviation in Preference Value)
  - Tabel Φ (Overall Preference Value / bobot otomatis)
  - Tabel PSI Score akhir per kandidat
- Tampilkan rumus yang digunakan di bawah setiap tabel

**Step 4 — Konfirmasi & Simpan**
- Preview ranking akhir dalam bentuk kartu kandidat berurutan
- Badge medal 🥇🥈🥉 untuk 3 teratas
- Checkbox "Tandai sebagai Mentor Direkomendasikan" untuk kandidat terpilih
- Tombol "Simpan Hasil" → simpan ke database

### 5. Hasil & Laporan (`/results`)
- List semua sesi perhitungan dengan tanggal
- Klik sesi → lihat detail hasil:
  - **Tabel Ranking**: Peringkat, Nama kandidat, Skor PSI, Badge rekomendasi
  - **Grafik Radar/Spider chart**: Perbandingan nilai normalisasi antar kandidat teratas
  - **Grafik Bar horizontal**: PSI score semua kandidat
  - **Tabel detail perhitungan** (collapsible): Semua tahap PSI untuk audit
  - Tombol **Export ke PDF** (gunakan `window.print()` atau `jsPDF`)
  - Tombol **Export ke CSV**

### 6. Pengaturan (`/settings`)
- Konfigurasi nama aplikasi, logo, nama instansi
- Manajemen data: tombol reset data, export/import backup JSON
- Tentang aplikasi: versi, penjelasan singkat metode PSI

---

## Desain UI/UX

### Palet Warna (Tema Profesional & Akademis)
```
Primary:     #1E3A5F  (Navy Blue — kepercayaan, akademis)
Secondary:   #2E86AB  (Steel Blue — teknologi, modern)
Accent:      #F0A500  (Amber Gold — prestasi, rekrutmen)
Success:     #27AE60  (Green)
Warning:     #E67E22  (Orange)
Danger:      #E74C3C  (Red)
Background:  #F8FAFC  (Off-white)
Surface:     #FFFFFF
Text:        #1A202C  (Near-black)
Muted:       #64748B
```

### Tipografi
- **Display/Heading**: Inter (bold, weight 700–800) — clean, modern, mudah dibaca
- **Body**: Inter (regular, weight 400–500)
- **Data/Angka**: JetBrains Mono atau `font-mono` — konsisten untuk tampilan tabel numerik

### Layout
- Sidebar navigasi di kiri (collapsible di mobile)
- Konten utama dengan max-width 1280px
- Breadcrumb di bagian atas halaman
- Responsive: berfungsi baik di layar 768px ke atas (tablet portrait)

### Komponen shadcn/ui yang Digunakan
- `Card` — kontainer dashboard dan statistik
- `Table` — matriks keputusan dan hasil ranking
- `Badge` — status, tipe kriteria, rekomendasi
- `Dialog` — form tambah/edit kandidat & kriteria
- `Tabs` — navigasi detail sesi hasil
- `Progress` — kelengkapan nilai kandidat
- `Tooltip` — penjelasan rumus PSI saat hover
- `Alert` — validasi error dan warning
- `Stepper` (custom) — wizard perhitungan PSI
- `Select`, `Input`, `Textarea`, `Switch` — form inputs
- `Skeleton` — loading state
- `Toaster` — notifikasi sukses/error

---

## Data Seed (untuk demo/development)

Pre-populate database dengan:

**5 Kriteria:**
| ID | Nama | Tipe | Satuan |
|----|------|------|--------|
| 1 | IPK / GPA | benefit | skala 0–4 |
| 2 | Pengalaman Mengajar (tahun) | benefit | tahun |
| 3 | Jumlah Publikasi | benefit | karya |
| 4 | Tarif per Jam | cost | Rupiah (ribu) |
| 5 | Jam Tersedia/Minggu | benefit | jam |

**6 Kandidat Mentor dengan nilai:**
| Kandidat | IPK | Pengalaman | Publikasi | Tarif (rb) | Jam/Minggu |
|----------|-----|-----------|-----------|------------|------------|
| Andi Setiawan | 3.85 | 5 | 12 | 150 | 20 |
| Budi Santoso | 3.62 | 8 | 7 | 100 | 25 |
| Citra Dewi | 3.90 | 3 | 15 | 200 | 15 |
| Dian Pratama | 3.45 | 10 | 5 | 80 | 30 |
| Eka Rahayu | 3.75 | 6 | 10 | 120 | 22 |
| Fajar Nugraha | 3.58 | 4 | 8 | 90 | 28 |

---

## Struktur File Proyek

```
mentor-psi/
├── client/                        # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── candidates/
│   │   │   │   ├── CandidateCard.tsx
│   │   │   │   ├── CandidateForm.tsx
│   │   │   │   └── ScoreInputForm.tsx
│   │   │   ├── criteria/
│   │   │   │   └── CriteriaForm.tsx
│   │   │   ├── calculation/
│   │   │   │   ├── MatrixTable.tsx
│   │   │   │   ├── PSIStepDisplay.tsx
│   │   │   │   └── CalculationWizard.tsx
│   │   │   └── results/
│   │   │       ├── RankingTable.tsx
│   │   │       ├── RadarChart.tsx
│   │   │       └── ResultExport.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Candidates.tsx
│   │   │   ├── CandidateDetail.tsx
│   │   │   ├── Criteria.tsx
│   │   │   ├── Calculation.tsx
│   │   │   ├── Results.tsx
│   │   │   └── Settings.tsx
│   │   ├── lib/
│   │   │   ├── psi.ts             # Logika algoritma PSI murni
│   │   │   ├── api.ts             # API client (fetch wrapper)
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   │   ├── useCandidates.ts
│   │   │   ├── useCriteria.ts
│   │   │   └── usePSI.ts
│   │   └── types/
│   │       └── index.ts           # TypeScript interfaces
│   └── package.json
│
├── server/                        # Express.js backend
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   ├── seed.ts
│   │   │   └── database.ts        # better-sqlite3 setup
│   │   ├── routes/
│   │   │   ├── candidates.ts
│   │   │   ├── criteria.ts
│   │   │   ├── scores.ts
│   │   │   └── psi.ts
│   │   ├── services/
│   │   │   └── psiCalculator.ts   # PSI business logic di backend
│   │   └── index.ts
│   └── package.json
│
└── README.md
```

---

## TypeScript Interfaces Utama

```typescript
// types/index.ts

export type CriteriaType = 'benefit' | 'cost';

export interface Criteria {
  id: number;
  name: string;
  description?: string;
  type: CriteriaType;
  unit?: string;
  createdAt: string;
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  education?: string;
  institution?: string;
  expertise?: string;
  bio?: string;
  photoUrl?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  completionRate?: number; // % kriteria yang sudah diisi
}

export interface Score {
  id: number;
  candidateId: number;
  criteriaId: number;
  value: number;
  notes?: string;
}

// Tipe untuk hasil perhitungan PSI
export interface DecisionMatrix {
  candidates: Candidate[];
  criteria: Criteria[];
  matrix: number[][];  // [candidateIndex][criteriaIndex]
}

export interface NormalizedMatrix {
  matrix: number[][];
  method: ('max' | 'min')[];  // normalisasi yang digunakan per kriteria
}

export interface PSICalculationDetail {
  normalizedMatrix: number[][];
  meanValues: number[];           // R̄_j
  preferenceVariation: number[];  // PV_j
  deviationPreference: number[];  // DPV_j
  overallPreference: number[];    // Φ_j (bobot otomatis)
  psiScores: number[];            // PSI_i final
}

export interface PSIResult {
  sessionId: number;
  sessionName: string;
  rankings: {
    rank: number;
    candidate: Candidate;
    psiScore: number;
    isRecommended: boolean;
  }[];
  calculationDetail: PSICalculationDetail;
  calculatedAt: string;
}
```

---

## Implementasi Algoritma PSI (lib/psi.ts)

```typescript
// Implementasi wajib di client/src/lib/psi.ts
// (dan mirror di server/src/services/psiCalculator.ts)

export function calculatePSI(
  matrix: number[][],         // [alternatif][kriteria]
  criteriaTypes: ('benefit' | 'cost')[]
): PSICalculationDetail {

  const m = matrix.length;         // jumlah alternatif
  const n = criteriaTypes.length;  // jumlah kriteria

  // Langkah 2: Normalisasi
  const normalized: number[][] = Array.from({ length: m }, () => Array(n).fill(0));

  for (let j = 0; j < n; j++) {
    const column = matrix.map(row => row[j]);
    const maxVal = Math.max(...column);
    const minVal = Math.min(...column);

    for (let i = 0; i < m; i++) {
      if (criteriaTypes[j] === 'benefit') {
        normalized[i][j] = matrix[i][j] / maxVal;
      } else {
        normalized[i][j] = minVal / matrix[i][j];
      }
    }
  }

  // Langkah 3: Mean per kriteria
  const meanValues: number[] = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    meanValues[j] = normalized.reduce((sum, row) => sum + row[j], 0) / m;
  }

  // Langkah 4: Preference Variation (PV)
  const preferenceVariation: number[] = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    preferenceVariation[j] = normalized.reduce(
      (sum, row) => sum + Math.pow(row[j] - meanValues[j], 2), 0
    );
  }

  // Langkah 5: Deviation in Preference (DPV)
  const deviationPreference = preferenceVariation.map(pv => 1 - pv);

  // Langkah 6: Overall Preference Value (Φ)
  const sumDPV = deviationPreference.reduce((a, b) => a + b, 0);
  const overallPreference = deviationPreference.map(dpv => dpv / sumDPV);

  // Langkah 7: PSI Score
  const psiScores: number[] = Array(m).fill(0);
  for (let i = 0; i < m; i++) {
    psiScores[i] = normalized[i].reduce(
      (sum, rij, j) => sum + overallPreference[j] * rij, 0
    );
  }

  return {
    normalizedMatrix: normalized,
    meanValues,
    preferenceVariation,
    deviationPreference,
    overallPreference,
    psiScores,
  };
}
```

---

## Halaman Perhitungan — Tampilan Langkah per Langkah

Setiap langkah PSI harus ditampilkan sebagai **tabel interaktif** dengan:
- Header kolom = nama kriteria
- Header baris = nama kandidat
- Angka diformat 4 desimal (`toFixed(4)`)
- **Color heatmap** pada sel: nilai tertinggi di kolom → hijau, terendah → merah (gradasi)
- Tooltip saat hover: tampilkan rumus yang menghasilkan nilai tersebut
- Panah animasi antar tabel menunjukkan alur perhitungan

Contoh label setiap tabel:
1. `📊 Matriks Keputusan (Nilai Asli)`
2. `📐 Matriks Normalisasi (r_ij)`
3. `📈 Rata-Rata Nilai Preferensi (R̄_j)`
4. `📉 Preference Variation Value (PV_j)`
5. `⚖️ Deviation in Preference Value (DPV_j)`
6. `🔢 Overall Preference Value / Bobot Otomatis (Φ_j)`
7. `🏆 PSI Score & Ranking Akhir`

---

## Halaman Hasil — Visualisasi

### Grafik Radar (Spider Chart)
- Tampilkan nilai normalisasi 3 kandidat teratas
- Setiap sumbu = satu kriteria
- Warna berbeda tiap kandidat
- Menggunakan `RadarChart` dari Recharts

### Grafik Bar Horizontal
- Tampilkan semua kandidat (sumbu Y) vs PSI Score (sumbu X)
- Highlight bar kandidat yang direkomendasikan dengan warna amber/gold
- Nilai PSI ditampilkan di ujung bar

### Kartu Ranking
```
┌─────────────────────────────────────────┐
│ 🥇  #1  Andi Setiawan                  │
│      PSI Score: 0.8742                  │
│      ✅ Direkomendasikan sebagai Mentor  │
│      IPK: 3.85 | Pengalaman: 5 thn     │
└─────────────────────────────────────────┘
```

---

## Catatan Implementasi Penting

1. **Validasi Data**: Pastikan tidak ada nilai 0 atau negatif untuk kriteria cost (akan menyebabkan pembagian dengan nol)
2. **Edge Case**: Jika semua nilai kriteria sama (PV = 0), tangani dengan DPV = 1 dan bagi rata
3. **Presisi**: Gunakan minimal 6 digit desimal untuk intermediate calculation, tampilkan 4 desimal ke user
4. **Konsistensi**: Hasil perhitungan di frontend (`lib/psi.ts`) dan backend (`services/psiCalculator.ts`) harus menggunakan logika yang identik
5. **Audit Trail**: Simpan detail setiap langkah perhitungan ke `psi_details` agar dapat diverifikasi ulang
6. **Immutability**: Hasil PSI yang tersimpan tidak dapat diubah, hanya bisa membuat sesi baru
7. **Lokalisasi angka**: Format angka besar menggunakan `toLocaleString('id-ID')` untuk Rupiah

---

## API Endpoints

```
GET    /api/candidates              Daftar semua kandidat
POST   /api/candidates              Tambah kandidat baru
GET    /api/candidates/:id          Detail kandidat
PUT    /api/candidates/:id          Update kandidat
DELETE /api/candidates/:id          Hapus kandidat
GET    /api/candidates/:id/scores   Nilai kandidat per kriteria
POST   /api/candidates/:id/scores   Simpan/update nilai

GET    /api/criteria                Daftar semua kriteria
POST   /api/criteria                Tambah kriteria
PUT    /api/criteria/:id            Update kriteria
DELETE /api/criteria/:id            Hapus kriteria

POST   /api/psi/calculate           Hitung PSI (kirim config sesi)
GET    /api/psi/sessions            Daftar sesi perhitungan
GET    /api/psi/sessions/:id        Detail hasil sesi + breakdown
DELETE /api/psi/sessions/:id        Hapus sesi

GET    /api/dashboard/stats         Statistik untuk dashboard
```

---

## Deliverable

Hasilkan aplikasi yang **production-ready** dengan:
- [ ] Semua halaman dan navigasi berfungsi
- [ ] Algoritma PSI terimplementasi dan terverifikasi akurat
- [ ] Database SQLite dengan schema dan seed data
- [ ] Form validasi di semua input
- [ ] Loading states dan error handling
- [ ] Responsive design (mobile-friendly sidebar)
- [ ] Export hasil ke PDF dan CSV
- [ ] Komentar kode pada bagian algoritma PSI
- [ ] README.md dengan instruksi setup dan penjelasan metode PSI

Mulai dari struktur proyek, kemudian implementasikan halaman per halaman secara berurutan: Dashboard → Kriteria → Kandidat → Perhitungan → Hasil.
