"use client"

import type { ComponentProps } from "react"
import type { UseFormRegisterReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface FormTextFieldProps
  extends Pick<
    ComponentProps<typeof Input>,
    "type" | "placeholder" | "inputMode" | "autoComplete" | "maxLength" | "disabled" | "className"
  > {
  id: string
  label: string
  required?: boolean
  /** Validation message from React Hook Form; shown under the field and linked for screen readers. */
  error?: string
  registration: UseFormRegisterReturn
  containerClassName?: string
}

/**
 * One labelled input for React Hook Form dialogs (organizations, staff members, catalog), so every form
 * shares the same label, required marker, placeholder style and error wiring.
 */
export function FormTextField({
  id,
  label,
  required = false,
  error,
  registration,
  containerClassName,
  ...inputProps
}: FormTextFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      <Label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
        {required ? (
          <>
            {" "}
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
            <span className="sr-only">(bắt buộc)</span>
          </>
        ) : null}
      </Label>
      <Input
        id={id}
        {...inputProps}
        {...registration}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
