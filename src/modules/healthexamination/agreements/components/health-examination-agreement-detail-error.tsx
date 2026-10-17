"use client"

import Link from "next/link"
import { AlertCircle, ArrowLeft, RefreshCw } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { ScreenLayout } from "@/shared/ui"

interface HealthExaminationAgreementDetailErrorProps {
  notFound: boolean
  error: unknown
  agreementsHref: string
  onRetry: () => void
}

export function HealthExaminationAgreementDetailError({
  notFound,
  error,
  agreementsHref,
  onRetry,
}: HealthExaminationAgreementDetailErrorProps) {
  return (
  <ScreenLayout
    data-slot="health-examination-agreement-detail-error"
    className="items-center justify-center py-12 text-center"
  >
    <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
      <AlertCircle className="size-7" />
    </div>
    <h2 className="text-lg font-bold text-foreground">
      {notFound ? "Không tìm thấy thỏa thuận" : "Không thể tải dữ liệu thỏa thuận"}
    </h2>
    <p role="alert" className="mt-1 mb-6 max-w-md text-xs text-muted-foreground">
      {error instanceof Error ? error.message : "Đã xảy ra lỗi khi tải thỏa thuận."}
    </p>
    <div className="flex items-center gap-3">
      <Link href={agreementsHref}>
        <Button variant="outline" size="sm" className="h-9 text-xs">
          <ArrowLeft className="mr-1.5 size-3.5" />
          Về danh sách thỏa thuận
        </Button>
      </Link>
      {!notFound && (
        <Button size="sm" onClick={onRetry} className="h-9 text-xs">
          <RefreshCw className="mr-1.5 size-3.5" />
          Thử lại
        </Button>
      )}
    </div>
  </ScreenLayout>
  )
}
