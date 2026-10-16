"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ApiClientError } from "@/shared/api/api-client"
import { catalogErrorMessage } from "../../utils/management/catalog-management-utils"

/** A conflict never silently overwrites the user's draft or retries a write. */
export function CatalogMutationError({ error, entityLabel, onReload, discardDraft = true }: {
  error: unknown
  entityLabel: string
  onReload?: () => Promise<void>
  discardDraft?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [reloadError, setReloadError] = useState<unknown>(null)
  if (!error) return null
  const conflict = error instanceof ApiClientError && error.status === 409
  return (
    <div role="alert" className="space-y-2 text-xs text-destructive">
      <p>{catalogErrorMessage(reloadError ?? error, entityLabel)}</p>
      {conflict && onReload && (
        <>
          <p className="text-muted-foreground">{discardDraft ? "Tải lại sẽ bỏ bản nháp và dùng dữ liệu mới nhất. Hãy kiểm tra lại trước khi lưu." : "Tải dữ liệu mới nhất và kiểm tra lại trạng thái trước khi xác nhận."}</p>
          <Button type="button" variant="outline" size="sm" disabled={loading} onClick={async () => {
            setLoading(true)
            setReloadError(null)
            try { await onReload() } catch (failure) { setReloadError(failure) }
            finally { setLoading(false) }
          }}>
            {loading ? "Đang tải lại..." : discardDraft ? "Bỏ bản nháp và tải lại" : "Tải dữ liệu mới"}
          </Button>
        </>
      )}
    </div>
  )
}
