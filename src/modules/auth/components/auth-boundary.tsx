"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { errorMessage } from "@/shared/api/http-client"
import { useStaffSession } from "../hooks/use-staff-session"
import type { StaffSession } from "../types"

export function AuthBoundary({ children }: { children: (session: StaffSession) => ReactNode }) {
  const session = useStaffSession()
  const router = useRouter()
  useEffect(() => {
    if (session.isSuccess && !session.isFetching && !session.data) router.replace("/auth/login")
  }, [session.isSuccess, session.isFetching, session.data, router])

  if (session.isError && !session.isFetching) {
    return (
      <div className="m-auto max-w-md p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {errorMessage(session.error)}
            <Button className="mt-3" variant="outline" onClick={() => void session.refetch()}>
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  // Verify on initial mount, but preserve forms during routine background checks.
  if (session.isPending || (!session.isFetchedAfterMount && session.isFetching) || !session.data || session.isError) {
    return <div role="status" className="m-auto p-6 text-muted-foreground">Đang kiểm tra phiên đăng nhập…</div>
  }
  return children(session.data)
}
