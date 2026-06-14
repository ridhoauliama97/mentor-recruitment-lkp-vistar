import { Users, ListChecks, BarChart3, Star } from "@/components/ui/icons"
import { Card, CardContent } from "@/components/ui/card"

export function SectionCards({
  totalCandidates,
  totalCriteria,
  totalSessions,
}: {
  totalCandidates: number
  totalCriteria: number
  totalSessions: number
}) {
  const cards = [
    {
      title: "Total Kandidat",
      value: totalCandidates,
      icon: Users,
    },
    {
      title: "Total Kriteria",
      value: totalCriteria,
      icon: ListChecks,
    },
    {
      title: "Sesi Perhitungan",
      value: totalSessions,
      icon: BarChart3,
    },
    {
      title: "Nilai Maksimal",
      value: 5,
      icon: Star,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
