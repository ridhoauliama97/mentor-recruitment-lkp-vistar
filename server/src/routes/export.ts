import { Router } from "express";
import { exec, transaction } from "../db/database.js";

const router = Router();

router.get("/", async (_req, res) => {
  const data = {
    appSettings: await exec("SELECT `key`, `value` FROM app_settings"),
    criteria: await exec("SELECT * FROM criteria ORDER BY id"),
    subCriteria: await exec("SELECT * FROM sub_criteria ORDER BY criteria_id, display_order"),
    candidates: await exec("SELECT * FROM candidates ORDER BY id"),
    scores: await exec("SELECT * FROM scores ORDER BY candidate_id, criteria_id"),
    psiSessions: await exec("SELECT * FROM psi_sessions ORDER BY id"),
    psiResults: await exec("SELECT * FROM psi_results ORDER BY session_id, `rank`"),
    psiDetails: await exec("SELECT * FROM psi_details ORDER BY session_id, candidate_id, criteria_id"),
    exportedAt: new Date().toISOString(),
  };
  res.json(data);
});

router.post("/import", async (req, res) => {
  const data = req.body;
  if (!data || !data.criteria || !data.candidates) {
    res.status(400).json({ message: "Format data tidak valid" });
    return;
  }

  try {
    await transaction(async (conn) => {
      await conn.query("DELETE FROM psi_details");
      await conn.query("DELETE FROM psi_results");
      await conn.query("DELETE FROM psi_sessions");
      await conn.query("DELETE FROM scores");
      await conn.query("DELETE FROM sub_criteria");
      await conn.query("DELETE FROM candidates");
      await conn.query("DELETE FROM criteria");
      await conn.query("DELETE FROM app_settings");

      if (data.appSettings?.length) {
        for (const s of data.appSettings) {
          await conn.execute("INSERT INTO app_settings (`key`, `value`) VALUES (?, ?)", [s.key, s.value]);
        }
      }
      if (data.criteria?.length) {
        for (const c of data.criteria) {
          await conn.execute(
            "INSERT INTO criteria (id, name, description, type, unit, code, weight_ref, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [c.id, c.name, c.description ?? "", c.type, c.unit ?? "", c.code ?? "", c.weightRef ?? 0, c.status ?? "active"],
          );
        }
      }
      if (data.subCriteria?.length) {
        for (const sc of data.subCriteria) {
          await conn.execute(
            "INSERT INTO sub_criteria (id, criteria_id, name, weight, display_order) VALUES (?, ?, ?, ?, ?)",
            [sc.id, sc.criteriaId, sc.name, sc.weight, sc.displayOrder ?? 0],
          );
        }
      }
      if (data.candidates?.length) {
        for (const cand of data.candidates) {
          await conn.execute(
            "INSERT INTO candidates (id, name, email, phone, education, major, expertise, photo_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [cand.id, cand.name, cand.email, cand.phone ?? "", cand.education ?? "", cand.major ?? "", cand.expertise ?? "", cand.photo_url ?? "", cand.status ?? "active"],
          );
        }
      }
      if (data.scores?.length) {
        for (const sc of data.scores) {
          await conn.execute(
            "INSERT INTO scores (id, candidate_id, criteria_id, value, sub_criteria_id, notes) VALUES (?, ?, ?, ?, ?, ?)",
            [sc.id, sc.candidateId, sc.criteriaId, sc.value, sc.subCriteriaId ?? null, sc.notes ?? ""],
          );
        }
      }
      if (data.psiSessions?.length) {
        for (const s of data.psiSessions) {
          await conn.execute(
            "INSERT INTO psi_sessions (id, session_name, description, status, calculated_at) VALUES (?, ?, ?, ?, ?)",
            [s.id, s.sessionName, s.description ?? "", "completed", s.calculatedAt ?? new Date().toISOString()],
          );
        }
      }
      if (data.psiResults?.length) {
        for (const r of data.psiResults) {
          await conn.execute(
            "INSERT INTO psi_results (id, session_id, candidate_id, psi_score, `rank`, is_recommended) VALUES (?, ?, ?, ?, ?, ?)",
            [r.id, r.sessionId, r.candidateId, r.psiScore, r.rank, r.isRecommended ? 1 : 0],
          );
        }
      }
      if (data.psiDetails?.length) {
        for (const d of data.psiDetails) {
          await conn.execute(
            "INSERT INTO psi_details (id, session_id, candidate_id, criteria_id, raw_value, normalized_value, pv_contribution, dpv_contribution, phi_value, weighted_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [d.id, d.sessionId, d.candidateId, d.criteriaId, d.rawValue, d.normalizedValue, d.pvContribution ?? 0, d.dpvContribution ?? 0, d.phiValue ?? 0, d.weightedScore ?? 0],
          );
        }
      }
    });
    res.json({ success: true, message: "Data berhasil diimport" });
  } catch (err) {
    console.error("Import error:", err);
    res.status(500).json({ message: "Gagal mengimport data" });
  }
});

export default router;
