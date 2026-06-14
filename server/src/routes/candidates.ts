import { Router } from "express";
import { exec, run, saveDb } from "../db/database.js";

const router = Router();

function sanitize(val: string) {
  return val.replace(/'/g, "''");
}

router.get("/", (_req, res) => {
  const candidates = exec("SELECT * FROM candidates ORDER BY id");
  const enriched = candidates.map((c: Record<string, unknown>) => {
    const total = exec("SELECT COUNT(*) as cnt FROM criteria");
    const filled = exec(`SELECT COUNT(*) as cnt FROM scores WHERE candidate_id = ${c.id}`);
    return {
      ...c,
      completionRate: total[0] && (total[0] as { cnt: number }).cnt > 0
        ? ((filled[0] as { cnt: number }).cnt / (total[0] as { cnt: number }).cnt)
        : 0,
    };
  });
  res.json(enriched);
});

router.get("/:id", (req, res) => {
  const rows = exec(`SELECT * FROM candidates WHERE id = ${req.params.id}`);
  if (rows.length === 0) {
    res.status(404).json({ message: "Kandidat tidak ditemukan" });
    return;
  }
  res.json(rows[0]);
});

router.post("/", (req, res) => {
  const { name, email, phone, education, institution, expertise, bio } = req.body;
  if (!name || !email) {
    res.status(400).json({ message: "Nama dan email wajib diisi" });
    return;
  }
  try {
    run(`INSERT INTO candidates (name, email, phone, education, institution, expertise, bio) VALUES (
      '${sanitize(name)}', '${sanitize(email)}', '${sanitize(phone ?? "")}',
      '${sanitize(education ?? "")}', '${sanitize(institution ?? "")}',
      '${sanitize(expertise ?? "")}', '${sanitize(bio ?? "")}'
    )`);
    saveDb();
    const candidates = exec("SELECT * FROM candidates ORDER BY id");
    res.status(201).json(candidates);
  } catch {
    res.status(400).json({ message: "Email sudah digunakan" });
  }
});

router.put("/:id", (req, res) => {
  const { name, email, phone, education, institution, expertise, bio, status } = req.body;
  const sets: string[] = [];
  if (name !== undefined) sets.push(`name = '${sanitize(name)}'`);
  if (email !== undefined) sets.push(`email = '${sanitize(email)}'`);
  if (phone !== undefined) sets.push(`phone = '${sanitize(phone)}'`);
  if (education !== undefined) sets.push(`education = '${sanitize(education)}'`);
  if (institution !== undefined) sets.push(`institution = '${sanitize(institution)}'`);
  if (expertise !== undefined) sets.push(`expertise = '${sanitize(expertise)}'`);
  if (bio !== undefined) sets.push(`bio = '${sanitize(bio)}'`);
  if (status !== undefined) sets.push(`status = '${status}'`);

  if (sets.length > 0) {
    run(`UPDATE candidates SET ${sets.join(", ")} WHERE id = ${req.params.id}`);
    saveDb();
  }
  res.json({ success: true });
});

router.delete("/:id", (req, res) => {
  run(`DELETE FROM candidates WHERE id = ${req.params.id}`);
  saveDb();
  res.json({ success: true });
});

router.get("/:id/scores", (req, res) => {
  const scores = exec(
    `SELECT s.*, c.name as criteria_name, c.type as criteria_type
    FROM scores s JOIN criteria c ON s.criteria_id = c.id
    WHERE s.candidate_id = ${req.params.id}`,
  );
  res.json(scores);
});

router.post("/:id/scores", (req, res) => {
  const { criteriaId, value, subCriteriaId } = req.body;
  if (criteriaId == null || value == null) {
    res.status(400).json({ message: "criteriaId dan value wajib diisi" });
    return;
  }
  const scId = subCriteriaId != null ? Number(subCriteriaId) : "NULL";
  run(`INSERT INTO scores (candidate_id, criteria_id, value, sub_criteria_id) VALUES (
    ${req.params.id}, ${criteriaId}, ${value}, ${scId}
  ) ON CONFLICT(candidate_id, criteria_id) DO UPDATE SET value = ${value}, sub_criteria_id = ${scId}`);
  saveDb();
  res.json({ success: true });
});

export default router;
