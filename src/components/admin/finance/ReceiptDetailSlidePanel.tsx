'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui';
import { formatDate, formatPhoneNumber, formatVND } from '@/lib/utils/formatters';
import type { InvoiceSummaryDto } from '@/types/finance';
import { getCustomerDisplayName, getReferenceTypeLabel } from './ReceiptsTable';

interface ReceiptDetailSlidePanelProps {
  invoice: InvoiceSummaryDto | null;
  isOpen: boolean;
  onClose: () => void;
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

export function ReceiptDetailSlidePanel({
  invoice,
  isOpen,
  onClose,
}: ReceiptDetailSlidePanelProps) {
  if (!isOpen || !invoice) return null;

  const isPaid = invoice.status === 'PAID';
  const isPending = invoice.status === 'PENDING';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết phiếu thu tiền"
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
              Chi tiết phiếu thu tiền
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#64748B] hidden sm:inline">Trạng thái:</span>
              <Badge
                variant={isPaid ? 'active' : isPending ? 'upcoming' : 'discontinued'}
                className="text-[13px] font-normal leading-[16px] px-2.5 py-[3px] rounded-[6px]"
              >
                {isPaid ? 'Đã thu tiền' : isPending ? 'Chờ thanh toán' : 'Đã hủy'}
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
                THÔNG TIN CHUNG
              </h4>
            </div>

            <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
              <InfoItem label="Số phiếu thu" value={invoice.invoiceNumber} />
              <InfoItem label="Ngày lập phiếu" value={formatDate(invoice.issuedAt)} />
              <InfoItem label="Người lập phiếu" value={invoice.creatorName || 'Hệ thống'} />
              <InfoItem label="Người nộp / Khách hàng" value={getCustomerDisplayName(invoice)} />
              <InfoItem label="Mã hội viên" value={invoice.memberCode} />
              <InfoItem
                label="Số điện thoại"
                value={formatPhoneNumber(invoice.customerPhone) || invoice.customerPhone || '—'}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl">
            <div className="border-b border-[#F1F5F9] pb-2 mb-4">
              <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                CHI TIẾT KHOẢN THU & THANH TOÁN
              </h4>
            </div>

            <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
              <InfoItem
                label="Nguồn thu"
                value={getReferenceTypeLabel(invoice.referenceType)}
              />
              <InfoItem
                label="Chứng từ gốc liên kết"
                value={
                  <span className="font-mono text-[#064343]">
                    {invoice.referenceId
                      ? `HD-${invoice.referenceId.slice(0, 8).toUpperCase()}`
                      : invoice.invoiceNumber}
                  </span>
                }
              />
              <InfoItem label="Phương thức thanh toán" value={invoice.paymentMethod || 'Tiền mặt'} />
              <InfoItem
                label="Số tiền thu"
                value={
                  <span className="font-semibold text-[#064343]">
                    +{formatVND(invoice.totalAmount)}
                  </span>
                }
              />
              <InfoItem
                label="Tạm tính / Tiền gốc"
                value={
                  <span>
                    {formatVND(invoice.subtotal)}
                    {invoice.subtotal > invoice.totalAmount && (
                      <span className="text-[12px] text-[#EE464C] ml-1.5 font-normal">
                        (Giảm {formatVND(invoice.subtotal - invoice.totalAmount)})
                      </span>
                    )}
                  </span>
                }
              />
              <InfoItem
                label="Ngày thanh toán"
                value={invoice.paidAt ? formatDate(invoice.paidAt) : 'Chưa thu'}
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
                {(() => {
                  const refCode = invoice.referenceId
                    ? `HD-${invoice.referenceId.slice(0, 8).toUpperCase()}`
                    : invoice.invoiceNumber;
                  return invoice.referenceType === 'PACKAGE'
                    ? `Ghi nhận khoản thu tiền thanh toán hợp đồng dịch vụ hội viên tập luyện tại trung tâm (${refCode}).`
                    : invoice.referenceType === 'PT_SESSION' || invoice.referenceType === 'PT_PACKAGE'
                    ? `Ghi nhận khoản thu tiền thanh toán hợp đồng dịch vụ PT 1:1 (${refCode}).`
                    : invoice.referenceType === 'DAY_TICKET'
                    ? `Ghi nhận khoản thu từ bán vé tập lượt trong ngày cho khách hàng (${refCode}).`
                    : invoice.referenceType === 'SERVICE_FEE'
                    ? `Ghi nhận khoản thu từ phí dịch vụ, bảo lưu, chuyển nhượng hoặc tiện ích hội viên (${refCode}).`
                    : `Ghi nhận thu tiền từ hoạt động bán lẻ quầy hoặc dịch vụ khác (${refCode}).`;
                })()}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#EAEDF2] flex items-center justify-end">
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

export default ReceiptDetailSlidePanel;
