import { cn } from "@/lib/utils"

interface WorklistTab<T extends string> {
  key: T
  label: string
}

interface WorklistTabHeaderProps<T extends string> {
  title: string
  count: number
  tabs: WorklistTab<T>[]
  activeTab: T
  onTabChange: (tab: T) => void
}

/** Title, row count and status tabs shown above a worklist table. */
export function WorklistTabHeader<T extends string>({
  title,
  count,
  tabs,
  activeTab,
  onTabChange,
}: WorklistTabHeaderProps<T>) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-border px-5 pt-4 pb-0 gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold text-foreground tracking-tight">{title}</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-surface-alt font-medium text-primary">
          {count}
        </span>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center overflow-x-auto gap-1 -mb-px scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer",
                isActive
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-secondary-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
