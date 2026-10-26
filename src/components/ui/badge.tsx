import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary-hover",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",
        accent:
          "border-transparent bg-primary-light text-primary-foreground",
        teal:
          "border-transparent bg-secondary-light text-secondary-dark font-medium",
        destructive:
          "border-transparent bg-danger text-white shadow-sm hover:bg-red-600",
        outline: "text-foreground border-border",
        success:
          "border-transparent bg-success text-white shadow-sm hover:bg-emerald-600",
        warning:
          "border-transparent bg-warning text-white shadow-sm hover:bg-amber-600",
        muted:
          "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
