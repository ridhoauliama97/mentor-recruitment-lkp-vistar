import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Loader2 } from "@/components/ui/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCandidateStore } from "@/stores/candidateStore";
import { useCriteriaStore } from "@/stores/criteriaStore";
import { usePSIStore } from "@/stores/psiStore";
import { api } from "@/lib/api";
import { calculatePSI } from "@/lib/psi";
import type { PSICalculationDetail } from "@/types";

const steps = ["Konfigurasi", "Matriks", "Perhitungan", "Konfirmasi"];

function heatColor(val: number, min: number, max: number): string {
  if (max === min) return "transparent";
  const ratio = (val - min) / (max - min);
  const r = Math.round(220 - ratio * 190);
  const g = Math.round(220 - ratio * 80);
  const b = Math.round(220 - ratio * 180);
  return `rgb(${r}, ${g}, ${b})`;
}

const stepFormulas = [
  { key: 0, label: "📐 Matriks Normalisasi (r_ij)", formula: { benefit: "r_ij = x_ij / max(x_j)", cost: "r_ij = min(x_j) / x_ij" }, decimals: 4 },
  { key: 1, label: "📈 Rata-Rata Nilai Preferensi (R̄_j)", formula: { general: "R̄_j = (1/m) × Σ r_ij" }, decimals: 4 },
  { key: 2, label: "📉 Preference Variation Value (PV_j)", formula: { general: "PV_j = Σ (r_ij − R̄_j)²" }, decimals: 6 },
  { key: 3, label: "⚖️ Deviation in Preference Value (DPV_j)", formula: { general: "DPV_j = 1 − PV_j" }, decimals: 6 },
  { key: 4, label: "🔢 Overall Preference Value / Bobot (Φ_j)", formula: { general: "Φ_j = DPV_j / Σ DPV_j" }, decimals: 6 },
  { key: 5, label: "🏆 PSI Score", formula: { general: "PSI_i = Σ (Φ_j × r_ij)" }, decimals: 4 },
];

function formatNumber(v: number, decimals: number) {
  return Number(v.toFixed(decimals));
}

interface ScoreData {
  candidateId: number;
  criteriaId: number;
  value: number;
  subCriteriaName?: string;
}

export default function Calculation() {
  const navigate = useNavigate();
  const { candidates, fetch: fetchCandidates } = useCandidateStore();
  const { criteria, fetch: fetchCriteria } = useCriteriaStore();
  const { calculate, loading: calcLoading } = usePSIStore();
  const [step, setStep] = useState(0);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [selectedCriteria, setSelectedCriteria] = useState<number[]>([]);
  const [sessionName, setSessionName] = useState("");
  const [description, setDescription] = useState("");
  const [detail, setDetail] = useState<PSICalculationDetail | null>(null);
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [matrixLabels, setMatrixLabels] = useState<string[][]>([]);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [missingScores, setMissingScores] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [criteriaSearch, setCriteriaSearch] = useState("");

  useEffect(() => {
    fetchCandidates();
    fetchCriteria();
  }, [fetchCandidates, fetchCriteria]);

  const activeCandidates = candidates.filter((c) => c.status === "active");
  const activeCriteria = criteria;

  const toggleSelect = (arr: number[], val: number) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const filteredCandidates = activeCandidates.filter((c) =>
    c.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(candidateSearch.toLowerCase()),
  );
  const filteredCriteria = activeCriteria.filter((c) =>
    c.name.toLowerCase().includes(criteriaSearch.toLowerCase()) ||
    c.code?.toLowerCase().includes(criteriaSearch.toLowerCase()),
  );

  const allCandidatesSelected = filteredCandidates.length > 0 &&
    filteredCandidates.every((c) => selectedCandidates.includes(c.id));
  const someCandidatesSelected = filteredCandidates.some((c) => selectedCandidates.includes(c.id));

  const allCriteriaSelected = filteredCriteria.length > 0 &&
    filteredCriteria.every((c) => selectedCriteria.includes(c.id));
  const someCriteriaSelected = filteredCriteria.some((c) => selectedCriteria.includes(c.id));

  const toggleAllCandidates = (checked: boolean) => {
    const ids = filteredCandidates.map((c) => c.id);
    if (checked) {
      setSelectedCandidates((prev) => [...new Set([...prev, ...ids])]);
    } else {
      setSelectedCandidates((prev) => prev.filter((id) => !ids.includes(id)));
    }
  };

  const toggleAllCriteria = (checked: boolean) => {
    const ids = filteredCriteria.map((c) => c.id);
    if (checked) {
      setSelectedCriteria((prev) => [...new Set([...prev, ...ids])]);
    } else {
      setSelectedCriteria((prev) => prev.filter((id) => !ids.includes(id)));
    }
  };

  const goNext = async () => {
    if (step === 0) {
      const candIds = selectedCandidates.length > 0 ? selectedCandidates : activeCandidates.map((c) => c.id);
      const critIds = selectedCriteria.length > 0 ? selectedCriteria : activeCriteria.map((c) => c.id);
      setSelectedCandidates(candIds);
      setSelectedCriteria(critIds);

      setScoresLoading(true);
      try {
        const scorePromises = candIds.map((cid) =>
          api.get<ScoreData[]>(`/candidates/${cid}/scores`),
        );
        const allScores = await Promise.all(scorePromises);
        const flat = allScores.flat();
        const m = candIds.map((cid) =>
          critIds.map((critId) => {
            const s = flat.find(
              (sc) => sc.candidateId === cid && sc.criteriaId === critId,
            );
            return s ? s.value : 0;
          }),
        );
        const lbl = candIds.map((cid) =>
          critIds.map((critId) => {
            const s = flat.find(
              (sc) => sc.candidateId === cid && sc.criteriaId === critId,
            );
            return s?.subCriteriaName ?? "";
          }),
        );
        setMatrix(m);
        setMatrixLabels(lbl);
        setMissingScores(m.some((row) => row.some((v) => v === 0)));
      } catch {
        const m = candIds.map(() => critIds.map(() => 0));
        setMatrix(m);
        setMatrixLabels(candIds.map(() => critIds.map(() => "")));
        setMissingScores(true);
      }
      setScoresLoading(false);
    }
    if (step === 1) {
      const critList = activeCriteria.filter((c) => selectedCriteria.includes(c.id));
      const d = calculatePSI(matrix, critList.map((c) => c.type));
      setDetail(d);
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleSave = async () => {
    try {
      const result = await calculate({
        sessionName: sessionName || `Sesi ${new Date().toLocaleDateString("id-ID")}`,
        description,
        candidateIds: selectedCandidates,
        criteriaIds: selectedCriteria,
      });
      navigate(`/results/${result.sessionId}`);
    } catch {
      // handled by store
    }
  };

  const candList = activeCandidates.filter((c) => selectedCandidates.includes(c.id));
  const critList = activeCriteria.filter((c) => selectedCriteria.includes(c.id));

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary">Perhitungan PSI</h1>
        </div>

        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Konfigurasi Sesi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Sesi</label>
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder={`Sesi ${new Date().toLocaleDateString("id-ID")}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi sesi perhitungan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Pilih Kandidat ({selectedCandidates.length} dipilih)
                </label>
                <div className="rounded-lg border">
                  <div className="flex items-center gap-2 border-b px-3 py-2">
                    <input
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      placeholder="Cari nama kandidat..."
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-muted">
                        <tr>
                          <th className="w-10 p-2 text-left">
                            <Checkbox
                              checked={allCandidatesSelected ? true : someCandidatesSelected ? "indeterminate" : false}
                              onCheckedChange={(v) => toggleAllCandidates(!!v)}
                            />
                          </th>
                          <th className="p-2 text-left font-medium">Nama</th>
                          <th className="p-2 text-left font-medium">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCandidates.length > 0 ? (
                          filteredCandidates.map((c) => (
                            <tr key={c.id} className="border-t hover:bg-muted/50">
                              <td className="p-2">
                                <Checkbox
                                  checked={selectedCandidates.includes(c.id)}
                                  onCheckedChange={() => setSelectedCandidates(toggleSelect(selectedCandidates, c.id))}
                                />
                              </td>
                              <td className="p-2">{c.name}</td>
                              <td className="p-2 text-muted-foreground">{c.email}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="p-4 text-center text-muted-foreground">Tidak ada data.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Pilih Kriteria ({selectedCriteria.length} dipilih)
                </label>
                <div className="rounded-lg border">
                  <div className="flex items-center gap-2 border-b px-3 py-2">
                    <input
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      placeholder="Cari nama kriteria..."
                      value={criteriaSearch}
                      onChange={(e) => setCriteriaSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-muted">
                        <tr>
                          <th className="w-10 p-2 text-left">
                            <Checkbox
                              checked={allCriteriaSelected ? true : someCriteriaSelected ? "indeterminate" : false}
                              onCheckedChange={(v) => toggleAllCriteria(!!v)}
                            />
                          </th>
                          <th className="p-2 text-left font-medium">Kode</th>
                          <th className="p-2 text-left font-medium">Nama</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCriteria.length > 0 ? (
                          filteredCriteria.map((c) => (
                            <tr key={c.id} className="border-t hover:bg-muted/50">
                              <td className="p-2">
                                <Checkbox
                                  checked={selectedCriteria.includes(c.id)}
                                  onCheckedChange={() => setSelectedCriteria(toggleSelect(selectedCriteria, c.id))}
                                />
                              </td>
                              <td className="p-2">{c.code}</td>
                              <td className="p-2">{c.name}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="p-4 text-center text-muted-foreground">Tidak ada data.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Matriks Keputusan (Nilai Asli)</CardTitle>
            </CardHeader>
            <CardContent>
              {scoresLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat data nilai...
                </div>
              ) : (
                <>
                  {missingScores && (
                    <div className="mb-4 p-3 rounded-lg bg-orange-50 border border-orange-200 text-sm text-orange-800">
                      Beberapa kandidat belum memiliki nilai pada kriteria tertentu (ditampilkan sebagai 0).
                      Lengkapi nilai di halaman Kandidat terlebih dahulu.
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Kandidat</th>
                          {critList.map((c) => (
                            <th key={c.id} className="p-2 font-medium text-center">
                              {c.name}
                              <Badge variant={c.type === "benefit" ? "success" : "warning"} className="ml-1 text-[10px]">
                                {c.type === "benefit" ? "B" : "C"}
                              </Badge>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {candList.map((cand, i) => (
                          <tr key={cand.id} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="p-2 font-medium">{cand.name}</td>
                            {critList.map((crit, j) => {
                              const val = matrix[i]?.[j];
                              const label = matrixLabels[i]?.[j];
                              const isMissing = val === 0;
                              return (
                                <Tooltip key={crit.id}>
                                  <TooltipTrigger asChild>
                                    <td
                                      className={`p-2 text-center font-mono cursor-help ${isMissing ? "bg-red-50 text-red-500" : ""}`}
                                    >
                                      {isMissing ? "—" : formatNumber(val, 2)}
                                    </td>
                                  </TooltipTrigger>
                                  {label && (
                                    <TooltipContent side="top" className="text-xs">
                                      {label}
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {step === 2 && detail && (
          <div className="space-y-6">
            {stepFormulas.map((sf) => {
              const dataMap: Record<number, number[][] | number[]> = {
                0: detail.normalizedMatrix,
                1: [detail.meanValues],
                2: [detail.preferenceVariation],
                3: [detail.deviationPreference],
                4: [detail.overallPreference],
                5: [detail.psiScores],
              };
              const data = dataMap[sf.key] as number[][];
              const isVector = data.length === 1;
              const allValues = data.flat();
              const min = Math.min(...allValues);
              const max = Math.max(...allValues);

              return (
                <Card key={sf.key}>
                  <CardHeader>
                    <CardTitle className="text-sm">{sf.label}</CardTitle>
                    {sf.formula && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {sf.formula.general || (
                          <>
                            Benefit: {sf.formula.benefit} &nbsp;|&nbsp; Cost: {sf.formula.cost}
                          </>
                        )}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">
                            {isVector ? "Kriteria" : "Kandidat"}
                          </th>
                          {isVector
                            ? critList.map((c) => (
                                <th key={c.id} className="p-2 font-medium text-center">{c.name}</th>
                              ))
                            : critList.map((c) => (
                                <th key={c.id} className="p-2 font-medium text-center">{c.name}</th>
                              ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((row, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="p-2 font-medium">
                              {isVector
                                ? critList[i]?.name ?? ""
                                : candList[i]?.name ?? ""}
                            </td>
                            {(row as number[]).map((val: number, j: number) => (
                              <Tooltip key={j}>
                                <TooltipTrigger asChild>
                                  <td
                                    className="p-2 text-center font-mono cursor-help"
                                    style={{ backgroundColor: heatColor(val, min, max) }}
                                  >
                                    {val.toFixed(sf.decimals)}
                                  </td>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  <p className="font-mono">{val.toFixed(6)}</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {step === 3 && detail && (
          <Card>
            <CardHeader>
              <CardTitle>🏆 PSI Score & Ranking Akhir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {candList.map((cand, i) => {
                  const rank = [...detail.psiScores]
                    .map((s, idx) => ({ score: s, idx }))
                    .sort((a, b) => b.score - a.score)
                    .findIndex((item) => item.idx === i) + 1;
                  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
                  return (
                    <div
                      key={cand.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        rank === 1 ? "border-accent border-2 bg-accent/10" : "bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{medal}</span>
                        <div>
                          <p className="font-medium">{cand.name}</p>
                          <p className="text-sm text-muted-foreground">{cand.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{detail.psiScores[i].toFixed(4)}</p>
                        <p className="text-xs text-muted-foreground">PSI Score</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Sebelumnya
          </Button>
          {step < 3 ? (
            <Button onClick={goNext} disabled={scoresLoading}>
              {scoresLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Selanjutnya <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={calcLoading}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {calcLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Simpan Hasil
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
