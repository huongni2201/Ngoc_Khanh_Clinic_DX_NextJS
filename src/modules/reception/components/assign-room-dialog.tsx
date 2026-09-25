"use client"

import * as React from "react"
import { AlertCircle, Loader2, CheckCircle2 } from "@/shared/ui/product-icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useClinicRooms, useAssignRoom } from "../hooks/use-reception"
import { Encounter } from "../types"
import { cn } from "@/lib/utils"

interface AssignRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  encounter: Encounter | null
  onSuccess?: (updated: Encounter) => void
}

export function AssignRoomDialog({
  open,
  onOpenChange,
  encounter,
  onSuccess,
}: AssignRoomDialogProps) {
  const { data: rooms, isLoading: isLoadingRooms } = useClinicRooms()
  const assignRoomMutation = useAssignRoom()

  const defaultRoomId = encounter?.roomId || (rooms && rooms.length > 0 ? rooms[0].id : "")
  const [userSelectedRoomId, setUserSelectedRoomId] = React.useState<string | null>(null)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const selectedRoomId = userSelectedRoomId ?? defaultRoomId
  const setSelectedRoomId = (id: string) => setUserSelectedRoomId(id)

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setServerError(null)
      setUserSelectedRoomId(null)
    }
    onOpenChange(isOpen)
  }

  if (!encounter) return null

  const handleConfirm = async () => {
    if (!selectedRoomId) {
      setServerError("Vui lòng chọn một phòng khám")
      return
    }

    const room = rooms?.find((r) => r.id === selectedRoomId)
    if (!room) return

    try {
      setServerError(null)
      const updated = await assignRoomMutation.mutateAsync({
        encounterId: encounter.id,
        roomId: room.id,
        physicianId: room.physicianId,
      })

      onOpenChange(false)
      if (onSuccess) {
        onSuccess(updated)
      }
    } catch (err) {
      setServerError((err as Error)?.message || "Không thể phân phòng khám")
    }
  }

  const isPending = assignRoomMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl max-w-[calc(100%-2rem)] p-6 sm:p-7 max-h-[92vh] flex flex-col gap-0 rounded-lg shadow-xl overflow-hidden bg-card border-border">
        <DialogHeader className="pb-4 shrink-0 text-left border-b border-border/80">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Phân phòng / Bác sĩ
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Điều phối bệnh nhân vào phòng khám chuyên môn phù hợp
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 -mr-1">
          {serverError && (
            <Alert variant="destructive" className="py-2.5 text-xs">
              <AlertCircle className="size-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {/* Patient and Encounter Context Info */}
          <div className="p-3.5 rounded-lg border border-border bg-surface-alt/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  {encounter.patientName}
                </span>
                <Badge
                  variant="outline"
                  className="bg-card text-primary font-mono text-[10px]"
                >
                  {encounter.encounterCode}
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Giờ tiếp đón: <strong className="text-foreground">{encounter.arrivalTime}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-secondary-foreground flex-wrap">
              <span>
                Mã BN: <strong className="text-foreground">{encounter.patientCode}</strong>
              </span>
              <span className="text-border">•</span>
              <span>
                Loại khám:{" "}
                <strong className="text-foreground">{encounter.examinationType}</strong>
              </span>
              {encounter.reasonForVisit && (
                <>
                  <span className="text-border">•</span>
                  <span>
                    Triệu chứng:{" "}
                    <span className="text-foreground italic">{encounter.reasonForVisit}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Room Selection Grid (2 Columns on Desktop) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground block">
                Chọn phòng khám & bác sĩ tiếp nhận:
              </label>
              <span className="text-[11px] text-muted-foreground">
                Hiển thị tải hàng đợi thời gian thực
              </span>
            </div>

            {isLoadingRooms ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
                Đang tải danh sách phòng khám...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rooms?.map((room) => {
                  const isSelected = selectedRoomId === room.id
                  const isAvailable = room.status === "ACTIVE"

                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={cn(
                        "p-3.5 rounded-lg border cursor-pointer transition-colors flex flex-col justify-between gap-3 text-left",
                        isSelected
                          ? "border-primary bg-selected ring-1 ring-primary "
                          : "border-border bg-card hover:bg-hover/60 hover:border-border/80"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground">
                              {room.name}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-surface-alt text-secondary-foreground border-border/60">
                              {room.department}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground pt-0.5">
                            Bác sĩ: <strong className="text-foreground font-medium">{room.physicianName}</strong>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="size-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                            <CheckCircle2 className="size-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              isAvailable ? "bg-status-success" : "bg-status-warning"
                            )}
                          />
                          <span className="text-[11px] text-secondary-foreground font-medium">
                            {isAvailable ? "Đang trực" : "Bận"}
                          </span>
                        </div>

                        <div className="text-[11px] text-muted-foreground">
                          Đang chờ: <strong className="text-foreground font-semibold">{room.waitingCount} BN</strong>{" "}
                          <span className="text-secondary-foreground">({room.estimatedWaitTime})</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-4 mt-2 border-t border-border flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium border-border/80 hover:bg-hover rounded-lg  cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || !selectedRoomId}
            className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium rounded-lg  cursor-pointer"
          >
            {isPending && <Loader2 className="size-3.5 mr-2 animate-spin" />}
            {isPending ? "Đang phân phòng..." : "Xác nhận phân phòng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
