import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import type { PSIResult } from "@/types";

const colors = {
  primary: "#1E3A5F",
  secondary: "#2E86AB",
  accent: "#F0A500",
  text: "#1a202c",
  muted: "#64748b",
  border: "#e2e8f0",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: colors.text,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: colors.muted,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  table: {
    width: "100%",
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc",
  },
  cellRank: { width: "10%", fontSize: 10, fontWeight: 600 },
  cellName: { width: "30%", fontSize: 10 },
  cellScore: { width: "20%", fontSize: 10, textAlign: "center" },
  cellStatus: { width: "20%", fontSize: 10, textAlign: "center" },
  cellRecommended: { width: "20%", fontSize: 10, textAlign: "center" },
  headerText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: 600,
    textTransform: "uppercase",
  },
  badge: {
    backgroundColor: colors.accent,
    color: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 700,
  },
  badgeDefault: {
    backgroundColor: colors.border,
    color: colors.muted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
  },
  detailTable: {
    width: "100%",
    marginBottom: 8,
  },
  detailHeader: {
    flexDirection: "row",
    backgroundColor: colors.secondary,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailCellLabel: { width: "25%", fontSize: 9, fontWeight: 600 },
  detailCell: { width: "15%", fontSize: 9, textAlign: "center" },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: colors.muted,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  medal: {
    fontSize: 16,
    marginRight: 4,
  },
  rankHighlight: {
    flexDirection: "row",
    backgroundColor: "#fef6e0",
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
});

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function getMedal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "";
}

interface PSIPDFProps {
  result: PSIResult;
}

export default function PSIPDF({ result }: PSIPDFProps) {
  const r = result;
  const criteriaCount = r.calculationDetail?.normalizedMatrix?.[0]?.length ?? 0;
  const criteriaLabels = r.calculationDetail?.meanValues?.map((_, i) => `C${i + 1}`) ?? [];

  return (
    <Document title={r.sessionName}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{r.sessionName}</Text>
        <Text style={styles.subtitle}>
          Tanggal: {formatDate(r.calculatedAt)} | {r.rankings.length} kandidat | {criteriaCount} kriteria
        </Text>

        <Text style={styles.sectionTitle}>Ranking & PSI Score</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cellRank, styles.headerText]}>Rank</Text>
            <Text style={[styles.cellName, styles.headerText]}>Kandidat</Text>
            <Text style={[styles.cellScore, styles.headerText]}>PSI Score</Text>
            <Text style={[styles.cellStatus, styles.headerText]}>Status</Text>
            <Text style={[styles.cellRecommended, styles.headerText]}>Rekomendasi</Text>
          </View>
          {r.rankings.map((rank, i) => (
            <View
              key={rank.candidate.id}
              style={[
                styles.tableRow,
                i % 2 === 1 ? styles.tableRowAlt : {},
                rank.isRecommended ? styles.rankHighlight : {},
              ]}
            >
              <Text style={styles.cellRank}>
                {getMedal(rank.rank)}{rank.rank}
              </Text>
              <Text style={styles.cellName}>{rank.candidate.name}</Text>
              <Text style={styles.cellScore}>{rank.psiScore.toFixed(6)}</Text>
              <Text style={styles.cellStatus}>{rank.candidate.status === "active" ? "Aktif" : "Nonaktif"}</Text>
              <Text style={styles.cellRecommended}>
                {rank.isRecommended ? "✅ Ya" : "—"}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Detail Kandidat</Text>
        {r.rankings.map((rank) => (
          <View key={rank.candidate.id} style={{ marginBottom: 6 }}>
            <Text style={{ fontSize: 10, fontWeight: 600 }}>
              #{rank.rank} — {rank.candidate.name}
            </Text>
            <Text style={{ fontSize: 9, color: colors.muted, marginLeft: 8 }}>
              Email: {rank.candidate.email}
              {rank.candidate.phone ? ` | Telp: ${rank.candidate.phone}` : ""}
              {rank.candidate.institution ? ` | ${rank.candidate.institution}` : ""}
              {rank.candidate.expertise ? ` | ${rank.candidate.expertise}` : ""}
            </Text>
          </View>
        ))}

        {r.calculationDetail && (
          <>
            <Text style={styles.sectionTitle}>Detail Perhitungan PSI</Text>

            <Text style={{ fontSize: 10, fontWeight: 600, marginBottom: 4, marginTop: 8 }}>
              Matriks Normalisasi
            </Text>
            <View style={styles.detailTable}>
              <View style={styles.detailHeader}>
                <Text style={[styles.detailCellLabel, styles.headerText]}>Kandidat</Text>
                {criteriaLabels.map((cl, i) => (
                  <Text key={i} style={[styles.detailCell, styles.headerText]}>{cl}</Text>
                ))}
              </View>
              {r.calculationDetail!.normalizedMatrix.map((row, i) => (
                <View key={i} style={[styles.detailRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={styles.detailCellLabel}>{r.rankings[i]?.candidate.name ?? `C${i + 1}`}</Text>
                  {row.map((val, j) => (
                    <Text key={j} style={styles.detailCell}>{val.toFixed(4)}</Text>
                  ))}
                </View>
              ))}
            </View>

            {[
              { label: "Rata-rata (R̄_j)", data: r.calculationDetail.meanValues },
              { label: "Preference Variation (PV_j)", data: r.calculationDetail.preferenceVariation },
              { label: "Deviation Preference (DPV_j)", data: r.calculationDetail.deviationPreference },
              { label: "Bobot Φ_j", data: r.calculationDetail.overallPreference },
            ].map((section) => (
              <View key={section.label}>
                <Text style={{ fontSize: 10, fontWeight: 600, marginBottom: 4, marginTop: 8 }}>
                  {section.label}
                </Text>
                <View style={styles.detailTable}>
                  <View style={[styles.detailHeader, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.detailCellLabel, styles.headerText]}>Kriteria</Text>
                    {criteriaLabels.map((cl, i) => (
                      <Text key={i} style={[styles.detailCell, styles.headerText]}>{cl}</Text>
                    ))}
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailCellLabel}>Value</Text>
                    {section.data.map((val, j) => (
                      <Text key={j} style={styles.detailCell}>{val.toFixed(6)}</Text>
                    ))}
                  </View>
                </View>
              </View>
            ))}

            <Text style={{ fontSize: 10, fontWeight: 600, marginBottom: 4, marginTop: 8 }}>
              PSI Score Akhir
            </Text>
            <View style={styles.detailTable}>
              <View style={[styles.detailHeader, { backgroundColor: colors.accent }]}>
                <Text style={[styles.detailCellLabel, { color: colors.primary, fontWeight: 700 }]}>Kandidat</Text>
                <Text style={[styles.detailCell, { color: colors.primary, fontWeight: 700 }]}>Score</Text>
              </View>
              {r.calculationDetail.psiScores.map((score, i) => (
                <View key={i} style={[styles.detailRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={styles.detailCellLabel}>{r.rankings[i]?.candidate.name ?? `C${i + 1}`}</Text>
                  <Text style={styles.detailCell}>{score.toFixed(6)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.footer}>
          Generated by Mentor Recruitment PSI — {formatDate(new Date().toISOString())}
        </Text>
      </Page>
    </Document>
  );
}
