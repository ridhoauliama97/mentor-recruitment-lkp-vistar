import { Router } from "express";
import { exec, run, saveDb } from "../db/database.js";
import { calculatePSI } from "../services/psiCalculator.js";

const router = Router();

router.post("/calculate", async (req, res) => {
  try {
    const { sessionName, description, candidateIds, criteriaIds } = req.body;

    if (!candidateIds || candidateIds.length < 2) {
      res.status(400).json({ message: "Minimal 2 kandidat diperlukan" });
      return;
    }
    if (!criteriaIds || criteriaIds.length < 2) {
      res.status(400).json({ message: "Minimal 2 kriteria diperlukan" });
      return;
    }

    const criteria = exec(
      `SELECT * FROM criteria WHERE id IN (${criteriaIds.join(",")}) ORDER BY id`,
    );
    const candidates = exec(
      `SELECT * FROM candidates WHERE id IN (${candidateIds.join(",")}) ORDER BY id`,
    );

    const matrix: number[][] = [];
    for (const cand of candidates) {
      const scores = exec(
        `SELECT criteria_id, value FROM scores WHERE candidate_id = ${(cand as Record<string, unknown>).id}`,
      );
      const row = criteriaIds.map((cid: number) => {
        const sc = (scores as Record<string, unknown>[]).find(
          (s) => s.criteriaId === cid,
        );
        return sc ? Number(sc.value) : 0;
      });
      matrix.push(row);
    }

    const criteriaTypes = criteria.map(
      (c) => (c as Record<string, unknown>).type as "benefit" | "cost",
    );

    const detail = calculatePSI(matrix, criteriaTypes);

    const ranked = detail.psiScores
      .map((score, i) => ({ candidateId: (candidates[i] as Record<string, unknown>).id as number, score }))
      .sort((a, b) => b.score - a.score);

    const name = sessionName || `Sesi ${new Date().toLocaleDateString("id-ID")}`;
    run(`INSERT INTO psi_sessions (session_name, description, status, calculated_at) VALUES (
      '${name.replace(/'/g, "''")}',
      '${(description ?? "").replace(/'/g, "''")}',
      'completed',
      datetime('now')
    )`);
    const sessionRows = exec("SELECT last_insert_rowid() as id");
    const sessionId = (sessionRows[0] as Record<string, unknown>).id as number;

    ranked.forEach((r, idx) => {
      run(`INSERT INTO psi_results (session_id, candidate_id, psi_score, rank, is_recommended) VALUES (
        ${sessionId}, ${r.candidateId}, ${r.score}, ${idx + 1}, ${idx === 0 ? 1 : 0}
      )`);
    });

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < criteriaIds.length; j++) {
        run(`INSERT INTO psi_details (session_id, candidate_id, criteria_id, raw_value, normalized_value, pv_contribution, dpv_contribution, phi_value, weighted_score) VALUES (
          ${sessionId},
          ${(candidates[i] as Record<string, unknown>).id},
          ${criteriaIds[j]},
          ${matrix[i][j]},
          ${detail.normalizedMatrix[i][j]},
          ${detail.preferenceVariation[j]},
          ${detail.deviationPreference[j]},
          ${detail.overallPreference[j]},
          ${detail.overallPreference[j] * detail.normalizedMatrix[i][j]}
        )`);
      }
    }

    saveDb();

    const rankings = ranked.map((r, idx) => {
      const cand = candidates.find(
        (c) => (c as Record<string, unknown>).id === r.candidateId,
      );
      return {
        rank: idx + 1,
        candidate: cand,
        psiScore: Number(r.score.toFixed(6)),
        isRecommended: idx === 0,
      };
    });

    res.json({
      sessionId,
      sessionName: name,
      rankings,
      calculationDetail: {
        normalizedMatrix: detail.normalizedMatrix,
        meanValues: detail.meanValues,
        preferenceVariation: detail.preferenceVariation,
        deviationPreference: detail.deviationPreference,
        overallPreference: detail.overallPreference,
        psiScores: detail.psiScores,
      },
      calculatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("PSI calculation error:", err);
    res.status(500).json({ message: "Gagal melakukan perhitungan PSI" });
  }
});

router.get("/sessions", (_req, res) => {
  const sessions = exec(
    `SELECT ps.id as sessionId, ps.session_name as sessionName, ps.description, ps.status, ps.created_at as createdAt, ps.calculated_at as calculatedAt, (SELECT COUNT(*) FROM psi_results WHERE session_id = ps.id) as candidateCount
     FROM psi_sessions ps ORDER BY ps.created_at DESC`,
  );
  res.json(sessions);
});

