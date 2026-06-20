import { Router } from "express";
import { exec } from "../db/database.js";

const router = Router();

const SYSTEM_PROMPT = `Anda adalah Athena, Asisten Supervisor Akademi untuk aplikasi SPK Rekrutmen Mentor AI Engineer milik LKP Academy Vistar.

Gunakan Bahasa Indonesia yang natural, ramah, dan profesional. Jawab dengan jelas dan ringkas.

⚠️ BATASAN KEAMANAN YANG HARUS DIPATUHI:
1. JANGAN PERNAH menyebutkan, membagikan, atau memberikan hint tentang API key, token, password, atau kredensial apapun.
2. JANGAN PERNAH menyebutkan isi file .env, struktur database, atau konfigurasi server.
3. JANGAN PERNAH menyebutkan username atau password default (admin/password).
4. JANGAN PERNAH memberikan instruksi untuk mengakses server, database, atau file system.
5. JANGAN PERNAH menyarankan modifikasi kode atau konfigurasi yang berbahaya.
6. Jika pengguna meminta informasi yang melanggar batasan di atas, tolak dengan sopan dan arahkan ke dokumentasi resmi aplikasi.

📋 KONTEKS APLIKASI:
- Nama: SPK Rekrutmen Mentor AI Engineer
- Domain: LKP Academy Vistar
- Metode: Preference Selection Index (PSI) — metode MADM yang menghitung bobot kriteria secara otomatis dari variasi data
- Semua kriteria bertipe Benefit (semakin tinggi nilai semakin baik)
- Skala penilaian: 1=Sangat Kurang, 2=Kurang, 3=Cukup, 4=Baik, 5=Sangat Baik
- 5 Kriteria: C1 Kompetensi Teknis AI Engineer (30%), C2 Pengalaman Praktis (25%), C3 Kemampuan Mengajar (20%), C4 Pemahaman Kurikulum (15%), C5 Profesionalisme (10%)

📚 METODE PSI (6 langkah):
1. Normalisasi Benefit: r_ij = x_ij / max(x_j)
2. Mean: R̄_j = (1/n) × Σ r_ij
3. Preference Variation: PV_j = Σ (r_ij - R̄_j)²
4. Deviation: DPV_j = 1 - PV_j (edge: PV=0 → DPV=1)
5. Overall Preference: Φ_j = DPV_j / Σ DPV_j (edge: ΣDPV=0 → Φ_j dibagi rata)
6. PSI Score: PSI_i = Σ (Φ_j × r_ij)
Ranking: skor tertinggi = peringkat 1

❓ FAQ:
- PSI adalah metode yang menghitung bobot otomatis dari variasi data.
- Semua kriteria Benefit, skala 1-5.
- Hasil PSI immutable, buat sesi baru untuk kalkulasi ulang.
- Export tersedia dalam format PDF, CSV, dan Excel.
- Dokumentasi lengkap ada di menu Dokumentasi (buka tab baru).

Jangan memberikan instruksi reset password. Jika ditanya cara reset password, arahkan ke menu Pengaturan.`;

function buildContents(history: { role: string; text: string }[] | undefined, message: string) {
  const contents: { role: string; parts: { text: string }[] }[] = [];
  if (Array.isArray(history)) {
    for (const msg of history) {
      if (msg.role === "assistant") {
        contents.push({ role: "model", parts: [{ text: msg.text }] });
      } else if (msg.role === "user") {
        contents.push({ role: "user", parts: [{ text: msg.text }] });
      }
    }
  }
  contents.push({ role: "user", parts: [{ text: message }] });
  return contents;
}

router.post("/stream", async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  let apiKey: string;
  try {
    const rows = await exec<{ value: string }>(
      "SELECT `value` FROM app_settings WHERE `key` = 'gemini_api_key'",
    );
    if (rows.length === 0 || !rows[0].value) {
      res.status(400).json({ error: "NO_KEY: API key belum dikonfigurasi" });
      return;
    }
    apiKey = rows[0].value;
  } catch {
    res.status(500).json({ error: "Gagal membaca konfigurasi" });
    return;
  }

  const contents = buildContents(history, message);

  const abortController = new AbortController();
  req.on("close", () => abortController.abort());

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
        }),
      },
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => ({})) as Record<string, unknown>;
      console.error("Gemini API stream error:", errBody);
      const status = (errBody.error as Record<string, unknown> | undefined)?.status as string | undefined;
      let msg = "Gagal terhubung ke layanan AI";
      if (status === "UNAVAILABLE") msg = "Layanan AI sedang sibuk. Coba lagi nanti.";
      else if (status === "RESOURCE_EXHAUSTED") msg = "Terlalu banyak permintaan. Tunggu sebentar.";
      res.write(`event: error\ndata: ${JSON.stringify({ error: msg })}\n\n`);
      res.end();
      return;
    }

    const reader = geminiRes.body?.getReader();
    if (!reader) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: "Response body tidak tersedia" })}\n\n`);
      res.end();
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
          const candidates = parsed.candidates as Array<Record<string, unknown>> | undefined;
          const content = candidates?.[0]?.content as Record<string, unknown> | undefined;
          const parts = content?.parts as Array<Record<string, unknown>> | undefined;
          const text = parts?.[0]?.text as string | undefined;
          if (text) {
            res.write(`event: chunk\ndata: ${JSON.stringify({ text })}\n\n`);
          }
        } catch {
          // skip malformed JSON
        }
      }
    }

    res.write(`event: done\ndata: {}\n\n`);
    res.end();
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      console.log("Stream aborted by client");
      res.end();
      return;
    }
    console.error("Chat stream error:", err);
    res.write(`event: error\ndata: ${JSON.stringify({ error: "Terjadi kesalahan server" })}\n\n`);
    res.end();
  }
});

router.post("/", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const rows = await exec<{ value: string }>(
      "SELECT `value` FROM app_settings WHERE `key` = 'gemini_api_key'",
    );

    if (rows.length === 0 || !rows[0].value) {
      res.status(400).json({ error: "NO_KEY: API key belum dikonfigurasi" });
      return;
    }

    const apiKey = rows[0].value;
    const contents = buildContents(history, message);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
        }),
      },
    );

    const data = await response.json() as Record<string, unknown>;

    if (!response.ok) {
      console.error("Gemini API error:", data);
      res.status(502).json({ error: "Gagal terhubung ke layanan AI" });
      return;
    }

    const candidates = data.candidates as Array<Record<string, unknown>> | undefined;
    const content = candidates?.[0]?.content as Record<string, unknown> | undefined;
    const parts = content?.parts as Array<Record<string, unknown>> | undefined;
    const reply = parts?.[0]?.text as string | undefined;

    res.json({ reply: reply ?? "Maaf, terjadi kesalahan." });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

export default router;
