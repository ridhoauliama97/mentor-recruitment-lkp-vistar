import { Router } from "express";
import { exec } from "../db/database.js";
import { buildSystemPrompt } from "../services/knowledgeBase.js";
import { getDynamicContext } from "../services/dynamicData.js";
import { getFirstOpenSuggestions } from "../services/suggestionEngine.js";

const router = Router();

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

async function getApiKey(): Promise<string> {
  const rows = await exec<{ value: string }>(
    "SELECT `value` FROM app_settings WHERE `key` = 'gemini_api_key'",
  );
  if (rows.length === 0 || !rows[0].value) {
    throw new Error("NO_KEY");
  }
  return rows[0].value;
}

router.get("/suggestions", async (_req, res) => {
  res.json(getFirstOpenSuggestions());
});

router.post("/stream", async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  let apiKey: string;
  try {
    apiKey = await getApiKey();
  } catch {
    res.status(400).json({ error: "NO_KEY: API key belum dikonfigurasi" });
    return;
  }

  const contents = buildContents(history, message);

  const [systemPrompt, dynamicContext] = await Promise.all([
    Promise.resolve().then(() => buildSystemPrompt(message, "")),
    getDynamicContext(),
  ]);

  const finalSystemPrompt = systemPrompt.replace(
    "— DATA SISTEM TERKINI —\n\n",
    `— DATA SISTEM TERKINI —\n\n${dynamicContext}\n\n`,
  );

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
          systemInstruction: { parts: [{ text: finalSystemPrompt }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
      },
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => ({})) as Record<string, unknown>;
      console.error("Gemini API stream error:", errBody);
      const status = (errBody.error as Record<string, unknown> | undefined)?.status as string | undefined;
      const errMsg = (errBody.error as Record<string, unknown> | undefined)?.message as string | undefined;
      let msg = "Gagal terhubung ke layanan AI";
      let retryAfter: number | undefined;
      if (status === "UNAVAILABLE") msg = "Layanan AI sedang sibuk. Coba lagi nanti.";
      else if (status === "RESOURCE_EXHAUSTED") {
        const retryMatch = errMsg?.match(/retry in ([\d.]+)s/);
        retryAfter = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 30;
        msg = `Terlalu banyak permintaan. Coba lagi dalam ${retryAfter} detik.`;
      }
      res.write(`event: error\ndata: ${JSON.stringify({ error: msg, retryAfter })}\n\n`);
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
    let fullReply = "";

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
            fullReply += text;
            res.write(`event: chunk\ndata: ${JSON.stringify({ text })}\n\n`);
          }
        } catch {
          // skip malformed JSON
        }
      }
    }

    res.write(`event: done\ndata: {}\n\n`);

    const suggestionMatch = fullReply.match(/<!--SUGGESTIONS-->(.*)/s);
    if (suggestionMatch) {
      try {
        const sgs = JSON.parse(suggestionMatch[1].trim());
        if (Array.isArray(sgs) && sgs.length > 0) {
          res.write(`event: suggestions\ndata: ${JSON.stringify({ suggestions: sgs.slice(0, 3) })}\n\n`);
        }
      } catch {
        // suggestions parse failed; skip
      }
    }

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

    const [apiKey, systemPrompt, dynamicContext] = await Promise.all([
      getApiKey(),
      Promise.resolve().then(() => buildSystemPrompt(message, "")),
      getDynamicContext(),
    ]);

    const finalSystemPrompt = systemPrompt.replace(
      "— DATA SISTEM TERKINI —\n\n",
      `— DATA SISTEM TERKINI —\n\n${dynamicContext}\n\n`,
    );

    const contents = buildContents(history, message);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: finalSystemPrompt }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
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
    if ((err as Error).message === "NO_KEY") {
      res.status(400).json({ error: "NO_KEY: API key belum dikonfigurasi" });
      return;
    }
    console.error("Chat error:", err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

export default router;
