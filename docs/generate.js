const fs = require("fs");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  LevelFormat,
  TableOfContents,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  PageNumber,
  PageBreak,
} = require("docx");

// ── Constants ──
const A4 = { width: 11906, height: 16838 };
const MARGIN = 1440;
const CONTENT_WIDTH = A4.width - MARGIN * 2; // 9026

const PRIMARY = "1E3A5F";
const WHITE = "FFFFFF";
const LIGHT_BG = "F8FAFC";
const BORDER_COLOR = "CCCCCC";

const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

// ── Helpers ──
function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: PRIMARY, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            color: WHITE,
            font: "Arial",
            size: 20,
          }),
        ],
      }),
    ],
  });
}

function cell(text, width, opts = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading
      ? { fill: opts.shading, type: ShadingType.CLEAR }
      : undefined,
    margins: cellMargins,
    verticalAlign: "center",
    children: [
      new Paragraph({
        alignment: opts.align || AlignmentType.LEFT,
        children: [
          new TextRun({
            text: String(text),
            font: "Arial",
            size: 20,
            bold: opts.bold,
            color: opts.color,
          }),
        ],
      }),
    ],
  });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun(text)],
    spacing: { before: 360, after: 200 },
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun(text)],
    spacing: { before: 280, after: 160 },
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun(text)],
    spacing: { before: 200, after: 120 },
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.spacingAfter || 120 },
    alignment: opts.align,
    children: [
      new TextRun({
        text,
        font: "Arial",
        size: 24,
        ...(opts.bold ? { bold: true } : {}),
        ...(opts.italic ? { italics: true } : {}),
      }),
    ],
  });
}

function multiRunPara(runs, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.spacingAfter || 120 },
    alignment: opts.align,
    children: runs.map((r) => new TextRun({ font: "Arial", size: 24, ...r })),
  });
}

function blankLine() {
  return new Paragraph({ spacing: { after: 60 }, children: [] });
}

function numberedItem(ref, level, text) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 24 })],
  });
}

// ── Data ──
const criteriaData = [
  [
    "C1",
    "Kompetensi Teknis AI Engineer",
    "benefit",
    "30%",
    "Menjadi aspek utama karena coach AI Engineer harus menguasai kemampuan teknis inti dalam bidang AI.",
  ],
  [
    "C2",
    "Pengalaman Praktis / Portofolio Proyek AI",
    "benefit",
    "25%",
    "Pengalaman proyek penting untuk memastikan coach mampu memberikan pembelajaran berbasis praktik nyata.",
  ],
  [
    "C3",
    "Kemampuan Mengajar dan Komunikasi",
    "benefit",
    "20%",
    "Coach tidak hanya harus ahli secara teknis, tetapi juga mampu mentransfer pengetahuan kepada peserta.",
  ],
  [
    "C4",
    "Pemahaman Kurikulum dan Penyusunan Materi",
    "benefit",
    "15%",
    "Diperlukan agar pembelajaran terarah, sistematis, dan sesuai dengan target kompetensi pelatihan.",
  ],
  [
    "C5",
    "Profesionalisme dan Komitmen",
    "benefit",
    "10%",
    "Menunjukkan kesiapan calon coach dalam menjalankan tugas secara konsisten dan bertanggung jawab.",
  ],
];

