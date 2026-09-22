"use client"

import * as React from "react"
import { EnterpriseDetail } from "../types"

interface EnterpriseInfoCardProps {
  enterprise: EnterpriseDetail
}

export function EnterpriseInfoCard({ enterprise }: EnterpriseInfoCardProps) {
  const fields = [
    {
      label: "Tên doanh nghiệp",
      value: enterprise.name,
    },
    {
      label: "Mã số thuế",
      value: enterprise.taxCode || "—",
    },
    {
      label: "Người liên hệ",
      value: enterprise.contactName || enterprise.contactPerson || "—",
    },
    {
      label: "Số điện thoại",
      value: enterprise.phone || enterprise.contactPhone || "—",
    },
    {
      label: "Email",
      value: enterprise.email || "—",
    },
    {
      label: "Địa chỉ",
      value: enterprise.address || "—",
    },
    {
      label: "Ghi chú",
      value: enterprise.note || "—",
    },
  ]

  return (
    <div className="w-full rounded-xl border border-border bg-card p-6 sm:p-8 shadow-2xs">
      <h2 className="text-lg font-bold tracking-tight text-foreground mb-4 sm:mb-6">
        Thông tin doanh nghiệp
      </h2>

      <div className="divide-y divide-table-divider">
        {fields.map((field) => (
          <div
            key={field.label}
            className="flex flex-col sm:flex-row sm:items-start py-4 first:pt-0 last:pb-0"
          >
            <span className="w-48 sm:w-64 shrink-0 text-sm text-secondary-foreground font-normal">
              {field.label}
            </span>
            <span className="mt-1 sm:mt-0 flex-1 text-sm font-medium text-foreground break-words">
              {field.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
