import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { MoonIcon, BrightnessDownIcon, BrandReactIcon } from "@/components/ui/icons";

const categories = [
  { label: "Pendahuluan", key: "pendahuluan" },
  { label: "Fitur Aplikasi", key: "fitur" },
  { label: "Metode PSI", key: "metode" },
  { label: "Teknis", key: "teknis" },
] as const;

const sections = [
  { id: "pendahuluan", title: "1. Pendahuluan", category: "pendahuluan" },
  { id: "metadata", title: "2. Metadata", category: "pendahuluan" },
  { id: "struktur", title: "3. Struktur Proyek", category: "pendahuluan" },
  { id: "instalasi", title: "4. Instalasi", category: "pendahuluan" },
  { id: "konfigurasi", title: "5. Konfigurasi", category: "pendahuluan" },
  { id: "kriteria", title: "6. Kriteria", category: "fitur" },
  { id: "subkriteria", title: "7. Sub-Kriteria", category: "fitur" },
  { id: "kandidat", title: "8. Kandidat", category: "fitur" },
  { id: "penilaian", title: "9. Sistem Penilaian", category: "fitur" },
  { id: "proses", title: "10. Proses Aplikasi", category: "fitur" },
  { id: "chatbot", title: "11. Chatbot Athena", category: "fitur" },
  { id: "metode-psi", title: "12. Metode PSI", category: "metode" },
  { id: "langkah", title: "13. Langkah Perhitungan", category: "metode" },
  { id: "database", title: "14. Database Schema", category: "teknis" },
  { id: "api", title: "15. API Endpoint", category: "teknis" },
  { id: "auth", title: "16. Autentikasi", category: "teknis" },
];

const GITHUB_URL = "https://github.com/ridhoauliama97/mentor-recruitment-lkp-vistar";

const code = (text: string) => (
  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-primary">{text}</code>
);

