"use client"

import * as React from "react"
import { AppSidebar } from "@/widgets/app-sidebar/app-sidebar"
import { AppHeader } from "@/widgets/app-header/app-header"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar className="hidden lg:flex h-full" />

      {/* Mobile Drawer Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[248px] max-w-[85vw] p-0">
          <AppSidebar className="border-r-0 w-full h-full" />
        </SheetContent>
      </Sheet>

      {/* Main Column */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <AppHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Main Content Area */}
        <main className="flex flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
          <div className="w-full flex-1 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
