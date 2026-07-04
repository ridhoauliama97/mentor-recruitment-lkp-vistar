import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { PSIResult } from "@/types";

Font.register({
  family: "Noto Serif",
  fonts: [
    { src: "/fonts/NotoSerif-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/NotoSerif-Medium.ttf", fontWeight: 500 },
    { src: "/fonts/NotoSerif-SemiBold.ttf", fontWeight: 600 },
    { src: "/fonts/NotoSerif-Bold.ttf", fontWeight: 700 },
  ],
});

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
    fontSize: 11,
    fontFamily: "Noto Serif",
    color: colors.text,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    fontFamily: "Noto Serif",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 55,
    height: 55,
    marginRight: 12,
  },
  subtitle: {
    fontSize: 9,
    fontFamily: "Noto Serif",
    color: colors.muted,
    textAlign: "center",
    lineHeight: 1.4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "Noto Serif",
    color: colors.primary,
    marginTop: 10,
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
    paddingHorizontal: 6,
    borderRadius: 2,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc",
  },
  cellRank: { width: "8%", fontSize: 8, fontWeight: 600, textAlign: "center" },
  cellName: { width: "27%", fontSize: 8 },
  cellEmail: { width: "27%", fontSize: 8 },
  cellScore: { width: "13%", fontSize: 8, textAlign: "center" },
  cellRecommended: { width: "25%", fontSize: 8, textAlign: "center" },
  headerText: {
    color: colors.white,
    fontSize: 8,
    fontFamily: "Noto Serif",
    fontWeight: 700,
    textTransform: "uppercase",
    textAlign: "center",
  },
  rankHighlight: {
    flexDirection: "row",
    backgroundColor: "#fef6e0",
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
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
    fontFamily: "Noto Serif",
    color: colors.muted,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
});

function formatDateTime(date: Date) {
  try {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} pukul ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  } catch {
    return date.toISOString();
  }
}

interface PSIPDFProps {
  result: PSIResult;
  exportedAt?: Date;
  username?: string;
  appName?: string;
  logoSrc?: string;
}

function RankBadge({ rank }: { rank: number }) {
  const badgeColors: Record<number, { bg: string; text: string }> = {
    1: { bg: "#F0A500", text: "#1a202c" },
    2: { bg: "#94A3B8", text: "#ffffff" },
    3: { bg: "#CD7F32", text: "#ffffff" },
  };
  const c = badgeColors[rank];
  if (!c) return null;
  return (
    <View style={{
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: c.bg,
      justifyContent: "center",
      alignItems: "center",
    }}>
      <Text style={{ fontSize: 9, fontWeight: 700, fontFamily: "Noto Serif", color: c.text }}>{rank}</Text>
    </View>
  );
}

export default function PSIPDF({ result, exportedAt, username, appName, logoSrc }: PSIPDFProps) {
  const r = result;
  const now = exportedAt ?? new Date();
  const criteriaLabels = r.calculationDetail?.meanValues?.map((_, i) => `C${i + 1}`) ?? [];
  const app = appName || "LKP Academy Vistar";

  return (
    <Document title={r.sessionName}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Image style={styles.logo} src={logoSrc || "/images/logo/logo.png"} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{app}</Text>
            <Text style={styles.subtitle}>
              Laporan Hasil Perhitungan Sistem Pendukung Keputusan Untuk Rekrutmen Mentor Bidang Ai Engineer pada LKP academy Vistar Menggunakan Metode PSI — {r.sessionName}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ranking & PSI Score</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cellRank, styles.headerText]}>Rank</Text>
            <Text style={[styles.cellName, styles.headerText]}>Kandidat</Text>
            <Text style={[styles.cellEmail, styles.headerText]}>Email</Text>
            <Text style={[styles.cellScore, styles.headerText]}>PSI Score</Text>
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
              <View style={[styles.cellRank, { flexDirection: "row", alignItems: "center", justifyContent: "center" }]}>
                {rank.rank <= 3 ? <RankBadge rank={rank.rank} /> : <Text>{rank.rank}</Text>}
              </View>
              <Text style={styles.cellName}>{rank.candidate.name}</Text>
              <Text style={styles.cellEmail}>{rank.candidate.email}</Text>
              <Text style={styles.cellScore}>{rank.psiScore.toFixed(4)}</Text>
              <Text style={styles.cellRecommended}>
                {rank.isRecommended ? "Ya" : "Tidak"}
              </Text>
            </View>
          ))}
        </View>

        {r.calculationDetail && (
          <>
            <Text style={styles.sectionTitle}>Detail Perhitungan PSI</Text>

            <Text style={{ fontSize: 11, fontFamily: "Noto Serif", fontWeight: 600, marginBottom: 4, marginTop: 8 }}>
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
                <Text style={{ fontSize: 11, fontFamily: "Noto Serif", fontWeight: 600, marginBottom: 4, marginTop: 8 }}>
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
                      <Text key={j} style={styles.detailCell}>{val.toFixed(4)}</Text>
                    ))}
                  </View>
                </View>
              </View>
            ))}

            <Text style={{ fontSize: 11, fontFamily: "Noto Serif", fontWeight: 600, marginBottom: 4, marginTop: 8 }}>
              PSI Score Akhir
            </Text>
            <View style={styles.detailTable}>
              <View style={[styles.detailHeader, { backgroundColor: colors.accent }]}>
                <Text style={[styles.detailCellLabel, { color: colors.primary, fontWeight: 700 }]}>Kandidat</Text>
                <Text style={[styles.detailCell, { color: colors.primary, fontWeight: 700 }]}>Score</Text>
              </View>
              {r.rankings.map((rank, i) => (
                <View key={rank.candidate.id} style={[styles.detailRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={styles.detailCellLabel}>{rank.candidate.name}</Text>
                  <Text style={styles.detailCell}>{rank.psiScore.toFixed(4)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.footer}>
          Dicetak oleh : {username || "—"} pada {formatDateTime(now)} — {app}
        </Text>
      </Page>
    </Document>
  );
}
