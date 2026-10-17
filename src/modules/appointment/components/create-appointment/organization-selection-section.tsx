"use client"

import { AlertCircle, Building2 } from "@/shared/ui/product-icon"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Patient } from "@/modules/patient"
import type { Organization } from "@/modules/healthexamination"
import type { HealthExaminationAgreementSummary, HealthExaminationParticipant } from "@/modules/healthexamination"

interface OrganizationSelectionSectionProps {
  organizations: Pick<Organization, "id" | "name">[]
  isLoadingOrganizations: boolean
  isOrganizationsError: boolean
  organizationsError: unknown
  agreements: Pick<HealthExaminationAgreementSummary, "id" | "name" | "code">[]
  participants: Pick<
    HealthExaminationParticipant,
    "id" | "participantCode" | "fullName" | "departmentName"
  >[]
  selectedOrganizationId: string
  selectedHealthExaminationAgreementId: string
  selectedParticipantCode: string
  selectedPatient: Patient | null
  isPending: boolean
  isLinkingParticipant: boolean
  onOrganizationChange: (organizationId: string) => void
  onAgreementChange: (agreementId: string) => void
  onParticipantChange: (participantCode: string) => void
}

/** Organization → agreement → participant pickers, plus the linked patient record once one is resolved. */
export function OrganizationSelectionSection({
  organizations,
  isLoadingOrganizations,
  isOrganizationsError,
  organizationsError,
  agreements,
  participants,
  selectedOrganizationId,
  selectedHealthExaminationAgreementId,
  selectedParticipantCode,
  selectedPatient,
  isPending,
  isLinkingParticipant,
  onOrganizationChange,
  onAgreementChange,
  onParticipantChange,
}: OrganizationSelectionSectionProps) {
  return (
    <div className="space-y-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
        1. Chọn đơn vị, thỏa thuận & người khám
      </span>

      {isOrganizationsError && (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            {organizationsError instanceof Error
              ? organizationsError.message
              : "Không thể tải danh sách đơn vị."}
          </AlertDescription>
        </Alert>
      )}

      {/* Organization select */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">
          Đơn vị <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedOrganizationId}
          onValueChange={(val) => onOrganizationChange(val || "")}
          disabled={isPending || isLoadingOrganizations || isOrganizationsError}
        >
          <SelectTrigger className="h-8.5 text-xs bg-card">
            <SelectValue
              placeholder={
                isLoadingOrganizations
                  ? "Đang tải đơn vị..."
                  : isOrganizationsError
                    ? "Danh sách đơn vị chưa khả dụng"
                    : "-- Chọn đơn vị --"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((ent) => (
              <SelectItem key={ent.id} value={ent.id}>
                {ent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Agreement select */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">
          Thỏa thuận sức khỏe <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedHealthExaminationAgreementId}
          onValueChange={(val) => onAgreementChange(val || "")}
          disabled={!selectedOrganizationId || isPending}
        >
          <SelectTrigger className="h-8.5 text-xs bg-card">
            <SelectValue
              placeholder={
                selectedOrganizationId ? "-- Chọn thỏa thuận --" : "Vui lòng chọn đơn vị trước"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {agreements.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name} ({b.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Participant select */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">
          Người khám trong thỏa thuận <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedParticipantCode}
          onValueChange={(val) => {
            if (val) onParticipantChange(val)
          }}
          disabled={!selectedHealthExaminationAgreementId || isPending || isLinkingParticipant}
        >
          <SelectTrigger className="h-8.5 text-xs bg-card">
            <SelectValue
              placeholder={
                selectedHealthExaminationAgreementId
                  ? isLinkingParticipant
                    ? "Đang liên kết hồ sơ..."
                    : "-- Chọn người khám --"
                  : "Vui lòng chọn thỏa thuận trước"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {participants.map((participant) => (
              <SelectItem key={participant.id} value={participant.participantCode || participant.id}>
                {participant.participantCode || participant.id} - {participant.fullName} (
                {participant.departmentName})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Linked patient card */}
      {selectedPatient && (
        <div className="p-3.5 rounded-lg border border-border bg-surface-alt/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
              <Building2 className="size-3.5" />
              <span>Hồ sơ liên kết</span>
            </div>
            <Badge variant="outline" className="bg-card text-primary font-mono text-[10px]">
              {selectedParticipantCode}
            </Badge>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">{selectedPatient.fullName}</span>
              <Badge variant="outline" className="bg-card text-muted-foreground font-mono text-[10px]">
                {selectedPatient.patientCode}
              </Badge>
            </div>
            <div className="text-secondary-foreground text-[11px] space-y-0.5">
              <div>
                SĐT: <strong className="text-foreground">{selectedPatient.phoneNumber}</strong>
              </div>
              <div>
                CCCD:{" "}
                <span className="font-mono text-foreground font-semibold">
                  {selectedPatient.identificationNumber}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
