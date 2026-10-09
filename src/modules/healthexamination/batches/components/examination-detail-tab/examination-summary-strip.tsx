import { Skeleton } from "@/components/ui/skeleton"
import type { ExaminationSummary } from "../../types"

interface ExaminationSummaryStripProps {
  summary?: ExaminationSummary
  isLoading?: boolean
}

const CARDS: { key: keyof ExaminationSummary; label: string; tone: string }[] = [
  { key: "registered", label: "Đăng ký", tone: "text-foreground" },
  { key: "unconfirmed", label: "Chưa đến", tone: "text-muted-foreground" },
  { key: "attended", label: "Đã đến", tone: "text-primary" },
  { key: "absent", label: "Vắng", tone: "text-muted-foreground" },
  { key: "pendingReconciliation", label: "Chờ đối soát", tone: "text-status-in-progress" },
  { key: "reconciled", label: "Đã đối soát", tone: "text-status-completed" },
]

/** Counters of the active roster. Cancelled Participants are never counted by the backend. */
export function ExaminationSummaryStrip({ summary, isLoading = false }: ExaminationSummaryStripProps) {
  return (
    <dl aria-label="Số liệu chi tiết khám" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {CARDS.map((card) => (
        <div key={card.key} className="space-y-1 rounded-lg border border-border bg-card p-3">
          <dt className="block text-[11px] font-medium text-muted-foreground">{card.label}</dt>
          <dd className={`block text-lg font-bold ${card.tone}`}>
            {isLoading || !summary ? <Skeleton className="h-6 w-10" /> : summary[card.key]}
          </dd>
        </div>
      ))}
    </dl>
  )
}
