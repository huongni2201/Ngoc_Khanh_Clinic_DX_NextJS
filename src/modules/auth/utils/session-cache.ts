import type { QueryClient } from "@tanstack/react-query"
import type { UserSession } from "../types"

export const SESSION_QUERY_KEY = ["auth", "session"] as const
export const SESSION_CHANNEL = "nkc-session-changed"

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
  client.setQueryData(SESSION_QUERY_KEY, session)
}

export function notifySessionChanged() {
  if (typeof BroadcastChannel === "undefined") return
  const channel = new BroadcastChannel(SESSION_CHANNEL)
  channel.postMessage("changed")
  channel.close()
}
