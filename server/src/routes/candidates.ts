import { Router } from "express";
import { exec, run } from "../db/database.js";

const router = Router();

const validEducation = ["SMA", "D3", "S1", "S2", "S3"];

router.get("/", async (_req, res) => {
  const candidates = await exec("SELECT * FROM candidates ORDER BY id");
  const totalResult = await exec("SELECT COUNT(*) as cnt FROM criteria");
  const total = totalResult[0]?.cnt as number || 0;
  const enriched = await Promise.all(candidates.map(async (c: Record<string, unknown>) => {
    const filled = await exec("SELECT COUNT(*) as cnt FROM scores WHERE candidate_id = ?", [c.id]);
    return {
      ...c,
      completionRate: total > 0 ? ((filled[0] as { cnt: number }).cnt / total) : 0,
    };
  }));
  res.json(enriched);
});

router.get("/:id", async (req, res) => {
  const rows = await exec("SELECT * FROM candidates WHERE id = ?", [req.params.id]);
  if (rows.length === 0) {
    res.status(404).json({ message: "Kandidat tidak ditemukan" });
    return;
  }
  res.json(rows[0]);
});

router.post("/", async (req, res) => {
  const { name, email, phone, education, major, expertise, photo_url } = req.body;
  if (!name || !email) {
    res.status(400).json({ message: "Nama dan email wajib diisi" });
    return;
  }
  if (education && !validEducation.includes(education)) {
    res.status(400).json({ message: "Pendidikan harus salah satu dari SMA, D3, S1, S2, S3" });
    return;
  }
  try {
    await run(
      "INSERT INTO candidates (name, email, phone, education, major, expertise, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, email, phone ?? "", education ?? "", major ?? "", expertise ?? "", photo_url ?? ""],
    );
    const candidates = await exec("SELECT * FROM candidates ORDER BY id");
    res.status(201).json(candidates);
  } catch {
    res.status(400).json({ message: "Email sudah digunakan" });
  }
});

router.put("/:id", async (req, res) => {
  const { name, email, phone, education, major, expertise, photo_url, status } = req.body;
  if (education && !validEducation.includes(education)) {
    res.status(400).json({ message: "Pendidikan harus salah satu dari SMA, D3, S1, S2, S3" });
    return;
  }
  const sets: string[] = [];
  const params: unknown[] = [];
  if (name !== undefined) { sets.push("name = ?"); params.push(name); }
  if (email !== undefined) { sets.push("email = ?"); params.push(email); }
  if (phone !== undefined) { sets.push("phone = ?"); params.push(phone); }
  if (education !== undefined) { sets.push("education = ?"); params.push(education); }
  if (major !== undefined) { sets.push("major = ?"); params.push(major); }
  if (expertise !== undefined) { sets.push("expertise = ?"); params.push(expertise); }
  if (photo_url !== undefined) { sets.push("photo_url = ?"); params.push(photo_url); }
  if (status !== undefined) { sets.push("status = ?"); params.push(status); }

  if (sets.length > 0) {
    params.push(req.params.id);
    await run(`UPDATE candidates SET ${sets.join(", ")} WHERE id = ?`, params);
  }
  res.json({ success: true });
});

router.delete("/:id", async (req, res) => {
  await run("DELETE FROM candidates WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

router.get("/:id/scores", async (req, res) => {
  const scores = await exec(
    `SELECT s.*, c.name as criteria_name, c.type as criteria_type
    FROM scores s JOIN criteria c ON s.criteria_id = c.id
    WHERE s.candidate_id = ?`,
    [req.params.id],
  );
  res.json(scores);
});

router.post("/:id/scores", async (req, res) => {
  const { criteriaId, value, subCriteriaId } = req.body;
  if (criteriaId == null || value == null) {
    res.status(400).json({ message: "criteriaId dan value wajib diisi" });
    return;
  }
  await run(
    `INSERT INTO scores (candidate_id, criteria_id, value, sub_criteria_id) VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE value = VALUES(value), sub_criteria_id = VALUES(sub_criteria_id)`,
    [req.params.id, criteriaId, value, subCriteriaId ?? null],
  );
  res.json({ success: true });
});

export default router;
