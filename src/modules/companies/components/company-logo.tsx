"use client"

import * as React from "react"
import { Building2 } from "@/shared/ui/product-icon"

interface CompanyLogoProps {
  type?: string
  name: string
  className?: string
}

export function CompanyLogo({ type }: CompanyLogoProps) {
  switch (type) {
    case "samsung":
      return (
        <svg className="h-6 w-16 shrink-0" viewBox="0 0 70 24" fill="none">
          <ellipse cx="35" cy="12" rx="34" ry="11" fill="#0c4da2" />
          <text
            x="35"
            y="15"
            fill="#ffffff"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            letterSpacing="1"
          >
            SAMSUNG
          </text>
        </svg>
      )
    case "fpt":
      return (
        <svg className="h-6 w-14 shrink-0" viewBox="0 0 60 24" fill="none">
          <text
            x="12"
            y="17"
            fill="#f37021"
            fontSize="13"
            fontWeight="900"
            fontFamily="Arial, sans-serif"
          >
            F
          </text>
          <text
            x="24"
            y="17"
            fill="#009344"
            fontSize="13"
            fontWeight="900"
            fontFamily="Arial, sans-serif"
          >
            P
          </text>
          <text
            x="36"
            y="17"
            fill="#0072bc"
            fontSize="13"
            fontWeight="900"
            fontFamily="Arial, sans-serif"
          >
            T
          </text>
        </svg>
      )
    case "canon":
      return (
        <svg className="h-6 w-14 shrink-0" viewBox="0 0 60 24" fill="none">
          <text
            x="30"
            y="17"
            fill="#bc0024"
            fontSize="13"
            fontWeight="bold"
            fontFamily="Georgia, serif"
            textAnchor="middle"
            letterSpacing="-0.5"
          >
            Canon
          </text>
        </svg>
      )
    case "vietcombank":
      return (
        <svg className="h-6 w-20 shrink-0" viewBox="0 0 80 24" fill="none">
          <polygon points="10,4 3,20 17,20" fill="#005a36" />
          <polygon points="10,9 6,18 14,18" fill="#ffffff" />
          <text
            x="22"
            y="16"
            fill="#005a36"
            fontSize="10"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
          >
            VCB
          </text>
        </svg>
      )
    case "vng":
      return (
        <svg className="h-6 w-12 shrink-0" viewBox="0 0 50 24" fill="none">
          <rect width="50" height="24" rx="4" fill="#ea5d28" />
          <text
            x="25"
            y="16"
            fill="#ffffff"
            fontSize="11"
            fontWeight="900"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
          >
            VNG
          </text>
        </svg>
      )
    case "hoaphat":
      return (
        <svg className="h-6 w-20 shrink-0" viewBox="0 0 85 24" fill="none">
          <path
            d="M8 3L2 9l6 6 6-6-6-6zm0 8l-4-4V15l4 4 4-4v-8l-4 4z"
            fill="#0d47a1"
          />
          <text
            x="18"
            y="15"
            fill="#0d47a1"
            fontSize="8"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
          >
            HÒA PHÁT
          </text>
        </svg>
      )
    case "unilever":
      return (
        <svg className="h-6 w-10 shrink-0" viewBox="0 0 40 24" fill="none">
          <text
            x="20"
            y="18"
            fill="#1f36c7"
            fontSize="18"
            fontWeight="bold"
            fontFamily="Georgia, serif"
            textAnchor="middle"
          >
            U
          </text>
        </svg>
      )
    case "vinamilk":
      return (
        <svg className="h-6 w-18 shrink-0" viewBox="0 0 75 24" fill="none">
          <rect width="75" height="24" rx="3" fill="#002f6c" />
          <text
            x="37"
            y="16"
            fill="#ffffff"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            letterSpacing="0.5"
          >
            VINAMILK
          </text>
        </svg>
      )
    default:
      return (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Building2 className="size-4" />
        </div>
      )
  }
}
