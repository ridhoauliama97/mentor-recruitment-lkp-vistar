import bcrypt from "bcryptjs";
import { exec, run, saveDb } from "./database.js";

export function seed() {
  const existingCount = exec("SELECT COUNT(*) as cnt FROM criteria");
  if (existingCount.length > 0 && (existingCount[0] as { cnt: number }).cnt > 0) return;

  run(`INSERT INTO criteria (code, name, description, type, weight_ref, status) VALUES
    ('C1', 'Kompetensi Teknis AI Engineer', 'Menjadi aspek utama karena coach AI Engineer harus menguasai kemampuan teknis inti dalam bidang AI.', 'benefit', 30, 'active'),
    ('C2', 'Pengalaman Praktis / Portofolio Proyek AI', 'Pengalaman proyek penting untuk memastikan coach mampu memberikan pembelajaran berbasis praktik nyata.', 'benefit', 25, 'active'),
    ('C3', 'Kemampuan Mengajar dan Komunikasi', 'Coach tidak hanya harus ahli secara teknis, tetapi juga mampu mentransfer pengetahuan kepada peserta.', 'benefit', 20, 'active'),
    ('C4', 'Pemahaman Kurikulum dan Penyusunan Materi', 'Diperlukan agar pembelajaran terarah, sistematis, dan sesuai dengan target kompetensi pelatihan.', 'benefit', 15, 'active'),
    ('C5', 'Profesionalisme dan Komitmen', 'Menunjukkan kesiapan calon coach dalam menjalankan tugas secara konsisten dan bertanggung jawab.', 'benefit', 10, 'active')
  `);

  run(`INSERT INTO sub_criteria (criteria_id, name, weight, display_order) VALUES
    (1, 'Sangat Baik — Menguasai konsep dan praktik AI Engineering secara sangat baik, mampu membangun model ML/DL, melakukan evaluasi model, serta memahami deployment AI.', 5, 1),
    (1, 'Baik — Menguasai sebagian besar konsep AI Engineering, mampu membuat model AI dan analisis hasil, tetapi belum terlalu mendalam pada deployment atau optimasi model.', 4, 2),
    (1, 'Cukup — Memahami dasar-dasar AI, machine learning, dan Python, tetapi masih terbatas dalam implementasi proyek AI yang kompleks.', 3, 3),
    (1, 'Kurang — Hanya memahami konsep dasar AI secara umum dan belum mampu menerapkan secara mandiri dalam bentuk proyek.', 2, 4),
    (1, 'Sangat Kurang — Tidak memiliki pemahaman yang memadai tentang AI Engineering, machine learning, maupun tools pendukungnya.', 1, 5),

    (2, 'Sangat Baik — Memiliki banyak portofolio proyek AI yang relevan, pernah menangani proyek nyata/industri, dan dapat menjelaskan proses serta hasil proyek dengan baik.', 5, 1),
    (2, 'Baik — Memiliki beberapa portofolio proyek AI yang relevan dan mampu menunjukkan hasil implementasi secara jelas.', 4, 2),
    (2, 'Cukup — Memiliki pengalaman proyek AI sederhana, misalnya klasifikasi data, prediksi, chatbot dasar, atau computer vision sederhana.', 3, 3),
    (2, 'Kurang — Pernah mencoba proyek AI, tetapi masih terbatas pada tutorial atau latihan tanpa pengembangan mandiri.', 2, 4),
    (2, 'Sangat Kurang — Tidak memiliki portofolio atau pengalaman praktik proyek AI.', 1, 5),

    (3, 'Sangat Baik — Mampu menjelaskan materi AI yang kompleks dengan bahasa sederhana, interaktif, sistematis, dan mampu membimbing peserta secara aktif.', 5, 1),
    (3, 'Baik — Penyampaian materi cukup jelas, komunikatif, dan mampu menjawab pertanyaan peserta dengan baik.', 4, 2),
    (3, 'Cukup — Dapat menyampaikan materi, tetapi masih kurang sistematis atau kurang interaktif dalam proses pembelajaran.', 3, 3),
    (3, 'Kurang — Penyampaian materi kurang jelas, cenderung monoton, dan sulit menyesuaikan penjelasan dengan kemampuan peserta.', 2, 4),
    (3, 'Sangat Kurang — Tidak mampu menjelaskan materi dengan baik dan kurang memiliki keterampilan komunikasi dalam pembelajaran.', 1, 5),

    (4, 'Sangat Baik — Mampu menyusun kurikulum, modul, dan rencana pembelajaran AI Engineer secara lengkap, sistematis, berbasis proyek, dan sesuai kebutuhan industri.', 5, 1),
    (4, 'Baik — Mampu menyusun materi pembelajaran yang cukup lengkap dan sesuai dengan tujuan pelatihan.', 4, 2),
    (4, 'Cukup — Dapat menyusun materi dasar, tetapi belum sepenuhnya terstruktur atau belum mengarah pada proyek akhir yang jelas.', 3, 3),
    (4, 'Kurang — Materi yang disusun masih terbatas, kurang runtut, dan belum sesuai dengan kebutuhan peserta atau industri.', 2, 4),
    (4, 'Sangat Kurang — Tidak mampu menyusun materi atau kurikulum pembelajaran AI Engineer secara layak.', 1, 5),

    (5, 'Sangat Baik — Sangat disiplin, bertanggung jawab, memiliki etika kerja baik, siap mengikuti jadwal pelatihan, dan menunjukkan komitmen tinggi.', 5, 1),
    (5, 'Baik — Memiliki sikap profesional, cukup disiplin, dan mampu menjalankan tugas sebagai coach dengan baik.', 4, 2),
    (5, 'Cukup — Menunjukkan komitmen yang cukup, tetapi masih perlu penguatan dalam konsistensi atau kedisiplinan.', 3, 3),
    (5, 'Kurang — Kurang disiplin, kurang siap mengajar, atau belum menunjukkan tanggung jawab yang kuat.', 2, 4),
    (5, 'Sangat Kurang — Tidak menunjukkan komitmen, kurang bertanggung jawab, dan tidak memenuhi standar profesional sebagai coach.', 1, 5)
  `);

  run(`INSERT INTO candidates (name, email, phone, education, institution, expertise, bio) VALUES
    ('Rizky Pratama', 'rizky@example.com', '081234567890', 'S2 Ilmu Komputer', 'Institut Teknologi Bandung', 'Machine Learning, Deep Learning, MLOps', 'AI Engineer dengan 5+ tahun pengalaman di pengembangan model ML/DL dan deployment.'),
    ('Siti Nurhaliza', 'siti@example.com', '081234567891', 'S2 Data Science', 'Universitas Gadjah Mada', 'Data Science, Natural Language Processing', 'Data Scientist berpengalaman dengan latar belakang mengajar di bootcamp AI.'),
    ('Dimas Ardiansyah', 'dimas@example.com', '081234567892', 'S1 Teknik Komputer', 'Universitas Indonesia', 'Computer Vision, Edge AI, Embedded Systems', 'Praktisi computer vision dengan portofolio proyek industri di bidang pengawasan kualitas.'),
    ('Putri Wulandari', 'putri@example.com', '081234567893', 'S2 Teknik Informatika', 'Universitas Brawijaya', 'NLP, Retrieval-Augmented Generation, Chatbot', 'NLP Engineer dengan pengalaman membangun sistem RAG dan chatbot untuk perusahaan.'),
    ('Hendra Gunawan', 'hendra@example.com', '081234567894', 'S1 Sistem Informasi', 'Universitas Airlangga', 'Web Development, API, Python, Cloud', 'Full-stack developer yang beralih ke AI, aktif membuat konten edukasi AI.'),
    ('Ayu Kartika', 'ayu@example.com', '081234567895', 'S3 Kecerdasan Buatan', 'Universitas Diponegoro', 'Reinforcement Learning, AI Ethics, Kurikulum AI', 'Akademisi dan peneliti AI dengan pengalaman mengajar dan menyusun kurikulum AI.'),
    ('Farhan Maulana', 'farhan@example.com', '081234567896', 'S1 Teknik Informatika', 'Universitas Telkom', 'Backend AI, API Development, Python', 'AI Engineer yang fokus pada pengembangan backend sistem AI dan API deployment.'),
    ('Dewi Anggraini', 'dewi@example.com', '081234567897', 'S2 Statistika', 'Institut Pertanian Bogor', 'Data Science, Visualisasi Data, Pengajaran', 'Data scientist dengan pengalaman mengajar di berbagai pelatihan data analytics.'),
    ('Aditya Nugroho', 'aditya@example.com', '081234567898', 'S1 Sistem Informasi', 'Universitas Bina Nusantara', 'Full-stack Development, Python, Cloud AI', 'Full-stack developer yang beralih ke AI, aktif mengembangkan aplikasi AI terintegrasi.'),
    ('Sarah Fitriani', 'sarah@example.com', '081234567899', 'S2 Ilmu Komputer', 'Universitas Padjadjaran', 'NLP, Text Analytics, Chatbot', 'NLP specialist dengan pengalaman membangun sistem chatbot dan text analytics.'),
    ('Bima Sakti', 'bima@example.com', '081234567800', 'S1 Teknik Elektro', 'Universitas Hasanuddin', 'Dasar ML, Python, IoT', 'Fresh graduate yang baru memulai perjalanan di bidang AI dan machine learning.'),
    ('Nindi Lestari', 'nindi@example.com', '081234567801', 'S3 Kecerdasan Buatan', 'Universitas Sebelas Maret', 'Deep Learning, Computer Vision, Akademik', 'Peneliti AI dengan publikasi internasional dan pengalaman mengajar di S1/S2.'),
    ('Reza Pahlevi', 'reza@example.com', '081234567802', 'S1 Teknik Informatika', 'Universitas Gunadarma', 'Mobile Dev, AI Integration, Python', 'Mobile developer yang beralih ke AI, fokus pada integrasi model AI ke platform mobile.'),
    ('Citra Maharani', 'citra@example.com', '081234567803', 'S2 Pendidikan Teknologi Informasi', 'Universitas Negeri Malang', 'Kurikulum AI, Instructional Design, Pelatihan', 'Spesialis pengembangan kurikulum dan materi pelatihan AI yang berpengalaman.'),
    ('Eko Prasetyo', 'eko@example.com', '081234567804', 'S1 Ilmu Komputer', 'Universitas Diponegoro', 'ML Engineering, Model Deployment, MLOps', 'AI Engineer dengan kemampuan teknis kuat namun masih berkembang dalam komunikasi.'),
    ('Fira Azzahra', 'fira@example.com', '081234567805', 'S2 Linguistik Terapan', 'Universitas Sumatera Utara', 'Komunikasi, Presentasi, Pelatihan NLP', 'Ahli komunikasi dan pelatih dengan spesialisasi pelatihan teknis bidang AI.'),
    ('Gilang Ramadhan', 'gilang@example.com', '081234567806', 'S1 Pendidikan Matematika', 'Universitas Negeri Yogyakarta', 'Kurikulum, Modul Ajar, Evaluasi Pembelajaran', 'Pengembang kurikulum dan materi ajar AI dengan latar belakang pendidikan.'),
    ('Hana Safira', 'hana@example.com', '081234567807', 'S2 Ilmu Komputer', 'Universitas Indonesia', 'AI Engineering, NLP, Computer Vision, Pengajaran', 'AI Engineer serba bisa dengan kemampuan teknis unggul dan pengalaman mengajar luas.'),
    ('Indra Lesmana', 'indra@example.com', '081234567808', 'S1 Manajemen Informatika', 'Universitas Sriwijaya', 'Dasar AI, Python Dasar, SQL', 'Pemula di bidang AI yang memiliki semangat belajar tinggi dan siap dikembangkan.'),
    ('Joko Susilo', 'joko@example.com', '081234567809', 'S1 Teknik Informatika', 'Universitas Jenderal Soedirman', 'Python, Data Analysis, Dasar ML', 'Kandidat dengan kemampuan rata-rata stabil dan konsisten di semua aspek penilaian.')
  `);

  run(`INSERT INTO scores (candidate_id, criteria_id, value, sub_criteria_id) VALUES
    (1, 1, 5, 1), (1, 2, 4, 7),  (1, 3, 4, 12), (1, 4, 4, 17), (1, 5, 4, 22),
    (2, 1, 4, 2), (2, 2, 3, 8),  (2, 3, 5, 11), (2, 4, 5, 16), (2, 5, 5, 21),
    (3, 1, 5, 1), (3, 2, 5, 6),  (3, 3, 3, 13), (3, 4, 3, 18), (3, 5, 3, 23),
    (4, 1, 4, 2), (4, 2, 4, 7),  (4, 3, 4, 12), (4, 4, 4, 17), (4, 5, 4, 22),
    (5, 1, 3, 3), (5, 2, 4, 7),  (5, 3, 3, 13), (5, 4, 3, 18), (5, 5, 5, 21),
    (6, 1, 4, 2), (6, 2, 3, 8),  (6, 3, 5, 11), (6, 4, 4, 17), (6, 5, 4, 22),
    (7, 1, 4, 2), (7, 2, 3, 8),  (7, 3, 4, 12), (7, 4, 3, 18), (7, 5, 4, 22),
    (8, 1, 5, 1), (8, 2, 4, 7),  (8, 3, 5, 11), (8, 4, 4, 17), (8, 5, 5, 21),
    (9, 1, 3, 3), (9, 2, 4, 7),  (9, 3, 3, 13), (9, 4, 4, 17), (9, 5, 3, 23),
    (10, 1, 4, 2), (10, 2, 5, 6), (10, 3, 4, 12), (10, 4, 5, 16), (10, 5, 4, 22),
    (11, 1, 2, 4), (11, 2, 3, 8), (11, 3, 3, 13), (11, 4, 2, 19), (11, 5, 4, 22),
    (12, 1, 5, 1), (12, 2, 5, 6), (12, 3, 4, 12), (12, 4, 3, 18), (12, 5, 5, 21),
    (13, 1, 3, 3), (13, 2, 2, 9), (13, 3, 4, 12), (13, 4, 4, 17), (13, 5, 3, 23),
    (14, 1, 4, 2), (14, 2, 4, 7), (14, 3, 5, 11), (14, 4, 5, 16), (14, 5, 4, 22),
    (15, 1, 5, 1), (15, 2, 3, 8), (15, 3, 3, 13), (15, 4, 3, 18), (15, 5, 3, 23),
    (16, 1, 3, 3), (16, 2, 5, 6), (16, 3, 4, 12), (16, 4, 4, 17), (16, 5, 5, 21),
    (17, 1, 4, 2), (17, 2, 4, 7), (17, 3, 4, 12), (17, 4, 5, 16), (17, 5, 3, 23),
    (18, 1, 5, 1), (18, 2, 5, 6), (18, 3, 5, 11), (18, 4, 5, 16), (18, 5, 5, 21),
    (19, 1, 2, 4), (19, 2, 2, 9), (19, 3, 3, 13), (19, 4, 2, 19), (19, 5, 2, 24),
    (20, 1, 4, 2), (20, 2, 3, 8), (20, 3, 4, 12), (20, 4, 4, 17), (20, 5, 4, 22)
  `);

  const adminHash = bcrypt.hashSync("password", 10);
  run(`INSERT OR IGNORE INTO users (username, password_hash) VALUES ('admin', '${adminHash}')`);

  saveDb();
  console.log("Database seeded successfully");
}

export function seedSettings() {
  run("INSERT OR IGNORE INTO app_settings (key, value) VALUES ('app_name', 'SPK Rekrutmen Mentor AI Engineer')");
  run("INSERT OR IGNORE INTO app_settings (key, value) VALUES ('institution', 'LKP Academy Vistar')");
  saveDb();
}