function SectionLink({ id, title, active, onSelect }: { id: string; title: string; active: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={`block w-full text-left border-l-2 px-3 py-1.5 text-sm transition-colors hover:text-foreground ${
        active
          ? "border-primary font-medium text-foreground"
          : "border-transparent text-muted-foreground"
      }`}
    >
      {title}
    </button>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | number | null | undefined)[][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-muted">
            {headers.map((h) => (
              <th key={h} className="px-4 py-2 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t even:bg-muted/50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2">{cell ?? "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock({ code: codeStr }: { code: string }) {
  return (
    <pre className="my-3 overflow-x-auto rounded-lg border bg-muted p-4 text-sm">
      <code>{codeStr}</code>
    </pre>
  );
}

export default function Dokumentasi() {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("pendahuluan");
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );

    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const filteredSections = useMemo(
    () =>
      searchQuery.trim()
        ? sections.filter(
            (s) =>
              s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.id.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : sections,
    [searchQuery],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen scroll-smooth bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2 font-semibold">
            <BrandReactIcon size={22} />
            <span>SPK PSI</span>
          </a>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="mx-auto hidden h-8 w-full max-w-xs items-center gap-2 rounded-md border bg-muted px-3 text-sm text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <span className="flex-1 text-left">Search</span>
            <kbd className="inline-flex items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              Ctrl<span>+</span>K
            </kbd>
          </button>
          <div className="flex items-center gap-2">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <BrightnessDownIcon size={18} /> : <MoonIcon size={18} />}
            </Button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-20 py-8">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Daftar Isi
              </h3>
              <nav className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat.key}>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {cat.label}
                    </p>
                    <div className="space-y-0.5 pl-3">
                      {sections
                        .filter((s) => s.category === cat.key)
                        .map((s) => (
                          <SectionLink
                            key={s.id}
                            id={s.id}
                            title={s.title}
                            active={activeSection === s.id}
                            onSelect={(id) => {
                              setActiveSection(id);
                              document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          <main className="min-w-0 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight">
                  SPK Rekrutmen Mentor AI Engineer
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                  Dokumentasi Sistem Pendukung Keputusan menggunakan Metode{" "}
                  <strong>Preference Selection Index (PSI)</strong> untuk rekrutmen
                  Mentor AI Engineer di <strong>LKP Academy Vistar</strong>.
                </p>
              </div>

              {/* 1. Pendahuluan */}
              <section id="pendahuluan" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight">1. Pendahuluan</h2>
                <hr className="my-3" />
                <p className="leading-relaxed text-muted-foreground">
                  Sistem Pendukung Keputusan (SPK) Rekrutmen Mentor AI Engineer adalah
                  aplikasi berbasis web yang dirancang untuk membantu LKP Academy Vistar
                  dalam menyeleksi calon mentor AI Engineer secara objektif, transparan,
                  dan terukur menggunakan metode <strong>Preference Selection Index (PSI)</strong>.
                </p>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  Metode PSI dipilih karena mampu menghitung bobot kriteria secara otomatis
                  berdasarkan variasi data — tanpa memerlukan bobot preferensi dari pengambil
                  keputusan — sehingga hasil seleksi lebih objektif dan bebas dari bias subjektif.
                </p>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  Repositori GitHub:{" "}
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    {GITHUB_URL}
                  </a>
                </p>
              </section>

              {/* 2. Metadata */}
              <section id="metadata" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight">2. Metadata</h2>
                <hr className="my-3" />
                <Table
                  headers={["Komponen", "Detail"]}
                  rows={[
                    ["Nama Aplikasi", "SPK Rekrutmen Mentor AI Engineer"],
                    ["Domain", "LKP Academy Vistar"],
                    ["Metode", "Preference Selection Index (PSI)"],
                    ["Package Manager", "pnpm"],
                    ["Frontend", "React 19 + TypeScript + Vite 8"],
                    ["UI Framework", "Tailwind CSS 3 + shadcn/ui"],
                    ["State Management", "Zustand 5"],
                    ["Animasi", "Motion 12"],
                    ["Backend", "Express 5 (TypeScript)"],
                    ["Database", "MySQL 8.0 (via mysql2/promise)"],
                    ["PDF Export", "@react-pdf/renderer 4"],
                    ["Spreadsheet Export", "xlsx 0.18"],
                    ["Chart", "Recharts 2.15"],
                    ["Autentikasi", "JWT (jsonwebtoken + bcryptjs)"],
                    ["Git Remote", GITHUB_URL],
                    ["Lisensi", "MIT"],
                  ]}
                />
              </section>

              {/* 3. Struktur Proyek */}
              <section id="struktur" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight">3. Struktur Proyek</h2>
                <hr className="my-3" />
                <p className="leading-relaxed text-muted-foreground">
                  Proyek ini menggunakan arsitektur <strong>monorepo</strong> dengan dua package
                  terpisah: client (React frontend) dan server (Express backend).
                </p>
                <CodeBlock
                  code={`mentor-recruitment-lkp-vistar/
├── AGENTS.md
├── package.json            # Root: pnpm workspace + concurrently
├── client/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   ├── public/fonts/       # Noto Serif & NotoSansMono
│   └── src/
│       ├── main.tsx
│       ├── App.tsx          # Routes
│       ├── index.css        # Tailwind + @font-face
│       ├── types/           # TypeScript interfaces
│       ├── lib/             # psi.ts, api.ts, pdf.tsx, utils.ts
│       ├── stores/          # Zustand stores (5 files)
│       ├── pages/           # 8 pages
│       └── components/      # ui/, layout/, hooks/
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── src/
│       ├── index.ts         # Express 5 entry point
│       ├── db/              # database.ts, schema.ts, seed.ts
│       ├── middleware/      # auth.ts (JWT)
│       ├── routes/          # 9 route files
│       └── services/        # psiCalculator.ts
├── docs/                   # Dokumentasi tambahan (Markdown)
├── prompt.md               # Spesifikasi asli proyek
└── README.md`}
                />
              </section>

              {/* 4. Instalasi */}
              <section id="instalasi" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight">4. Instalasi</h2>
                <hr className="my-3" />
                <h3 className="mt-4 text-lg font-semibold">Prasyarat</h3>
                <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
                  <li>Node.js 18+</li>
                  <li>pnpm 9+</li>
                  <li>MySQL 8.0 (running)</li>
                  <li>Git</li>
                </ul>

                <h3 className="mt-6 text-lg font-semibold">Langkah Instalasi</h3>
                <CodeBlock
                  code={`# 1. Clone repositori
git clone https://github.com/ridhoauliama97/mentor-recruitment-lkp-vistar.git
cd mentor-recruitment-lkp-vistar

# 2. Install dependensi
pnpm install

# 3. Setup environment
cp server/.env.example server/.env

# 4. Edit server/.env (sesuaikan konfigurasi MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=rekrutmen_mentor_psi

# 5. Buat database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rekrutmen_mentor_psi"

# 6. Jalankan aplikasi (dev mode) — Terminal 1: Client
cd client && pnpm dev

# Terminal 2: Server
cd server && pnpm start

# Atau dari root:
pnpm dev`}
                />
                <p className="mt-3 text-sm text-muted-foreground">
                  Client akan berjalan di {code("http://localhost:5173")} dan server di{" "}
                  {code("http://localhost:3001")}. Skema dan seed data dibuat otomatis
                  saat server pertama kali dijalankan.
                </p>

                <h3 className="mt-6 text-lg font-semibold">Build Produksi</h3>
                <CodeBlock code="pnpm build" />
              </section>

              {/* 5. Konfigurasi */}
              <section id="konfigurasi" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight">5. Konfigurasi</h2>
                <hr className="my-3" />
                <p className="leading-relaxed text-muted-foreground">
                  Konfigurasi aplikasi diatur melalui file {code("server/.env")}:
                </p>
                <Table
                  headers={["Variabel", "Default", "Deskripsi"]}
                  rows={[
                    ["DB_HOST", "localhost", "Host MySQL"],
                    ["DB_PORT", "3306", "Port MySQL"],
                    ["DB_USER", "root", "User MySQL"],
                    ["DB_PASSWORD", "password", "Password MySQL"],
                    ["DB_NAME", "rekrutmen_mentor_psi", "Nama database"],
                    ["JWT_SECRET", "mentor-psi-secret-key", "Secret key JWT"],
                    ["PORT", "3001", "Port server Express"],
                  ]}
                />
                <p className="mt-4 text-muted-foreground">
                  Konfigurasi tambahan (nama aplikasi, institusi) dapat diubah melalui
                  halaman Pengaturan di aplikasi.
                </p>
              </section>

              {/* 6. Kriteria */}
              <section id="kriteria" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight">6. Kriteria</h2>
                <hr className="my-3" />
                <p className="leading-relaxed text-muted-foreground">
                  Terdapat <strong>5 kriteria</strong> yang digunakan untuk menilai calon mentor.
                  Semua kriteria bertipe <strong>Benefit</strong> (semakin tinggi nilai semakin baik).
                </p>
                <Table
                  headers={["Kode", "Nama Kriteria", "Bobot Referensi", "Tipe"]}
                  rows={[
                    ["C1", "Kompetensi Teknis AI Engineer", "30%", "Benefit"],
                    ["C2", "Pengalaman Praktis / Portofolio Proyek AI", "25%", "Benefit"],
                    ["C3", "Kemampuan Mengajar dan Komunikasi", "20%", "Benefit"],
                    ["C4", "Pemahaman Kurikulum dan Penyusunan Materi", "15%", "Benefit"],
                    ["C5", "Profesionalisme dan Komitmen", "10%", "Benefit"],
                  ]}
                />
                <p className="mt-3 text-sm text-muted-foreground">
                  Catatan: Bobot referensi hanya untuk display. Perhitungan PSI menggunakan bobot
                  otomatis ({code("Φ_j")}) yang dihitung dari variasi data.
                </p>
              </section>

              {/* 7. Sub-Kriteria */}
              <section id="subkriteria" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight">7. Sub-Kriteria</h2>
                <hr className="my-3" />
                <p className="leading-relaxed text-muted-foreground">
                  Setiap kriteria memiliki{" "}
                  <strong>5 level sub-kriteria</strong> (total 25) dengan bobot 1–5 dan skala
                  label Bahasa Indonesia.
                </p>
                <Table
                  headers={["Kriteria", "Bobot 5", "Bobot 4", "Bobot 3", "Bobot 2", "Bobot 1"]}
                  rows={[
                    [
                      "C1 — Kompetensi Teknis",
                      "Sangat Baik",
                      "Baik",
                      "Cukup",
                      "Kurang",
                      "Sangat Kurang",
                    ],
                    [
                      "C2 — Pengalaman Praktis",
                      "Sangat Baik",
                      "Baik",
                      "Cukup",
                      "Kurang",
                      "Sangat Kurang",
                    ],
                    [
                      "C3 — Kemampuan Mengajar",
                      "Sangat Baik",
                      "Baik",
                      "Cukup",
                      "Kurang",
                      "Sangat Kurang",
                    ],
                    [
                      "C4 — Pemahaman Kurikulum",
                      "Sangat Baik",
                      "Baik",
                      "Cukup",
                      "Kurang",
                      "Sangat Kurang",
                    ],
                    [
                      "C5 — Profesionalisme",
                      "Sangat Baik",
                      "Baik",
                      "Cukup",
                      "Kurang",
                      "Sangat Kurang",
                    ],
                  ]}
                />
              </section>

              {/* 8. Kandidat */}
              <section id="kandidat" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight">8. Kandidat</h2>
                <hr className="my-3" />
                <p className="leading-relaxed text-muted-foreground">
                  Seed data mencakup <strong>20 kandidat</strong> dengan latar belakang pendidikan
                  dan keahlian yang beragam.
                </p>
                <Table
                  headers={["No", "Nama", "Pendidikan", "Jurusan", "Keahlian"]}
                  rows={[
                    ["1", "Rizky Pratama", "S2", "Ilmu Komputer", "ML, Deep Learning, MLOps"],
                    ["2", "Siti Nurhaliza", "S2", "Data Science", "Data Science, NLP"],
                    ["3", "Dimas Ardiansyah", "S1", "Teknik Komputer", "Computer Vision, Edge AI"],
                    ["4", "Putri Wulandari", "S2", "Teknik Informatika", "NLP, RAG, Chatbot"],
                    ["5", "Hendra Gunawan", "S1", "Sistem Informasi", "Web Dev, API, Python, Cloud"],
                    ["6", "Ayu Kartika", "S3", "Kecerdasan Buatan", "RL, AI Ethics, Kurikulum AI"],
                    ["7", "Farhan Maulana", "S1", "Teknik Informatika", "Backend AI, API, Python"],
                    ["8", "Dewi Anggraini", "S2", "Statistika", "Data Science, Visualisasi"],
                    ["9", "Aditya Nugroho", "S1", "Sistem Informasi", "Full-stack, Python, Cloud AI"],
                    ["10", "Sarah Fitriani", "S2", "Ilmu Komputer", "NLP, Text Analytics, Chatbot"],
                    ["11", "Bima Sakti", "S1", "Teknik Elektro", "Dasar ML, Python, IoT"],
                    ["12", "Nindi Lestari", "S3", "Kecerdasan Buatan", "Deep Learning, CV, Akademik"],
                    ["13", "Reza Pahlevi", "S1", "Teknik Informatika", "Mobile Dev, AI, Python"],
                    ["14", "Citra Maharani", "S2", "Teknologi Pendidikan", "Kurikulum AI, Instructional Design"],
                    ["15", "Eko Prasetyo", "S1", "Ilmu Komputer", "ML Engineering, MLOps"],
                    ["16", "Fira Azzahra", "S2", "Linguistik", "Komunikasi, Presentasi, NLP"],
                    ["17", "Gilang Ramadhan", "S1", "Pendidikan Matematika", "Kurikulum, Modul Ajar"],
                    ["18", "Hana Safira", "S2", "Ilmu Komputer", "AI Engineering, NLP, CV"],
                    ["19", "Indra Lesmana", "S1", "Manajemen Informatika", "Dasar AI, Python Dasar, SQL"],
                    ["20", "Joko Susilo", "S1", "Teknik Informatika", "Python, Data Analysis, ML"],
                  ]}
                />
              </section>

              {/* 9. Sistem Penilaian */}
              <section id="penilaian" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight">9. Sistem Penilaian</h2>
                <hr className="my-3" />
                <p className="leading-relaxed text-muted-foreground">
                  Penilaian kandidat menggunakan skala integer <strong>1–5</strong> yang
                  direferensikan ke sub-kriteria.
                </p>
                <Table
                  headers={["Nilai", "Label"]}
                  rows={[
                    ["5", "Sangat Baik"],
                    ["4", "Baik"],
                    ["3", "Cukup"],
                    ["2", "Kurang"],
                    ["1", "Sangat Kurang"],
                  ]}
                />
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  Validasi nilai 1–5 dilakukan di sisi server. Format angka menggunakan{" "}
                  {code("toLocaleString('id-ID')")} untuk Rupiah, 4 desimal untuk display,
                  dan 6+ desimal untuk perhitungan internal.
                </p>
              </section>

              {/* 10. Proses Aplikasi */}
              <section id="proses" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight">10. Proses Aplikasi</h2>
                <hr className="my-3" />
                <p className="leading-relaxed text-muted-foreground">
                  Alur penggunaan aplikasi secara umum:
                </p>
                <ol className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      1
                    </span>
                    <span>
                      <strong>Login</strong> — Administrator login menggunakan username dan password.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      2
                    </span>
                    <span>
                      <strong>Kelola Kriteria</strong> — Mengatur 5 kriteria dan sub-kriteria
                      penilaian (jika diperlukan).
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      3
                    </span>
                    <span>
                      <strong>Input Data Kandidat</strong> — Menambahkan data kandidat dan
                      memberikan nilai skor 1–5 untuk setiap kriteria.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      4
                    </span>
                    <span>
                      <strong>Kalkulasi PSI</strong> — Membuat sesi baru dan menjalankan
                      perhitungan PSI. Hasil disimpan secara immutable.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      5
                    </span>
                    <span>
                      <strong>Lihat Hasil</strong> — Menampilkan peringkat, skor, dan detail
                      perhitungan dalam bentuk heatmap.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      6
                    </span>
                    <span>
                      <strong>Export Laporan</strong> — Mengekspor hasil ke PDF, CSV, atau Excel.
                    </span>
                  </li>
                </ol>
              </section>

              {/* 11. Chatbot Athena */}
              <section id="chatbot" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight">11. Chatbot Athena</h2>
                <hr className="my-3" />
                <p className="leading-relaxed text-muted-foreground">
                  <strong>Athena — Asisten Supervisor Akademi</strong> adalah asisten AI berbasis{" "}
                  <strong>Google Gemini Flash</strong> (model <code>gemini-flash-latest</code>)
                  yang membantu pengguna menjawab pertanyaan seputar aplikasi, metode PSI,
                  data kandidat, dan sesi perhitungan secara real-time.
                </p>

                <h3 className="mt-6 text-lg font-semibold">Akses</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-6 text-muted-foreground">
                  <li>Klik ikon chat <strong>pojok kanan bawah</strong> pada halaman yang sudah login.</li>
                  <li>Shortcut keyboard: <strong>Ctrl+M</strong> (buka) / <strong>Escape</strong> (tutup).</li>
                  <li>Tombol <strong>Enter</strong> untuk kirim pesan.</li>
                </ul>

                <h3 className="mt-6 text-lg font-semibold">Konfigurasi</h3>
                <p className="leading-relaxed text-muted-foreground">
                  API Key dikonfigurasi di halaman <strong>Pengaturan → Konfigurasi AI — Athena</strong>.
                  Masukkan Gemini API Key (disimpan di tabel <code>app_settings</code>, input
                  bertipe password), lalu klik "Simpan API Key". Dapatkan API key gratis di{" "}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    aistudio.google.com
                  </a>.
                </p>

                <h3 className="mt-6 text-lg font-semibold">Fitur</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-6 text-muted-foreground">
                  <li><strong>Streaming response</strong> — teks muncul token per token via SSE (Server-Sent Events).</li>
                  <li><strong>Format Markdown</strong> — tebal, miring, inline code, paragraf, tabel, list (ordered & unordered).</li>
                  <li><strong>Saran pertanyaan lanjutan</strong> (suggestion chips) di bawah setiap balasan asisten.</li>
                  <li><strong>Riwayat chat</strong> tersimpan otomatis di <code>localStorage</code> (key <code>athena_chat_history</code>).</li>
                  <li><strong>Knowledge base</strong> — 20+ entri mencakup seluruh fitur, menu, data sesi, dan metode PSI dengan TF-IDF retrieval.</li>
                  <li><strong>Data dinamis</strong> — statistik langsung dari database (jumlah kandidat aktif, sesi tersimpan, top-3 ranking per sesi) di-refresh setiap 5 menit.</li>
                  <li><strong>Retry & cooldown</strong> — tombol "Coba Lagi" muncul saat error, cooldown 3 detik antar pengiriman untuk mencegah spam.</li>
                  <li><strong>Rate-limit handling</strong> — saat kuota Google habis (<code>RESOURCE_EXHAUSTED</code>), countdown mundur sesuai <code>retry-after</code> dari server.</li>
                  <li><strong>Abort on close</strong> — stream dibatalkan otomatis saat chatbot ditutup.</li>
                </ul>

                <h3 className="mt-6 text-lg font-semibold">Saran Pertanyaan Awal</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Saat pertama membuka chatbot, tiga saran pertanyaan ditampilkan:
                </p>
                <ul className="mt-2 list-disc space-y-1.5 pl-6 text-muted-foreground">
                  <li>"Apa saja fitur yang tersedia di aplikasi ini?"</li>
                  <li>"Bagaimana cara melakukan perhitungan PSI?"</li>
                  <li>"Siapa saja kandidat mentor yang tersedia?"</li>
                </ul>

                <h3 className="mt-6 text-lg font-semibold">Batasan</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-6 text-muted-foreground">
                  <li>Membutuhkan koneksi internet untuk menghubungi API Gemini.</li>
                  <li>Membutuhkan Gemini API key yang valid (disimpan di database).</li>
                  <li>Jika kuota habis (<code>RESOURCE_EXHAUSTED</code>), tampil countdown mundur sesuai <code>retry-after</code> dari Google.</li>
                  <li>Hasil PSI bersifat <strong>immutable</strong> — chatbot hanya membaca data sesi, tidak bisa mengubah atau menghapus.</li>
                  <li>Chatbot tidak bisa menjalankan perhitungan PSI baru — hanya memandu pengguna ke menu <strong>Proses PSI</strong>.</li>
                </ul>

                <h3 className="mt-6 text-lg font-semibold">Endpoint API</h3>
                <Table
                  headers={["Method", "Endpoint", "Deskripsi"]}
                  rows={[
                    ["POST", "/api/chat/stream", "Streaming chat via SSE (event: chunk/done/error/suggestions)"],
                    ["POST", "/api/chat", "Non-streaming chat (JSON response)"],
                    ["GET", "/api/chat/suggestions", "Dapatkan saran pertanyaan awal"],
                  ]}
                />
              </section>

              {/* 12. Metode PSI */}
              <section id="metode-psi" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight">12. Metode PSI</h2>
                <hr className="my-3" />
                <p className="leading-relaxed text-muted-foreground">
                  <strong>Preference Selection Index (PSI)</strong> adalah metode MADM yang
                  menghitung bobot kriteria secara otomatis dari variasi data. Berikut langkah-langkahnya:
                </p>

                <h3 className="mt-6 text-lg font-semibold">Langkah 1: Normalisasi</h3>
                <p className="text-muted-foreground">Untuk kriteria Benefit:</p>
                <CodeBlock code="r_ij = x_ij / max(x_j)" />
                <p className="text-muted-foreground">Untuk kriteria Cost:</p>
                <CodeBlock code="r_ij = min(x_j) / x_ij" />

                <h3 className="mt-6 text-lg font-semibold">Langkah 2: Mean Value</h3>
                <CodeBlock code="R̄_j = (1/n) × Σ r_ij   (i = 1..n)" />

                <h3 className="mt-6 text-lg font-semibold">Langkah 3: Preference Variation (PV)</h3>
                <CodeBlock code="PV_j = Σ (r_ij - R̄_j)²   (i = 1..n)" />

                <h3 className="mt-6 text-lg font-semibold">Langkah 4: Deviation (DPV)</h3>
                <CodeBlock code="DPV_j = 1 - PV_j" />
                <p className="text-sm text-muted-foreground">
                  Edge case: Jika semua nilai identik (PV=0), maka DPV=1 untuk semua kriteria.
                </p>

                <h3 className="mt-6 text-lg font-semibold">Langkah 5: Overall Preference (Φ)</h3>
                <CodeBlock code="Φ_j = DPV_j / Σ DPV_j" />
                <p className="text-sm text-muted-foreground">
                  Edge case: Jika ΣDPV=0, semua Φ_j dibagi rata.
                </p>

                <h3 className="mt-6 text-lg font-semibold">Langkah 6: PSI Score</h3>
                <CodeBlock code="PSI_i = Σ (Φ_j × r_ij)   (j = 1..m)" />

                <h3 className="mt-6 text-lg font-semibold">Langkah 7: Ranking</h3>
                <p className="text-muted-foreground">
                  Kandidat dengan <strong>PSI Score tertinggi</strong> mendapatkan peringkat 1
                  (paling direkomendasikan).
                </p>
              </section>

              {/* 13. Langkah Perhitungan */}
              <section id="langkah" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight">13. Langkah Perhitungan</h2>
                <hr className="my-3" />
                <p className="leading-relaxed text-muted-foreground">
                  Berikut ilustrasi perhitungan PSI untuk 3 kandidat dengan 3 kriteria:
                </p>

                <h3 className="mt-6 text-lg font-semibold">Decision Matrix (X)</h3>
                <Table
                  headers={["Kandidat", "C1 (Benefit)", "C2 (Benefit)", "C3 (Benefit)"]}
                  rows={[
                    ["A1", "4", "5", "3"],
                    ["A2", "3", "4", "5"],
                    ["A3", "5", "3", "4"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">Normalized Matrix (R)</h3>
                <p className="text-sm text-muted-foreground">
                  C1: max=5, C2: max=5, C3: max=5
                </p>
                <Table
                  headers={["Kandidat", "C1", "C2", "C3"]}
                  rows={[
                    ["A1", "0.8000", "1.0000", "0.6000"],
                    ["A2", "0.6000", "0.8000", "1.0000"],
                    ["A3", "1.0000", "0.6000", "0.8000"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">Mean (R̄)</h3>
                <CodeBlock code="C1: (0.8 + 0.6 + 1.0) / 3 = 0.8000
C2: (1.0 + 0.8 + 0.6) / 3 = 0.8000
C3: (0.6 + 1.0 + 0.8) / 3 = 0.8000" />

                <h3 className="mt-6 text-lg font-semibold">Preference Variation (PV)</h3>
                <CodeBlock code="PV_C1 = (0.8-0.8)² + (0.6-0.8)² + (1.0-0.8)² = 0 + 0.04 + 0.04 = 0.0800
PV_C2 = (1.0-0.8)² + (0.8-0.8)² + (0.6-0.8)² = 0.04 + 0 + 0.04 = 0.0800
PV_C3 = (0.6-0.8)² + (1.0-0.8)² + (0.8-0.8)² = 0.04 + 0.04 + 0 = 0.0800" />

                <h3 className="mt-6 text-lg font-semibold">Deviation (DPV)</h3>
                <CodeBlock code="DPV_C1 = 1 - 0.08 = 0.9200
DPV_C2 = 1 - 0.08 = 0.9200
DPV_C3 = 1 - 0.08 = 0.9200" />

                <h3 className="mt-6 text-lg font-semibold">Overall Preference (Φ)</h3>
                <CodeBlock code="ΣDPV = 0.92 + 0.92 + 0.92 = 2.76
Φ_C1 = 0.92 / 2.76 = 0.3333
Φ_C2 = 0.92 / 2.76 = 0.3333
Φ_C3 = 0.92 / 2.76 = 0.3333" />

                <h3 className="mt-6 text-lg font-semibold">PSI Score</h3>
                <CodeBlock code="PSI_A1 = (0.3333×0.8) + (0.3333×1.0) + (0.3333×0.6) = 0.8000
PSI_A2 = (0.3333×0.6) + (0.3333×0.8) + (0.3333×1.0) = 0.8000
PSI_A3 = (0.3333×1.0) + (0.3333×0.6) + (0.3333×0.8) = 0.8000" />

                <h3 className="mt-6 text-lg font-semibold">Ranking</h3>
                <p className="text-muted-foreground">
                  Karena semua skor identik (variasi data rendah), semua kandidat mendapatkan skor
                  yang sama dan peringkat dibagi rata.
                </p>
              </section>

              {/* 14. Database Schema */}
              <section id="database" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight">14. Database Schema</h2>
                <hr className="my-3" />
                <p className="leading-relaxed text-muted-foreground">
                  Database MySQL 8.0 ({code("rekrutmen_mentor_psi")}) terdiri dari{" "}
                  <strong>9 tabel</strong>:
                </p>

                <h3 className="mt-6 text-lg font-semibold">criteria</h3>
                <p className="text-sm text-muted-foreground">Menyimpan kriteria penilaian mentor.</p>
                <Table
                  headers={["Kolom", "Tipe", "Keterangan"]}
                  rows={[
                    ["id", "INT (PK)", "Auto increment"],
                    ["code", "VARCHAR(50)", "Kode kriteria (C1-C5)"],
                    ["name", "VARCHAR(255)", "Nama kriteria"],
                    ["description", "TEXT", "Deskripsi"],
                    ["type", "VARCHAR(20)", "benefit / cost"],
                    ["unit", "VARCHAR(100)", "Satuan"],
                    ["weight_ref", "INT", "Bobot referensi (display only)"],
                    ["status", "VARCHAR(20)", "active / inactive"],
                    ["created_at", "DATETIME", "Default CURRENT_TIMESTAMP"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">candidates</h3>
                <p className="text-sm text-muted-foreground">Menyimpan data kandidat mentor.</p>
                <Table
                  headers={["Kolom", "Tipe", "Keterangan"]}
                  rows={[
                    ["id", "INT (PK)", "Auto increment"],
                    ["name", "VARCHAR(255)", "Nama lengkap"],
                    ["email", "VARCHAR(255)", "Email (UNIQUE)"],
                    ["phone", "VARCHAR(50)", "No telepon"],
                    ["education", "VARCHAR(10)", "SMA/D3/S1/S2/S3"],
                    ["major", "TEXT", "Jurusan"],
                    ["expertise", "TEXT", "Keahlian"],
                    ["photo_url", "TEXT", "URL foto"],
                    ["status", "VARCHAR(20)", "active / inactive"],
                    ["created_at", "DATETIME", "Default CURRENT_TIMESTAMP"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">sub_criteria</h3>
                <p className="text-sm text-muted-foreground">
                  Level penilaian per kriteria (FK ke {code("criteria.id")} CASCADE).
                </p>
                <Table
                  headers={["Kolom", "Tipe", "Keterangan"]}
                  rows={[
                    ["id", "INT (PK)", "Auto increment"],
                    ["criteria_id", "INT (FK)", "ID kriteria"],
                    ["name", "TEXT", "Label level"],
                    ["weight", "INT", "Bobot 1-5"],
                    ["display_order", "INT", "Urutan tampil"],
                    ["created_at", "DATETIME", "Default CURRENT_TIMESTAMP"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">scores</h3>
                <p className="text-sm text-muted-foreground">
                  Nilai kandidat per kriteria (UNIQUE candidate_id + criteria_id).
                </p>
                <Table
                  headers={["Kolom", "Tipe", "Keterangan"]}
                  rows={[
                    ["id", "INT (PK)", "Auto increment"],
                    ["candidate_id", "INT (FK)", "ID kandidat CASCADE"],
                    ["criteria_id", "INT (FK)", "ID kriteria CASCADE"],
                    ["value", "DOUBLE", "Nilai 1-5"],
                    ["sub_criteria_id", "INT (FK)", "ID sub-kriteria"],
                    ["notes", "TEXT", "Catatan"],
                    ["created_at", "DATETIME", "Default CURRENT_TIMESTAMP"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">psi_sessions</h3>
                <p className="text-sm text-muted-foreground">Sesi perhitungan PSI.</p>
                <Table
                  headers={["Kolom", "Tipe", "Keterangan"]}
                  rows={[
                    ["id", "INT (PK)", "Auto increment"],
                    ["session_name", "VARCHAR(255)", "Nama sesi"],
                    ["description", "TEXT", "Deskripsi"],
                    ["status", "VARCHAR(20)", "draft / completed"],
                    ["created_at", "DATETIME", "Default CURRENT_TIMESTAMP"],
                    ["calculated_at", "DATETIME", "Waktu kalkulasi"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">psi_results</h3>
                <p className="text-sm text-muted-foreground">
                  Hasil perhitungan PSI per kandidat.
                </p>
                <Table
                  headers={["Kolom", "Tipe", "Keterangan"]}
                  rows={[
                    ["id", "INT (PK)", "Auto increment"],
                    ["session_id", "INT (FK)", "ID sesi CASCADE"],
                    ["candidate_id", "INT (FK)", "ID kandidat"],
                    ["psi_score", "DOUBLE", "Skor PSI akhir"],
                    ["rank", "INT", "Peringkat"],
                    ["is_recommended", "BOOLEAN", "Direkomendasikan"],
                    ["created_at", "DATETIME", "Default CURRENT_TIMESTAMP"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">psi_details</h3>
                <p className="text-sm text-muted-foreground">
                  Detail langkah perhitungan PSI per kandidat per kriteria.
                </p>
                <Table
                  headers={["Kolom", "Tipe", "Keterangan"]}
                  rows={[
                    ["id", "INT (PK)", "Auto increment"],
                    ["session_id", "INT (FK)", "ID sesi CASCADE"],
                    ["candidate_id", "INT (FK)", "ID kandidat"],
                    ["criteria_id", "INT (FK)", "ID kriteria"],
                    ["raw_value", "DOUBLE", "Nilai mentah"],
                    ["normalized_value", "DOUBLE", "Nilai ternormalisasi"],
                    ["pv_contribution", "DOUBLE", "Kontribusi PV"],
                    ["dpv_contribution", "DOUBLE", "Kontribusi DPV"],
                    ["phi_value", "DOUBLE", "Bobot PSI"],
                    ["weighted_score", "DOUBLE", "Skor terboboti"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">users</h3>
                <p className="text-sm text-muted-foreground">Akun administrator.</p>
                <Table
                  headers={["Kolom", "Tipe", "Keterangan"]}
                  rows={[
                    ["id", "INT (PK)", "Auto increment"],
                    ["username", "VARCHAR(100)", "Username (UNIQUE)"],
                    ["password_hash", "TEXT", "Hash bcrypt"],
                    ["created_at", "DATETIME", "Default CURRENT_TIMESTAMP"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">app_settings</h3>
                <p className="text-sm text-muted-foreground">Konfigurasi aplikasi key-value.</p>
                <Table
                  headers={["Kolom", "Tipe", "Keterangan"]}
                  rows={[
                    ["key", "VARCHAR(255)", "Primary key"],
                    ["value", "TEXT", "Nilai konfigurasi"],
                  ]}
                />
              </section>

              {/* 15. API Endpoint */}
              <section id="api" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight">15. API Endpoint</h2>
                <hr className="my-3" />
                <p className="leading-relaxed text-muted-foreground">
                  Server Express berjalan di port 3001. Client Vite mem-proxy /api/* ke server.
                  Endpoint yang memerlukan autentikasi ditandai dengan . Semua response dalam
                  format JSON.
                </p>

                <h3 className="mt-6 text-lg font-semibold">Autentikasi</h3>
                <Table
                  headers={["Method", "Endpoint", "Deskripsi"]}
                  rows={[
                    ["POST", "/api/auth/login", "Login (mendapatkan JWT)"],
                    ["GET", "/api/auth/me", "Profil user saat ini"],
                    ["PUT", "/api/auth/password", "Ganti password"],
                    ["GET", "/api/health", "Health check"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">Kriteria</h3>
                <Table
                  headers={["Method", "Endpoint", "Deskripsi"]}
                  rows={[
                    ["GET", "/api/criteria", "Daftar semua kriteria"],
                    ["POST", "/api/criteria", "Tambah kriteria baru"],
                    ["PUT", "/api/criteria/:id", "Update kriteria"],
                    ["DELETE", "/api/criteria/:id", "Hapus kriteria"],
                    ["GET", "/api/criteria/:id/sub-criteria", "Sub-kriteria per kriteria"],
                    ["POST", "/api/criteria/:id/sub-criteria", "Tambah sub-kriteria"],
                    ["PUT", "/api/sub-criteria/:id", "Update sub-kriteria"],
                    ["DELETE", "/api/sub-criteria/:id", "Hapus sub-kriteria"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">Kandidat</h3>
                <Table
                  headers={["Method", "Endpoint", "Deskripsi"]}
                  rows={[
                    ["GET", "/api/candidates", "Daftar kandidat"],
                    ["POST", "/api/candidates", "Tambah kandidat"],
                    ["PUT", "/api/candidates/:id", "Update kandidat"],
                    ["DELETE", "/api/candidates/:id", "Hapus kandidat"],
                    ["GET", "/api/candidates/:id/scores", "Skor kandidat"],
                    ["POST", "/api/candidates/:id/scores", "Simpan skor kandidat"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">Skor</h3>
                <Table
                  headers={["Method", "Endpoint", "Deskripsi"]}
                  rows={[
                    ["GET", "/api/scores/:candidateId/scores", "Ambil skor kandidat"],
                    ["POST", "/api/scores/:candidateId/scores", "Simpan skor kandidat"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">PSI</h3>
                <Table
                  headers={["Method", "Endpoint", "Deskripsi"]}
                  rows={[
                    ["POST", "/api/psi/calculate", "Jalankan kalkulasi PSI"],
                    ["GET", "/api/psi/sessions", "Daftar sesi PSI"],
                    ["GET", "/api/psi/sessions/latest", "Sesi terbaru"],
                    ["GET", "/api/psi/sessions/:id", "Detail sesi + hasil"],
                    ["DELETE", "/api/psi/sessions/:id", "Hapus sesi"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">Dashboard</h3>
                <Table
                  headers={["Method", "Endpoint", "Deskripsi"]}
                  rows={[
                    ["GET", "/api/dashboard/stats", "Statistik dashboard"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">Pengaturan</h3>
                <Table
                  headers={["Method", "Endpoint", "Deskripsi"]}
                  rows={[
                    ["GET", "/api/settings", "Ambil pengaturan"],
                    ["PUT", "/api/settings", "Update pengaturan"],
                  ]}
                />

                <h3 className="mt-6 text-lg font-semibold">Export / Import</h3>
                <Table
                  headers={["Method", "Endpoint", "Deskripsi"]}
                  rows={[
                    ["GET", "/api/export", "Export data ke JSON"],
                    ["POST", "/api/export/import", "Import data dari JSON"],
                    ["POST", "/api/upload", "Upload file (foto, dll)"],
                  ]}
                />
              </section>

              {/* 16. Autentikasi */}
              <section id="auth" className="mb-12 scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight">16. Autentikasi</h2>
                <hr className="my-3" />
                <p className="leading-relaxed text-muted-foreground">
                  Autentikasi menggunakan <strong>JSON Web Token (JWT)</strong> dengan
                  masa berlaku <strong>7 hari</strong>.
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                  <li>
                    <strong>Login:</strong> {code("POST /api/auth/login")} dengan username
                    dan password → mengembalikan token JWT.
                  </li>
                  <li>
                    <strong>Token:</strong> Disimpan di {code("localStorage")} dengan key{" "}
                    {code("auth_token")}.
                  </li>
                  <li>
                    <strong>Header:</strong> Setiap request terproteksi menyertakan{" "}
                    {code("Authorization: Bearer <token>")}.
                  </li>
                  <li>
                    <strong>Middleware:</strong> {code("verifyToken")} memverifikasi token
                    pada setiap route yang diproteksi.
                  </li>
                  <li>
                    <strong>Auto-redirect:</strong> Jika response 401, client otomatis
                    redirect ke halaman login.
                  </li>
                  <li>
                    <strong>Akun default:</strong> username = {code("admin")}, password ={" "}
                    {code("password")} (bcrypt hashed).
                  </li>
                </ul>
              </section>

              <div className="border-t pt-6 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} LKP Academy Vistar — SPK Rekrutmen Mentor AI Engineer
              </div>
            </motion.div>
          </main>
        </div>
      </div>

      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 pt-[15vh] backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsSearchOpen(false);
              setSearchQuery("");
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full max-w-lg overflow-hidden rounded-xl border bg-background shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b px-4">
              <svg className="h-4 w-4 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                Esc
              </kbd>
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {filteredSections.length > 0 ? (
                filteredSections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSection(s.id);
                      setSearchQuery("");
                      setIsSearchOpen(false);
                      document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <svg className="h-4 w-4 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span>{s.title}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No results found for "{searchQuery}"
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Kembali ke atas"
          className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </div>
  );
}