const subCriteriaData = {
  "Kompetensi Teknis AI Engineer": [
    [
      5,
      "Sangat Baik",
      "Menguasai konsep dan praktik AI Engineering secara sangat baik, mampu membangun model ML/DL, melakukan evaluasi model, serta memahami deployment AI.",
    ],
    [
      4,
      "Baik",
      "Menguasai sebagian besar konsep AI Engineering, mampu membuat model AI dan analisis hasil, tetapi belum terlalu mendalam pada deployment atau optimasi model.",
    ],
    [
      3,
      "Cukup",
      "Memahami dasar-dasar AI, machine learning, dan Python, tetapi masih terbatas dalam implementasi proyek AI yang kompleks.",
    ],
    [
      2,
      "Kurang",
      "Hanya memahami konsep dasar AI secara umum dan belum mampu menerapkan secara mandiri dalam bentuk proyek.",
    ],
    [
      1,
      "Sangat Kurang",
      "Tidak memiliki pemahaman yang memadai tentang AI Engineering, machine learning, maupun tools pendukungnya.",
    ],
  ],
  "Pengalaman Praktis / Portofolio Proyek AI": [
    [
      5,
      "Sangat Baik",
      "Memiliki banyak portofolio proyek AI yang relevan, pernah menangani proyek nyata/industri, dan dapat menjelaskan proses serta hasil proyek dengan baik.",
    ],
    [
      4,
      "Baik",
      "Memiliki beberapa portofolio proyek AI yang relevan dan mampu menunjukkan hasil implementasi secara jelas.",
    ],
    [
      3,
      "Cukup",
      "Memiliki pengalaman proyek AI sederhana, misalnya klasifikasi data, prediksi, chatbot dasar, atau computer vision sederhana.",
    ],
    [
      2,
      "Kurang",
      "Pernah mencoba proyek AI, tetapi masih terbatas pada tutorial atau latihan tanpa pengembangan mandiri.",
    ],
    [
      1,
      "Sangat Kurang",
      "Tidak memiliki portofolio atau pengalaman praktik proyek AI.",
    ],
  ],
  "Kemampuan Mengajar dan Komunikasi": [
    [
      5,
      "Sangat Baik",
      "Mampu menjelaskan materi AI yang kompleks dengan bahasa sederhana, interaktif, sistematis, dan mampu membimbing peserta secara aktif.",
    ],
    [
      4,
      "Baik",
      "Penyampaian materi cukup jelas, komunikatif, dan mampu menjawab pertanyaan peserta dengan baik.",
    ],
    [
      3,
      "Cukup",
      "Dapat menyampaikan materi, tetapi masih kurang sistematis atau kurang interaktif dalam proses pembelajaran.",
    ],
    [
      2,
      "Kurang",
      "Penyampaian materi kurang jelas, cenderung monoton, dan sulit menyesuaikan penjelasan dengan kemampuan peserta.",
    ],
    [
      1,
      "Sangat Kurang",
      "Tidak mampu menjelaskan materi dengan baik dan kurang memiliki keterampilan komunikasi dalam pembelajaran.",
    ],
  ],
  "Pemahaman Kurikulum dan Penyusunan Materi": [
    [
      5,
      "Sangat Baik",
      "Mampu menyusun kurikulum, modul, dan rencana pembelajaran AI Engineer secara lengkap, sistematis, berbasis proyek, dan sesuai kebutuhan industri.",
    ],
    [
      4,
      "Baik",
      "Mampu menyusun materi pembelajaran yang cukup lengkap dan sesuai dengan tujuan pelatihan.",
    ],
    [
      3,
      "Cukup",
      "Dapat menyusun materi dasar, tetapi belum sepenuhnya terstruktur atau belum mengarah pada proyek akhir yang jelas.",
    ],
    [
      2,
      "Kurang",
      "Materi yang disusun masih terbatas, kurang runtut, dan belum sesuai dengan kebutuhan peserta atau industri.",
    ],
    [
      1,
      "Sangat Kurang",
      "Tidak mampu menyusun materi atau kurikulum pembelajaran AI Engineer secara layak.",
    ],
  ],
  "Profesionalisme dan Komitmen": [
    [
      5,
      "Sangat Baik",
      "Sangat disiplin, bertanggung jawab, memiliki etika kerja baik, siap mengikuti jadwal pelatihan, dan menunjukkan komitmen tinggi.",
    ],
    [
      4,
      "Baik",
      "Memiliki sikap profesional, cukup disiplin, dan mampu menjalankan tugas sebagai coach dengan baik.",
    ],
    [
      3,
      "Cukup",
      "Menunjukkan komitmen yang cukup, tetapi masih perlu penguatan dalam konsistensi atau kedisiplinan.",
    ],
    [
      2,
      "Kurang",
      "Kurang disiplin, kurang siap mengajar, atau belum menunjukkan tanggung jawab yang kuat.",
    ],
    [
      1,
      "Sangat Kurang",
      "Tidak menunjukkan komitmen, kurang bertanggung jawab, dan tidak memenuhi standar profesional sebagai coach.",
    ],
  ],
};

