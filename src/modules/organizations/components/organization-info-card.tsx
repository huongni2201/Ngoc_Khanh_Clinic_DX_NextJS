"use client"

import { InfoList } from "@/shared/ui"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { OrganizationDetail } from "../types"

interface OrganizationInfoCardProps {
  organization: OrganizationDetail
}

/** Reference card shown beside the batch list, so contact details are one glance away. */
export function OrganizationInfoCard({ organization }: OrganizationInfoCardProps) {
  return (
    <Card data-slot="organization-info-card" className="gap-0 py-0">
      <CardHeader className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">Thông tin đơn vị</h2>
      </CardHeader>
      <CardContent className="space-y-5 px-5 py-4">
        <section aria-labelledby="organization-contact-heading" className="space-y-3">
          <h3
            id="organization-contact-heading"
            className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground"
          >
            Người liên hệ
          </h3>
          <InfoList
            items={[
              { label: "Họ và tên", value: organization.contactName },
              { label: "Số điện thoại", value: organization.contactPhone, mono: true },
              { label: "Email", value: organization.contactEmail },
            ]}
          />
        </section>
        <section
          aria-labelledby="organization-general-heading"
          className="space-y-3 border-t border-border pt-5"
        >
          <h3
            id="organization-general-heading"
            className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground"
          >
            Đơn vị
          </h3>
          <InfoList
            items={[
              { label: "Mã số thuế", value: organization.taxCode, mono: true },
              { label: "Điện thoại đơn vị", value: organization.phone, mono: true },
              { label: "Email đơn vị", value: organization.email },
              { label: "Địa chỉ", value: organization.address },
            ]}
          />
        </section>
      </CardContent>
    </Card>
  )
}
