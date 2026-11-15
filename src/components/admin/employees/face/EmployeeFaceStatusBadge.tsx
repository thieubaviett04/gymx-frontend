'use client';

import React from 'react';
import { Camera, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmployeeFaceStatusBadgeProps {
  hasFace: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function EmployeeFaceStatusBadge({
  hasFace,
  className,
  size = 'md',
}: EmployeeFaceStatusBadgeProps) {
  if (hasFace) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 font-medium rounded-[6px] border transition-colors',
          size === 'sm'
            ? 'px-2 py-0.5 text-[11px] leading-[16px]'
            : 'px-2.5 py-1 text-[12px] leading-[18px]',
          'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
          className
        )}
      >
        <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>Đã có dữ liệu khuôn mặt</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-[6px] border transition-colors',
        size === 'sm'
          ? 'px-2 py-0.5 text-[11px] leading-[16px]'
          : 'px-2.5 py-1 text-[12px] leading-[18px]',
        'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]',
        className
      )}
    >
      <Camera className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>Chưa đăng ký khuôn mặt</span>
    </span>
  );
}

export default EmployeeFaceStatusBadge;

