"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Pencil,
  ClipboardPlus,
  Phone,
  CreditCard,
  MapPin,
  Mail,
  Clock,
  FileText,
  AlertCircle,
} from "@/shared/ui/product-icon"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/shared/ui"
import { usePatient } from "../hooks/use-patients"
import { EditPatientDialog } from "../components/edit-patient-dialog"
import { PatientCheckInDialog } from "@/modules/reception"
import {
  formatDisplayDate,
  calculatePatientAge,
  formatPhoneNumber,
  getGenderLabel,
} from "../lib/patient-formatters"
import { EncounterHistoryTable } from "@/modules/encounters/components/encounter/encounter-history-table"

export function PatientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const patientId = params?.id as string

  const { data: patient, isLoading, isError, error, refetch } = usePatient(patientId)

  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isReceiveOpen, setIsReceiveOpen] = React.useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !patient) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/patients")}
          className="text-xs"
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Quay lại danh sách
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Không tìm thấy thông tin bệnh nhân yêu cầu."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const age = calculatePatientAge(patient.dateOfBirth, patient.birthYear)
  const dobDisplay = formatDisplayDate(patient.dateOfBirth)
  const lastExamDisplay = formatDisplayDate(patient.lastExamDate)

  return (
    <div className="space-y-6 flex-1">
      <PageHeader
        breadcrumbs={[
          { label: "Bệnh nhân", href: "/patients" },
          { label: patient.fullName },
        ]}
        title={patient.fullName}
        titleAccessory={
          <Badge variant="outline" className="font-mono text-xs font-semibold">
            {patient.patientCode}
          </Badge>
        }
        description={`${getGenderLabel(patient.gender)} · ${dobDisplay} (${age} tuổi) · Lần khám gần nhất: ${lastExamDisplay}`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => router.push("/patients")}
            >
              <ArrowLeft className="size-4" />
              Danh sách
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="size-4" />
              Sửa thông tin
            </Button>
            <Button onClick={() => setIsReceiveOpen(true)}>
              <ClipboardPlus className="size-4" />
              Tiếp nhận khám
            </Button>
          </>
        }
      />

      <section
        aria-label="Thông tin hành chính"
        className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card px-5 py-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0"
      >
          <div className="flex items-center gap-3 text-xs">
            <CreditCard className="size-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Số định danh (CCCD)</p>
              <p className="font-mono font-medium text-foreground">{patient.identificationNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs lg:border-l lg:border-border lg:pl-5">
            <Phone className="size-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Số điện thoại</p>
              <p className="font-mono font-medium text-foreground">{formatPhoneNumber(patient.phoneNumber)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs lg:border-l lg:border-border lg:pl-5">
            <Mail className="size-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Email</p>
              <p className="font-medium text-foreground truncate max-w-[180px]">
                {patient.email || "Chưa cập nhật"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs lg:border-l lg:border-border lg:pl-5">
            <MapPin className="size-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Địa chỉ</p>
              <p className="font-medium text-foreground truncate max-w-[200px]" title={patient.address}>
                {patient.address || "Chưa cập nhật"}
              </p>
            </div>
          </div>
      </section>

      {/* Tabs for Medical History */}
      <Tabs defaultValue="encounters" className="w-full">
        <TabsList>
          <TabsTrigger value="encounters">
            <Clock className="mr-1.5 size-3.5" />
            Lịch sử khám bệnh
          </TabsTrigger>
          <TabsTrigger value="records">
            <FileText className="mr-1.5 size-3.5" />
            Hồ sơ y tế & Chẩn đoán
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encounters" className="mt-4">
          <EncounterHistoryTable patientId={patient.id} />
        </TabsContent>

        <TabsContent value="records" className="mt-4">
          <div className="rounded-lg border border-border bg-card p-6  text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <FileText className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Hồ sơ kết quả khám & Chẩn đoán
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Dữ liệu kết quả cận lâm sàng, xét nghiệm và chẩn đoán bác sĩ sẽ được hiển thị khi đợt khám hoàn tất.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditPatientDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        patient={patient}
        onSuccess={() => refetch()}
      />

      <PatientCheckInDialog
        open={isReceiveOpen}
        onOpenChange={setIsReceiveOpen}
        initialPatient={patient}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
