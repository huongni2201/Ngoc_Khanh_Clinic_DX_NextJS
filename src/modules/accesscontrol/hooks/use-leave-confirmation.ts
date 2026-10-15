"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export interface LeaveConfirmation {
  /** Where the user wanted to go, while the confirmation is open; null otherwise. */
  pendingHref: string | null
  /** Stays on the page and keeps the unsaved changes. */
  stay: () => void
  /** Leaves to the requested page; the unsaved changes are lost. */
  leave: () => void
}

/**
 * Asks before leaving a page with unsaved changes. A reload or closing the tab gets the browser's
 * own prompt. A click on an in-app link (sidebar, breadcrumb) is held back and reported through
 * `pendingHref`, because client navigation never fires `beforeunload`. Links opened in another
 * tab and the browser Back button are not intercepted.
 */
export function useLeaveConfirmation(enabled: boolean): LeaveConfirmation {
  const router = useRouter()
  const [pendingHref, setPendingHref] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!enabled) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    // Capture phase on the document runs before React's own click handlers, including next/link.
    const intercept = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }
      const anchor = (event.target as Element | null)?.closest?.("a[href]")
      if (!(anchor instanceof HTMLAnchorElement)) return
      if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return
      event.preventDefault()
      event.stopPropagation()
      setPendingHref(`${url.pathname}${url.search}${url.hash}`)
    }
    window.addEventListener("beforeunload", warn)
    document.addEventListener("click", intercept, true)
    return () => {
      window.removeEventListener("beforeunload", warn)
      document.removeEventListener("click", intercept, true)
    }
  }, [enabled])

  return {
    pendingHref,
    stay: () => setPendingHref(null),
    leave: () => {
      const href = pendingHref
      setPendingHref(null)
      if (href) router.push(href)
    },
  }
}
