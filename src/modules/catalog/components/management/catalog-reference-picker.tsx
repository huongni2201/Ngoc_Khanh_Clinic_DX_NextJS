"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HugeiconsIcon } from "@hugeicons/react"
import { UnfoldMoreIcon, Tick02Icon, Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"

export interface PickerItem {
  id: string
  code: string
  name: string
  active: boolean
}

export interface CatalogReferencePickerProps {
  id?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: string
  placeholder?: string
  selectedId?: string | null
  selectedName?: string | null
  allowNone?: boolean
  noneLabel?: string
  onSelect: (item: PickerItem | null) => void
  disabled?: boolean
  className?: string
  triggerClassName?: string
  clearable?: boolean

  items: PickerItem[]
  isLoading?: boolean
  isError?: boolean
  error?: unknown
  onRetry?: () => void

  searchValue?: string
  onSearchChange?: (q: string) => void

  // Backward compatibility props
  currentPage?: number
  totalPages?: number
  totalItems?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  returnFocusRef?: React.RefObject<HTMLButtonElement | null>
}

/**
 * Searchable popover dropdown picker for selecting catalog references (Departments, Specialties, etc.)
 * Features:
 * 1. Styled like standard option selects with trigger button & dropdown.
 * 2. Embedded search input at the top for real-time filtering.
 * 3. Max height (max-h-60) with smooth scrolling.
 */
export function CatalogReferencePicker({
  id,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  title,
  placeholder = "Chọn...",
  selectedId,
  selectedName,
  allowNone = false,
  noneLabel = "— Bỏ chọn —",
  onSelect,
  disabled = false,
  className,
  triggerClassName,
  clearable = false,
  items,
  isLoading = false,
  isError = false,
  onRetry,
  searchValue: controlledSearchValue,
  onSearchChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: CatalogReferencePickerProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = (next: boolean) => {
    if (isControlled && setControlledOpen) {
      setControlledOpen(next)
    } else {
      setInternalOpen(next)
    }
  }

  const [internalSearch, setInternalSearch] = React.useState("")
  const localSearch = controlledSearchValue ?? internalSearch

  const handleSearchChange = (q: string) => {
    if (controlledSearchValue === undefined) setInternalSearch(q)
    if (onSearchChange) {
      onSearchChange(q)
    }
  }

  // Server searches can match text beyond name/code; only filter locally in uncontrolled mode.
  const displayItems = React.useMemo(() => {
    if (onSearchChange || !localSearch.trim()) return items
    const lower = localSearch.toLowerCase().trim()
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.code.toLowerCase().includes(lower)
    )
  }, [items, localSearch, onSearchChange])

  const currentItem = items.find((i) => i.id === selectedId)
  const displayText = selectedName || currentItem?.name

  const handleItemSelect = (item: PickerItem | null) => {
    onSelect(item)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative w-full">
      <PopoverTrigger
        type="button"
        id={id}
        disabled={disabled}
        aria-label={placeholder}
        className={cn(
          "flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-xs sm:text-sm text-foreground transition-colors",
          "hover:bg-muted focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !displayText && "text-muted-foreground",
          clearable && selectedId && "pr-9",
          triggerClassName,
          className
        )}
      >
        <span className="truncate text-left">
          {displayText || placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
          {(!clearable || !selectedId) && (
            <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} className="size-3.5 pointer-events-none" />
          )}
        </div>
      </PopoverTrigger>
      {clearable && selectedId && (
        <Button type="button" variant="ghost" size="icon-sm" disabled={disabled} aria-label="Bỏ chọn" className="absolute right-1 top-1/2 size-6 -translate-y-1/2 text-muted-foreground hover:text-destructive" onClick={() => onSelect(null)}>
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3.5" />
        </Button>
      )}
      </div>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        className="w-72 sm:w-80 p-0 rounded-lg shadow-lg border border-border bg-popover text-popover-foreground overflow-hidden"
      >
        {/* Search Input at the top of the dropdown */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2 bg-muted/30">
          <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="size-3.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={title ? `Tìm ${title.toLowerCase()}...` : "Tìm kiếm..."}
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3" />
            </button>
          )}
        </div>

        {/* Scrollable list with max-height: max-h-60 */}
        <div className="max-h-60 overflow-y-auto p-1 text-xs">
          {/* Allow none / Clear option */}
          {allowNone && (
            <button
              type="button"
              onClick={() => handleItemSelect(null)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer",
                !selectedId
                  ? "bg-accent font-semibold text-accent-foreground"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <span>{noneLabel}</span>
              {!selectedId && (
                <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-3.5 text-primary shrink-0" />
              )}
            </button>
          )}

          {/* Loading */}
          {isLoading && (
            <p className="py-4 text-center text-xs text-muted-foreground">Đang tải dữ liệu...</p>
          )}

          {/* Error */}
          {isError && (
            <div role="alert" className="space-y-2 py-3 text-center text-xs text-destructive">
              <p>Không thể tải dữ liệu</p>
              {onRetry && <Button type="button" variant="outline" size="sm" onClick={onRetry}>Thử lại</Button>}
            </div>
          )}

          {/* Items */}
          {!isLoading && !isError && displayItems.length > 0 && (
            <div className={cn("space-y-0.5", allowNone && "mt-1 border-t border-border pt-1")}>
              {displayItems.map((item) => {
                const isSelected = item.id === selectedId
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemSelect(item)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer",
                      isSelected
                        ? "bg-accent font-semibold text-accent-foreground"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate">{item.name}</span>
                      {!item.active && (
                        <span className="rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground shrink-0">
                          Ngừng
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-3.5 text-primary shrink-0 ml-1.5" />
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && displayItems.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">
              {localSearch ? "Không tìm thấy kết quả phù hợp" : "Chưa có dữ liệu"}
            </p>
          )}
        </div>
        {onPageChange && totalPages > 1 && (
          <Pagination aria-label={`Phân trang ${title?.toLowerCase() ?? "danh mục"}`} className="border-t border-border px-2 py-1">
            <PaginationContent className="w-full justify-between">
              <PaginationItem><PaginationPrevious disabled={isLoading || currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} /></PaginationItem>
              <PaginationItem><span className="text-xs text-muted-foreground" aria-live="polite">{currentPage}/{totalPages}</span></PaginationItem>
              <PaginationItem><PaginationNext disabled={isLoading || currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} /></PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </PopoverContent>
    </Popover>
  )
}
