# Seed Data — SPK Rekrutmen Mentor AI Engineer

## Prasyarat

- MySQL 8.0 sudah berjalan sebagai service
- Database `rekrutmen_mentor_psi` sudah dibuat
- Koneksi database diatur di `server/.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=rekrutmen_mentor_psi
```

## Cara Kerja

Seeder berjalan **otomatis** setiap kali server dinyalakan (`pnpm dev` atau `pnpm start`).

Di dalam `server/src/index.ts`, fungsi `start()` memanggil:

```
runSchema() → seed() → seedSettings()
```

Seeder **hanya berjalan sekali**: sebelum insert, ia cek `SELECT COUNT(*) FROM criteria`. Kalau sudah ada data (> 0 baris), seeder dilewati (`return`).

## Reset Data

Seeder tidak bisa dijalankan ulang selama masih ada data di tabel `criteria`. Untuk mereset:

### Opsi 1: Via MySQL CLI (disarankan)

```bash
mysql -u root -ppassword rekrutmen_mentor_psi -e "
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE psi_details;
TRUNCATE TABLE psi_results;
TRUNCATE TABLE psi_sessions;
TRUNCATE TABLE scores;
TRUNCATE TABLE sub_criteria;
TRUNCATE TABLE candidates;
TRUNCATE TABLE criteria;
TRUNCATE TABLE users;
TRUNCATE TABLE app_settings;
SET FOREIGN_KEY_CHECKS = 1;
"
```

Restart server — seeder akan insert data baru.

### Opsi 2: Drop database

```bash
mysql -u root -ppassword -e "DROP DATABASE rekrutmen_mentor_psi; CREATE DATABASE rekrutmen_mentor_psi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Restart server — schema + seed akan dibuat dari nol.

## Login Admin

| Field    | Nilai      |
|----------|------------|
| username | `admin`    |
| password | `password` |

Seeder menggunakan `INSERT IGNORE INTO`, jadi data admin tidak akan duplikat meskipun seeder dipanggil ulang.

## Data yang Di-seed

### 5 Kriteria — SPK Rekrutmen Mentor AI Engineer

| Kode | Nama | Bobot Referensi | Tipe | Status |
|------|------|----------------:|:----:|--------|
| C1 | Kompetensi Teknis AI Engineer | 30% | Benefit | Aktif |
| C2 | Pengalaman Praktis / Portofolio Proyek AI | 25% | Benefit | Aktif |
| C3 | Kemampuan Mengajar dan Komunikasi | 20% | Benefit | Aktif |
| C4 | Pemahaman Kurikulum dan Penyusunan Materi | 15% | Benefit | Aktif |
| C5 | Profesionalisme dan Komitmen | 10% | Benefit | Aktif |

> **Catatan:** Bobot referensi bersifat informatif. PSI menghitung bobot (Φⱼ) otomatis dari variasi data.

### 25 Sub-Kriteria (5 per kriteria)

Setiap kriteria memiliki 5 level penilaian:

| Nilai | Label | Bobot |
|-------|-------|:-----:|
| 5 | Sangat Baik | 5 |
| 4 | Baik | 4 |
| 3 | Cukup | 3 |
| 2 | Kurang | 2 |
| 1 | Sangat Kurang | 1 |

### 20 Kandidat

| Nama | Pendidikan | Jurusan | Keahlian |
|------|:----------:|---------|----------|
| Rizky Pratama | S2 | Ilmu Komputer | Machine Learning, Deep Learning, MLOps |
| Siti Nurhaliza | S2 | Data Science | Data Science, Natural Language Processing |
| Dimas Ardiansyah | S1 | Teknik Komputer | Computer Vision, Edge AI, Embedded Systems |
| Putri Wulandari | S2 | Teknik Informatika | NLP, Retrieval-Augmented Generation, Chatbot |
| Hendra Gunawan | S1 | Sistem Informasi | Web Development, API, Python, Cloud |
| Ayu Kartika | S3 | Kecerdasan Buatan | Reinforcement Learning, AI Ethics, Kurikulum AI |
| Farhan Maulana | S1 | Teknik Informatika | Backend AI, API Development, Python |
| Dewi Anggraini | S2 | Statistika | Data Science, Visualisasi Data, Pengajaran |
| Aditya Nugroho | S1 | Sistem Informasi | Full-stack Development, Python, Cloud AI |
| Sarah Fitriani | S2 | Ilmu Komputer | NLP, Text Analytics, Chatbot |
| Bima Sakti | S1 | Teknik Elektro | Dasar ML, Python, IoT |
| Nindi Lestari | S3 | Kecerdasan Buatan | Deep Learning, Computer Vision, Akademik |
| Reza Pahlevi | S1 | Teknik Informatika | Mobile Dev, AI Integration, Python |
| Citra Maharani | S2 | Teknologi Pendidikan | Kurikulum AI, Instructional Design, Pelatihan |
| Eko Prasetyo | S1 | Ilmu Komputer | ML Engineering, Model Deployment, MLOps |
| Fira Azzahra | S2 | Linguistik | Komunikasi, Presentasi, Pelatihan NLP |
| Gilang Ramadhan | S1 | Pendidikan Matematika | Kurikulum, Modul Ajar, Evaluasi Pembelajaran |
| Hana Safira | S2 | Ilmu Komputer | AI Engineering, NLP, Computer Vision, Pengajaran |
| Indra Lesmana | S1 | Manajemen Informatika | Dasar AI, Python Dasar, SQL |
| Joko Susilo | S1 | Teknik Informatika | Python, Data Analysis, Dasar ML |

### 100 Nilai (Scores)

Setiap kandidat memiliki satu nilai per kriteria (20 kandidat × 5 kriteria = 100 baris).
Nilai berupa angka **1–5** (integer) yang mereferensi `sub_criteria_id`.

### 2 Pengaturan Aplikasi

| Key | Value |
|-----|-------|
| app_name | LKP Academy Vistar |
| institution | SPK Rekrutmen Mentor AI Engineer |

## File Terkait

| File | Fungsi |
|------|--------|
| `server/.env` | Konfigurasi koneksi MySQL |
| `server/src/db/seed.ts` | Seed data utama (criteria, candidates, sub_criteria, scores, users, settings) |
| `server/src/db/schema.ts` | DDL tabel (dijalankan sebelum seed) |
| `server/src/db/database.ts` | Koneksi pool MySQL (mysql2) + fungsi `exec`, `run`, `transaction` |
| `server/.env` | Environment variables untuk koneksi DB |

## Cara Edit Seed Data

1. Buka `server/src/db/seed.ts`
2. Ubah data pada query `INSERT INTO` yang sesuai
3. Truncate tabel (lihat [Reset Data](#reset-data))
4. Restart server — seeder akan insert data baru

> **Catatan:** Seeder tidak menerima parameter eksternal. Semua data hardcoded di `seed.ts`. Pastikan server tidak berjalan saat melakukan truncate.
