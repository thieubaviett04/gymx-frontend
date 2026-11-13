'use client';

import React, { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { TrashBinIcon } from '@/components/ui';
import { formatDate, formatVND } from '@/lib/utils/formatters';
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
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !expense) return null;

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do hủy phiếu chi.');
      return;
    }
    if (reason.trim().length > 500) {
      setError('Lý do hủy không được vượt quá 500 ký tự.');
      return;
    }

    await onConfirm(expense.id, reason.trim());
    setReason('');
    setError('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hủy phiếu chi vận hành"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[540px] bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="pt-5 pb-4 px-6 flex items-center justify-between shrink-0 bg-white border-b border-[#F1F5F9]">
          <div className="flex items-center h-[26px] border-l-[4px] border-[#EE464C] pl-4 min-w-0">
            <h3 className="text-[18px] sm:text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              Hủy phiếu chi vận hành
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#525252] flex items-center justify-center transition-colors cursor-pointer ml-1 disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#EE464C] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5 text-[13px] text-red-900 leading-relaxed">
              <span className="font-semibold">Lưu ý thao tác không thể hoàn tác:</span>
              <span className="text-[12.5px] text-red-700">
                Sau khi xác nhận hủy, phiếu chi này sẽ bị vô hiệu hóa vĩnh viễn và không còn được tính vào tổng chi phí hoạt động.
              </span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 grid grid-cols-3 gap-3 text-[13px]">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[12px] font-medium text-[#64748B]">Mã phiếu chi</span>
              <span className="font-semibold text-[#064343] truncate">{expense.expenseCode}</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[12px] font-medium text-[#64748B]">Số tiền chi</span>
              <span className="font-semibold text-[#EE464C] truncate">-{formatVND(expense.amount)}</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[12px] font-medium text-[#64748B]">Ngày chi</span>
              <span className="font-medium text-[#202939] truncate">{formatDate(expense.expenseDate)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Lý do hủy phiếu chi <span className="text-[#EE464C]">*</span>
            </label>
            <textarea
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Nhập"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-[8px] text-[14px] text-[#202939] placeholder:text-slate-400 outline-none resize-none focus:bg-white focus:border-[#EE464C] focus:ring-1 focus:ring-[#EE464C]"
            />
            {error && (
              <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1 animate-in fade-in duration-200">
                {error}
              </p>
            )}
          </div>
        </form>

        <div className="h-[64px] px-6 bg-[#F8FAFC] border-t border-[#EAEDF2] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-[40px] px-5 bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="h-[40px] px-5 rounded-[10px] text-[13px] font-medium leading-[20px] text-white bg-[#EE464C] hover:bg-[#D9383E] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <TrashBinIcon className="w-4 h-4 text-white" color="#FFFFFF" />
                <span>Xác nhận hủy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelExpenseModal;