router.get("/sessions/latest", (_req, res) => {
  const sessions = exec(
    "SELECT * FROM psi_sessions ORDER BY created_at DESC LIMIT 1",
  );
  if (sessions.length === 0) {
    res.json(null);
    return;
  }
  const session = sessions[0] as Record<string, unknown>;
  const results = exec(
    `SELECT pr.*, c.* FROM psi_results pr
     JOIN candidates c ON pr.candidate_id = c.id
     WHERE pr.session_id = ${session.id}
     ORDER BY pr.rank`,
  );
  const criteria = exec("SELECT * FROM criteria ORDER BY id");
  const details = exec(
    `SELECT * FROM psi_details WHERE session_id = ${session.id} ORDER BY candidate_id, criteria_id`,
  );

  res.json({
    sessionId: session.id,
    sessionName: session.sessionName,
    rankings: results.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        rank: row.rank,
        psiScore: Number((row.psiScore as number).toFixed(6)),
        isRecommended: row.isRecommended === 1 || row.isRecommended === true,
        candidate: {
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          education: row.education,
          institution: row.institution,
          expertise: row.expertise,
          bio: row.bio,
          status: row.status,
          createdAt: row.createdAt,
        },
      };
    }),
    calculationDetail: extractDetail(details, results.length, criteria.length),
    calculatedAt: session.calculatedAt,
  });
});

router.get("/sessions/:id", (req, res) => {
  const sessions = exec(
    `SELECT * FROM psi_sessions WHERE id = ${req.params.id}`,
  );
  if (sessions.length === 0) {
    res.status(404).json({ message: "Sesi tidak ditemukan" });
    return;
  }
  const session = sessions[0] as Record<string, unknown>;

  const results = exec(
    `SELECT pr.*, c.* FROM psi_results pr
     JOIN candidates c ON pr.candidate_id = c.id
     WHERE pr.session_id = ${session.id}
     ORDER BY pr.rank`,
  );

  const criteria = exec("SELECT * FROM criteria ORDER BY id");
  const details = exec(
    `SELECT * FROM psi_details WHERE session_id = ${session.id} ORDER BY candidate_id, criteria_id`,
  );

  res.json({
    sessionId: session.id,
    sessionName: session.sessionName,
    rankings: results.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        rank: row.rank,
        psiScore: Number((row.psiScore as number).toFixed(6)),
        isRecommended: row.isRecommended === 1 || row.isRecommended === true,
        candidate: {
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          education: row.education,
          institution: row.institution,
          expertise: row.expertise,
          bio: row.bio,
          status: row.status,
          createdAt: row.createdAt,
        },
      };
    }),
    calculationDetail: extractDetail(details, results.length, criteria.length),
    calculatedAt: session.calculatedAt,
  });
});

router.delete("/sessions/:id", (req, res) => {
  run(`DELETE FROM psi_sessions WHERE id = ${req.params.id}`);
  saveDb();
  res.json({ success: true });
});

function extractDetail(
  details: Record<string, unknown>[],
  candidateCount: number,
  criteriaCount: number,
) {
  const normalizedMatrix: number[][] = Array.from(
    { length: candidateCount },
    () => Array(criteriaCount).fill(0),
  );
  const rawMatrix: number[][] = Array.from(
    { length: candidateCount },
    () => Array(criteriaCount).fill(0),
  );

  const candidateIds = [...new Set(details.map((d) => (d as Record<string, unknown>).candidateId as number))];
  const criteriaIds = [...new Set(details.map((d) => (d as Record<string, unknown>).criteriaId as number))];

  details.forEach((d) => {
    const row = d as Record<string, unknown>;
    const ci = candidateIds.indexOf(row.candidateId as number);
    const cj = criteriaIds.indexOf(row.criteriaId as number);
    if (ci >= 0 && cj >= 0) {
      normalizedMatrix[ci][cj] = row.normalizedValue as number;
      rawMatrix[ci][cj] = row.rawValue as number;
    }
  });

  const meanValues: number[] = [];
  const preferenceVariation: number[] = [];
  const deviationPreference: number[] = [];
  const overallPreference: number[] = [];

  for (let j = 0; j < criteriaCount; j++) {
    const col = normalizedMatrix.map((row) => row[j]);
    const mean = col.reduce((a, b) => a + b, 0) / col.length;
    meanValues.push(mean);
    const pv = col.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0);
    preferenceVariation.push(pv);
    const dpv = 1 - pv;
    deviationPreference.push(dpv);
  }

  const sumDPV = deviationPreference.reduce((a, b) => a + b, 0);
  for (let j = 0; j < criteriaCount; j++) {
    overallPreference.push(
      sumDPV === 0 ? 1 / criteriaCount : deviationPreference[j] / sumDPV,
    );
  }

  const psiScores = normalizedMatrix.map((row) =>
    row.reduce((sum, v, j) => sum + overallPreference[j] * v, 0),
  );

  return {
    normalizedMatrix,
    rawMatrix,
    meanValues,
    preferenceVariation,
    deviationPreference,
    overallPreference,
    psiScores,
  };
}

export default router;
