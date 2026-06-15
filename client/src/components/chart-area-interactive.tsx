import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"

interface RankingItem {
  name: string
  score: number
  rank: number
}

export function ChartAreaInteractive({
  data,
  sessionName,
  variant = "card",
}: {
  data: RankingItem[]
  sessionName?: string
  variant?: "card" | "content"
}) {
  const barData = useMemo(
    () => data.map((d) => ({
      name: d.name,
      rank1: d.rank === 1 ? d.score : undefined,
      rank2: d.rank === 2 ? d.score : undefined,
      rank3: d.rank === 3 ? d.score : undefined,
      rank4: d.rank === 4 ? d.score : undefined,
      rank5: d.rank === 5 ? d.score : undefined,
    })),
    [data],
  )

  const header = (
    <div>
      <h3 className="text-lg font-semibold">Top 5 Kandidat</h3>
      <p className="text-sm text-muted-foreground">
        {sessionName ?? "Hasil perhitungan PSI terbaru"}
      </p>
    </div>
  )

  const chart = data.length > 0 ? (
    <ChartContainer
      config={{}}
      className="aspect-auto h-full w-full"
    >
      <BarChart
        data={barData}
        margin={{ top: 5, right: 20, bottom: 60, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12 }}
        />
        <YAxis
          type="number"
          domain={[0, 1]}
          tickFormatter={(v: number) => v.toFixed(2)}
        />
        <ChartTooltip
          cursor={false}
          content={({ active, payload, label }: any) => {
            if (!active || !payload?.length) return null
            const item = payload[0]
            return (
              <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                <p className="mb-0.5 text-sm font-medium">{label}</p>
                <p className="flex items-center gap-1.5 text-xs">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name} :</span>
                  <span className="font-bold text-foreground"> {Number(item.value).toFixed(4)}</span>
                </p>
              </div>
            )
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: 8, fontSize: 12 }}
          iconSize={10}
          formatter={(value: string) => (
            <span className="text-xs text-muted-foreground">{value}</span>
          )}
        />
        <Bar dataKey="rank1" name="Peringkat 1" fill="#F0A500" radius={4} stackId="a" />
        <Bar dataKey="rank2" name="Peringkat 2" fill="#94A3B8" radius={4} stackId="a" />
        <Bar dataKey="rank3" name="Peringkat 3" fill="#CD7F32" radius={4} stackId="a" />
        <Bar dataKey="rank4" name="Peringkat 4" fill="#2E86AB" radius={4} stackId="a" />
        <Bar dataKey="rank5" name="Peringkat 5" fill="#1E3A5F" radius={4} stackId="a" />
      </BarChart>
    </ChartContainer>
  ) : (
    <p className="text-sm text-muted-foreground py-8 text-center">
      Belum ada data perhitungan. Lakukan perhitungan PSI terlebih dahulu.
    </p>
  )

  if (variant === "content") {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 pb-0 shrink-0">{header}</div>
        <div className="px-2 pt-4 sm:px-6 sm:pt-6 pb-6 flex-1 min-h-0">{chart}</div>
      </div>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>{header}</CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">{chart}</CardContent>
    </Card>
  )
}
