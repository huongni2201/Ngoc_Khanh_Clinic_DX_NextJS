"use client"

import * as React from "react"
import { AppSidebar } from "@/widgets/app-sidebar"
import { AppHeader, type AppHeaderUser } from "@/widgets/app-header"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { AuthBoundary } from "@/modules/accesscontrol"
import { PaymentCompletionNotifier } from "@/modules/billing"

export interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <AuthBoundary>
      {(session) => (
        <AuthenticatedShell key={session.userId} user={{
          name: session.username,
          role: [...new Set(session.roleAssignments.map((assignment) => assignment.roleCode))].join(", "),
        }}>
          {children}
        </AuthenticatedShell>
      )}
    </AuthBoundary>
  )
}

function AuthenticatedShell({ children, user }: AppShellProps & { user: AppHeaderUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-2 focus:ring-ring"
      >
        Bỏ qua đến nội dung chính
      </a>
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
        <AppHeader user={user} onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Main Content Area */}
        <main
          id="main-content"
          className="flex flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 xl:px-8"
        >
          <div className="w-full flex-1 flex flex-col">
            {children}
          </div>
        </main>
      </div>
      <PaymentCompletionNotifier />
    </div>
  )
}
