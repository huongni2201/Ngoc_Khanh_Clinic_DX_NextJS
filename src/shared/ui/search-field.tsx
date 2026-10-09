import type * as React from "react"
import { Search } from "./product-icon"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  placeholder: string
  /** Accessible name; falls back to the placeholder. */
  label?: string
  maxLength?: number
  className?: string
}

/** The single search box used on list toolbars: icon, 36px height, controlled value. */
export function SearchField({
  value,
  onChange,
  onKeyDown,
  placeholder,
  label,
  maxLength,
  className,
}: SearchFieldProps) {
  return (
    <div className={cn("relative w-full sm:max-w-sm", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        className="h-9 bg-card pl-9 text-sm"
      />
    </div>
  )
}
