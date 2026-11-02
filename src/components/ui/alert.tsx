import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, X, AlertTriangle, AlertCircle, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative flex items-center w-full bg-white border border-[#E5E5E5] rounded-full shadow-[0px_4px_12px_rgba(0,0,0,0.05)] transition-all animate-in fade-in duration-200",
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
      size: {
        default: "min-h-[56px] p-1 pr-4 pl-1 gap-3 sm:gap-4",
        sm: "min-h-[46px] p-1.5 pr-4 pl-1.5 gap-3",
      },
    },
    defaultVariants: {
      variant: "danger",
      size: "default",
    },
  }
)

const iconBgVariants: Record<string, string> = {
  danger: "bg-danger",
  error: "bg-danger",
  deleted: "bg-danger",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-secondary",
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
      size = "default",
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
    const isSm = size === "sm"

    const defaultIcon = React.useMemo(() => {
      const iconClass = isSm ? "w-4 h-4 text-white stroke-[2.5]" : "w-5 h-5 text-white stroke-[2.5]"
      switch (currentVariant) {
        case "success":
          return <Check className={iconClass} />
        case "warning":
          return <AlertTriangle className={iconClass} />
        case "info":
          return <Info className={iconClass} />
        case "danger":
        case "error":
        case "deleted":
        default:
          return <X className={iconClass} />
      }
    }, [currentVariant, isSm])

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant, size }), className)}
        {...props}
      >
        {/* Left Circle Icon Badge */}
        <div
          className={cn(
            isSm
              ? "w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 shadow-xs"
              : "w-[48px] h-[48px] sm:w-[50px] sm:h-[50px] rounded-full flex items-center justify-center shrink-0 shadow-sm",
            iconBgVariants[currentVariant] || iconBgVariants.danger
          )}
        >
          {icon || defaultIcon}
        </div>

        {/* Center Content / Message */}
        <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-center">
          {title && (
            <p className={cn("font-medium text-foreground leading-tight mb-0.5", isSm ? "text-xs" : "text-sm")}>
              {title}
            </p>
          )}
          <div className={cn("font-normal text-foreground leading-snug break-words", isSm ? "text-[13px]" : "text-sm")}>
            {children}
          </div>
        </div>

        {/* Right Close Button */}
        {isDismissible && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thông báo"
            className={cn(
              "rounded-full text-muted-foreground hover:text-foreground hover:bg-[#F5F5F5] transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              isSm ? "p-1" : "p-1.5"
            )}
          >
            <X className={isSm ? "w-3.5 h-3.5" : "w-5 h-5"} />
          </button>
        )}
      </div>
    )
  }
)

Alert.displayName = "Alert"

export { Alert, alertVariants }
