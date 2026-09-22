import * as React from "react"

export function LoginBackgroundDecorations() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* Soft Ambient Light Glows */}
      <div className="absolute -top-32 -left-32 size-[500px] rounded-full bg-login-decor-shape/60 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 size-[500px] rounded-full bg-login-decor-shape/60 blur-3xl" />
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 size-[600px] rounded-full bg-login-decor-shape/30 blur-3xl" />

      {/* Top-Right Decorative Medical Cross */}
      <div className="absolute top-16 right-16 sm:top-24 sm:right-32 lg:right-44">
        <svg
          className="size-28 sm:size-36 text-login-decor-shape/80 dark:text-login-decor-shape/30"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path
            d="M38 12C38 7.58172 41.5817 4 46 4H54C58.4183 4 62 7.58172 62 12V38H88C92.4183 38 96 41.5817 96 46V54C96 58.4183 92.4183 62 88 62H62V88C62 92.4183 58.4183 96 54 96H46C41.5817 96 38 92.4183 38 88V62H12C7.58172 62 4 58.4183 4 54V46C4 41.5817 7.58172 38 12 38H38V12Z"
          />
        </svg>
      </div>

      {/* Top-Right Dot Matrix Grid */}
      <div className="absolute top-20 right-8 sm:top-28 sm:right-16 lg:right-24 hidden sm:block">
        <svg
          className="w-24 h-24 text-primary/20"
          viewBox="0 0 96 96"
          fill="currentColor"
        >
          {Array.from({ length: 5 }).map((_, rowIndex) =>
            Array.from({ length: 5 }).map((_, colIndex) => (
              <circle
                key={`tr-${rowIndex}-${colIndex}`}
                cx={12 + colIndex * 18}
                cy={12 + rowIndex * 18}
                r={3}
              />
            ))
          )}
        </svg>
      </div>

      {/* Bottom-Left Dot Matrix Grid */}
      <div className="absolute bottom-16 left-8 sm:bottom-24 sm:left-16 lg:left-24">
        <svg
          className="w-28 h-28 text-primary/20"
          viewBox="0 0 110 110"
          fill="currentColor"
        >
          {Array.from({ length: 6 }).map((_, rowIndex) =>
            Array.from({ length: 5 }).map((_, colIndex) => (
              <circle
                key={`bl-${rowIndex}-${colIndex}`}
                cx={12 + colIndex * 20}
                cy={12 + rowIndex * 18}
                r={3}
              />
            ))
          )}
        </svg>
      </div>

      {/* Large Subtle Circle Arc on Left */}
      <div className="absolute -left-48 top-1/4 size-[480px] rounded-full border border-login-decor-shape/50 pointer-events-none hidden md:block" />
    </div>
  )
}
