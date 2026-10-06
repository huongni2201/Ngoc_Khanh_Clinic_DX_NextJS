"use client"

import * as React from "react"
import { OrganizationDetail } from "../types"

interface OrganizationInfoCardProps {
  organization: OrganizationDetail
}

export function OrganizationInfoCard({ organization }: OrganizationInfoCardProps) {
  const fields = [
    {
      label: "Tên đơn vị",
      value: organization.name,
    },
    {
      label: "Mã số thuế",
      value: organization.taxCode || "—",
    },
    {
      label: "Người liên hệ",
      value: organization.contactName || "—",
    },
    {
      label: "Số điện thoại",
      value: organization.contactPhone || "—",
    },
    { label: "Điện thoại đơn vị", value: organization.phone },
    { label: "Email đơn vị", value: organization.email },
    { label: "Email người liên hệ", value: organization.contactEmail },
    {
      label: "Địa chỉ",
      value: organization.address || "—",
    },
  ]

  return (
    <div className="w-full rounded-lg border border-border bg-card p-6 sm:p-8 ">
      <h2 className="text-lg font-bold tracking-tight text-foreground mb-4 sm:mb-6">
        Thông tin đơn vị
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

