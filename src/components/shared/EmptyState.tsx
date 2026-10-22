import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-white">
      <div className="w-14 h-14 rounded-2xl bg-[#F9FAFB] flex items-center justify-center text-[#99A1AF] mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-[#101828] mb-1">{title}</h3>
      <p className="text-xs text-[#6A7282] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
