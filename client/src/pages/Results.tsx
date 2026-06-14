import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from "recharts";
import { Download, FileText, Trash2, ChevronDown, ChevronRight, Loader2 } from "@/components/ui/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { usePSIStore } from "@/stores/psiStore";
import { pdf } from "@react-pdf/renderer";
import PSIPDF from "@/lib/pdf";

const COLORS = ["#1E3A5F", "#2E86AB", "#F0A500", "#27AE60", "#E74C3C", "#8B5CF6"];

export default function Results() {
  const { id } = useParams();
  const { sessions, currentResult, loading, fetchSessions, fetchSession, removeSession } = usePSIStore();
  const [expandedDetail, setExpandedDetail] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (id) fetchSession(Number(id));
  }, [id, fetchSession]);

  if (id && currentResult) {
    const r = currentResult;

    const radarData = r.calculationDetail ? r.calculationDetail.normalizedMatrix[0]?.map((_, ci) => {
      const entry: Record<string, string | number> = { criteria: r.rankings[0]?.candidate?.name || `C${ci}` };
      r.rankings.slice(0, 3).forEach((rank) => {
        entry[rank.candidate.name] = r.calculationDetail?.normalizedMatrix[
          r.rankings.findIndex((rr) => rr.candidate.id === rank.candidate.id)
        ]?.[ci] ?? 0;
      });
      return entry;
    }) : [];

    const barData = r.rankings.map((rank) => ({
      name: rank.candidate.name,
      score: rank.psiScore,
      recommended: rank.isRecommended,
    }));

    const getHeatColor = (val: number, min: number, max: number) => {
      if (max === min) return "transparent";
      const ratio = (val - min) / (max - min);
      return `rgb(${Math.round(220 - ratio * 190)}, ${Math.round(220 - ratio * 80)}, ${Math.round(220 - ratio * 180)})`;
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/results"><Button variant="ghost"><ChevronRight className="h-5 w-5 rotate-180" /></Button></Link>
          <h1 className="text-2xl font-bold text-primary">{r.sessionName}</h1>
          <Badge>{r.rankings.filter((rr) => rr.isRecommended).length} Direkomendasikan</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {r.rankings.slice(0, 3).map((rank, i) => (
            <Card key={rank.rank} className={i === 0 ? "border-accent border-2" : ""}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{["🥇", "🥈", "🥉"][i]}</span>
                  <div>
                    <p className="font-semibold">#{rank.rank} {rank.candidate.name}</p>
                    <p className="text-sm text-muted-foreground">
                      PSI Score: <span className="font-mono font-bold">{rank.psiScore.toFixed(4)}</span>
                    </p>
                    {rank.isRecommended && (
                      <Badge variant="success" className="mt-1">Direkomendasikan</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {radarData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Radar Chart — 3 Teratas</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="criteria" />
                  <PolarRadiusAxis angle={30} domain={[0, 1]} />
                  {r.rankings.slice(0, 3).map((rank, i) => (
                    <Radar key={rank.candidate.id} dataKey={rank.candidate.name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.2} />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>PSI Score — Semua Kandidat</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => v.toFixed(2)} />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip formatter={(v: number) => v.toFixed(4)} />
                <Bar dataKey="score" fill="var(--secondary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {r.calculationDetail && (
          <Card>
            <CardHeader>
              <button className="flex items-center gap-2" onClick={() => setExpandedDetail(!expandedDetail)}>
                <CardTitle>Detail Perhitungan</CardTitle>
                {expandedDetail ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </CardHeader>
            {expandedDetail && (
              <CardContent className="overflow-x-auto space-y-4">
                {[
                  { label: "Normalisasi", data: r.calculationDetail.normalizedMatrix },
                  { label: "R̄_j (Mean)", data: [r.calculationDetail.meanValues] },
                  { label: "PV_j", data: [r.calculationDetail.preferenceVariation] },
                  { label: "DPV_j", data: [r.calculationDetail.deviationPreference] },
                  { label: "Φ_j (Bobot)", data: [r.calculationDetail.overallPreference] },
                ].map((section) => {
                  const allVals = section.data.flat();
                  const mn = Math.min(...allVals);
                  const mx = Math.max(...allVals);
                  return (
                    <div key={section.label}>
                      <p className="text-sm font-medium mb-2">{section.label}</p>
                      <table className="w-full text-xs">
                        <tbody>
                          {section.data.map((row, ri) => (
                            <tr key={ri}>
                              {row.map((val: number, ci: number) => (
                                <td key={ci} className="p-1.5 text-center font-mono" style={{ backgroundColor: getHeatColor(val, mn, mx) }}>
                                  {val.toFixed(4)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={pdfLoading}
            onClick={async () => {
              setPdfLoading(true);
              try {
                const blob = await pdf(<PSIPDF result={r} />).toBlob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${r.sessionName}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
              } catch (err) {
                toast.error(`Gagal export PDF: ${(err as Error).message}`);
              } finally {
                setPdfLoading(false);
              }
            }}
          >
            {pdfLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => {
            const weights = r.calculationDetail?.overallPreference ?? [];

            const headers = [
              "Rank", "Nama", "Email", "Phone", "Pendidikan", "Instansi", "Keahlian",
              ...(r.calculationDetail?.rawMatrix?.[0] ?? []).map((_, j) => `Kriteria ${j + 1} (raw)`),
              ...(r.calculationDetail?.normalizedMatrix?.[0] ?? []).map((_, j) => `Kriteria ${j + 1} (norm)`),
              "PSI Score",
              ...weights.map((_, j) => `Φ${j + 1}`),
              "Direkomendasikan",
            ];

            const csvRows = r.rankings.map((rr, i) => {
              const rawRow = r.calculationDetail?.rawMatrix?.[i] ?? [];
              const normRow = r.calculationDetail?.normalizedMatrix?.[i] ?? [];
              return [
                rr.rank,
                `"${rr.candidate.name}"`,
                rr.candidate.email,
                rr.candidate.phone ?? "",
                `"${rr.candidate.education ?? ""}"`,
                `"${rr.candidate.institution ?? ""}"`,
                `"${rr.candidate.expertise ?? ""}"`,
                ...rawRow.map((v) => v.toFixed(4)),
                ...normRow.map((v) => v.toFixed(4)),
                rr.psiScore.toFixed(6),
                ...weights.map((w) => w.toFixed(6)),
                rr.isRecommended ? "Ya" : "Tidak",
              ].join(",");
            });

            const csv = [headers.join(","), ...csvRows].join("\n");
            const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${r.sessionName}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Hasil Perhitungan</h1>
      {loading && <p className="text-muted-foreground">Memuat...</p>}
      {!loading && sessions.length === 0 && (
        <p className="text-muted-foreground">Belum ada sesi perhitungan. Buat sesi baru di halaman Perhitungan.</p>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((s) => (
          <Card key={s.sessionId} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <Link to={`/results/${s.sessionId}`} className="font-semibold text-secondary hover:underline dark:text-white">
                    {s.sessionName}
                  </Link>
                  <p className="text-sm text-muted-foreground">{s.candidateCount ?? s.rankings?.length ?? 0} kandidat</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeSession(s.sessionId)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
