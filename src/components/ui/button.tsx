import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center font-semibold text-sm whitespace-nowrap transition-all duration-200 outline-none select-none disabled:pointer-events-none active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-[#011010] font-bold tracking-tight shadow-[0_4px_14px_rgba(186,253,0,0.3)] hover:bg-primary-hover hover:shadow-[0_6px_20px_rgba(186,253,0,0.4)] active:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary/40 disabled:bg-[#E5E7EB] disabled:text-[#4B5563] disabled:shadow-none disabled:cursor-not-allowed",
        primary:
          "bg-primary text-[#011010] font-bold tracking-tight shadow-[0_4px_14px_rgba(186,253,0,0.3)] hover:bg-primary-hover hover:shadow-[0_6px_20px_rgba(186,253,0,0.4)] active:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary/40 disabled:bg-[#E5E7EB] disabled:text-[#4B5563] disabled:shadow-none disabled:cursor-not-allowed",
        gradient:
          "bg-gradient-to-r from-primary to-primary-light text-[#011010] font-bold tracking-tight shadow-[0_4px_16px_rgba(186,253,0,0.35)] hover:shadow-[0_6px_22px_rgba(186,253,0,0.5)] hover:opacity-95 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary/40 disabled:bg-[#E5E7EB] disabled:text-[#4B5563] disabled:shadow-none disabled:cursor-not-allowed",
        outline:
          "border-2 border-[#D1D5DB] bg-white text-[#111827] font-semibold hover:border-foreground/50 hover:bg-[#F9FAFB] hover:text-foreground active:bg-[#F3F4F6] focus-visible:ring-2 focus-visible:ring-secondary/20 disabled:bg-white disabled:border-[#E5E7EB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed shadow-2xs",
        ghost:
          "text-[#111827] font-semibold hover:bg-[#F3F4F6] hover:text-foreground active:bg-[#E5E7EB] focus-visible:ring-2 focus-visible:ring-secondary/20 disabled:text-[#9CA3AF] disabled:cursor-not-allowed",
        destructive:
          "bg-danger text-white font-bold hover:bg-red-600 active:bg-red-700 focus-visible:ring-2 focus-visible:ring-danger/40 disabled:bg-[#FCA5A5] disabled:cursor-not-allowed shadow-sm",
        link:
          "text-secondary hover:text-[#011010] font-bold underline-offset-4 hover:underline active:text-secondary p-0 h-auto disabled:text-[#9CA3AF] disabled:no-underline transition-colors",
        secondary:
          "bg-secondary text-secondary-foreground font-bold hover:bg-[#085555] active:bg-secondary-dark focus-visible:ring-2 focus-visible:ring-secondary/40 disabled:bg-[#064343]/50 disabled:text-white/60 disabled:cursor-not-allowed shadow-sm",
        auth:
          "bg-[linear-gradient(40deg,#064343_54%,#525252_100%)] text-white !text-[14px] !font-normal shadow-sm outline-none border-none select-none disabled:cursor-not-allowed hover:bg-[linear-gradient(40deg,#064343_54%,#525252_100%)] hover:opacity-100",
      },
      size: {
        default: "h-10 px-4 text-btn-default gap-2 rounded-lg [&_svg:not([class*='size-'])]:size-4",
        sm: "h-9 px-3.5 text-btn-small gap-1.5 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 px-4 text-btn-default gap-2 rounded-lg [&_svg:not([class*='size-'])]:size-4",
        xl: "h-12 px-6 text-base gap-2 rounded-lg [&_svg:not([class*='size-'])]:size-4",
        xs: "h-7 px-2.5 text-btn-small gap-1 rounded-md [&_svg:not([class*='size-'])]:size-3",
        icon: "size-10 p-0 rounded-lg [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-9 p-0 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11 p-0 rounded-lg [&_svg:not([class*='size-'])]:size-5",
      },
      rounded: {
        default: "",
        full: "!rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot.Root
          ref={ref}
          data-slot="button"
          data-variant={variant}
          data-size={size}
          className={cn(buttonVariants({ variant, size, rounded, className }))}
          {...props}
        >
          {children}
        </Slot.Root>
      )
    }

    return (
      <button
        ref={ref}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0 items-center">{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
