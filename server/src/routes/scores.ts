import { Router } from "express";
import { exec, run } from "../db/database.js";

const router = Router();

router.get("/:candidateId/scores", async (req, res) => {
  const scores = await exec(
    `SELECT s.*, sc.name as sub_criteria_name, sc.weight as sub_criteria_weight
    FROM scores s
    LEFT JOIN sub_criteria sc ON s.sub_criteria_id = sc.id
    WHERE s.candidate_id = ?`,
    [req.params.candidateId],
  );
  res.json(scores);
});

router.post("/:candidateId/scores", async (req, res) => {
  const { criteriaId, value, subCriteriaId } = req.body;
  if (value == null || !Number.isInteger(value) || value < 1 || value > 5) {
    res.status(400).json({ message: "Nilai harus berupa angka bulat 1\u20135" });
    return;
  }
  const existing = await exec(
    "SELECT id FROM scores WHERE candidate_id = ? AND criteria_id = ?",
    [req.params.candidateId, criteriaId],
  );
  if (existing.length > 0) {
    await run(
      "UPDATE scores SET value = ?, sub_criteria_id = ? WHERE candidate_id = ? AND criteria_id = ?",
      [value, subCriteriaId ?? null, req.params.candidateId, criteriaId],
    );
  } else {
    await run(
      "INSERT INTO scores (candidate_id, criteria_id, value, sub_criteria_id) VALUES (?, ?, ?, ?)",
      [req.params.candidateId, criteriaId, value, subCriteriaId ?? null],
    );
  }
  const score = await exec(
    "SELECT * FROM scores WHERE candidate_id = ? AND criteria_id = ?",
    [req.params.candidateId, criteriaId],
  );
  res.json(score[0]);
});

export default router;
