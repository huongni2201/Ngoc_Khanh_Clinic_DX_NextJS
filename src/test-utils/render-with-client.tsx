import type { ReactElement } from "react"
import { render } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PERMISSION } from "@/modules/accesscontrol"
import { SESSION_QUERY_KEY } from "@/modules/accesscontrol/utils/session-cache"

/** Every permission the frontend knows, for a test that is not about access. */
export const ALL_PERMISSIONS: readonly string[] = Object.values(PERMISSION)

/** A signed-in STAFF session that carries `permissions`, as `/me` returns it. */
export function staffSessionWith(permissions: readonly string[]) {
  return {
    userId: "11111111-1111-4111-8111-111111111111",
    staffId: "22222222-2222-4222-8222-222222222222",
    patientId: null,
    username: "staff.test",
    principalType: "STAFF" as const,
    roleAssignments: [
      {
        roleId: "33333333-3333-4333-8333-333333333333",
        roleCode: "CLINIC_MANAGER",
        permissions: [...permissions],
      },
    ],
    idleExpiresAt: "2099-01-01T12:00:00Z",
    absoluteExpiresAt: "2099-01-01T20:00:00Z",
  }
}

interface RenderWithClientOptions {
  /**
   * Signs a STAFF account in with these permissions before rendering. Without it no session is
   * loaded, so a screen shows no action that needs a permission.
   */
  permissions?: readonly string[]
}

/** Renders `ui` inside a fresh QueryClient that never retries, so failures surface immediately. */
export function renderWithClient(ui: ReactElement, options: RenderWithClientOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  if (options.permissions) {
    queryClient.setQueryData(SESSION_QUERY_KEY, staffSessionWith(options.permissions))
  }
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}