const candidatesData = [
  [
    "Rizky Pratama",
    "rizky@example.com",
    "S2 Ilmu Komputer",
    "Institut Teknologi Bandung",
    "Machine Learning, Deep Learning, MLOps",
  ],
  [
    "Siti Nurhaliza",
    "siti@example.com",
    "S2 Data Science",
    "Universitas Gadjah Mada",
    "Data Science, Natural Language Processing",
  ],
  [
    "Dimas Ardiansyah",
    "dimas@example.com",
    "S1 Teknik Komputer",
    "Universitas Indonesia",
    "Computer Vision, Edge AI, Embedded Systems",
  ],
  [
    "Putri Wulandari",
    "putri@example.com",
    "S2 Teknik Informatika",
    "Universitas Brawijaya",
    "NLP, Retrieval-Augmented Generation, Chatbot",
  ],
  [
    "Hendra Gunawan",
    "hendra@example.com",
    "S1 Sistem Informasi",
    "Universitas Airlangga",
    "Web Development, API, Python, Cloud",
  ],
  [
    "Ayu Kartika",
    "ayu@example.com",
    "S3 Kecerdasan Buatan",
    "Universitas Diponegoro",
    "Reinforcement Learning, AI Ethics, Kurikulum AI",
  ],
  [
    "Farhan Maulana",
    "farhan@example.com",
    "S1 Teknik Informatika",
    "Universitas Telkom",
    "Backend AI, API Development, Python",
  ],
  [
    "Dewi Anggraini",
    "dewi@example.com",
    "S2 Statistika",
    "Institut Pertanian Bogor",
    "Data Science, Visualisasi Data, Pengajaran",
  ],
  [
    "Aditya Nugroho",
    "aditya@example.com",
    "S1 Sistem Informasi",
    "Universitas Bina Nusantara",
    "Full-stack Development, Python, Cloud AI",
  ],
  [
    "Sarah Fitriani",
    "sarah@example.com",
    "S2 Ilmu Komputer",
    "Universitas Padjadjaran",
    "NLP, Text Analytics, Chatbot",
  ],
  [
    "Bima Sakti",
    "bima@example.com",
    "S1 Teknik Elektro",
    "Universitas Hasanuddin",
    "Dasar ML, Python, IoT",
  ],
  [
    "Nindi Lestari",
    "nindi@example.com",
    "S3 Kecerdasan Buatan",
    "Universitas Sebelas Maret",
    "Deep Learning, Computer Vision, Akademik",
  ],
  [
    "Reza Pahlevi",
    "reza@example.com",
    "S1 Teknik Informatika",
    "Universitas Gunadarma",
    "Mobile Dev, AI Integration, Python",
  ],
  [
    "Citra Maharani",
    "citra@example.com",
    "S2 Pendidikan Teknologi Informasi",
    "Universitas Negeri Malang",
    "Kurikulum AI, Instructional Design, Pelatihan",
  ],
  [
    "Eko Prasetyo",
    "eko@example.com",
    "S1 Ilmu Komputer",
    "Universitas Diponegoro",
    "ML Engineering, Model Deployment, MLOps",
  ],
  [
    "Fira Azzahra",
    "fira@example.com",
    "S2 Linguistik Terapan",
    "Universitas Sumatera Utara",
    "Komunikasi, Presentasi, Pelatihan NLP",
  ],
  [
    "Gilang Ramadhan",
    "gilang@example.com",
    "S1 Pendidikan Matematika",
    "Universitas Negeri Yogyakarta",
    "Kurikulum, Modul Ajar, Evaluasi Pembelajaran",
  ],
  [
    "Hana Safira",
    "hana@example.com",
    "S2 Ilmu Komputer",
    "Universitas Indonesia",
    "AI Engineering, NLP, Computer Vision, Pengajaran",
  ],
  [
    "Indra Lesmana",
    "indra@example.com",
    "S1 Manajemen Informatika",
    "Universitas Sriwijaya",
    "Dasar AI, Python Dasar, SQL",
  ],
  [
    "Joko Susilo",
    "joko@example.com",
    "S1 Teknik Informatika",
    "Universitas Jenderal Soedirman",
    "Python, Data Analysis, Dasar ML",
  ],
];

