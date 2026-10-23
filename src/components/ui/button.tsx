import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-all duration-150 outline-none select-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-none hover:bg-[#FF8833] active:bg-[#CC5500] focus-visible:ring-2 focus-visible:ring-primary/40",
        primary:
          "bg-primary text-white shadow-none hover:bg-[#FF8833] active:bg-[#CC5500] focus-visible:ring-2 focus-visible:ring-primary/40",
        outline:
          "border border-border bg-white text-[#0A0A0A] hover:bg-[#F5F5F5] hover:text-[#0A0A0A] active:bg-[#E5E5E5] focus-visible:ring-2 focus-visible:ring-border",
        ghost:
          "text-[#0A0A0A] hover:bg-[#F5F5F5] active:bg-[#E5E5E5] focus-visible:ring-2 focus-visible:ring-border",
        destructive:
          "bg-danger text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-2 focus-visible:ring-danger/40",
        link:
          "text-primary underline-offset-4 hover:underline hover:text-[#FF8833] p-0 h-auto font-normal",
        secondary:
          "bg-[#F5F5F5] text-[#0A0A0A] hover:bg-[#E5E5E5] active:bg-[#D4D4D4] focus-visible:ring-2 focus-visible:ring-border",
      },
      size: {
        default: "h-10 px-4 text-sm gap-2 rounded-lg [&_svg:not([class*='size-'])]:size-4",
        sm: "h-9 px-3.5 text-sm gap-1.5 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 px-4 text-sm gap-2 rounded-lg [&_svg:not([class*='size-'])]:size-4",
        xs: "h-7 px-2.5 text-xs gap-1 rounded-md [&_svg:not([class*='size-'])]:size-3",
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
