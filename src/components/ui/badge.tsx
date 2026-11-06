import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Component Badge theo chuẩn GymX Design System (Figma Node 1437:1446)
 * - active: #06D7A0 (Hoạt động)
 * - inactive: #FDAD73 (Chưa có dữ liệu / Chưa kích hoạt)
 * - discontinued / locked: #F37277 (Đang khóa / Ngừng kinh doanh)
 * - processing: #4BC9F0 (Đang xử lý)
 * - planning: #5B70B3 (Lên kế hoạch)
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-[6px] px-3 py-[5px] text-[13px] leading-[18px] font-normal transition-colors select-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
          "border-transparent bg-[#F37277] text-white",
        outline: "text-foreground border border-border",
        success:
          "border-transparent bg-[#06D7A0] text-white",
        warning:
          "border-transparent bg-[#FDAD73] text-white",
        muted:
          "border-transparent bg-muted text-muted-foreground",
        // Chuẩn GymX Figma Node 1437:1446
        active:
          "border-transparent bg-[#06D7A0] text-white",
        inactive:
          "border-transparent bg-[#FDAD73] text-white",
        discontinued:
          "border-transparent bg-[#F37277] text-white",
        locked:
          "border-transparent bg-[#F37277] text-white",
        processing:
          "border-transparent bg-[#4BC9F0] text-white",
        planning:
          "border-transparent bg-[#5B70B3] text-white",
        upcoming:
          "border-transparent bg-[#64748B] text-white",
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
