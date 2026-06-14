import { TrendingUpIcon } from "lucide-react"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
      description: "Calon coach AI Engineer",
      footer: "Data kandidat yang terdaftar",
    },
    {
      title: "Total Kriteria",
      value: totalCriteria,
      description: "Kriteria penilaian",
      footer: "Semua bertipe Benefit",
    },
    {
      title: "Sesi Perhitungan",
      value: totalSessions,
      description: "Sesi PSI tersimpan",
      footer: "Hasil bersifat tetap (immutable)",
    },
    {
      title: "Nilai Maksimal",
      value: 5,
      description: "Skala penilaian",
      footer: "1 = Sangat Kurang, 5 = Sangat Baik",
    },
  ]

  return (
    <div     className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
      {cards.map((card) => (
        <Card key={card.title} className="@container/card">
          <CardHeader className="relative">
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {card.value}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {card.footer} <TrendingUpIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">{card.description}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
