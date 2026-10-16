import type { Metadata } from "next"
import { LoginPage } from "@/modules/accesscontrol"

export const metadata: Metadata = {
  title: "Đăng nhập — Phòng khám Ngọc Khánh",
  description: "Đăng nhập hệ thống Quản lý khám sức khỏe đơn vị Phòng khám Ngọc Khánh",
}

export default function LoginRoute() {
  return <LoginPage />
}

