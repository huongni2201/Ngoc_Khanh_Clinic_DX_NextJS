"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { InfoList, formatVND } from "@/shared/ui"
import { MISSING_SERVICE_NAME } from "../utils/batch-form-values"
import { EXAMINATION_SITE_TYPE_LABELS } from "../utils/batch-labels"
import { formatHealthExaminationDate } from "../utils/format-health-examination-date"
import type { HealthExaminationBatch } from "../types"

export function HealthExaminationBatchOverview({ batch }: { batch: HealthExaminationBatch }) {
  return (
    <div className="space-y-6">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b border-border px-5 py-4">
          <h2 id="batch-site-heading" className="text-base font-semibold text-foreground">
            Địa điểm và ngày khám
          </h2>
        </CardHeader>
        <CardContent className="space-y-4 px-5 py-4">
          <InfoList
            layout="inline"
            items={[
              { label: "Loại địa điểm", value: EXAMINATION_SITE_TYPE_LABELS[batch.examinationSiteType] },
              { label: "Tên địa điểm", value: batch.examinationSiteName },
              { label: "Địa chỉ", value: batch.examinationSiteAddress },
            ]}
          />
          <ul aria-label="Ngày khám" className="flex flex-wrap gap-2 border-t border-divider pt-4">
            {batch.examinationDates.map((date) => (
              <li
                key={date}
                className="rounded-md border border-border bg-surface-alt px-2.5 py-1 text-xs font-medium tabular-nums text-foreground"
              >
                {formatHealthExaminationDate(date)}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="border-b border-border px-5 py-4">
          <h2 id="batch-services-heading" className="text-base font-semibold text-foreground">
            Dịch vụ và giá thỏa thuận
          </h2>
        </CardHeader>
        <Table aria-labelledby="batch-services-heading">
          <TableHeader>
            <TableRow className="border-b border-border bg-table-header-bg hover:bg-table-header-bg">
              <TableHead className="h-10 w-14 px-4 text-center text-xs font-semibold">STT</TableHead>
              <TableHead className="h-10 px-4 text-xs font-semibold">Hạng mục</TableHead>
              <TableHead className="h-10 px-4 text-right text-xs font-semibold">Giá tham chiếu</TableHead>
              <TableHead className="h-10 px-4 text-right text-xs font-semibold">Giá thỏa thuận</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batch.services.map((service, index) => (
              <TableRow key={service.id}>
                <TableCell className="px-4 py-3 text-center text-xs text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-normal">
                  <div className="text-sm font-medium text-foreground">
                    {service.name ?? MISSING_SERVICE_NAME}
                  </div>
                  {service.code && (
                    <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                      Mã: {service.code}
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-sm tabular-nums text-muted-foreground">
                  {formatVND(service.referencePrice)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-sm font-medium tabular-nums text-foreground">
                  {formatVND(service.negotiatedPrice)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
