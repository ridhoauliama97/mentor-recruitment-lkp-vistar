# Reset Database MySQL

> **Peringatan:** Semua data yang ada akan hilang. Pastikan sudah backup jika diperlukan (export via `/api/export`).

## Opsi 1: Truncate tabel (disarankan)

Menghapus semua data tanpa mengubah struktur tabel.

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

Restart server — seeder akan insert data baru dari `server/src/db/seed.ts`.

## Opsi 2: Drop & create ulang database

Menghapus database beserta seluruh tabel, lalu membuatnya kembali.

```bash
mysql -u root -ppassword -e "DROP DATABASE IF EXISTS rekrutmen_mentor_psi; CREATE DATABASE rekrutmen_mentor_psi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Restart server — schema + seed akan dibuat dari nol.

## Opsi 3: Via aplikasi (Export/Import)

> **Catatan:** Fitur Export/Import di halaman Settings hanya untuk backup data, bukan untuk reset.

## Verifikasi

Setelah restart, cek apakah data sudah terisi:

```bash
mysql -u root -ppassword -e "
USE rekrutmen_mentor_psi;
SELECT 'criteria', COUNT(*) FROM criteria
UNION ALL SELECT 'candidates', COUNT(*) FROM candidates
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'app_settings', COUNT(*) FROM app_settings;
"
```

Hasil yang diharapkan:

| Tabel | Jumlah |
|-------|-------:|
| criteria | 5 |
| candidates | 20 |
| users | 1 |
| app_settings | 2 |
