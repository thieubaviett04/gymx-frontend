'use client';

import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PasswordRule {
  id: string;
  label: string;
  isValid: boolean;
}

export interface PasswordChecklistProps {
  password: string;
  className?: string;
  showAlways?: boolean;
}

export function checkPasswordCriteria(password: string): PasswordRule[] {
  return [
    {
      id: 'length',
      label: 'Tối thiểu 8 ký tự',
      isValid: password.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'Ít nhất 1 chữ in hoa (A-Z)',
      isValid: /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'Ít nhất 1 chữ thường (a-z)',
      isValid: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'Ít nhất 1 chữ số (0-9)',
      isValid: /[0-9]/.test(password),
    },
    {
      id: 'special',
      label: 'Ít nhất 1 ký tự đặc biệt (@, #, $, !...)',
      isValid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];
}

export function isPasswordValid(password: string): boolean {
  return checkPasswordCriteria(password).every((rule) => rule.isValid);
}

export function PasswordChecklist({
  password,
  className,
  showAlways = false,
}: PasswordChecklistProps) {
  const rules = checkPasswordCriteria(password);
  const isStarted = password.length > 0;

  if (!showAlways && !isStarted) {
    return (
      <div className={cn('text-xs text-[#6A7282] mt-1 space-y-1', className)}>
        <span>Mật khẩu mới tối thiểu 8 ký tự gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt.</span>
      </div>
    );
  }

  return (
    <div className={cn('bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-3 mt-1.5 space-y-1.5 transition-all', className)}>
      <div className="text-xs font-medium text-[#4A5565] mb-1">Tiêu chuẩn mật khẩu an toàn:</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
        {rules.map((rule) => {
          return (
            <div
              key={rule.id}
              className={cn(
                'flex items-center gap-1.5 transition-colors duration-150',
                rule.isValid ? 'text-[#16A34A] font-medium' : 'text-[#6A7282]'
              )}
            >
              {rule.isValid ? (
                <div className="w-3.5 h-3.5 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-[#16A34A] stroke-[3]" />
                </div>
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-[#D1D5DB] flex items-center justify-center shrink-0">
                  <Circle className="w-1.5 h-1.5 text-transparent" />
                </div>
              )}
              <span>{rule.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PasswordChecklist;
