'use client';

import React from 'react';
import { ConfirmDialog } from '@/components/ui';
import { formatVND } from '@/lib/utils/formatters';
import type { ExpenseSummaryDto } from '@/types/finance';

interface CancelExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseSummaryDto | null;
  onConfirm: (id: string, reason: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function CancelExpenseModal({
  isOpen,
  onClose,
  expense,
  onConfirm,
  isSubmitting = false,
}: CancelExpenseModalProps) {
  if (!isOpen || !expense) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={async () => {
        await onConfirm(expense.id, 'Hủy phiếu chi theo yêu cầu của quản trị viên');
      }}
      type="danger"
      size="sm"
      title="Hủy phiếu chi vận hành"
      description={
        <span>
          Bạn có chắc chắn muốn hủy phiếu chi{' '}
          <strong className="text-[#064343] font-semibold">{expense.expenseCode}</strong>{' '}
          với số tiền{' '}
          <strong className="text-[#EE464C] font-semibold">
            {formatVND(expense.amount)}
          </strong>{' '}
          không?
        </span>
      }
      cancelText="Hủy"
      confirmText="Hủy phiếu chi"
      isLoading={isSubmitting}
    />
  );
}

export default CancelExpenseModal;
