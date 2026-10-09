"use client"

import type { ComponentProps } from "react"
import type { UseFormRegisterReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface OrganizationTextFieldProps
  extends Pick<ComponentProps<typeof Input>, "type" | "placeholder" | "inputMode" | "autoComplete"> {
  id: string
  label: string
  required?: boolean
  /** Validation message from React Hook Form; shown under the field and linked for screen readers. */
  error?: string
  registration: UseFormRegisterReturn
}

/**
 * One labelled input for the organization create/edit forms, so both dialogs share the same
 * label, required marker, placeholder style and error wiring.
 */
export function OrganizationTextField({
  id,
  label,
  required = false,
  error,
  registration,
  ...inputProps
}: OrganizationTextFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="space-y-1.5">
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
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
