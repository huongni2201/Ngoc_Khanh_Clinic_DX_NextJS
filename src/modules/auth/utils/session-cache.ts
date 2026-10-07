import type { QueryClient } from "@tanstack/react-query"
import type { UserSession } from "../types"

export const SESSION_QUERY_KEY = ["auth", "session"] as const
export const SESSION_CHANNEL = "nkc-session-changed"
export const SESSION_SOURCE = crypto.randomUUID()
const SESSION_HINT_KEY = "nkc-session-present"
let sessionHint = false

// A restore hint only; identity and authorization always come from the backend.
export function hasSessionHint() {
  try { return localStorage.getItem(SESSION_HINT_KEY) === "1" }
  catch { return sessionHint }
}

export function setSessionHint(present: boolean) {
  sessionHint = present
  try {
    if (present) localStorage.setItem(SESSION_HINT_KEY, "1")
    else localStorage.removeItem(SESSION_HINT_KEY)
  } catch { /* Storage may be disabled; keep this tab's hint in memory. */ }
}

export async function clearBusinessData(client: QueryClient) {
  const filter = { predicate: (query: { queryKey: readonly unknown[] }) => query.queryKey[0] !== "auth" }
  await client.cancelQueries(filter)
  client.removeQueries(filter)
  for (const mutation of client.getMutationCache().getAll()) {
    if (mutation.state.status !== "pending") client.getMutationCache().remove(mutation)
  }
}

export async function replaceSession(client: QueryClient, session: UserSession | null) {
  await client.cancelQueries()
  await clearBusinessData(client)
  setSessionHint(Boolean(session))
  client.setQueryData(SESSION_QUERY_KEY, session)
}

export function notifySessionChanged() {
  if (typeof BroadcastChannel === "undefined") return
  const channel = new BroadcastChannel(SESSION_CHANNEL)
  channel.postMessage({ type: "changed", source: SESSION_SOURCE })
  channel.close()
}
