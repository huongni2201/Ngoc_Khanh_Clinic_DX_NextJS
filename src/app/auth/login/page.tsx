import type { Metadata } from "next"
import { LoginPage } from "@/modules/auth"

export const metadata: Metadata = {
  title: "Đăng nhập — Ngọc Khánh Clinic",
  description: "Đăng nhập hệ thống Quản lý khám sức khỏe doanh nghiệp Ngọc Khánh Clinic",
}

export default function LoginRoute() {
  return <LoginPage />
}
