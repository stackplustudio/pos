import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-md border border-brand-line-strong bg-brand-surface px-3 py-2 text-sm text-brand-ink-dark placeholder:text-brand-ink-muted transition-colors duration-150 ease-standard outline-none focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-brand-surface-alt disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