const scoresData = {
  "Rizky Pratama": [5, 4, 4, 4, 4],
  "Siti Nurhaliza": [4, 3, 5, 5, 5],
  "Dimas Ardiansyah": [5, 5, 3, 3, 3],
  "Putri Wulandari": [4, 4, 4, 4, 4],
  "Hendra Gunawan": [3, 4, 3, 3, 5],
  "Ayu Kartika": [4, 3, 5, 4, 4],
  "Farhan Maulana": [4, 3, 4, 3, 4],
  "Dewi Anggraini": [5, 4, 5, 4, 5],
  "Aditya Nugroho": [3, 4, 3, 4, 3],
  "Sarah Fitriani": [4, 5, 4, 5, 4],
  "Bima Sakti": [2, 3, 3, 2, 4],
  "Nindi Lestari": [5, 5, 4, 3, 5],
  "Reza Pahlevi": [3, 2, 4, 4, 3],
  "Citra Maharani": [4, 4, 5, 5, 4],
  "Eko Prasetyo": [5, 3, 3, 3, 3],
  "Fira Azzahra": [3, 5, 4, 4, 5],
  "Gilang Ramadhan": [4, 4, 4, 5, 3],
  "Hana Safira": [5, 5, 5, 5, 5],
  "Indra Lesmana": [2, 2, 3, 2, 2],
  "Joko Susilo": [4, 3, 4, 4, 4],
};

const scoreLabels = ["C1", "C2", "C3", "C4", "C5"];

// ── Table builders ──
function buildSimpleTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        children: headers.map((h, i) => headerCell(h, colWidths[i])),
      }),
      ...rows.map(
        (row, ri) =>
          new TableRow({
            children: row.map((cellText, ci) =>
              cell(cellText, colWidths[ci], {
                shading: ri % 2 === 1 ? LIGHT_BG : undefined,
              }),
            ),
          }),
      ),
    ],
  });
}

function buildScoresTable() {
  const names = candidatesData.map((c) => c[0]);
  const colWidths = [2200, ...scoreLabels.map(() => 1365)];
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);

  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        children: [
          headerCell("Kandidat", colWidths[0]),
          ...scoreLabels.map((l, i) => headerCell(l, colWidths[i + 1])),
        ],
      }),
      ...names.map(
        (name, ri) =>
          new TableRow({
            children: [
              cell(name, colWidths[0], {
                shading: ri % 2 === 1 ? LIGHT_BG : undefined,
              }),
              ...scoresData[name].map((v, ci) =>
                cell(String(v), colWidths[ci + 1], {
                  align: AlignmentType.CENTER,
                  shading: ri % 2 === 1 ? LIGHT_BG : undefined,
                }),
              ),
            ],
          }),
      ),
    ],
  });
}

// ── Build children array ──
const children = [];

// ── Cover page ──
children.push(
  blankLine(),
  blankLine(),
  blankLine(),
  blankLine(),
  blankLine(),
  blankLine(),
);
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text: "SEED DATA",
        font: "Arial",
        size: 56,
        bold: true,
        color: PRIMARY,
      }),
    ],
  }),
);
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [
      new TextRun({
        text: "SPK Rekrutmen Mentor AI Engineer",
        font: "Arial",
        size: 36,
        color: PRIMARY,
      }),
    ],
  }),
);
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [
      new TextRun({
        text: "LKP Academy Vistar",
        font: "Arial",
        size: 28,
        color: "666666",
      }),
    ],
  }),
);
children.push(blankLine(), blankLine(), blankLine());
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    border: {
      top: { style: BorderStyle.SINGLE, size: 6, color: PRIMARY, space: 1 },
    },
    spacing: { before: 200, after: 120 },
    children: [
      new TextRun({
        text: "Dokumentasi Seeder Database",
        font: "Arial",
        size: 24,
        bold: true,
        color: PRIMARY,
      }),
    ],
  }),
);
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: `Tanggal: ${new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}`,
        font: "Arial",
        size: 22,
        color: "666666",
      }),
    ],
  }),
);
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text: "Metode PSI (Preference Selection Index)",
        font: "Arial",
        size: 22,
        color: "666666",
      }),
    ],
  }),
);

// Page break after cover
children.push(new Paragraph({ children: [new PageBreak()] }));

// ── Table of Contents ──
children.push(heading1("Daftar Isi"));
children.push(
  new TableOfContents("Daftar Isi", {
    hyperlink: true,
    headingStyleRange: "1-3",
  }),
);
children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════
// BAB 1
// ══════════════════════════════════
children.push(heading1("1. Pendahuluan"));

