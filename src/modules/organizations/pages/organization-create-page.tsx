"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Building2 } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader, ScreenLayout } from "@/shared/ui"
import { useCreateOrganization } from "../hooks/use-organizations"
import { createOrganizationErrorMessage } from "../utils/organization-errors"
import {
  createOrganizationSchema,
  type CreateOrganizationFormValues,
} from "../schemas"

export function OrganizationCreatePage() {
  const router = useRouter()
  const { mutateAsync: createOrg, isPending, error } = useCreateOrganization()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      taxCode: "",
      phone: "",
      email: "",
      address: "",
      contactPerson: "",
      contactPhone: "",
      contactEmail: "",
    },
  })

  const onSubmit = async (values: CreateOrganizationFormValues) => {
    try {
      const created = await createOrg({
        name: values.name,
        taxCode: values.taxCode || undefined,
        phone: values.phone,
        email: values.email,
        contactName: values.contactPerson,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        address: values.address,
      })
      router.push(`/organizations/${created.id}`)
    } catch {
      // The mutation error is rendered in the form.
    }
  }

  return (
    <ScreenLayout data-slot="organization-create-page" className="gap-6">
      <PageHeader
        breadcrumbs={[
          { label: "Đơn vị", href: "/organizations" },
          { label: "Thêm đơn vị mới" },
        ]}
        title="Thêm đơn vị mới"
        description="Đăng ký hồ sơ đơn vị tham gia các đợt khám sức khỏe định kỳ"
      />

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {createOrganizationErrorMessage(error)}
            </p>
          )}
          {/* Card 1: Thông tin cơ bản */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Building2 className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Thông tin chung đơn vị
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tên đơn vị */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-foreground">
                  Tên đơn vị <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="VD: Công ty Cổ phần Công nghệ ABC"
                  {...register("name")}
                  className="h-9 text-xs"
                />
                {errors.name && (
                  <p className="text-[11px] text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Mã số thuế */}
              <div className="space-y-1.5">
                <Label htmlFor="taxCode" className="text-xs font-medium text-foreground">
                  Mã số thuế
                </Label>
                <Input
                  id="taxCode"
                  placeholder="VD: 0102030405"
                  {...register("taxCode")}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Điện thoại đơn vị *</Label>
                <Input id="phone" type="tel" {...register("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} />
                {errors.phone && <p id="phone-error" className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email đơn vị *</Label>
                <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
                {errors.email && <p id="email-error" className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              {/* Địa chỉ */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="address" className="text-xs font-medium text-foreground">
                  Địa chỉ trụ sở / văn phòng <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address"
                  placeholder="VD: Tòa nhà FPT, số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội"
                  {...register("address")}
                  className="h-9 text-xs"
                  aria-invalid={!!errors.address}
                  aria-describedby={errors.address ? "address-error" : undefined}
                />
                {errors.address && <p id="address-error" className="text-xs text-destructive">{errors.address.message}</p>}
              </div>
            </div>
          </div>

          {/* Card 2: Thông tin liên hệ */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground pb-2 border-b border-border">
              Thông tin người đại diện / liên hệ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Người liên hệ */}
              <div className="space-y-1.5">
                <Label htmlFor="contactPerson" className="text-xs font-medium text-foreground">
                  Người liên hệ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactPerson"
                  placeholder="VD: Nguyễn Văn A"
                  {...register("contactPerson")}
                  className="h-9 text-xs"
                />
                {errors.contactPerson && (
                  <p className="text-[11px] text-destructive">{errors.contactPerson.message}</p>
                )}
              </div>

              {/* Số điện thoại */}
              <div className="space-y-1.5">
                <Label htmlFor="contactPhone" className="text-xs font-medium text-foreground">
                  Số điện thoại <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactPhone"
                  placeholder="VD: 0912 345 678"
                  {...register("contactPhone")}
                  className="h-9 text-xs"
                />
                {errors.contactPhone && (
                  <p className="text-[11px] text-destructive">{errors.contactPhone.message}</p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="contactEmail">Email người liên hệ *</Label>
                <Input id="contactEmail" type="email" {...register("contactEmail")} aria-invalid={!!errors.contactEmail} aria-describedby={errors.contactEmail ? "contact-email-error" : undefined} />
                {errors.contactEmail && <p id="contact-email-error" className="text-xs text-destructive">{errors.contactEmail.message}</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/organizations">
              <Button type="button" variant="outline" size="sm" className="text-xs h-9">
                <ArrowLeft className="size-3.5 mr-1.5" />
                Hủy bỏ
              </Button>
            </Link>

            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="text-xs h-9"
            >
              {isPending ? "Đang lưu..." : "Lưu đơn vị"}
            </Button>
          </div>
        </form>
      </div>
    </ScreenLayout>
  )
}
