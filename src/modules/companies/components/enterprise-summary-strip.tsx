"use client"

import { EnterpriseDetail } from "../types"

interface EnterpriseSummaryStripProps {
  enterprise: EnterpriseDetail
}

export function EnterpriseSummaryStrip({
  enterprise,
}: EnterpriseSummaryStripProps) {
  const displayAddress =
    enterprise.shortAddress || enterprise.address || "Chưa cập nhật"

  const summaryItems = [
    {
      label: "Mã doanh nghiệp",
      value: enterprise.code,
    },
    {
      label: "Người liên hệ",
      value: enterprise.contactName || enterprise.contactPerson || "Chưa cập nhật",
    },
    {
      label: "Số điện thoại",
      value: enterprise.phone || enterprise.contactPhone || "Chưa cập nhật",
    },
    {
      label: "Địa chỉ",
      value: displayAddress,
    },
  ]

  return (
    <div className="w-full rounded-lg border border-border bg-card px-5 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0">
        {summaryItems.map((item, index) => {
          const isLast = index === summaryItems.length - 1

          return (
            <div
              key={item.label}
              className={`flex items-center gap-3.5 ${
                index > 0 ? "lg:pl-6" : ""
              } ${
                !isLast ? "lg:border-r lg:border-border lg:pr-6" : ""
              }`}
            >
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted-foreground leading-tight">
                  {item.label}
                </span>
                <span
                  className="mt-0.5 truncate text-sm font-semibold leading-snug tracking-tight text-foreground"
                  title={item.value}
                >
                  {item.value}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
