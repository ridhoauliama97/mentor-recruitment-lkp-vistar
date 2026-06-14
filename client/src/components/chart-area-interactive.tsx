import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface RankingItem {
  name: string
  score: number
  rank: number
}

export function ChartAreaInteractive({
  data,
  sessionName,
}: {
  data: RankingItem[]
  sessionName?: string
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Top Kandidat</CardTitle>
        <CardDescription>
          {sessionName
            ? `Berdasarkan ${sessionName}`
            : "Hasil perhitungan PSI terbaru"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {data.length > 0 ? (
          <ChartContainer
            config={{}}
            className="aspect-auto h-[300px] w-full"
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 100, right: 20, top: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 1]}
                tickFormatter={(v: number) => v.toFixed(2)}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent indicator="dot" />
                }
              />
              <Bar
                dataKey="score"
                fill="hsl(var(--chart-1))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Belum ada data perhitungan. Lakukan perhitungan PSI terlebih dahulu.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
