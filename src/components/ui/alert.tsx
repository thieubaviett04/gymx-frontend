import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, X, AlertTriangle, AlertCircle, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative flex items-center w-full min-h-[60px] p-1 pr-4 pl-1 bg-white border border-[#E5E5E5] rounded-full shadow-[0px_4px_12px_rgba(0,0,0,0.05)] transition-all animate-in fade-in duration-200",
  {
    variants: {
      variant: {
        danger: "",
        error: "",
        deleted: "",
        success: "",
        warning: "",
        info: "",
      },
    },
    defaultVariants: {
      variant: "danger",
    },
  }
)

const iconBgVariants: Record<string, string> = {
  danger: "bg-[#EF4444]",
  error: "bg-[#EF4444]",
  deleted: "bg-[#EF4444]",
  success: "bg-[#22C55E]",
  warning: "bg-[#FFB800]",
  info: "bg-[#3B82F6]",
}

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  icon?: React.ReactNode
  onClose?: () => void
  isDismissible?: boolean
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "danger",
      title,
      children,
      icon,
      onClose,
      isDismissible = true,
      ...props
    },
    ref
  ) => {
    const currentVariant = (variant as string) || "danger"

    const defaultIcon = React.useMemo(() => {
      switch (currentVariant) {
        case "success":
          return <Check className="w-5 h-5 text-white stroke-[2.5]" />
        case "warning":
          return <AlertTriangle className="w-5 h-5 text-white stroke-[2.5]" />
        case "info":
          return <Info className="w-5 h-5 text-white stroke-[2.5]" />
        case "danger":
        case "error":
        case "deleted":
        default:
          return <X className="w-5 h-5 text-white stroke-[2.5]" />
      }
    }, [currentVariant])

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), "gap-3 sm:gap-4", className)}
        {...props}
      >
        {/* Left Circle Icon Badge */}
        <div
          className={cn(
            "w-[50px] h-[50px] sm:w-[52px] sm:h-[52px] rounded-full flex items-center justify-center shrink-0 shadow-sm",
            iconBgVariants[currentVariant] || iconBgVariants.danger
          )}
        >
          {icon || defaultIcon}
        </div>

        {/* Center Content / Message */}
        <div className="flex-1 min-w-0 py-1.5 flex flex-col justify-center">
          {title && (
            <p className="text-sm font-semibold text-[#0A0A0A] leading-tight mb-0.5">
              {title}
            </p>
          )}
          <div className="text-sm font-normal text-[#0A0A0A] leading-snug break-words">
            {children}
          </div>
        </div>

        {/* Right Close Button */}
        {isDismissible && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thông báo"
            className="p-1.5 rounded-full text-[#737373] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    )
  }
)

Alert.displayName = "Alert"

export { Alert, alertVariants }
