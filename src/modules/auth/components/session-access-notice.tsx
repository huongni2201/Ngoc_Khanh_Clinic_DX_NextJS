"use client"

import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useLogout } from "../hooks/use-auth"
import type { UserSession } from "../types"

export function SessionAccessNotice({ session }: { session: UserSession }) {
  const router = useRouter()
  const { logout, isLoggingOut, logoutError } = useLogout()

  const handleLogout = async () => {
    if (await logout()) router.replace("/auth/login")
  }

  return (
    <div className="m-auto w-full max-w-md space-y-4 p-6">
      <h1 className="text-xl font-semibold text-foreground">Đã đăng nhập</h1>
      <p className="text-foreground">{session.username}</p>
      <Alert>
        <AlertDescription>
          {session.principalType === "PATIENT"
            ? "Hiện chưa có chức năng dành cho tài khoản bệnh nhân trên giao diện này."
            : "Tài khoản chưa có vai trò đang hiệu lực để truy cập khu vực nhân viên. Vui lòng liên hệ phòng khám."}
        </AlertDescription>
      </Alert>
      {logoutError && <Alert variant="destructive"><AlertDescription>{logoutError}</AlertDescription></Alert>}
      <Button disabled={isLoggingOut} onClick={() => void handleLogout()}>
        {isLoggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
      </Button>
    </div>
  )
}
