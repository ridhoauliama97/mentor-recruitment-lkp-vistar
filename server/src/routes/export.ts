import { Router } from "express";
import { exec, execSql, run, saveDb } from "../db/database.js";

const router = Router();

router.get("/", (_req, res) => {
  const data = {
    appSettings: exec("SELECT key, value FROM app_settings"),
    criteria: exec("SELECT * FROM criteria ORDER BY id"),
    subCriteria: exec("SELECT * FROM sub_criteria ORDER BY criteria_id, display_order"),
    candidates: exec("SELECT * FROM candidates ORDER BY id"),
    scores: exec("SELECT * FROM scores ORDER BY candidate_id, criteria_id"),
    psiSessions: exec("SELECT * FROM psi_sessions ORDER BY id"),
    psiResults: exec("SELECT * FROM psi_results ORDER BY session_id, rank"),
    psiDetails: exec("SELECT * FROM psi_details ORDER BY session_id, candidate_id, criteria_id"),
    exportedAt: new Date().toISOString(),
  };
  res.json(data);
});

router.post("/import", (req, res) => {
  const data = req.body;
  if (!data || !data.criteria || !data.candidates) {
    res.status(400).json({ message: "Format data tidak valid" });
    return;
  }

  try {
    execSql("BEGIN TRANSACTION");

    execSql("DELETE FROM psi_details");
    execSql("DELETE FROM psi_results");
    execSql("DELETE FROM psi_sessions");
    execSql("DELETE FROM scores");
    execSql("DELETE FROM sub_criteria");
    execSql("DELETE FROM candidates");
    execSql("DELETE FROM criteria");
    execSql("DELETE FROM app_settings");

    if (data.appSettings?.length) {
      for (const s of data.appSettings) {
        run(`INSERT INTO app_settings (key, value) VALUES ('${(s.key as string).replace(/'/g, "''")}', '${(s.value as string).replace(/'/g, "''")}')`);
      }
    }
    if (data.criteria?.length) {
      for (const c of data.criteria) {
        run(`INSERT INTO criteria (id, name, description, type, unit, code, weight_ref, status) VALUES (${c.id}, '${(c.name as string).replace(/'/g, "''")}', '${((c.description ?? "") as string).replace(/'/g, "''")}', '${c.type}', '${((c.unit ?? "") as string).replace(/'/g, "''")}', '${((c.code ?? "") as string).replace(/'/g, "''")}', ${c.weightRef ?? 0}, '${c.status ?? "active"}')`);
      }
    }
    if (data.subCriteria?.length) {
      for (const sc of data.subCriteria) {
        run(`INSERT INTO sub_criteria (id, criteria_id, name, weight, display_order) VALUES (${sc.id}, ${sc.criteriaId}, '${(sc.name as string).replace(/'/g, "''")}', ${sc.weight}, ${sc.displayOrder ?? 0})`);
      }
    }
    if (data.candidates?.length) {
      for (const cand of data.candidates) {
        run(`INSERT INTO candidates (id, name, email, phone, education, major, expertise, photo_url, status) VALUES (${cand.id}, '${(cand.name as string).replace(/'/g, "''")}', '${(cand.email as string).replace(/'/g, "''")}', '${((cand.phone ?? "") as string).replace(/'/g, "''")}', '${((cand.education ?? "") as string).replace(/'/g, "''")}', '${((cand.major ?? "") as string).replace(/'/g, "''")}', '${((cand.expertise ?? "") as string).replace(/'/g, "''")}', '${((cand.photo_url ?? "") as string).replace(/'/g, "''")}', '${cand.status ?? "active"}')`);
      }
    }
    if (data.scores?.length) {
      for (const sc of data.scores) {
        run(`INSERT INTO scores (id, candidate_id, criteria_id, value, sub_criteria_id, notes) VALUES (${sc.id}, ${sc.candidateId}, ${sc.criteriaId}, ${sc.value}, ${sc.subCriteriaId ?? "NULL"}, '${((sc.notes ?? "") as string).replace(/'/g, "''")}')`);
      }
    }
    if (data.psiSessions?.length) {
      for (const s of data.psiSessions) {
        run(`INSERT INTO psi_sessions (id, session_name, description, status, calculated_at) VALUES (${s.id}, '${(s.sessionName as string).replace(/'/g, "''")}', '${((s.description ?? "") as string).replace(/'/g, "''")}', 'completed', '${s.calculatedAt ?? new Date().toISOString()}')`);
      }
    }
    if (data.psiResults?.length) {
      for (const r of data.psiResults) {
        run(`INSERT INTO psi_results (id, session_id, candidate_id, psi_score, rank, is_recommended) VALUES (${r.id}, ${r.sessionId}, ${r.candidateId}, ${r.psiScore}, ${r.rank}, ${r.isRecommended ? 1 : 0})`);
      }
    }
    if (data.psiDetails?.length) {
      for (const d of data.psiDetails) {
        run(`INSERT INTO psi_details (id, session_id, candidate_id, criteria_id, raw_value, normalized_value, pv_contribution, dpv_contribution, phi_value, weighted_score) VALUES (${d.id}, ${d.sessionId}, ${d.candidateId}, ${d.criteriaId}, ${d.rawValue}, ${d.normalizedValue}, ${d.pvContribution ?? 0}, ${d.dpvContribution ?? 0}, ${d.phiValue ?? 0}, ${d.weightedScore ?? 0})`);
      }
    }

    execSql("COMMIT");
    saveDb();
    res.json({ success: true, message: "Data berhasil diimport" });
  } catch (err) {
    execSql("ROLLBACK");
    console.error("Import error:", err);
    res.status(500).json({ message: "Gagal mengimport data" });
  }
});

export default router;
