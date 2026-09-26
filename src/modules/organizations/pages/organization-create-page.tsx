"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Building2 } from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader, ScreenLayout } from "@/shared/ui"
import { useCreateOrganization } from "../hooks/use-organizations"
import type { OrganizationType } from "../types"

const newOrganizationSchema = z.object({
  name: z.string().trim().min(2, { message: "Tên đơn vị phải có ít nhất 2 ký tự" }),
  type: z.enum([
    "COMPANY",
    "SCHOOL",
    "GOVERNMENT_AGENCY",
    "HEALTHCARE_ORGANIZATION",
    "NON_PROFIT",
    "OTHER",
  ]),
  taxCode: z.string().trim().optional(),
  address: z.string().trim().optional(),
  contactPerson: z.string().trim().min(2, { message: "Người liên hệ là bắt buộc" }),
  contactPhone: z
    .string()
    .trim()
    .min(9, { message: "Số điện thoại phải từ 9 đến 11 số" })
    .regex(/^[0-9+() -]+$/, { message: "Số điện thoại không hợp lệ" }),
  contactEmail: z
    .string()
    .trim()
    .email({ message: "Email không đúng định dạng" })
    .optional()
    .or(z.literal("")),
  note: z.string().trim().optional(),
})

type NewOrganizationFormValues = z.infer<typeof newOrganizationSchema>

const ORGANIZATION_TYPE_OPTIONS: { value: OrganizationType; label: string }[] = [
  { value: "COMPANY", label: "Doanh nghiệp / Công ty" },
  { value: "SCHOOL", label: "Trường học / Cơ sở đào tạo" },
  { value: "GOVERNMENT_AGENCY", label: "Cơ quan nhà nước" },
  { value: "HEALTHCARE_ORGANIZATION", label: "Cơ sở y tế / Tổ chức y tế" },
  { value: "NON_PROFIT", label: "Tổ chức phi lợi nhuận" },
  { value: "OTHER", label: "Khác" },
]

export function OrganizationCreatePage() {
  const router = useRouter()
  const { mutateAsync: createOrg, isPending } = useCreateOrganization()

  const [selectedType, setSelectedType] = React.useState<OrganizationType>("COMPANY")

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NewOrganizationFormValues>({
    resolver: zodResolver(newOrganizationSchema),
    defaultValues: {
      name: "",
      type: "COMPANY",
      taxCode: "",
      address: "",
      contactPerson: "",
      contactPhone: "",
      contactEmail: "",
      note: "",
    },
  })

  const onSubmit = async (values: NewOrganizationFormValues) => {
    try {
      const created = await createOrg({
        name: values.name,
        taxCode: values.taxCode || undefined,
        contactPerson: values.contactPerson,
        contactPhone: values.contactPhone,
        address: values.address || undefined,
      })
      router.push(`/organizations/${created.id}`)
    } catch (err) {
      console.error("Failed to create organization:", err)
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

              {/* Loại tổ chức */}
              <div className="space-y-1.5">
                <Label htmlFor="type-select" className="text-xs font-medium text-foreground">
                  Loại tổ chức <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedType}
                  onValueChange={(val) => {
                    if (val) {
                      const nextType = val as OrganizationType
                      setSelectedType(nextType)
                      setValue("type", nextType)
                    }
                  }}
                >
                  <SelectTrigger id="type-select" className="h-9 text-xs border-border bg-background w-full">
                    <SelectValue placeholder="Chọn loại tổ chức" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORGANIZATION_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-[11px] text-destructive">{errors.type.message}</p>
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

              {/* Địa chỉ */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="address" className="text-xs font-medium text-foreground">
                  Địa chỉ trụ sở / văn phòng
                </Label>
                <Input
                  id="address"
                  placeholder="VD: Tòa nhà FPT, số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội"
                  {...register("address")}
                  className="h-9 text-xs"
                />
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

              {/* Email */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="contactEmail" className="text-xs font-medium text-foreground">
                  Email liên hệ
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="VD: lienhe@abc.com.vn"
                  {...register("contactEmail")}
                  className="h-9 text-xs"
                />
                {errors.contactEmail && (
                  <p className="text-[11px] text-destructive">{errors.contactEmail.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Ghi chú */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground pb-2 border-b border-border">
              Ghi chú bổ sung
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="note" className="text-xs font-medium text-foreground">
                Ghi chú nội bộ
              </Label>
              <Textarea
                id="note"
                placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt của đơn vị này..."
                {...register("note")}
                className="text-xs min-h-[80px]"
              />
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
