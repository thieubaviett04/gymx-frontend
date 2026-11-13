'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { Badge, TrashBinIcon } from '@/components/ui';
import { financeService } from '@/lib/api';
import { formatDate, formatDateTime, formatVND } from '@/lib/utils/formatters';
import { EXPENSE_CATEGORY_LABELS } from './ExpensesToolbar';
import type { ExpenseSummaryDto } from '@/types/finance';

interface ExpenseDetailSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId: string | null;
  onCancelRequest?: (expense: ExpenseSummaryDto) => void;
}

function InfoItem({
  label,
  value,
  isHighlight = false,
  className = '',
}: {
  label: string;
  value?: React.ReactNode;
  isHighlight?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
      <span className="text-[13px] font-medium text-[#64748B] leading-none">
        {label}
      </span>
      <div
        className={`text-[14px] leading-relaxed break-words ${
          isHighlight ? 'font-semibold text-[#064343]' : 'font-medium text-[#011010]'
        }`}
      >
        {value !== undefined && value !== null && value !== '' ? value : '—'}
      </div>
    </div>
  );
}

export function ExpenseDetailSlidePanel({
  isOpen,
  onClose,
  expenseId,
  onCancelRequest,
}: ExpenseDetailSlidePanelProps) {
  const { data: detail, isLoading } = useQuery({
    queryKey: ['admin-expense-detail', expenseId],
    queryFn: async () => {
      if (!expenseId) return null;
      const res = await financeService.getExpenseById(expenseId);
      return res.data;
    },
    enabled: Boolean(isOpen && expenseId),
  });

  if (!isOpen || !expenseId) return null;

  const isConfirmed = detail?.status === 'CONFIRMED';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết phiếu chi vận hành"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[700px] max-w-full bg-white h-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border-l border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <div className="pt-6 pb-4 pr-6 pl-0 flex items-center justify-between shrink-0 bg-white border-b border-[#F1F5F9]">
          <div className="flex items-center h-[28px] border-l-[4px] border-[#064343] pl-5 min-w-0">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              Chi tiết phiếu chi vận hành
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {detail && (
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[#64748B] hidden sm:inline">Trạng thái:</span>
                <Badge
                  variant={isConfirmed ? 'active' : 'discontinued'}
                  className="text-[13px] font-normal leading-[16px] px-2.5 py-[3px] rounded-[6px]"
                >
                  {isConfirmed ? 'Đã chi' : 'Đã hủy'}
                </Badge>
              </div>
            )}

            <div className="w-[1px] h-4 bg-[#E2E8F0]" />

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#525252] flex items-center justify-center transition-colors cursor-pointer ml-1"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#064343] animate-spin" />
            <p className="text-[14px] text-[#64748B]">Đang tải chi tiết phiếu chi...</p>
          </div>
        ) : !detail ? (
          <div className="flex-1 flex items-center justify-center text-[14px] text-[#64748B]">
            Không tìm thấy thông tin phiếu chi này.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
            <div className="bg-white rounded-xl">
              <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  THÔNG TIN PHIẾU CHI
                </h4>
              </div>

              <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
                <InfoItem label="Số phiếu chi" value={detail.expenseCode} />
                <InfoItem label="Người lập phiếu" value={detail.recordedByName || 'Hệ thống'} />
                <InfoItem label="Ngày chi" value={formatDate(detail.expenseDate)} />
                <InfoItem
                  label="Danh mục chi phí"
                  value={EXPENSE_CATEGORY_LABELS[detail.category] || detail.category}
                />
                <InfoItem
                  label="Số tiền chi trả"
                  value={
                    <span className="font-semibold text-[#EE464C]">
                      -{formatVND(detail.amount)}
                    </span>
                  }
                />
                <InfoItem label="Thời điểm tạo phiếu" value={formatDateTime(detail.createdAt)} />
              </div>
            </div>

            <div className="bg-white rounded-xl">
              <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  NỘI DUNG & DIỄN GIẢI
                </h4>
              </div>

              <div className="px-5">
                <p className="text-[14px] text-[#011010] leading-relaxed whitespace-pre-wrap break-words">
                  {detail.description || 'Không có ghi chú diễn giải.'}
                </p>
              </div>
            </div>

            {!isConfirmed && (
              <div className="bg-white rounded-xl">
                <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                  <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                    THÔNG TIN HỦY PHIẾU CHI
                  </h4>
                </div>

                <div className="px-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <InfoItem label="Người thực hiện hủy" value={detail.cancelledByName || '—'} />
                  <InfoItem
                    label="Thời điểm hủy"
                    value={detail.cancelledAt ? formatDateTime(detail.cancelledAt) : '—'}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="h-[68px] px-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3 shrink-0">
          {detail && isConfirmed && onCancelRequest && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onCancelRequest(detail);
              }}
              className="h-[40px] px-4 rounded-[10px] text-[13px] font-medium leading-[20px] text-[#EE0033] hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1.5 border border-red-200"
            >
              <TrashBinIcon className="w-4 h-4 text-[#EE0033]" color="#EE0033" />
              <span>Hủy phiếu chi</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="h-[40px] px-6 min-w-[90px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[14px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center"
          >
            <span>Đóng</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExpenseDetailSlidePanel;
