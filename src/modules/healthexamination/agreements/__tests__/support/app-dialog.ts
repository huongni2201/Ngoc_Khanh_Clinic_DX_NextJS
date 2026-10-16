import { screen, waitFor } from "@testing-library/react"

/** Toasts are non-modal `dialog` elements inside the "Thông báo" region; app dialogs are not. */
const isToast = (element: HTMLElement) =>
  element.closest('[role="region"][aria-label="Thông báo"]') !== null

/** The open app dialog, ignoring toasts. `null` when none is open. */
export function queryDialog(): HTMLElement | null {
  return screen.queryAllByRole("dialog").find((element) => !isToast(element)) ?? null
}

export function getDialog(): HTMLElement {
  const dialog = queryDialog()
  if (!dialog) throw new Error("Expected an open dialog")
  return dialog
}

export function findDialog(): Promise<HTMLElement> {
  return waitFor(getDialog)
}