children.push(heading2("1.1 Cara Kerja Seeder"));
children.push(
  para(
    "Seeder berjalan otomatis setiap kali server dinyalakan (pnpm dev atau pnpm start). Proses inisialisasi dilakukan dalam urutan berikut:",
  ),
);
children.push(
  numberedItem("steps", 0, "initDb() — Memuat engine SQLite (sql.js via WASM)"),
);
children.push(
  numberedItem(
    "steps",
    0,
    "runSchema() — Membuat seluruh tabel jika belum ada",
  ),
);
children.push(
  numberedItem(
    "steps",
    0,
    "seed() — Menyisipkan data awal (kriteria, sub-kriteria, kandidat, nilai)",
  ),
);
children.push(
  numberedItem("steps", 0, "seedSettings() — Menyisipkan pengaturan aplikasi"),
);
children.push(blankLine());
children.push(
  para(
    "Seeder hanya berjalan sekali. Sebelum melakukan insert, ia mengecek SELECT COUNT(*) FROM criteria. Jika sudah ada data (> 0 baris), seeder dilewati (return).",
  ),
);

children.push(heading2("1.2 Inisialisasi Database"));
children.push(
  para(
    "Database menggunakan SQLite via sql.js (WASM-based, tanpa kompilasi native). File database disimpan di:",
  ),
);
children.push(para("server/data/mentor-psi.db", { bold: true }));
children.push(
  para(
    "Jika file tidak ditemukan, server akan membuat database baru dari awal, menjalankan schema, dan mengisi seed data secara otomatis.",
  ),
);

children.push(heading2("1.3 File Terkait"));
children.push(
  buildSimpleTable(
    ["File", "Fungsi"],
    [
      [
        "server/src/db/seed.ts",
        "Seed data utama (criteria, candidates, sub_criteria, scores, users)",
      ],
      ["server/src/db/schema.ts", "DDL untuk 8 tabel database"],
      [
        "server/src/db/database.ts",
        "Koneksi SQLite + fungsi exec, run, saveDb",
      ],
      ["server/data/mentor-psi.db", "File database SQLite (auto-generated)"],
    ],
    [3500, 5526],
  ),
);
children.push(blankLine());

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════
// BAB 2
// ══════════════════════════════════
children.push(heading1("2. Struktur Database"));
children.push(para("Database terdiri dari 8 tabel berikut:"));

const tableInfo = [
  ["criteria", "Data kriteria penilaian (C1–C5)"],
  ["sub_criteria", "Level penilaian per kriteria (5 level per kriteria)"],
  ["candidates", "Data kandidat mentor"],
  ["scores", "Nilai penilaian per kandidat per kriteria"],
  ["psi_sessions", "Sesi perhitungan PSI"],
  ["psi_results", "Hasil perhitungan PSI per sesi"],
  ["psi_details", "Detail langkah perhitungan PSI"],
  ["users", "Pengguna sistem (admin)"],
  ["app_settings", "Pengaturan aplikasi"],
];

children.push(
  buildSimpleTable(["Nama Tabel", "Deskripsi"], tableInfo, [2800, 6226]),
);
children.push(blankLine());

children.push(heading2("2.1 Tabel criteria"));
children.push(
  para(
    "Menyimpan kriteria yang digunakan dalam penilaian mentor. Kolom: id, code, name, description, type (benefit/cost), weight_ref, status (active/inactive), created_at.",
  ),
);

children.push(heading2("2.2 Tabel sub_criteria"));
children.push(
  para(
    "Menyimpan level penilaian untuk setiap kriteria. Kolom: id, criteria_id, name, weight (1–5), display_order, created_at.",
  ),
);

children.push(heading2("2.3 Tabel candidates"));
children.push(
  para(
    "Menyimpan data kandidat mentor. Kolom: id, name, email (unique), phone, education, institution, expertise, bio, photo_url, status (active/inactive), created_at.",
  ),
);

children.push(heading2("2.4 Tabel scores"));
children.push(
  para(
    "Menyimpan nilai penilaian per kandidat per kriteria. Kolom: id, candidate_id, criteria_id, value (1–5), sub_criteria_id, notes, created_at. Memiliki constraint UNIQUE(candidate_id, criteria_id).",
  ),
);

