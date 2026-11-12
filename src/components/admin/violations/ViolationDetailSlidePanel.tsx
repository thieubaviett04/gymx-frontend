'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Badge, TrashBinIcon, LinkChainIcon } from '@/components/ui';
import { formatVND } from '@/lib/utils/formatters';
import { violationService } from '@/lib/api/modules/violationService';
import type { ViolationSummaryItem, ViolationDetail } from '@/types';

interface ViolationDetailSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  violation: ViolationSummaryItem | null;
  onCancelViolation?: (violation: ViolationSummaryItem) => void;
  isPeriodLocked?: boolean;
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
          isHighlight
            ? 'font-semibold text-[#EE0033]'
            : 'font-medium text-[#011010]'
        }`}
      >
        {value !== undefined && value !== null && value !== '' ? value : '—'}
      </div>
    </div>
  );
}

export function ViolationDetailSlidePanel({
  isOpen,
  onClose,
  violation,
  onCancelViolation,
  isPeriodLocked = false,
}: ViolationDetailSlidePanelProps) {
  const { data: detailData } = useQuery({
    queryKey: ['admin-violation-detail', violation?.id],
    queryFn: async () => {
      if (!violation?.id) return null;
      const res = await violationService.getViolationById(violation.id);
      return res.data;
    },
    enabled: isOpen && !!violation?.id,
    staleTime: 30000,
  });

  if (!isOpen || !violation) return null;

  const detail: Partial<ViolationDetail> | null | undefined = detailData;

  const violationCode = detail?.violationCode || violation.violationCode;
  const employeeCode = detail?.employeeCode || violation.employeeCode;
  const employeeName = detail?.employeeName || violation.employeeName;
  const employeePosition = detail?.employeePosition || violation.employeePosition;
  const ruleName = detail?.penaltyRuleName || violation.ruleName;
  const fineAmount = detail?.fineAmount ?? violation.fineAmount;
  const occurredAt = detail?.occurredAt || violation.occurredAt;
  const createdDate = detail?.createdDate || violation.createdDate;
  const evidenceUrl = detail?.evidenceUrl ?? violation.evidenceUrl;
  const note = detail?.note ?? violation.note;
  const status = detail?.status || violation.status;

  const isCancelled = status === 'CANCELLED';
  const roleName =
    employeePosition === 'TRAINER'
      ? 'Huấn luyện viên'
      : employeePosition === 'RECEPTIONIST'
      ? 'Lễ tân'
      : employeePosition || '—';

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${hours}:${mins} ${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const getFileName = (url?: string | null) => {
    if (!url) return '';
    try {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      return decodeURIComponent(lastPart.split('?')[0]);
    } catch {
      return url;
    }
  };

  const evidenceFileName = getFileName(evidenceUrl);
  const hasNote = Boolean(note && note.trim().length > 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết biên bản vi phạm"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[700px] max-w-full bg-white h-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border-l border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <div className="pt-6 pb-4 pr-6 pl-0 flex items-center justify-between shrink-0 bg-white border-b border-[#F1F5F9]">
          <div className="flex items-center min-h-[28px] border-l-[4px] border-[#064343] pl-5 min-w-0">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-tight tracking-[-0.025em] py-0.5">
              Chi tiết biên bản
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#64748B] hidden sm:inline">Trạng thái:</span>
              <Badge
                variant={isCancelled ? 'inactive' : 'active'}
                className="text-[13px] font-normal leading-[16px] px-2.5 py-[3px] rounded-[6px]"
              >
                {isCancelled ? 'Đã hủy' : 'Đang hiệu lực'}
              </Badge>
            </div>

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

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          <div className="bg-white rounded-xl">
            <div className="border-b border-[#F1F5F9] pb-2 mb-4">
              <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                THÔNG TIN NHÂN VIÊN
              </h4>
            </div>

            <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
              <InfoItem
                label="Mã NV"
                value={employeeCode || '—'}
              />

              <InfoItem
                label="Họ và tên"
                value={employeeName || '—'}
              />

              <InfoItem
                label="Vai trò"
                value={roleName || '—'}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl">
            <div className="border-b border-[#F1F5F9] pb-2 mb-4">
              <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                NỘI DUNG VI PHẠM
              </h4>
            </div>

            <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
              <InfoItem
                label="Mã biên bản"
                value={violationCode || '—'}
              />

              <InfoItem
                label="Số tiền phạt"
                value={
                  fineAmount !== undefined && fineAmount !== null
                    ? `-${formatVND(fineAmount)}`
                    : '—'
                }
                isHighlight
              />

              <InfoItem
                label="Quy định vi phạm"
                value={ruleName || '—'}
              />

              <InfoItem
                label="Thời gian xảy ra vi phạm"
                value={formatDateTime(occurredAt)}
              />

              <InfoItem
                label="Ngày lập biên bản"
                value={formatDateTime(createdDate)}
              />

              <InfoItem
                label="Bằng chứng vi phạm"
                value={
                  evidenceUrl ? (
                    <a
                      href={evidenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[14px] text-[#064343] hover:underline font-medium break-all"
                      title={evidenceFileName || evidenceUrl}
                    >
                      <LinkChainIcon className="w-3.5 h-3.5 shrink-0 text-[#064343]" />
                      <span className="truncate max-w-[150px]">
                        {evidenceFileName || evidenceUrl}
                      </span>
                    </a>
                  ) : (
                    '—'
                  )
                }
              />
            </div>
          </div>

          <div className="bg-white rounded-xl">
            <div className="border-b border-[#F1F5F9] pb-2 mb-4">
              <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                GHI CHÚ
              </h4>
            </div>

            {hasNote ? (
              <div className="px-5">
                <p className="text-[14px] text-[#011010] leading-relaxed whitespace-pre-wrap break-words">
                  {note}
                </p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center py-8 sm:py-10">
                <img
                  src="/images/empty-rating.svg"
                  alt="Chưa có ghi chú"
                  className="w-[90px] h-[105px] object-contain mb-3"
                />
                <p className="text-[15px] text-[#64748B] font-normal leading-6 text-center">
                  Chưa có ghi chú
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="h-[68px] px-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3 shrink-0">
          {!isCancelled && !isPeriodLocked && onCancelViolation && (
            <button
              type="button"
              onClick={() => onCancelViolation(violation)}
              className="h-[40px] px-4 rounded-[10px] text-[13px] font-medium leading-[20px] text-[#EE0033] hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1.5 border border-red-200"
            >
              <TrashBinIcon className="w-4 h-4 text-[#EE0033]" color="#EE0033" />
              <span>Hủy biên bản</span>
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

export default ViolationDetailSlidePanel;
