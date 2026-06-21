interface KnowledgeEntry {
  id: string;
  keywords: string[];
  content: string;
}

const ALWAYS_INCLUDE: { security: string; identity: string } = {
  security: `⚠️ BATASAN KEAMANAN:
1. JANGAN PERNAH menyebutkan, membagikan, atau memberikan hint tentang API key, token, password, atau kredensial apapun.
2. JANGAN PERNAH menyebutkan isi file .env, struktur database, atau konfigurasi server.
3. JANGAN PERNAH menyebutkan username atau password default (admin/password).
4. JANGAN PERNAH memberikan instruksi untuk mengakses server, database, atau file system.
5. JANGAN PERNAH menyarankan modifikasi kode atau konfigurasi yang berbahaya.
6. Jika pengguna meminta informasi yang melanggar batasan di atas, tolak dengan sopan dan arahkan ke dokumentasi resmi aplikasi.`,

  identity: `Anda adalah Athena, Asisten Supervisor Akademi untuk aplikasi SPK Rekrutmen Mentor AI Engineer milik LKP Academy Vistar.
Gunakan Bahasa Indonesia yang natural, ramah, dan profesional. Jawab dengan jelas dan ringkas.
Gunakan format Markdown untuk memudahkan pembacaan: **tebal** untuk penekanan, - untuk poin-poin, 1. untuk urutan, | kolom | kolom | untuk tabel, \\\`kode\\\` untuk istilah teknis. PISAHKAN setiap poin dengan baris baru.`,
};

