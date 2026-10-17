"use client"

import { Card, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatVND } from "@/shared/ui"
import { MISSING_SERVICE_NAME } from "../utils/agreement-form-values"
import type { HealthExaminationAgreement } from "../types"

interface HealthExaminationAgreementOverviewProps {
  agreement: HealthExaminationAgreement
}

/** The service lines (with their negotiated prices) of one agreement. Read-only: a draft is edited in its form. */
export function HealthExaminationAgreementOverview({
  agreement,
}: HealthExaminationAgreementOverviewProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="border-b border-border px-5 py-4">
        <h2 id="agreement-services-heading" className="text-base font-semibold text-foreground">
          Dịch vụ và giá thỏa thuận
        </h2>
      </CardHeader>
      <Table aria-labelledby="agreement-services-heading">
        <TableHeader>
          <TableRow className="border-b border-border bg-table-header-bg hover:bg-table-header-bg">
            <TableHead className="h-10 w-14 px-4 text-center text-xs font-semibold">STT</TableHead>
            <TableHead className="h-10 px-4 text-xs font-semibold">Hạng mục</TableHead>
            <TableHead className="h-10 px-4 text-right text-xs font-semibold">Giá tham chiếu</TableHead>
            <TableHead className="h-10 px-4 text-right text-xs font-semibold">Giá thỏa thuận</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agreement.services.map((service, index) => {
            // Lines retired before this screen became read-only stay listed, marked.
            const retired = service.active === false
            return (
              <TableRow key={service.id} className={retired ? "opacity-60" : undefined}>
                <TableCell className="px-4 py-3 text-center text-xs text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-normal">
                  <div className="text-sm font-medium text-foreground">
                    {service.name ?? MISSING_SERVICE_NAME}
                    {retired && (
                      <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Đã ngừng
                      </span>
                    )}
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
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
