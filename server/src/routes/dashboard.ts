import { Router } from "express";
import { exec } from "../db/database.js";

const router = Router();

router.get("/stats", (_req, res) => {
  const candidateCount = exec("SELECT COUNT(*) as cnt FROM candidates WHERE status = 'active'");
  const criteriaCount = exec("SELECT COUNT(*) as cnt FROM criteria");
  const sessionCount = exec("SELECT COUNT(*) as cnt FROM psi_sessions");

  res.json({
    totalCandidates: (candidateCount[0] as { cnt: number }).cnt,
    totalCriteria: (criteriaCount[0] as { cnt: number }).cnt,
    totalSessions: (sessionCount[0] as { cnt: number }).cnt,
  });
});

export default router;
