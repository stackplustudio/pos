import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent font-medium whitespace-nowrap transition-colors duration-150 ease-standard outline-none select-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-brand-primary text-white hover:bg-brand-primary-dark shadow-sm",
        outline:
          "border-brand-line bg-brand-surface text-brand-ink-dark hover:bg-brand-surface-alt hover:text-brand-ink-dark shadow-sm",
        secondary:
          "bg-brand-surface-alt text-brand-ink-dark hover:bg-brand-line hover:text-brand-ink-dark",
        ghost:
          "text-brand-ink hover:bg-brand-surface-alt hover:text-brand-ink-dark",
        destructive:
          "bg-danger text-white hover:bg-danger-dark shadow-sm focus-visible:ring-danger",
        link: "text-brand-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 gap-2 px-4 text-sm",
        sm: "h-9 gap-1.5 px-3 text-compact",
        lg: "h-11 gap-2.5 px-5 text-base",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