const ENTRIES: KnowledgeEntry[] = [
  // ── Menu & Navigasi ─────────────────────────────────
  {
    id: "menu-dashboard",
    keywords: ["dashboard", "beranda", "statistik", "total", "kandidat", "kriteria", "chart", "ranking", "grafik"],
    content: `Dashboard adalah halaman utama yang menampilkan:
- 4 kartu statistik: Total Kandidat Aktif, Total Kriteria, Sesi Perhitungan, Nilai Maksimal (5)
- Grafik stacked bar chart Top 5 Kandidat berdasarkan skor PSI (emas, perak, perunggu)
- Tabel Hasil Ranking dengan kolom: Peringkat, Nama, Skor PSI (4 desimal), Rekomendasi
- Pemilih sesi perhitungan (dropdown) jika sudah ada sesi tersimpan`,
  },
  {
    id: "menu-kriteria",
    keywords: ["kriteria", "c1", "c2", "c3", "c4", "c5", "bobot", "tipe", "sub-kriteria", "level"],
    content: `Halaman Kriteria berisi 5 kriteria Benefit (semua tipe Benefit):
- C1 Kompetensi Teknis AI Engineer (bobot referensi 30%)
- C2 Pengalaman Praktis / Portofolio Proyek AI (25%)
- C3 Kemampuan Mengajar dan Komunikasi (20%)
- C4 Pemahaman Kurikulum dan Penyusunan Materi (15%)
- C5 Profesionalisme dan Komitmen (10%)
Masing-masing punya 5 sub-kriteria level 1-5 (Sangat Kurang hingga Sangat Baik) dengan deskripsi spesifik. Bobot referensi hanya untuk display — PSI menghitung bobot otomatis.`,
  },
  {
    id: "menu-kandidat",
    keywords: ["kandidat", "mentor", "daftar", "nama", "email", "pendidikan", "keahlian", "foto"],
    content: `Halaman Kandidat berisi 20 kandidat mentor dengan detail: nama, email, no HP, pendidikan terakhir (SMA/D3/S1/S2/S3), jurusan, keahlian, foto.
Fitur: tambah kandidat baru, edit, hapus, upload foto, filter/pagination tabel.
Setiap kandidat bisa dinilai per kriteria di halaman detail (Klik nama → halaman Input Nilai dengan radio button sub-kriteria).`,
  },
  {
    id: "menu-psi",
    keywords: ["proses", "psi", "perhitungan", "wizard", "konfigurasi", "matriks", "langkah", "hitung"],
    content: `Proses PSI adalah wizard 4 langkah:
1. Konfigurasi: nama sesi (auto-generate dari tanggal), deskripsi opsional, pilih kandidat & kriteria (default: semua aktif)
2. Matriks Keputusan: tabel nilai asli (1-5) per kandidat per kriteria, dengan tooltip sub-kriteria
3. Detail Perhitungan: 6 kartu (Normalisasi, Mean, PV, DPV, Phi, Skor PSI) dengan heatmap
4. Konfirmasi: ranking akhir, sorot rank 1, tombol Simpan Hasil`,
  },
  {
    id: "menu-hasil",
    keywords: ["hasil", "ranking", "skor", "rekomendasi", "sesi", "medali", "export"],
    content: `Halaman Hasil Perhitungan menampilkan:
- Daftar sesi dalam kartu dengan nama, tanggal, jumlah kandidat, pratinjau top 3
- Detail sesi: kartu medali top 3 (🥇🥈🥉), grafik stacked bar, tabel ranking
- Detail Perhitungan collapsible dengan 5 tabel dan heatmap
- Tombol Export: PDF (Noto Serif), CSV (UTF-8 BOM), Excel (xlsx)
- Hapus sesi dengan konfirmasi`,
  },
  {
    id: "menu-pengaturan",
    keywords: ["pengaturan", "setting", "konfigurasi", "api key", "password", "export json", "import", "reset"],
    content: `Halaman Pengaturan memiliki 5 seksi:
1. Konfigurasi Aplikasi: nama aplikasi, nama instansi
2. Konfigurasi AI Athena: input Gemini API Key (password field), simpan
3. Manajemen Data: Export JSON (backup full database), Import JSON (restore, replace semua data), Reset
4. Ubah Password: password lama, baru, konfirmasi (min 6 karakter)
5. Tentang: versi aplikasi 1.0.0, deskripsi metode PSI`,
  },

  // ── PSI Algorithm ────────────────────────────────────
  {
    id: "psi-overview",
    keywords: ["psi", "preference selection index", "metode", "madm", "bobot otomatis"],
    content: `PSI (Preference Selection Index) adalah metode MADM yang menghitung bobot kriteria secara OTOMATIS dari variasi data. Tidak seperti AHP atau Weighted Product, PSI tidak membutuhkan bobot dari pengambil keputusan. Bobot referensi (30%, 25%, dll) hanya untuk display, tidak pernah dipakai dalam perhitungan.`,
  },
  {
    id: "psi-normalisasi",
    keywords: ["normalisasi", "r_ij", "benefit", "cost", "max", "min"],
    content: `Langkah 1 — Normalisasi:
Setiap nilai x_ij dinormalisasi menjadi r_ij.
- Benefit (semakin tinggi semakin baik): r_ij = x_ij / max(x_j)
- Cost (semakin rendah semakin baik): r_ij = min(x_j) / x_ij
Semua 5 kriteria di aplikasi ini adalah Benefit.`,
  },
  {
    id: "psi-mean",
    keywords: ["mean", "rata-rata", "r_bar", "r̄"],
    content: `Langkah 2 — Mean (R̄_j):
R̄_j = (1/m) × Σ r_ij
Rata-rata nilai normalisasi per kriteria, dihitung dari seluruh kandidat.`,
  },
  {
    id: "psi-pv",
    keywords: ["pv", "preference variation", "variasi"],
    content: `Langkah 3 — Preference Variation (PV_j):
PV_j = Σ (r_ij - R̄_j)²
Mengukur seberapa bervariasi nilai kriteria. Semakin besar variasi data, semakin tinggi PV.`,
  },
  {
    id: "psi-dpv",
    keywords: ["dpv", "deviation", "phi", "bobot"],
    content: `Langkah 4 — Deviation in Preference Value (DPV_j):
DPV_j = 1 - PV_j
Jika semua nilai sama (PV = 0), maka DPV = 1.

Langkah 5 — Bobot Otomatis (Φ_j):
Φ_j = DPV_j / Σ DPV_j
Jika Σ DPV = 0, maka Φ_j dibagi rata (1/n). Bobot ini yang dipakai untuk menghitung skor akhir.`,
  },
  {
    id: "psi-score",
    keywords: ["psi score", "ranking", "rekomendasi", "skor akhir", "score"],
    content: `Langkah 6 — PSI Score:
PSI_i = Σ (Φ_j × r_ij)
Skor akhir per kandidat = jumlah dari (bobot × nilai normalisasi) untuk semua kriteria.
Ranking: skor tertinggi = peringkat 1. Kandidat rank 1 otomatis ditandai "Direkomendasikan".`,
  },

  // ── Data & Scoring ───────────────────────────────────
  {
    id: "skala-nilai",
    keywords: ["skala", "nilai", "1-5", "score", "label", "penilaian", "sangat kurang", "kurang", "cukup", "baik", "sangat baik"],
    content: `Skala penilaian 1-5 integer:
1 = **Sangat Kurang**
2 = **Kurang**
3 = **Cukup**
4 = **Baik**
5 = **Sangat Baik**

Nilai hanya boleh 1-5. Nilai maksimal adalah 5.`,
  },
  {
    id: "sub-kriteria-detail",
    keywords: ["sub-kriteria", "level", "deskripsi", "detail"],
    content: `Setiap kriteria punya 5 sub-kriteria (weight 1-5) dengan deskripsi spesifik.
Contoh sub-kriteria C1 (Kompetensi Teknis):
- 5: Sangat Baik — Menguasai konsep dan praktik AI Engineering secara sangat baik
- 4: Baik — Menguasai sebagian besar konsep
- 3: Cukup — Memahami dasar-dasar AI
- 2: Kurang — Hanya memahami konsep dasar
- 1: Sangat Kurang — Tidak memiliki pemahaman memadai`,
  },

  // ── Features ─────────────────────────────────────────
  {
    id: "fitur-export",
    keywords: ["export", "pdf", "csv", "excel", "download", "backup", "json"],
    content: `Fitur Export tersedia dalam 4 format:
- **PDF**: ranking + detail perhitungan (Noto Serif font), footer username & tanggal
- **CSV**: UTF-8 BOM (kompatibel Excel Indonesia), raw + normalized + PSI score
- **Excel**: via xlsx library, sheet "Hasil PSI"
- **JSON**: backup full database via Pengaturan
Export PDF/CSV/Excel dari detail sesi. JSON export/import dari halaman Pengaturan.`,
  },
  {
    id: "fitur-upload",
    keywords: ["upload", "foto", "photo", "gambar", "image"],
    content: `Upload foto kandidat via multer:
- Maksimal 2 MB
- Hanya file gambar (image/*)
- Disimpan di server/uploads/
- Ditampilkan sebagai thumbnail lingkaran 56px di halaman Kandidat`,
  },
  {
    id: "fitur-dokumentasi",
    keywords: ["dokumentasi", "docs", "bantuan", "panduan"],
    content: `Halaman Dokumentasi (/dokumentasi) berisi 15 seksi lengkap tentang aplikasi:
pengenalan, kriteria, kandidat, metode PSI, perhitungan, dashboard, tutorial, FAQ, dsb.
Membuka tab baru. TOC sticky di sidebar dengan smooth scrolling.`,
  },
  {
    id: "fitur-sesi",
    keywords: ["sesi", "session", "simpan", "immutable", "perhitungan", "hasil"],
    content: `Sesi perhitungan bersifat **immutable** — setelah disimpan, hasil tidak bisa diubah atau diedit.
Untuk kalkulasi ulang, buat sesi baru. Hapus sesi via tombol trash di kartu sesi (konfirmasi).
Penghapusan otomatis menghapus psi_results dan psi_details (CASCADE).`,
  },

  // ── FAQ ──────────────────────────────────────────────
  {
    id: "faq-cara-hitung",
    keywords: ["cara", "bagaimana", "langkah", "hitung", "proses"],
    content: `Cara melakukan perhitungan PSI:
1. Buka menu **Proses PSI**
2. Ikuti wizard 4 langkah: Konfigurasi → Matriks → Detail Perhitungan → Konfirmasi
3. Pilih kandidat dan kriteria yang diinginkan (default: semua aktif)
4. Klik **Simpan Hasil** untuk menyimpan sesi
Hasil bisa dilihat di menu **Hasil Perhitungan**`,
  },
  {
    id: "faq-reset-password",
    keywords: ["reset", "lupa", "password", "ubah"],
    content: `Cara mengubah password:
1. Buka menu **Pengaturan**
2. Masuk ke seksi **Ubah Password**
3. Isi password lama, password baru (min 6 karakter), konfirmasi
4. Klik **Ubah Password**
Tidak ada fitur reset password. Hubungi administrator jika lupa password.`,
  },
  {
    id: "faq-nilai-kosong",
    keywords: ["nilai", "kosong", "missing", "0", "belum", "lengkapi"],
    content: `Nilai yang belum diisi akan ditampilkan sebagai 0 (dengan latar merah).
Cara melengkapi:
1. Buka menu **Kandidat**
2. Klik nama kandidat yang ingin dinilai
3. Di halaman Input Nilai, pilih sub-kriteria (radio button) untuk setiap kriteria
4. Klik **Simpan Nilai**`,
  },
  {
    id: "faq-tambah-data",
    keywords: ["tambah", "buat", "baru", "kandidat", "kriteria", "sub-kriteria"],
    content: `**Tambah Kandidat:** tombol "Tambah Kandidat" di halaman Kandidat → isi form (nama, email wajib)
**Tambah Kriteria:** tombol "Tambah Kriteria" di halaman Kriteria → isi form (nama, tipe Benefit)
**Tambah Sub-kriteria:** klik expand baris kriteria → tombol "Tambah Level" → isi nama & weight`,
  },
  {
    id: "faq-athena",
    keywords: ["athena", "chatbot", "ai", "gemini", "api key", "asisten"],
    content: `Athena adalah asisten AI berbasis Google Gemini Flash yang membantu Anda menggunakan aplikasi.
Athena bisa menjawab pertanyaan tentang fitur, menu, data sesi, kriteria, kandidat, dan metode PSI.
Untuk mengaktifkan: buka **Pengaturan** → **Konfigurasi AI Athena** → masukkan Gemini API Key.
Dapatkan API key gratis di https://aistudio.google.com/apikei`,
  },
  {
    id: "faq-login",
    keywords: ["login", "auth", "masuk", "logout", "keluar", "token"],
    content: `Login menggunakan username dan password.
Default: username **admin**, password **password** (segera ubah setelah login pertama).
Logout dari avatar user di pojok kiri bawah sidebar. Token JWT disimpan di localStorage.`,
  },

  // ── Teknis ───────────────────────────────────────────
  {
    id: "stack-teknologi",
    keywords: ["teknologi", "stack", "react", "express", "mysql", "typescript", "framework", "vite"],
    content: `Stack teknologi:
- **Client:** React 19 + TypeScript + Vite 8 + shadcn/ui + Tailwind CSS + Motion (animasi) + Zustand (state management)
- **Server:** Express + MySQL 8.0 + JWT authentication
- **Package manager:** pnpm (workspace monorepo)`,
  },
  {
    id: "format-tampilan",
    keywords: ["format", "angka", "desimal", "rupiah", "warna"],
    content: `Format tampilan:
- Angka: 4 desimal untuk display, 6+ untuk kalkulasi internal
- Rupiah: toLocaleString('id-ID')
- Warna: Primary #1E3A5F, Secondary #2E86AB, Accent #F0A500
- Heatmap: nilai tertinggi hijau, terendah merah (gradient rgb)`,
  },
];