children.push(heading2("2.5 Tabel psi_sessions"));
children.push(
  para(
    "Menyimpan sesi perhitungan PSI. Kolom: id, session_name, description, status (draft/completed), created_at, calculated_at.",
  ),
);

children.push(heading2("2.6 Tabel psi_results"));
children.push(
  para(
    "Menyimpan hasil perhitungan per kandidat per sesi. Kolom: id, session_id, candidate_id, psi_score, rank, is_recommended, created_at.",
  ),
);

children.push(heading2("2.7 Tabel psi_details"));
children.push(
  para(
    "Menyimpan detail langkah perhitungan PSI. Kolom: id, session_id, candidate_id, criteria_id, raw_value, normalized_value, pv_contribution, dpv_contribution, phi_value, weighted_score.",
  ),
);

children.push(heading2("2.8 Tabel users"));
children.push(
  para(
    "Menyimpan pengguna sistem. Kolom: id, username (unique), password_hash, created_at.",
  ),
);

children.push(heading2("2.9 Tabel app_settings"));
children.push(
  para(
    "Menyimpan pengaturan aplikasi key-value. Kolom: key (primary key), value.",
  ),
);

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════
// BAB 3
// ══════════════════════════════════
children.push(heading1("3. Data Kriteria Penilaian"));
children.push(
  para(
    "Terdapat 5 kriteria yang digunakan dalam penilaian calon mentor AI Engineer. Semua kriteria bertipe Benefit (semakin tinggi nilai, semakin baik).",
  ),
);

children.push(
  buildSimpleTable(
    ["Kode", "Nama Kriteria", "Tipe", "Bobot", "Deskripsi"],
    criteriaData.map((r) => r),
    [600, 2200, 700, 700, 4826],
  ),
);
children.push(blankLine());

children.push(
  para(
    "Bobot Referensi (weight_ref) hanya untuk tampilan dan referensi penilaian. Algoritma PSI menghitung bobot otomatis (phi_j) dari variasi data, tidak menggunakan bobot referensi ini.",
    { italic: true },
  ),
);

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════
// BAB 4
// ══════════════════════════════════
children.push(heading1("4. Data Sub-Kriteria"));
children.push(
  para(
    "Setiap kriteria memiliki 5 level penilaian dengan bobot 1 (Sangat Kurang) hingga 5 (Sangat Baik). Total 25 sub-kriteria.",
  ),
);
children.push(blankLine());

Object.entries(subCriteriaData).forEach(([criterionName, levels]) => {
  children.push(
    heading2(
      `4.${Object.keys(subCriteriaData).indexOf(criterionName) + 1} ${criterionName}`,
    ),
  );
  children.push(
    buildSimpleTable(
      ["Bobot", "Label", "Deskripsi"],
      levels.map((l) => [String(l[0]), l[1], l[2]]),
      [600, 1200, 7226],
    ),
  );
  children.push(blankLine());
});

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════
// BAB 5
// ══════════════════════════════════
children.push(heading1("5. Data Kandidat"));
children.push(
  para(
    `Terdapat ${candidatesData.length} kandidat yang siap dinilai sebagai calon mentor AI Engineer.`,
  ),
);
children.push(blankLine());

children.push(
  buildSimpleTable(
    ["Nama", "Email", "Pendidikan", "Institusi", "Keahlian"],
    candidatesData.map((r) => r),
    [1600, 1600, 1400, 2000, 2426],
  ),
);
children.push(blankLine());

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════
// BAB 6
// ══════════════════════════════════
children.push(heading1("6. Data Nilai (Scores)"));
children.push(
  para(
    "Setiap kandidat memiliki satu nilai per kriteria. Total 100 baris (20 kandidat x 5 kriteria). Nilai berupa angka 1–5 (integer) yang mereferensi sub_criteria_id.",
  ),
);
children.push(blankLine());

children.push(buildScoresTable());
children.push(blankLine());

