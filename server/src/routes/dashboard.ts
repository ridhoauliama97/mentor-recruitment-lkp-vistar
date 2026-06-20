import { Router } from "express";
import { exec } from "../db/database.js";

const router = Router();

router.get("/stats", async (_req, res) => {
  const candidateCount = await exec("SELECT COUNT(*) as cnt FROM candidates WHERE status = 'active'");
  const criteriaCount = await exec("SELECT COUNT(*) as cnt FROM criteria");
  const sessionCount = await exec("SELECT COUNT(*) as cnt FROM psi_sessions");

  res.json({
    totalCandidates: (candidateCount[0] as { cnt: number }).cnt,
    totalCriteria: (criteriaCount[0] as { cnt: number }).cnt,
    totalSessions: (sessionCount[0] as { cnt: number }).cnt,
  });
});

export default router;
