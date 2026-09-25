"use client"

import * as React from "react"
import { cn } from "cn"

export interface MoneyInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
  value?: number
  onChange?: (value: number) => void
  disabled?: boolean
  error?: boolean
}

export function formatVND(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "0 đ"
  }
  return `${value.toLocaleString("vi-VN")} đ`
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  function MoneyInput(
    {
      value = 0,
      onChange,
      disabled = false,
      error = false,
      className,
      ...props
    },
    ref
  ) {
    const inputRef = React.useRef<HTMLInputElement | null>(null)

    // Merged ref
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    // State for local display value to give fluid typing experience
    const [displayValue, setDisplayValue] = React.useState<string>(() =>
      formatVND(value)
    )

    // Sync display value whenever value or disabled changes externally
    React.useEffect(() => {
      setDisplayValue(formatVND(value))
    }, [value, disabled])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return

      // Allow control keys: Backspace, Delete, Arrow keys, Tab, Enter, Select all
      if (
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Tab" ||
        e.key === "Enter" ||
        (e.ctrlKey && (e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x"))
      ) {
        return
      }

      // Block non-digit keys
      if (!/^\d$/.test(e.key)) {
        e.preventDefault()
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return

      const raw = e.target.value.replace(/[^\d]/g, "")
      const parsedNum = raw ? parseInt(raw, 10) : 0

      // Update parent with purely number
      onChange?.(parsedNum)

      // Update formatted display
      setDisplayValue(formatVND(parsedNum))
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Put cursor right before " đ" or select all
      const input = e.target
      setTimeout(() => {
        const val = input.value
        const endPos = val.endsWith(" đ") ? val.length - 2 : val.length
        input.setSelectionRange(0, endPos)
      }, 0)
    }

    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={disabled ? "0 đ" : displayValue}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onFocus={handleFocus}
        className={cn(
          "h-9 w-full rounded-md border border-input px-3 py-1 text-xs sm:text-sm font-normal transition-colors  outline-none",
          disabled
            ? "bg-muted/60 text-muted-foreground border-border/60 cursor-not-allowed select-none"
            : "bg-background text-foreground hover:border-input focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20",
          error && "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive",
          className
        )}
        {...props}
      />
    )
  }
)

MoneyInput.displayName = "MoneyInput"
