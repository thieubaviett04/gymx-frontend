import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground placeholder:font-normal font-normal text-sm transition-all duration-150 outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
  {
    variants: {
      inputSize: {
        default: "h-11 px-3.5 py-2.5",
        sm: "h-9 px-3 py-1.5 text-xs",
        lg: "h-12 px-4 py-3 text-base",
      },
      hasError: {
        true: "!border-[1.5px] !border-danger focus:!border-danger focus:!ring-1 focus:!ring-danger shadow-none",
        false:
          "border border-border hover:border-[#D4D4D4] focus:border-primary focus:ring-1 focus:ring-primary shadow-none",
      },
    },
    defaultVariants: {
      inputSize: "default",
      hasError: false,
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: React.ReactNode
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
  containerClassName?: string
  labelClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      labelClassName,
      type = "text",
      inputSize = "default",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      required,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    const isPassword = type === "password"
    const [passwordVisible, setPasswordVisible] = React.useState(false)

    const actualType = isPassword ? (passwordVisible ? "text" : "password") : type
    const shouldShowToggle = isPassword && (showPasswordToggle || showPasswordToggle === undefined)

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none select-none transition-colors",
              error ? "text-danger" : "text-foreground",
              labelClassName
            )}
          >
            {label}
            {required && <span className="ml-1 text-danger">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-muted-foreground [&_svg]:size-4">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            type={actualType}
            disabled={disabled}
            required={required}
            className={cn(
              inputVariants({ inputSize, hasError: Boolean(error) }),
              leftIcon && "pl-10",
              (rightIcon || shouldShowToggle) && "pr-10",
              className
            )}
            {...props}
          />

          {shouldShowToggle ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setPasswordVisible((prev) => !prev)}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              className="absolute right-3.5 p-0.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            >
              {passwordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3.5 flex items-center text-[#525252] [&_svg]:size-4">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {error ? (
          <p className="text-xs font-normal text-danger leading-tight flex items-center gap-1 mt-0.5">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs font-normal text-muted-foreground leading-tight mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input, inputVariants }