let vectorsCache: { entry: KnowledgeEntry; vector: Record<string, number>; magnitude: number }[] | null = null;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function computeTF(text: string): Record<string, number> {
  const terms = tokenize(text);
  const tf: Record<string, number> = {};
  for (const t of terms) {
    tf[t] = (tf[t] ?? 0) + 1;
  }
  const len = terms.length || 1;
  for (const k of Object.keys(tf)) {
    tf[k] /= len;
  }
  return tf;
}

function precomputeVectors() {
  if (vectorsCache) return;

  const allTerms = new Set<string>();
  const docFreq: Record<string, number> = {};
  const entryVectors: { entry: KnowledgeEntry; vector: Record<string, number> }[] = [];

  for (const entry of ENTRIES) {
    const combined = entry.keywords.join(" ") + " " + entry.content;
    const terms = tokenize(combined);
    const seen = new Set<string>();
    for (const t of terms) {
      allTerms.add(t);
      if (!seen.has(t)) {
        docFreq[t] = (docFreq[t] ?? 0) + 1;
        seen.add(t);
      }
    }

    const tf = computeTF(combined);
    entryVectors.push({ entry, vector: tf });
  }

  const N = ENTRIES.length;
  const idf: Record<string, number> = {};
  for (const t of allTerms) {
    idf[t] = Math.log((N + 1) / ((docFreq[t] ?? 0) + 1)) + 1;
  }

  vectorsCache = entryVectors.map(({ entry, vector }) => {
    const weighted: Record<string, number> = {};
    let magSq = 0;
    for (const [term, tf] of Object.entries(vector)) {
      const w = tf * (idf[term] ?? 0);
      weighted[term] = w;
      magSq += w * w;
    }
    return { entry, vector: weighted, magnitude: Math.sqrt(magSq) };
  });
}

