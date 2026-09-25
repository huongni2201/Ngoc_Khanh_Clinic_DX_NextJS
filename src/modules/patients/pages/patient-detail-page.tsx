"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  Home,
  ChevronRight,
  ArrowLeft,
  User,
  Pencil,
  ClipboardPlus,
  Phone,
  CreditCard,
  MapPin,
  Mail,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { usePatient } from "../hooks/use-patients"
import { EditPatientDialog } from "../components/edit-patient-dialog"
import { ReceivePatientDialog } from "@/modules/reception"
import {
  formatDisplayDate,
  calculatePatientAge,
  formatPhoneNumber,
  getGenderLabel,
} from "../lib/patient-formatters"
import { EncounterHistoryTable } from "../components/encounter/encounter-history-table"

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
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
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
      {/* Breadcrumbs */}
      <nav aria-label="Đường dẫn" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Home className="size-3.5" />
          <span className="sr-only">Trang chủ</span>
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/60" />
        <Link href="/patients" className="hover:text-foreground transition-colors">
          Bệnh nhân
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/60" />
        <span className="font-medium text-foreground">{patient.fullName}</span>
      </nav>

      {/* Top Banner / Summary Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Patient Bio */}
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <User className="size-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  {patient.fullName}
                </h1>
                <Badge variant="outline" className="font-mono text-xs font-semibold">
                  {patient.patientCode}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                <span>{getGenderLabel(patient.gender)}</span>
                <span>•</span>
                <span>{dobDisplay} ({age} tuổi)</span>
                <span>•</span>
                <span>Lần khám gần nhất: <strong className="text-foreground">{lastExamDisplay}</strong></span>
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => router.push("/patients")}
              className="h-9 rounded-xl border-border text-xs font-medium"
            >
              <ArrowLeft className="mr-1.5 size-4" />
              Danh sách
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(true)}
              className="h-9 rounded-xl border-border text-xs font-medium hover:text-primary"
            >
              <Pencil className="mr-1.5 size-4" />
              Sửa thông tin
            </Button>
            <Button
              onClick={() => setIsReceiveOpen(true)}
              className="h-9 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <ClipboardPlus className="mr-1.5 size-4" />
              Tiếp nhận khám
            </Button>
          </div>
        </div>

        {/* Administrative Details Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-border pt-5">
          <div className="flex items-center gap-3 text-xs">
            <CreditCard className="size-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Số định danh (CCCD)</p>
              <p className="font-mono font-medium text-foreground">{patient.identificationNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Phone className="size-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Số điện thoại</p>
              <p className="font-mono font-medium text-foreground">{formatPhoneNumber(patient.phoneNumber)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Mail className="size-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Email</p>
              <p className="font-medium text-foreground truncate max-w-[180px]">
                {patient.email || "Chưa cập nhật"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <MapPin className="size-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Địa chỉ</p>
              <p className="font-medium text-foreground truncate max-w-[200px]" title={patient.address}>
                {patient.address || "Chưa cập nhật"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Medical History */}
      <Tabs defaultValue="encounters" className="w-full">
        <TabsList className="h-10 bg-muted/70 p-1 rounded-xl">
          <TabsTrigger value="encounters" className="text-xs rounded-lg">
            <Clock className="mr-1.5 size-3.5" />
            Lịch sử khám bệnh
          </TabsTrigger>
          <TabsTrigger value="records" className="text-xs rounded-lg">
            <FileText className="mr-1.5 size-3.5" />
            Hồ sơ y tế & Chẩn đoán
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encounters" className="mt-4">
          <EncounterHistoryTable patientId={patient.id} />
        </TabsContent>

        <TabsContent value="records" className="mt-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs text-center">
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

      <ReceivePatientDialog
        open={isReceiveOpen}
        onOpenChange={setIsReceiveOpen}
        initialPatient={patient}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
