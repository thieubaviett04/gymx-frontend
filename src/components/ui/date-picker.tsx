'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { vi } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string; // Format: YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  onFocus?: () => void;
}

export function FigmaCalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6.33329 11.547C6.83955 11.547 7.24996 11.1366 7.24996 10.6303C7.24996 10.124 6.83955 9.71362 6.33329 9.71362C5.82703 9.71362 5.41663 10.124 5.41663 10.6303C5.41663 11.1366 5.82703 11.547 6.33329 11.547Z"
        fill="currentColor"
      />
      <path
        d="M6.33329 15.2135C6.83955 15.2135 7.24996 14.8031 7.24996 14.2968C7.24996 13.7905 6.83955 13.3801 6.33329 13.3801C5.82703 13.3801 5.41663 13.7905 5.41663 14.2968C5.41663 14.8031 5.82703 15.2135 6.33329 15.2135Z"
        fill="currentColor"
      />
      <path
        d="M14.5833 10.6303C14.5833 11.1366 14.1729 11.547 13.6667 11.547C13.1604 11.547 12.75 11.1366 12.75 10.6303C12.75 10.124 13.1604 9.71362 13.6667 9.71362C14.1729 9.71362 14.5833 10.124 14.5833 10.6303Z"
        fill="currentColor"
      />
      <path
        d="M13.6667 15.2135C14.1729 15.2135 14.5833 14.8031 14.5833 14.2968C14.5833 13.7905 14.1729 13.3801 13.6667 13.3801C13.1604 13.3801 12.75 13.7905 12.75 14.2968C12.75 14.8031 13.1604 15.2135 13.6667 15.2135Z"
        fill="currentColor"
      />
      <path
        d="M10.9167 10.6303C10.9167 11.1366 10.5063 11.547 10 11.547C9.49378 11.547 9.08337 11.1366 9.08337 10.6303C9.08337 10.124 9.49378 9.71362 10 9.71362C10.5063 9.71362 10.9167 10.124 10.9167 10.6303Z"
        fill="currentColor"
      />
      <path
        d="M10 15.2135C10.5063 15.2135 10.9167 14.8031 10.9167 14.2968C10.9167 13.7905 10.5063 13.3801 10 13.3801C9.49378 13.3801 9.08337 13.7905 9.08337 14.2968C9.08337 14.8031 9.49378 15.2135 10 15.2135Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.33337 1C6.74759 1 7.08337 1.33579 7.08337 1.75V1.93809C7.78234 1.91674 8.58204 1.91674 9.50078 1.91675H10.4992C11.418 1.91674 12.2177 1.91674 12.9166 1.93809V1.75C12.9166 1.33579 13.2524 1 13.6666 1C14.0808 1 14.4166 1.33579 14.4166 1.75V2.042C15.2602 2.14826 15.9718 2.35098 16.6029 2.75957C17.2249 3.16218 17.7546 3.69186 18.1572 4.3138C18.61 5.01338 18.81 5.81169 18.906 6.77903C19 7.7258 19 8.91183 19 10.4176V10.4993C19 12.005 19 13.191 18.906 14.1378C18.81 15.1051 18.61 15.9035 18.1572 16.603C17.7546 17.225 17.2249 17.7547 16.6029 18.1573C15.9034 18.6101 15.1051 18.8101 14.1377 18.9061C13.191 19.0001 12.005 19.0001 10.4993 19.0001H9.50073C7.99504 19.0001 6.80904 19.0001 5.86228 18.9061C4.89494 18.8101 4.09663 18.6101 3.39705 18.1573C2.77511 17.7547 2.24543 17.225 1.84283 16.603C1.38996 15.9035 1.19 15.1051 1.09397 14.1378C0.999987 13.191 0.999993 12.005 1 10.4993V10.4175C0.999993 8.91181 0.999987 7.7258 1.09397 6.77903C1.19 5.81169 1.38996 5.01338 1.84283 4.3138C2.24543 3.69186 2.77511 3.16218 3.39705 2.75957C4.02824 2.35098 4.73981 2.14826 5.58337 2.042V1.75C5.58337 1.33579 5.91916 1 6.33337 1ZM12.9166 3.43872V3.58333C12.9166 3.99755 13.2524 4.33333 13.6666 4.33333C14.0808 4.33333 14.4166 3.99755 14.4166 3.58333V3.55625C15.0273 3.64905 15.4458 3.79738 15.7878 4.01877C16.2321 4.30634 16.6104 4.68469 16.898 5.12893C17.1042 5.44754 17.2471 5.83258 17.3407 6.37754C17.0419 6.34499 16.6782 6.30921 16.2498 6.27351C14.8541 6.1572 12.7709 6.04175 10 6.04175C7.22914 6.04175 5.14586 6.1572 3.75021 6.27351C3.32176 6.30921 2.95813 6.34499 2.65932 6.37754C2.75292 5.83258 2.89577 5.44754 3.10202 5.12893C3.38959 4.68469 3.76794 4.30634 4.21218 4.01877C4.55417 3.79738 4.9727 3.64905 5.58337 3.55625V3.58333C5.58337 3.99755 5.91916 4.33333 6.33337 4.33333C6.74759 4.33333 7.08337 3.99755 7.08337 3.58333V3.43872C7.75961 3.41709 8.56273 3.41675 9.54167 3.41675H10.4583C11.4373 3.41675 12.2404 3.41709 12.9166 3.43872ZM17.4747 7.9024C17.1478 7.86363 16.6979 7.81605 16.1252 7.76832C14.7709 7.65546 12.7291 7.54175 10 7.54175C7.27086 7.54175 5.22914 7.65546 3.87478 7.76832C3.30206 7.81605 2.85222 7.86363 2.52528 7.9024C2.50038 8.59869 2.5 9.43189 2.5 10.4584C2.5 12.014 2.50086 13.1256 2.58663 13.9896C2.67121 14.8416 2.83246 15.3715 3.10202 15.7879C3.38959 16.2321 3.76794 16.6105 4.21218 16.8981C4.62858 17.1676 5.15844 17.3289 6.01046 17.4134C6.87449 17.4992 7.98611 17.5001 9.54167 17.5001H10.4583C12.0139 17.5001 13.1255 17.4992 13.9895 17.4134C14.8416 17.3289 15.3714 17.1676 15.7878 16.8981C16.2321 16.6105 16.6104 16.2321 16.898 15.7879C17.1675 15.3715 17.3288 14.8416 17.4134 13.9896C17.4991 13.1256 17.5 12.014 17.5 10.4584C17.5 9.43189 17.4996 8.59869 17.4747 7.9024Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Chọn',
  disabled = false,
  className,
  id,
  onFocus,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse YYYY-MM-DD string to Date object
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const parts = value.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange('');
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setOpen(false);
  };

  // Format display text DD/MM/YYYY
  const displayValue = React.useMemo(() => {
    if (!selectedDate) return '';
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const year = selectedDate.getFullYear();
    return `${day}/${month}/${year}`;
  }, [selectedDate]);

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen && onFocus) onFocus();
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          onFocus={onFocus}
          className={cn(
            'flex h-[44px] w-full items-center justify-between rounded-[8px] border border-[#CDD5DF] bg-white px-3.5 py-2 text-[14px] text-[#2F3D50] shadow-2xs transition-all hover:border-[#064343] focus:outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400',
            open && 'border-[#064343] ring-1 ring-[#064343]',
            className
          )}
        >
          <span className={cn('truncate', !displayValue && 'text-[#697586] font-normal')}>
            {displayValue || placeholder}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {displayValue && !disabled && (
              <span
                onClick={handleClear}
                className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Xóa ngày đã chọn"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <FigmaCalendarIcon className="w-5 h-5 text-[#697586]" />
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        avoidCollisions={false}
        className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-3.5 bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_10px_30px_rgba(0,0,0,0.12)] z-50"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          autoFocus
          captionLayout="label"
          locale={vi}
          className="w-full"
        />

        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs px-1">
          <button
            type="button"
            onClick={() => handleSelect(new Date())}
            className="text-[#064343] font-medium hover:underline cursor-pointer"
          >
            Hôm nay
          </button>
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-red-500 cursor-pointer"
            >
              Xóa chọn
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
