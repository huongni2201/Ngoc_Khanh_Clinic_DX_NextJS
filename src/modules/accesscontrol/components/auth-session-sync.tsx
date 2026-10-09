"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { clearBusinessData, SESSION_CHANNEL, SESSION_QUERY_KEY, SESSION_SOURCE } from "../utils/session-cache"

export function AuthSessionSync() {
  const client = useQueryClient()
  useEffect(() => {
    try {
      localStorage.removeItem("nk_auth_token")
      localStorage.removeItem("nk_auth_user")
    } catch { /* Storage may be disabled; it is never an authentication source. */ }
    if (typeof BroadcastChannel === "undefined") return
    const channel = new BroadcastChannel(SESSION_CHANNEL)
    channel.onmessage = async (event: MessageEvent<unknown>) => {
      const message = event.data
      if (typeof message !== "object" || message === null ||
        !("type" in message) || message.type !== "changed" ||
        !("source" in message) || typeof message.source !== "string" ||
        message.source === SESSION_SOURCE) return
      await client.cancelQueries()
      await clearBusinessData(client)
      await client.resetQueries({ queryKey: SESSION_QUERY_KEY })
    }
    return () => channel.close()
  }, [client])
  return null
}
