"use client"

import { Calendar, ListChecks, Clock } from "@/shared/ui/product-icon"
import { Card, CardContent } from "@/components/ui/card"
import { HealthExaminationAgreement } from "../types"
import { formatHealthExaminationDate, formatValidityRange } from "../utils/format-health-examination-date"

interface HealthExaminationAgreementSummaryStripProps {
  agreement: HealthExaminationAgreement
}

export function HealthExaminationAgreementSummaryStrip({
  agreement,
}: HealthExaminationAgreementSummaryStripProps) {
  const offered = agreement.services.filter((service) => service.active !== false).length
  const retired = agreement.services.length - offered
  const items = [
    {
      icon: Calendar,
      label: "Thời gian áp dụng",
      value: formatValidityRange(agreement.validFrom, agreement.validTo),
    },
    {
      icon: ListChecks,
      label: "Dịch vụ",
      value: retired > 0 ? `${offered} hạng mục (${retired} đã ngừng)` : `${offered} hạng mục`,
    },
    {
      icon: Clock,
      label: "Cập nhật lần cuối",
      value: formatHealthExaminationDate(agreement.updatedAt),
    },
  ]

  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-0">
        <dl className="grid grid-cols-1 divide-y divide-divider sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {items.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-5 py-4">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-selected text-primary"
              >
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 truncate text-sm font-semibold text-foreground" title={value}>
                  {value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
