import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, CalculatorIcon, Download, FileText, FileSpreadsheet, Trash2, ChevronDown, ChevronRight, Loader2 } from "@/components/ui/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { PSIResult } from "@/types";
import { usePSIStore } from "@/stores/psiStore";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { pdf } from "@react-pdf/renderer";
import PSIPDF from "@/lib/pdf";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import * as XLSX from "xlsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Results() {
  const { id } = useParams();
  const { sessions, currentResult, loading, fetchSessions, fetchSession, removeSession } = usePSIStore();
  const [expandedDetail, setExpandedDetail] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [previews, setPreviews] = useState<Record<number, string[]>>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const username = user?.username ?? "";
  const appName = settings.app_name ?? "LKP Academy Vistar";

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (id) fetchSession(Number(id));
  }, [id, fetchSession]);

  useEffect(() => {
    const cached = new Set(Object.keys(previews).map(Number));
    sessions.forEach((s) => {
      if (!cached.has(s.sessionId)) {
        api.get<PSIResult>(`/psi/sessions/${s.sessionId}`).then((r) => {
          setPreviews((prev) => ({
            ...prev,
            [s.sessionId]: r.rankings.slice(0, 3).map((rr) => rr.candidate.name),
          }));
        }).catch(() => { });
      }
    });
  }, [sessions]);

  if (id && currentResult) {
    const r = currentResult;

    const getHeatColor = (val: number, min: number, max: number) => {
      if (max === min) return "transparent";
      const ratio = (val - min) / (max - min);
      const alpha = 0.08 + ratio * 0.25;
      return `rgba(46, 134, 171, ${alpha})`;
    };

    const chartData = r.rankings.slice(0, 5).map((r) => ({
      name: r.candidate.name,
      score: Number(r.psiScore.toFixed(4)),
      rank: r.rank,
    }));

    interface CandidateRow {
      rank: number;
      name: string;
      score: number;
      recommended: boolean;
    }

    const tableColumns: ColumnDef<CandidateRow>[] = [
      {
        accessorKey: "rank",
        header: "Peringkat",
        cell: ({ row }) => (
          <span className="font-mono font-medium">{row.original.rank}</span>
        ),
      },
      {
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "score",
        header: "Skor PSI",
        cell: ({ row }) => (
          <span className="font-mono">{row.original.score.toFixed(4)}</span>
        ),
      },
      {
        accessorKey: "recommended",
        header: "Rekomendasi",
        cell: ({ row }) => (
          row.original.recommended
            ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Direkomendasikan</Badge>
            : <Badge variant="secondary">Tidak</Badge>
        ),
      },
    ];

    const tableData: CandidateRow[] = r.rankings.map((rr) => ({
      rank: rr.rank,
      name: rr.candidate.name,
      score: rr.psiScore,
      recommended: rr.isRecommended,
    }));

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/results"><Button variant="ghost"><ChevronRight className="h-5 w-5 rotate-180" /></Button></Link>
          <h1 className="text-2xl font-bold text-primary">{r.sessionName}</h1>
          {/* <Badge>{r.rankings.filter((rr) => rr.isRecommended).length} Direkomendasikan</Badge> */}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {r.rankings.slice(0, 3).map((rank, i) => (
            <Card key={rank.rank} className={i === 0 ? "border-accent border-2" : ""}>
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">{["🥇", "🥈", "🥉"][i]}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{rank.candidate.name}</p>
                  <p className="text-sm text-muted-foreground">
                    PSI Score: <span className="font-mono font-bold">{rank.psiScore.toFixed(4)}</span>
                  </p>
                  {rank.isRecommended && (
                    <Badge variant="success" className="mt-1">Direkomendasikan</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className={tableData.length > 0 ? "lg:border-r h-full" : "h-full"}>
              <ChartAreaInteractive
                variant="content"
                data={chartData}
                sessionName={r.sessionName}
              />
            </div>
            {tableData.length > 0 && (
              <div className="p-6">
                <h3 className="mb-1 text-lg font-semibold">Hasil Ranking</h3>
                {r.sessionName && (
                  <p className="mb-4 text-sm text-muted-foreground">{r.sessionName}</p>
                )}
                <DataTable columns={tableColumns} data={tableData} pageSize={5} />
              </div>
            )}
          </div>
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
                                <td key={ci} className="p-1.5 text-center font-noto-mono" style={{ backgroundColor: getHeatColor(val, mn, mx) }}>
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
                const blob = await pdf(<PSIPDF result={r} exportedAt={new Date()} username={username} appName={appName} />).toBlob();
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
              "Rank", "Nama", "Email", "Phone", "Pendidikan", "Jurusan", "Keahlian",
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
                `"${rr.candidate.major ?? ""}"`,
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
          <Button variant="outline" onClick={() => {
            const wsData = [
              ["Rank", "Nama", "Email", "Phone", "Pendidikan", "Jurusan", "Keahlian", "PSI Score", "Direkomendasikan"],
              ...r.rankings.map((rr) => [
                rr.rank,
                rr.candidate.name,
                rr.candidate.email,
                rr.candidate.phone ?? "",
                rr.candidate.education ?? "",
                rr.candidate.major ?? "",
                rr.candidate.expertise ?? "",
                Number(rr.psiScore.toFixed(6)),
                rr.isRecommended ? "Ya" : "Tidak",
              ]),
            ];
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws["!cols"] = wsData[0].map((_, i) => ({ wch: i === 1 ? 30 : 18 }));
            XLSX.utils.book_append_sheet(wb, ws, "Hasil PSI");
            XLSX.writeFile(wb, `${r.sessionName}.xlsx`);
          }}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Hasil Perhitungan</h1>
      {loading && <p className="text-muted-foreground">Memuat...</p>}
      {!loading && sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalculatorIcon />
                </EmptyMedia>
                <EmptyTitle>Belum Ada Sesi Perhitungan</EmptyTitle>
                <EmptyDescription>
                  Anda belum memiliki sesi perhitungan PSI. Mulai dengan membuat perhitungan baru.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link to="/calculation">
                  <Button>Buat Perhitungan Baru</Button>
                </Link>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      ) : (<>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => (
            <Card key={s.sessionId} className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <div className="h-1 bg-gradient-to-r from-secondary to-accent" />
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link to={`/results/${s.sessionId}`} className="text-base font-semibold line-clamp-1 hover:text-secondary transition-colors">
                      {s.sessionName}
                    </Link>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{new Date(s.calculatedAt).toLocaleDateString("id-ID")}</span>
                      <span>•</span>
                      <span>{s.candidateCount ?? s.rankings?.length ?? 0} kandidat</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDeletingId(s.sessionId)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                {previews[s.sessionId] && (
                  <>
                    <div className="mt-4 pt-4 border-t">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Peringkat Teratas</p>
                      <div className="space-y-1.5">
                        {previews[s.sessionId].map((name, i) => (
                          <Link key={i} to={`/results/${s.sessionId}`}
                            className="flex items-center gap-2 text-sm hover:bg-muted/50 rounded-md -mx-1 px-1 py-0.5 transition-colors"
                          >
                            <span className={`inline-flex items-center justify-center size-5 rounded-full text-[10px] font-bold shrink-0 ${i === 0 ? "bg-yellow-100 text-yellow-700" :
                                i === 1 ? "bg-gray-100 text-gray-500" :
                                  "bg-orange-100 text-orange-700"
                              }`}>
                              {i + 1}
                            </span>
                            <span className="truncate">{name}</span>
                          </Link>
                        ))}
                      </div>
                      {(s.candidateCount ?? 0) > 3 && (
                        <p className="mt-2 text-xs text-muted-foreground">+{(s.candidateCount ?? 0) - 3} lainnya</p>
                      )}
                    </div>

                    <div className="mt-4">
                      <Link to={`/results/${s.sessionId}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:underline"
                      >
                        Lihat Detail <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <AlertDialog open={deletingId !== null} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Sesi Perhitungan?</AlertDialogTitle>
              <AlertDialogDescription>
                Data perhitungan "{sessions.find(s => s.sessionId === deletingId)?.sessionName ?? ""}" akan dihapus permanen. Apakah Anda yakin?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={() => { if (deletingId !== null) { removeSession(deletingId); } setDeletingId(null); }}>
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
      )}
    </div>
  );
}
