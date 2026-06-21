import { exec } from "../db/database.js";

let cache: { data: string; timestamp: number } | null = null;
const TTL = 5 * 60 * 1000;

export async function getDynamicContext(): Promise<string> {
  const now = Date.now();
  if (cache && now - cache.timestamp < TTL) {
    return cache.data;
  }

  try {
    const [stats] = await exec<{
      totalCandidates: number;
      totalCriteria: number;
      totalSessions: number;
    }>(
      "SELECT (SELECT COUNT(*) FROM candidates WHERE status = 'active') as totalCandidates, (SELECT COUNT(*) FROM criteria) as totalCriteria, (SELECT COUNT(*) FROM psi_sessions) as totalSessions",
    );

    const criteria = await exec<{ code: string; name: string; weightRef: number }>(
      "SELECT code, name, weight_ref as weightRef FROM criteria WHERE status = 'active' ORDER BY code",
    );

    const sessions = await exec<{ id: number; sessionName: string; createdAt: string; totalCandidates: number }>(
      "SELECT ps.id, ps.session_name as sessionName, ps.created_at as createdAt, (SELECT COUNT(*) FROM psi_results WHERE session_id = ps.id) as totalCandidates FROM psi_sessions ps ORDER BY ps.created_at DESC",
    );

    const topRanks: { sessionId: number; name: string; rank: number; psiScore: number }[] = [];
    if (sessions.length > 0) {
      const ids = sessions.map((s) => s.id);
      const rows = await exec<{ sessionId: number; name: string; rank: number; psiScore: number }>(
        `SELECT pr.session_id as sessionId, c.name, pr.\`rank\`, pr.psi_score as psiScore
         FROM psi_results pr JOIN candidates c ON pr.candidate_id = c.id
         WHERE pr.session_id IN (${ids.map(() => "?").join(",")}) AND pr.\`rank\` <= 3
         ORDER BY pr.session_id, pr.\`rank\``,
        ids,
      );
      topRanks.push(...rows);
    }

    const parts: string[] = [];

    parts.push(`Statistik Sistem: ${stats.totalCandidates} kandidat aktif, ${stats.totalCriteria} kriteria, ${stats.totalSessions} sesi tersimpan.`);

    if (criteria.length > 0) {
      const criteriaList = criteria.map((c) => `${c.code}: ${c.name} (${c.weightRef}%)`).join(" | ");
      parts.push(`Kriteria: ${criteriaList}`);
    }

    if (sessions.length > 0) {
      const sessionLines = sessions.map((s) => {
        const date = new Date(s.createdAt).toLocaleDateString("id-ID", {
          day: "numeric", month: "long", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        });
        const top = topRanks
          .filter((t) => t.sessionId === s.id)
          .map((t) => `Rank ${t.rank}: ${t.name} (skor ${t.psiScore.toFixed(4)})`)
          .join(", ");
        const topInfo = top ? ` — ${top}` : "";
        return `"${s.sessionName}" (${date}, ${s.totalCandidates} kandidat)${topInfo}`;
      });
      parts.push(`Sesi tersimpan (${sessions.length}):`);
      parts.push(sessionLines.slice(0, 5).join("\n"));
      if (sessions.length > 5) {
        parts.push(`...dan ${sessions.length - 5} sesi lainnya.`);
      }
    } else {
      parts.push("Belum ada sesi perhitungan. Arahkan user ke menu Proses PSI untuk memulai.");
    }

    const result = parts.join("\n\n");
    cache = { data: result, timestamp: now };
    return result;
  } catch (err) {
    console.error("Dynamic data fetch error:", err);
    if (cache) return cache.data;
    return "Data sistem tidak tersedia saat ini.";
  }
}
