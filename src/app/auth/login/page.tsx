import type { Metadata } from "next"
import { LoginPage } from "@/modules/accesscontrol"

export const metadata: Metadata = {
  title: "Đăng nhập — Ngọc Khánh Clinic",
  description: "Đăng nhập hệ thống Quản lý khám sức khỏe đơn vị Ngọc Khánh Clinic",
}

export default function LoginRoute() {
  return <LoginPage />
}

