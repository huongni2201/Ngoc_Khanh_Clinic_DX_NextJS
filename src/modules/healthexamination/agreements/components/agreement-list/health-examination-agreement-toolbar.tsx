"use client"

import { Plus } from "@/shared/ui/product-icon"
import { SearchField } from "@/shared/ui"
import { Button } from "@/components/ui/button"
import { AGREEMENT_MAX_SEARCH_LENGTH } from "../../utils/agreement-list-params"

interface HealthExaminationAgreementToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  /** Omitted when the account may not create agreements: the action is then not shown. */
  onCreateClick?: () => void
}

export function HealthExaminationAgreementToolbar({
  search,
  onSearchChange,
  onCreateClick,
}: HealthExaminationAgreementToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <SearchField
        value={search}
        maxLength={AGREEMENT_MAX_SEARCH_LENGTH}
        onChange={onSearchChange}
        placeholder="Tìm theo mã hoặc tên thỏa thuận..."
        label="Tìm thỏa thuận"
      />
      {onCreateClick && (
        <Button type="button" onClick={onCreateClick}>
          <Plus className="size-4" />
          Tạo thỏa thuận
        </Button>
      )}
    </div>
  )
}
