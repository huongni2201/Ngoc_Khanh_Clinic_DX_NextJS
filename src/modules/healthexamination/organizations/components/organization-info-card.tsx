"use client"

import { InfoList } from "@/shared/ui"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { OrganizationDetail } from "../types"

interface OrganizationInfoCardProps {
  organization: OrganizationDetail
}

const CONTACT_LINK_CLASS =
  "rounded-sm text-foreground underline-offset-4 outline-none transition-colors hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring/30"

/** A phone number the user can tap to call. */
function PhoneLink({ value }: { value: string }) {
  return (
    <a href={`tel:${value.replace(/[^\d+]/g, "")}`} className={CONTACT_LINK_CLASS}>
      {value}
    </a>
  )
}

/** An email address that opens the user's mail app. */
function EmailLink({ value }: { value: string }) {
  return (
    <a href={`mailto:${value}`} className={CONTACT_LINK_CLASS}>
      {value}
    </a>
  )
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
              {
                label: "Số điện thoại",
                value: organization.contactPhone ? <PhoneLink value={organization.contactPhone} /> : undefined,
                mono: true,
              },
              {
                label: "Email",
                value: organization.contactEmail ? <EmailLink value={organization.contactEmail} /> : undefined,
              },
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
              {
                label: "Điện thoại đơn vị",
                value: organization.phone ? <PhoneLink value={organization.phone} /> : undefined,
                mono: true,
              },
              {
                label: "Email đơn vị",
                value: organization.email ? <EmailLink value={organization.email} /> : undefined,
              },
              { label: "Địa chỉ", value: organization.address },
            ]}
          />
        </section>
      </CardContent>
    </Card>
  )
}
