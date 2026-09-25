import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

import { QueryProvider } from "@/providers/query-provider";
import { PaymentCompletionNotifier } from "@/modules/billing";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ngọc Khánh Clinic — Quản lý khám sức khỏe đơn vị",
  description: "Hệ thống quản lý khám sức khỏe định kỳ đơn vị Ngọc Khánh Clinic",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={cn("h-full", "antialiased", geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="h-full flex flex-col bg-background text-foreground overflow-hidden">
        <QueryProvider>{children}<PaymentCompletionNotifier /></QueryProvider>
      </body>
    </html>
  );
}

