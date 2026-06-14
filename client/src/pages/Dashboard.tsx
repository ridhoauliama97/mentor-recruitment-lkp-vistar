import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { api } from "@/lib/api";
import type { DashboardStats, PSIResult } from "@/types";
import type {
  ColumnDef,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

interface CandidateRow {
  rank: number;
  name: string;
  score: number;
  recommended: boolean;
}

const columns: ColumnDef<CandidateRow>[] = [
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

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topCandidates, setTopCandidates] = useState<PSIResult | null>(null);

  useEffect(() => {
    api.get<DashboardStats>("/dashboard/stats").then(setStats).catch(() => {});
    api.get<PSIResult>("/psi/sessions/latest").then(setTopCandidates).catch(() => {});
  }, []);

  const chartData = topCandidates?.rankings.slice(0, 5).map((r) => ({
    name: r.candidate.name,
    score: Number(r.psiScore.toFixed(4)),
    rank: r.rank,
  })) ?? [];

  const tableData: CandidateRow[] = topCandidates?.rankings.map((r) => ({
    rank: r.rank,
    name: r.candidate.name,
    score: Number(r.psiScore.toFixed(4)),
    recommended: r.isRecommended,
  })) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <Link to="/calculation">
          <Button>
            <Plus />
            Hitung PSI Baru
          </Button>
        </Link>
      </div>

      <SectionCards
        totalCandidates={stats?.totalCandidates ?? 0}
        totalCriteria={stats?.totalCriteria ?? 0}
        totalSessions={stats?.totalSessions ?? 0}
      />

      <ChartAreaInteractive
          data={chartData}
          sessionName={topCandidates?.sessionName}
        />

      {tableData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hasil Ranking</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable columns={columns} data={tableData} pageSize={5} />
          </CardContent>
        </Card>
      )}

      <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link to="/candidates" className="block">
              <Button variant="outline" className="w-full justify-between">
                Kelola Kandidat <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/criteria" className="block">
              <Button variant="outline" className="w-full justify-between">
                Kelola Kriteria <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/results" className="block">
              <Button variant="outline" className="w-full justify-between">
                Lihat Hasil <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
    </div>
  );
}
