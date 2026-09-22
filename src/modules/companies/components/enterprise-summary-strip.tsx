"use client"

import * as React from "react"
import { Building2, User, Phone, MapPin } from "lucide-react"
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
      icon: Building2,
      label: "Mã doanh nghiệp",
      value: enterprise.code,
    },
    {
      icon: User,
      label: "Người liên hệ",
      value: enterprise.contactName || enterprise.contactPerson || "Chưa cập nhật",
    },
    {
      icon: Phone,
      label: "Số điện thoại",
      value: enterprise.phone || enterprise.contactPhone || "Chưa cập nhật",
    },
    {
      icon: MapPin,
      label: "Địa chỉ",
      value: displayAddress,
    },
  ]

  return (
    <div className="w-full rounded-xl border border-border bg-card px-6 py-4.5 shadow-2xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0">
        {summaryItems.map((item, index) => {
          const Icon = item.icon
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
              <Icon className="size-5 shrink-0 text-secondary-foreground stroke-[1.75]" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted-foreground leading-tight">
                  {item.label}
                </span>
                <span
                  className="text-sm font-bold text-foreground tracking-tight leading-snug truncate mt-0.5"
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
