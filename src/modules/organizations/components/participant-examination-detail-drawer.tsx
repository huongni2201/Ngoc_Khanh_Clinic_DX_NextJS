"use client"

import * as React from "react"
import Link from "next/link"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  User,
} from "@/shared/ui/product-icon"
import type {
  ParticipantExaminationProgress,
  ClinicalServiceColumn,
} from "@/modules/health-examinations"

interface ParticipantExaminationDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  participant: ParticipantExaminationProgress | null
  batchName?: string
  batchExamDate?: string
  services?: ClinicalServiceColumn[]
}

export function ParticipantExaminationDetailDrawer({
  open,
  onOpenChange,
  participant,
  batchName,
  batchExamDate,
  services = [],
}: ParticipantExaminationDetailDrawerProps) {
  if (!participant) return null

  const isCompleted = participant.examStatus === "COMPLETED"
  const isInProgress = participant.examStatus === "IN_PROGRESS"
  const isNotStarted = participant.examStatus === "NOT_STARTED"

  const encounterCode = `ENC-${participant.participantCode || participant.id.slice(-6).toUpperCase()}`
  const mockPatientId = `PAT-${participant.id.slice(-6).toUpperCase()}`
  const checkInDate = isNotStarted ? "Chưa tiếp nhận" : batchExamDate || "18/09/2026 08:15"
  const currentDoctor = isNotStarted
    ? "Chưa phân bổ"
    : isCompleted
    ? "BS.CKI Nguyễn Văn Hùng · Phòng Khám Nội"
    : "BS. Trần Mai Anh · Phòng Khám Chuyên khoa"

  const completedServicesCount = participant.completedServiceIds.length
  const totalServicesCount = services.length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto p-0 border-l border-border bg-background"
      >
        {/* 1. Header with Metadata */}
        <SheetHeader className="border-b border-border bg-card p-6">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="space-y-1">
              <SheetTitle className="text-base font-bold text-foreground">
                {participant.fullName}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                <span>Mã: <strong className="text-foreground">{participant.participantCode || "—"}</strong></span>
                <span>•</span>
                <span>CCCD: <strong className="text-foreground">{participant.identificationNumber || "—"}</strong></span>
                {participant.organizationUnit && (
                  <>
                    <span>•</span>
                    <span>{participant.organizationUnit}</span>
                  </>
                )}
              </SheetDescription>
            </div>

            {/* Status Badge */}
            <div>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-status-completed-bg px-2.5 py-1 text-xs font-medium text-status-completed">
                  <CheckCircle2 className="size-3" />
                  Hoàn thành
                </span>
              ) : isInProgress ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-status-in-progress-bg px-2.5 py-1 text-xs font-medium text-status-in-progress">
                  <Clock className="size-3" />
                  Đang khám
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <AlertCircle className="size-3" />
                  Chưa đến
                </span>
              )}
            </div>
          </div>

          {/* Quick clinical links */}
          <div className="mt-3 flex items-center gap-3 pt-3 border-t border-border/60 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>Hồ sơ bệnh nhân:</span>
              {!isNotStarted ? (
                <Link
                  href={`/patients/${mockPatientId}`}
                  className="font-medium text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  {mockPatientId}
                  <ExternalLink className="size-3 ml-0.5" />
                </Link>
              ) : (
                <span className="italic text-muted-foreground">Chưa liên kết</span>
              )}
            </div>

            <span className="text-border">|</span>

            <div className="flex items-center gap-1 text-muted-foreground">
              <span>Mã lượt khám:</span>
              {!isNotStarted ? (
                <Link
                  href={`/encounters/${encounterCode}`}
                  className="font-medium text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  {encounterCode}
                  <ExternalLink className="size-3 ml-0.5" />
                </Link>
              ) : (
                <span className="italic text-muted-foreground">Chưa khởi tạo</span>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {/* 2. Encounter Summary */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Thông tin tiếp nhận & Khám lâm sàng
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Đợt khám:</span>
                <span className="font-medium text-foreground">{batchName || "Đợt khám sức khỏe"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Thời gian tiếp nhận:</span>
                <span className="font-medium text-foreground">{checkInDate}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block">Bác sĩ / Phòng phụ trách:</span>
                <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                  <User className="size-3.5 text-muted-foreground" />
                  {currentDoctor}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Service Progress Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tiến độ dịch vụ ({completedServicesCount}/{totalServicesCount})
              </h4>
              <span className="text-xs text-muted-foreground">
                {totalServicesCount > 0
                  ? `${Math.round((completedServicesCount / totalServicesCount) * 100)}% hoàn thành`
                  : "0%"}
              </span>
            </div>

            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 border-b border-border">
                    <TableHead className="h-8 px-3 text-xs font-semibold text-foreground">
                      Hạng mục khám
                    </TableHead>
                    <TableHead className="h-8 px-3 text-xs font-semibold text-foreground text-center w-28">
                      Trạng thái
                    </TableHead>
                    <TableHead className="h-8 px-3 text-xs font-semibold text-foreground text-center w-28">
                      Kết quả
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-4 text-center text-xs text-muted-foreground">
                        Không có dịch vụ nào trong đợt khám.
                      </TableCell>
                    </TableRow>
                  ) : (
                    services.map((svc) => {
                      const isServiceDone = participant.completedServiceIds.includes(svc.id)
                      const isPendingService = !isNotStarted && !isServiceDone

                      return (
                        <TableRow key={svc.id} className="border-b border-border/60 hover:bg-muted/30">
                          <TableCell className="px-3 py-2 text-xs font-medium text-foreground">
                            {svc.name}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-center">
                            {isServiceDone ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-status-completed">
                                <CheckCircle2 className="size-3" />
                                Hoàn thành
                              </span>
                            ) : isPendingService ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-status-in-progress">
                                <Clock className="size-3" />
                                Đang khám
                              </span>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">
                                Chưa khám
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-center text-xs">
                            {isServiceDone ? (
                              <span className="text-[11px] font-medium text-primary">
                                Có kết quả
                              </span>
                            ) : isPendingService ? (
                              <span className="text-[11px] text-muted-foreground italic">
                                Chờ kết quả
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 4. Conclusion & Encounter Navigation */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Kết luận khám sức khỏe
            </h4>

            {isCompleted ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-status-completed font-medium">
                  <CheckCircle2 className="size-4" />
                  <span>Đã kết luận: Đủ sức khỏe làm việc loại I</span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Bác sĩ kết luận thể lực tốt, không phát hiện bệnh lý mạn tính hạn chế lao động. Đã cấp giấy chứng nhận sức khỏe định kỳ.
                </p>
              </div>
            ) : isInProgress ? (
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 text-status-in-progress font-medium">
                  <Clock className="size-4" />
                  <span>Chờ hoàn thành dịch vụ cận lâm sàng để kết luận</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Người khám đang thực hiện các xét nghiệm/chẩn đoán hình ảnh. Bác sĩ tổng quát sẽ kết luận sau khi có đủ kết quả.
                </p>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Người khám chưa tiếp nhận tại phòng khám.
              </div>
            )}

            {!isNotStarted && (
              <div className="pt-2 border-t border-border/60">
                <Link href={`/encounters/${encounterCode}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs h-8">
                    <ExternalLink className="size-3.5 mr-1.5" />
                    Mở hồ sơ lượt khám chi tiết
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
