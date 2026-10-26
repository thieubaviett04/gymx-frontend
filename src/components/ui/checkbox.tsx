import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: boolean
  label?: React.ReactNode
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      checked,
      onCheckedChange,
      onChange,
      error,
      label,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const checkboxId = id || generatedId

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      onCheckedChange?.(e.target.checked)
    }

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer select-none text-sm text-[#525252] leading-6",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="relative flex items-center justify-center shrink-0">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              "w-4 h-4 rounded-[4px] border transition-all duration-150 flex items-center justify-center",
              "bg-white border-border peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40",
              "peer-checked:bg-primary peer-checked:border-primary",
              error && "border-danger ring-1 ring-danger/20",
              !disabled && !checked && "hover:border-[#D4D4D4]"
            )}
          >
            {checked && (
              <Check className="w-3 h-3 text-primary-foreground stroke-[3]" />
            )}
          </div>
        </div>
        {label && <span className="text-sm font-normal text-[#525252]">{label}</span>}
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
