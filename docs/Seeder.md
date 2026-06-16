# Seed Data — SPK Rekrutmen Mentor AI Engineer

## Cara Kerja

Seeder berjalan **otomatis** setiap kali server dinyalakan (`pnpm dev` atau `pnpm start`).

Di dalam `server/src/index.ts`, fungsi `start()` memanggil:

```
initDb() → runSchema() → seed() → seedSettings()
```

Seeder **hanya berjalan sekali**: sebelum insert, ia cek `SELECT COUNT(*) FROM criteria`. Kalau sudah ada data (> 0 baris), seeder dilewati (`return`).

## Reset Data

Hapus file database lalu restart server:

```sh
# Dari root proyek
# 1. Hapus DB
rm -f data/mentor-psi.db
# 2. Start server
pnpm start
```

Server akan membuat database baru dari nol dan menjalankan seeder.

## Login Admin

| Field    | Nilai      |
|----------|------------|
| username | `admin`    |
| password | `password` |

Seeder menggunakan `INSERT OR IGNORE`, jadi data admin tidak akan duplikat meskipun seeder dipanggil ulang.

## Data yang Di-seed

### 5 Kriteria — SPK Rekrutmen Mentor AI Engineer

| Kode | Nama | Bobot Ref | Tipe | Status |
|------|------|-----------|:----:|--------|
| C1 | Kompetensi Teknis AI Engineer | 30% | Benefit | Aktif |
| C2 | Pengalaman Praktis / Portofolio Proyek AI | 25% | Benefit | Aktif |
| C3 | Kemampuan Mengajar dan Komunikasi | 20% | Benefit | Aktif |
| C4 | Pemahaman Kurikulum dan Penyusunan Materi | 15% | Benefit | Aktif |
| C5 | Profesionalisme dan Komitmen | 10% | Benefit | Aktif |

### 25 Sub-Kriteria (5 per kriteria)

Setiap kriteria memiliki 5 level penilaian:

| Nilai | Label | Bobot |
|-------|-------|:-----:|
| 5 | Sangat Baik | 5 |
| 4 | Baik | 4 |
| 3 | Cukup | 3 |
| 2 | Kurang | 2 |
| 1 | Sangat Kurang | 1 |

### 6 Kandidat

| Nama | Institusi | Keahlian |
|------|-----------|----------|
| Rizky Pratama | Institut Teknologi Bandung | Machine Learning, Deep Learning, MLOps |
| Siti Nurhaliza | Universitas Gadjah Mada | Data Science, Natural Language Processing |
| Dimas Ardiansyah | Universitas Indonesia | Computer Vision, Edge AI, Embedded Systems |
| Putri Wulandari | Universitas Brawijaya | NLP, Retrieval-Augmented Generation, Chatbot |
| Hendra Gunawan | Universitas Airlangga | Web Development, API, Python, Cloud |
| Ayu Kartika | Universitas Diponegoro | Reinforcement Learning, AI Ethics, Kurikulum AI |

### 30 Nilai (Scores)

Setiap kandidat memiliki satu nilai per kriteria (6 kandidat × 5 kriteria = 30 baris).
Nilai berupa angka **1–5** (integer) yang mereferensi `sub_criteria_id`.

### 2 Pengaturan Aplikasi

| Key | Value |
|-----|-------|
| app_name | SPK Rekrutmen Mentor AI Engineer |
| institution | LKP Academy Vistar |

## File Terkait

| File | Fungsi |
|------|--------|
| `server/src/db/seed.ts` | Seed data utama (criteria, candidates, sub_criteria, scores, users) |
| `server/src/db/schema.ts` | DDL tabel (dijalankan sebelum seed) |
| `server/src/db/database.ts` | Koneksi SQLite + fungsi `exec`, `run`, `saveDb` |
| `server/data/mentor-psi.db` | File database SQLite |

## Cara Edit Seed Data

1. Buka `server/src/db/seed.ts`
2. Ubah data pada query `INSERT INTO` yang sesuai
3. Hapus `server/data/mentor-psi.db`
4. Restart server — seeder akan insert data baru

> **Catatan:** Seeder tidak menerima parameter eksternal. Semua data hardcoded di `seed.ts`.
