import { Router } from "express";
import { exec, run } from "../db/database.js";

const router = Router();

router.get("/:candidateId/scores", (req, res) => {
  const scores = exec(
    `SELECT s.*, sc.name as sub_criteria_name, sc.weight as sub_criteria_weight
    FROM scores s
    LEFT JOIN sub_criteria sc ON s.sub_criteria_id = sc.id
    WHERE s.candidate_id = ${req.params.candidateId}`,
  );
  res.json(scores);
});

router.post("/:candidateId/scores", (req, res) => {
  const { criteriaId, value, subCriteriaId, notes } = req.body;
  if (value == null || !Number.isInteger(value) || value < 1 || value > 5) {
    res.status(400).json({ message: "Nilai harus berupa angka bulat 1\u20135" });
    return;
  }
  const existing = exec(
    `SELECT id FROM scores WHERE candidate_id = ${req.params.candidateId} AND criteria_id = ${criteriaId}`,
  );
  if (existing.length > 0) {
    run(
      `UPDATE scores SET value = ${value}, sub_criteria_id = ${subCriteriaId ?? "NULL"}${notes ? `, notes = '${notes.replace(/'/g, "''")}'` : ""} WHERE candidate_id = ${req.params.candidateId} AND criteria_id = ${criteriaId}`,
    );
  } else {
    run(
      `INSERT INTO scores (candidate_id, criteria_id, value, sub_criteria_id${notes ? ", notes" : ""}) VALUES (${req.params.candidateId}, ${criteriaId}, ${value}, ${subCriteriaId ?? "NULL"}${notes ? `, '${notes.replace(/'/g, "''")}'` : ""})`,
    );
  }
  const score = exec(
    `SELECT * FROM scores WHERE candidate_id = ${req.params.candidateId} AND criteria_id = ${criteriaId}`,
  );
  res.json(score[0]);
});

export default router;
