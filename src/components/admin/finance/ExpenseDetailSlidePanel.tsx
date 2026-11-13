'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui';
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
                  THÔNG TIN CHUNG
                </h4>
              </div>

              <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
                <InfoItem label="Số phiếu chi" value={detail.expenseCode} />
                <InfoItem label="Ngày chi" value={formatDate(detail.expenseDate)} />
                <InfoItem label="Người lập phiếu" value={detail.recordedByName || 'Hệ thống'} />
                <InfoItem label="Thời điểm tạo phiếu" value={formatDateTime(detail.createdAt)} />
                <InfoItem label="Đơn vị chi" value="GymX Fitness Center" />
                <InfoItem
                  label="Mã tham chiếu hệ thống"
                  value={
                    <span className="font-medium text-[#064343]">
                      #{detail.id.slice(0, 8).toUpperCase()}
                    </span>
                  }
                />
              </div>
            </div>

            <div className="bg-white rounded-xl">
              <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  CHI TIẾT KHOẢN CHI & THANH TOÁN
                </h4>
              </div>

              <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
                <InfoItem
                  label="Danh mục chi phí"
                  value={EXPENSE_CATEGORY_LABELS[detail.category] || detail.category}
                />
                <InfoItem label="Phân loại nghiệp vụ" value="Chi phí vận hành phòng gym" />
                <InfoItem label="Phương thức chi trả" value="Chuyển khoản / Tiền mặt" />
                <InfoItem
                  label="Số tiền chi trả"
                  value={
                    <span className="font-semibold text-[#EE464C]">
                      -{formatVND(detail.amount)}
                    </span>
                  }
                />
                <InfoItem label="Ngày ghi nhận chi" value={formatDate(detail.expenseDate)} />
                <InfoItem
                  label="Trạng thái thanh toán"
                  value={
                    <span className={isConfirmed ? 'text-[#064343] font-medium' : 'text-[#EE464C] font-medium'}>
                      {isConfirmed ? 'Đã chi hoàn tất' : 'Đã hủy phiếu chi'}
                    </span>
                  }
                />
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
                  {detail.description || 'Ghi nhận chi phí vận hành phòng gym theo chứng từ nội bộ.'}
                </p>
              </div>
            </div>

            {!isConfirmed && (
              <div className="bg-white rounded-xl">
                <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                  <h4 className="text-[13px] font-semibold text-[#EE464C] tracking-[-0.0074em] uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-[#EE464C]" />
                    <span>THÔNG TIN HỦY PHIẾU CHI</span>
                  </h4>
                </div>

                <div className="px-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <InfoItem label="Người thực hiện hủy" value={detail.cancelledByName || '—'} />
                  <InfoItem
                    label="Thời điểm hủy"
                    value={detail.cancelledAt ? formatDateTime(detail.cancelledAt) : '—'}
                  />
                  <div className="col-span-1 sm:col-span-2">
                    <InfoItem
                      label="Lý do hủy"
                      value={
                        <span className="italic text-[#EE464C]">
                          &quot;{detail.cancellationReason || 'Không ghi rõ lý do'}&quot;
                        </span>
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#EAEDF2] flex items-center justify-between">
          <div>
            {detail && isConfirmed && onCancelRequest && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCancelRequest(detail);
                }}
                className="h-[40px] px-5 rounded-[10px] bg-red-50 hover:bg-red-100 text-[#EE464C] text-[13px] font-medium transition-colors cursor-pointer"
              >
                Hủy phiếu chi này
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-[40px] px-5 bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExpenseDetailSlidePanel;
