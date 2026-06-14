import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "@/components/ui/icons";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import type { Candidate, Criteria, SubCriteria } from "@/types";

interface ScoreWithSub {
  criteriaId: number;
  value: number;
  subCriteriaId?: number;
}

export default function CandidateDetail() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [subCriteria, setSubCriteria] = useState<Record<number, SubCriteria[]>>({});
  const [scores, setScores] = useState<Record<number, ScoreWithSub>>({});
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<Candidate>(`/candidates/${id}`),
      api.get<Criteria[]>("/criteria"),
      api.get<ScoreWithSub[]>(`/candidates/${id}/scores`),
    ]).then(([cand, crits, scs]) => {
      setCandidate(cand);
      setCriteria(crits);
      const map: Record<number, ScoreWithSub> = {};
      scs.forEach((s) => { map[s.criteriaId] = s; });
      setScores(map);
      setInitializing(false);
    });
  }, [id]);

  useEffect(() => {
    Promise.all(
      criteria.map((c) =>
        api.get<SubCriteria[]>(`/criteria/${c.id}/sub-criteria`).then((list) => ({ [c.id]: list })),
      ),
    ).then((results) => {
      setSubCriteria(Object.assign({}, ...results));
    });
  }, [criteria]);

  const filledCount = criteria.filter((c) => scores[c.id] && scores[c.id].value > 0).length;
  const progress = criteria.length > 0 ? (filledCount / criteria.length) * 100 : 0;

  const handleSelect = (criteriaId: number, sc: SubCriteria) => {
    setScores({ ...scores, [criteriaId]: { criteriaId, value: sc.weight, subCriteriaId: sc.id } });
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const entries = Object.values(scores);
      for (const s of entries) {
        await api.post(`/candidates/${id}/scores`, {
          criteriaId: s.criteriaId,
          value: s.value,
          subCriteriaId: s.subCriteriaId,
        });
      }
      const updated = await api.get<ScoreWithSub[]>(`/candidates/${id}/scores`);
      const map: Record<number, ScoreWithSub> = {};
      updated.forEach((s) => { map[s.criteriaId] = s; });
      setScores(map);
      toast.success(`${entries.length} nilai berhasil disimpan`);
    } catch (err) {
      toast.error(`Gagal menyimpan nilai: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!candidate || initializing) return <div className="text-center py-8 text-muted-foreground">Memuat...</div>;

  const selectedWeight = (scId: number) => {
    const s = Object.values(scores).find((sc) => sc.subCriteriaId === scId);
    return s?.subCriteriaId === scId;
  };

  const scoreLabel: Record<number, string> = { 5: "Sangat Baik", 4: "Baik", 3: "Cukup", 2: "Kurang", 1: "Sangat Kurang" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/candidates">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-primary">{candidate.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Input Nilai</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Kelengkapan</span>
              <span className="font-medium">{filledCount}/{criteria.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            {criteria.map((c) => {
              const scList = subCriteria[c.id] ?? [];
              const isMissing = !scores[c.id] || scores[c.id].value === 0;
              return (
                <div key={c.id} className={`p-4 rounded-lg border ${isMissing ? "border-red-300 bg-red-50" : "border-border"}`}>
                  <label className="block text-sm font-medium mb-2">
                    {c.name}
                    <span className="ml-1 text-xs text-muted-foreground">({c.type})</span>
                  </label>
                  {scList.length > 0 ? (
                    <div className="space-y-1">
                      {scList.map((sc) => {
                        const sel = selectedWeight(sc.id);
                        return (
                          <label
                            key={sc.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md border cursor-pointer transition-colors ${sel
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border hover:border-primary"
                              }`}
                          >
                            <input
                              type="radio"
                              name={`criteria-${c.id}`}
                              checked={sel}
                              onChange={() => handleSelect(c.id, sc)}
                              className="accent-white"
                            />
                            <span className="flex-1 text-sm">{sc.name}</span>
                            <span className="text-xs text-muted-foreground mr-1">{scoreLabel[sc.weight]}</span>
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${sel ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                              }`}>
                              {sc.weight}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Belum ada sub-kriteria. Tambah di halaman Kriteria terlebih dahulu.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Nilai"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
