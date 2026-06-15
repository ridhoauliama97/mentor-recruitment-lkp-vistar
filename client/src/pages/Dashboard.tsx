import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalculatorIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { usePSIStore } from "@/stores/psiStore";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/types";
import type {
  ColumnDef,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { sessions, currentResult, fetchSessions, fetchSession } = usePSIStore();
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  useEffect(() => {
    api.get<DashboardStats>("/dashboard/stats").then(setStats).catch(() => { });
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const latest = String(sessions[0].sessionId);
      setSelectedSessionId(latest);
      fetchSession(Number(latest));
    }
  }, [sessions, selectedSessionId, fetchSession]);

  const handleSessionChange = (value: string) => {
    setSelectedSessionId(value);
    fetchSession(Number(value));
  };

  const chartData = currentResult?.rankings.slice(0, 5).map((r) => ({
    name: r.candidate.name,
    score: Number(r.psiScore.toFixed(4)),
    rank: r.rank,
  })) ?? [];

  const tableData: CandidateRow[] = currentResult?.rankings.map((r) => ({
    rank: r.rank,
    name: r.candidate.name,
    score: Number(r.psiScore.toFixed(4)),
    recommended: r.isRecommended,
  })) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      </div>

      <SectionCards
        totalCandidates={stats?.totalCandidates ?? 0}
        totalCriteria={stats?.totalCriteria ?? 0}
        totalSessions={stats?.totalSessions ?? 0}
      />

      {sessions.length >= 1 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Pilih Sesi Perhitungan:</span>
          <Select value={selectedSessionId} onValueChange={handleSessionChange}>
            <SelectTrigger className="h-8 w-[200px]">
              <SelectValue placeholder="Pilih sesi..." />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.sessionId} value={String(s.sessionId)}>
                  {s.sessionName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalculatorIcon />
                </EmptyMedia>
                <EmptyTitle>Belum Ada Sesi Perhitungan</EmptyTitle>
                <EmptyDescription>
                  Belum ada sesi perhitungan PSI. Buat sesi baru untuk melihat hasil ranking kandidat.
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
      ) : (
        <>
          <Card>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className={tableData.length > 0 ? "lg:border-r h-full" : "h-full"}>
                <ChartAreaInteractive
                  variant="content"
                  data={chartData}
                  sessionName={currentResult?.sessionName}
                />
              </div>
              {tableData.length > 0 && (
                <div className="p-6">
                  <h3 className="mb-1 text-lg font-semibold">Hasil Ranking</h3>
                  {currentResult?.sessionName && (
                    <p className="mb-4 text-sm text-muted-foreground">{currentResult.sessionName}</p>
                  )}
                  <DataTable columns={columns} data={tableData} pageSize={5} />
                </div>
              )}
            </div>
          </Card>

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
        </>
      )}
    </div>
  );
}
