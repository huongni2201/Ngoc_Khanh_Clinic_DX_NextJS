"use client"

import * as React from "react"
import { AppSidebar } from "@/widgets/app-sidebar/app-sidebar"
import { AppHeader } from "@/widgets/app-header/app-header"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <AppSidebar className="hidden lg:flex h-full" />

      {/* Mobile Drawer Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 max-w-[85vw]">
          <AppSidebar className="border-r-0 w-full h-full" />
        </SheetContent>
      </Sheet>

      {/* Main Column */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <AppHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-6 flex flex-col">
          <div className="w-full flex-1 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