children.push(heading2("6.1 Distribusi Nilai"));
children.push(para("Nilai 5 (Sangat Baik): 22 kali"));
children.push(para("Nilai 4 (Baik): 41 kali"));
children.push(para("Nilai 3 (Cukup): 25 kali"));
children.push(para("Nilai 2 (Kurang): 10 kali"));
children.push(para("Nilai 1 (Sangat Kurang): 2 kali"));
children.push(blankLine());
children.push(para("Rata-rata nilai keseluruhan: 3.73", { bold: true }));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════
// BAB 7
// ══════════════════════════════════
children.push(heading1("7. Data Pengguna dan Pengaturan"));

children.push(heading2("7.1 Admin User"));
children.push(
  buildSimpleTable(
    ["Username", "Password", "Metode Hash"],
    [["admin", "password", "bcrypt (10 rounds)"]],
    [3000, 3000, 3026],
  ),
);
children.push(blankLine());

children.push(heading2("7.2 App Settings"));
children.push(
  buildSimpleTable(
    ["Key", "Value"],
    [
      ["app_name", "SPK Rekrutmen Mentor AI Engineer"],
      ["institution", "LKP Academy Vistar"],
    ],
    [3000, 6026],
  ),
);
children.push(blankLine());

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════
// BAB 8
// ══════════════════════════════════
children.push(heading1("8. Cara Penggunaan"));

children.push(heading2("8.1 Reset Data"));
children.push(para("Untuk mereset data ke keadaan awal seed:"));
children.push(numberedItem("usage", 0, "Hapus file database:"));
children.push(
  new Paragraph({
    numbering: { reference: "usage", level: 0 },
    indent: { left: 720 },
    spacing: { after: 80 },
    children: [
      new TextRun({
        text: "rm server/data/mentor-psi.db",
        font: "Courier New",
        size: 22,
      }),
    ],
  }),
);
children.push(numberedItem("usage", 0, "Restart server:"));
children.push(
  new Paragraph({
    numbering: { reference: "usage", level: 0 },
    indent: { left: 720 },
    spacing: { after: 120 },
    children: [
      new TextRun({ text: "pnpm dev", font: "Courier New", size: 22 }),
    ],
  }),
);
children.push(
  para(
    "Server akan membuat database baru dari nol dan menjalankan seeder secara otomatis.",
  ),
);

children.push(heading2("8.2 Edit Seed Data"));
children.push(numberedItem("edit", 0, "Buka file server/src/db/seed.ts"));
children.push(
  numberedItem("edit", 0, "Ubah data pada query INSERT INTO yang sesuai"),
);
children.push(numberedItem("edit", 0, "Hapus server/data/mentor-psi.db"));
children.push(numberedItem("edit", 0, "Restart server (pnpm dev)"));
children.push(blankLine());
children.push(
  para(
    "Seeder tidak menerima parameter eksternal. Semua data hardcoded di seed.ts.",
    { italic: true },
  ),
);

children.push(heading2("8.3 Login Admin"));
children.push(
  para(
    "Seeder menggunakan INSERT OR IGNORE, jadi data admin tidak akan duplikat meskipun seeder dipanggil ulang.",
  ),
);
children.push(
  buildSimpleTable(
    ["Field", "Nilai"],
    [
      ["URL Login", "/login"],
      ["Username", "admin"],
      ["Password", "password"],
    ],
    [3000, 6026],
  ),
);

// ── Build Document ──
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 24 } } },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: PRIMARY },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: PRIMARY },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "2E86AB" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "steps",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
      {
        reference: "usage",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
      {
        reference: "edit",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: A4,
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { after: 0 },
              children: [
                new TextRun({
                  text: "Seed Data — SPK Rekrutmen Mentor AI Engineer",
                  font: "Arial",
                  size: 18,
                  color: "999999",
                  italics: true,
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Halaman ",
                  font: "Arial",
                  size: 18,
                  color: "999999",
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: "Arial",
                  size: 18,
                  color: "999999",
                }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

// ── Write ──
const OUT = "docs/Seed-Data-SPK-Rekrutmen-Mentor-AI-Engineer.docx";
Packer.toBuffer(doc)
  .then((buffer) => {
    fs.writeFileSync(OUT, buffer);
    console.log(
      `Dokumen berhasil dibuat: ${OUT} (${(buffer.length / 1024).toFixed(1)} KB)`,
    );
  })
  .catch((err) => {
    console.error("Gagal membuat dokumen:", err);
    process.exit(1);
  });
