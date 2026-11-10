'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  className?: string;
}

export function Slider({
  value,
  min = 0,
  max = 30,
  step = 0.5,
  disabled = false,
  onChange,
  className,
}: SliderProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn('relative flex items-center w-full select-none touch-none', className)}>
      <div className="relative w-full h-[8px] bg-[#E2E8F0] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#064343] transition-all duration-75"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] bg-white border-2 border-[#064343] rounded-full shadow-sm pointer-events-none transition-all duration-75"
        style={{ left: `calc(${percentage}% - 9px)` }}
      />
    </div>
  );
}

export default Slider;
