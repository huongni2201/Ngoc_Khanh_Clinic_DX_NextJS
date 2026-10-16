"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface CatalogPriceFieldProps {
  id: string
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

/**
 * Price input for catalog services. Keeps the raw string the user types in state; only normalizes
 * at form submission boundary. Accepts digits and at most one decimal separator with up to 2 digits.
 * Does NOT use float arithmetic – prices stay as strings throughout the form layer.
 */
export function CatalogPriceField({
  id,
  label,
  required,
  value,
  onChange,
  error,
  disabled,
}: CatalogPriceFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // Allow only digits, decimal point/comma and limited decimal places
    if (/^\d*[,.]?\d{0,2}$/.test(raw)) {
      onChange(raw)
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-destructive" aria-hidden="true">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={handleChange}
          inputMode="decimal"
          placeholder="VD: 150000.00"
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn("pr-8", error && "border-destructive focus-visible:ring-destructive/30")}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          đ
        </span>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
