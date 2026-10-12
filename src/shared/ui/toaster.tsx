"use client"

import * as React from "react"
import { Toast } from "@base-ui/react/toast"
import { cn } from "@/lib/utils"
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "./product-icon"

type ToastKind = "success" | "error" | "warning" | "info"

export interface ToastOptions {
  /** Secondary line under the message. */
  description?: React.ReactNode
  /** Showing a toast with an id that is already visible updates it instead of stacking a copy. */
  id?: string
  /** Auto-dismiss delay in ms. `0` keeps the toast until the user closes it. */
  timeout?: number
  /** One optional follow-up action, for example "Thử lại". */
  action?: { label: string; onClick: () => void }
}

/** Success and info are routine; warnings and errors stay a little longer to be read. */
const DEFAULT_TIMEOUT: Record<ToastKind, number> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 6000,
}

const toastManager = Toast.createToastManager()

function show(kind: ToastKind, title: string, options: ToastOptions = {}) {
  return toastManager.add({
    ...(options.id ? { id: options.id } : {}),
    type: kind,
    title,
    description: options.description,
    timeout: options.timeout ?? DEFAULT_TIMEOUT[kind],
    // Errors are announced immediately by screen readers; the rest wait for a pause.
    priority: kind === "error" ? "high" : "low",
    actionProps: options.action
      ? { children: options.action.label, onClick: options.action.onClick }
      : undefined,
  })
}

/**
 * App-wide toast messages. Callable from components, hooks and plain modules. Nothing is shown
 * until `<Toaster />` is mounted (it is, in the root layout).
 *
 * Use it for the result of an action that has no visible place of its own (a saved record, a
 * finished export, a dialog that closed). Errors that belong to a form field or to an open dialog
 * stay inline next to what the user is fixing.
 */
export const toast = {
  success: (title: string, options?: ToastOptions) => show("success", title, options),
  error: (title: string, options?: ToastOptions) => show("error", title, options),
  warning: (title: string, options?: ToastOptions) => show("warning", title, options),
  info: (title: string, options?: ToastOptions) => show("info", title, options),
  /** Closes one toast by id, or all of them when no id is given. */
  dismiss: (id?: string) => toastManager.close(id),
}

const KINDS: Record<
  ToastKind,
  { Icon: typeof CheckCircle2; accent: string; icon: string }
> = {
  success: { Icon: CheckCircle2, accent: "border-l-status-success", icon: "text-status-success" },
  error: { Icon: AlertCircle, accent: "border-l-status-danger", icon: "text-status-danger" },
  warning: { Icon: AlertTriangle, accent: "border-l-status-warning", icon: "text-status-warning" },
  info: { Icon: Info, accent: "border-l-status-in-progress", icon: "text-status-in-progress" },
}

function toKind(type: string | undefined): ToastKind {
  return type && type in KINDS ? (type as ToastKind) : "info"
}

function ToastItem({ item }: { item: Toast.Root.ToastObject }) {
  const { Icon, accent, icon } = KINDS[toKind(item.type)]

  return (
    <Toast.Root
      toast={item}
      className={cn(
        "group/toast pointer-events-auto w-full rounded-lg border border-l-4 border-border bg-card text-card-foreground shadow-lg",
        "[transform:translate(var(--toast-swipe-movement-x,0px),var(--toast-swipe-movement-y,0px))]",
        "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
        "data-starting-style:opacity-0 data-ending-style:opacity-0 data-limited:hidden",
        accent
      )}
    >
      <Toast.Content className="flex items-start gap-3 p-3 pr-2 transition-transform duration-200 ease-out group-data-starting-style/toast:translate-y-2 motion-reduce:transition-none">
        <Icon className={cn("mt-0.5 size-4 shrink-0", icon)} aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-0.5">
          <Toast.Title className="text-sm font-medium leading-snug text-foreground" />
          <Toast.Description className="text-xs leading-relaxed text-muted-foreground" />
          {item.actionProps && (
            <Toast.Action className="mt-1.5 inline-flex h-7 cursor-pointer items-center rounded-md border border-border px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          )}
        </div>
        <Toast.Close
          aria-label="Đóng thông báo"
          className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden="true" />
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  )
}

function ToastList() {
  const { toasts } = Toast.useToastManager()
  return toasts.map((item) => <ToastItem key={item.id} item={item} />)
}

/** Mounts the toast viewport once for the whole app. Place it in the root layout. */
export function Toaster() {
  return (
    <Toast.Provider toastManager={toastManager} limit={3}>
      <Toast.Portal>
        <Toast.Viewport
          aria-label="Thông báo"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col gap-2 p-4 outline-none sm:inset-x-auto sm:right-0 sm:w-[26rem]"
        >
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}
