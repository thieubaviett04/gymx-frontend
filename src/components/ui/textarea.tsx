import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean
  minHeight?: number
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize = false, minHeight = 110, value, onChange, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null)

    const adjustHeight = React.useCallback(() => {
      if (!autoResize) return
      const el = internalRef.current
      if (!el) return
      el.style.height = "auto"
      el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`
    }, [autoResize, minHeight])

    React.useEffect(() => {
      adjustHeight()
    }, [value, adjustHeight])

    return (
      <textarea
        ref={(node) => {
          internalRef.current = node
          if (typeof ref === "function") {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        value={value}
        onChange={(e) => {
          onChange?.(e)
          adjustHeight()
        }}
        className={cn(
          "w-full rounded-[8px] p-3.5 text-[14px] bg-slate-50 border border-slate-200 text-[#202939] placeholder:text-[#697586] outline-none transition-all resize-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] disabled:cursor-not-allowed disabled:opacity-60 leading-relaxed",
          autoResize && "overflow-hidden",
          className
        )}
        style={{ minHeight: `${minHeight}px` }}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