function cosineSimilarity(
  queryVec: Record<string, number>,
  docVec: Record<string, number>,
  docMag: number,
): number {
  let dot = 0;
  for (const [term, qw] of Object.entries(queryVec)) {
    const dw = docVec[term];
    if (dw !== undefined) {
      dot += qw * dw;
    }
  }
  const qMag = Math.sqrt(Object.values(queryVec).reduce((s, v) => s + v * v, 0));
  if (qMag === 0 || docMag === 0) return 0;
  return dot / (qMag * docMag);
}

export function retrieve(query: string, topK = 3): KnowledgeEntry[] {
  precomputeVectors();

  const queryVec = computeTF(query);
  const scored = vectorsCache!.map(({ entry, vector, magnitude }) => ({
    entry,
    score: cosineSimilarity(queryVec, vector, magnitude),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.entry);
}

export function buildSystemPrompt(query: string, dynamicContext: string): string {
  const retrieved = retrieve(query, 3);
  const context = retrieved.map((e) => e.content).join("\n\n");

  return `${ALWAYS_INCLUDE.identity}

${ALWAYS_INCLUDE.security}

— PERTANYAAN PENGGUNA —
${query}

— KONTEKS RELEVAN —
${context}

— DATA SISTEM TERKINI —
${dynamicContext}

Jawab berdasarkan konteks di atas. Jika tidak ada informasi yang relevan, jawab berdasarkan pengetahuan umum dan arahkan ke menu Dokumentasi untuk detail lebih lanjut.

Jawab dengan RINGKAS: gunakan poin-poin (-), hindari tabel panjang atau paragraf panjang. Prioritas jawaban yang langsung ke inti.

Gunakan format Markdown: **tebal** untuk penekanan, - atau * untuk bullet list, 1. 2. untuk numbered list, | kolom1 | kolom2 | untuk tabel, \`kode\` untuk istilah teknis. Gunakan emoji untuk memperkaya tampilan. Pisahkan paragraf dengan baris kosong.

PENTING: Setiap jawaban HARUS diakhiri dengan 3 pertanyaan lanjutan yang relevan dalam format:
<!--SUGGESTIONS-->["pertanyaan 1","pertanyaan 2","pertanyaan 3"]

JANGAN PERNAH menyebutkan atau memberikan hint tentang API key, password, token, atau kredensial lainnya.`;
}
