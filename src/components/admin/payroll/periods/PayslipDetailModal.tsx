'use client';

import React from 'react';
import { Printer, X } from 'lucide-react';
import { Badge } from '@/components/ui';
import { formatVND } from '@/lib/utils/formatters';
import type { PayslipSummaryDto } from '@/types/payroll';

interface PayslipDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payslip: PayslipSummaryDto | null;
  periodMonth?: number;
  periodYear?: number;
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
            ? 'font-semibold text-[#064343]'
            : 'font-medium text-[#011010]'
        }`}
      >
        {value || '—'}
      </div>
    </div>
  );
}

export function PayslipDetailModal({
  isOpen,
  onClose,
  payslip,
  periodMonth,
  periodYear,
}: PayslipDetailModalProps) {
  if (!isOpen || !payslip) return null;

  const isTrainer = payslip.position === 'TRAINER';
  const ptAmount = payslip.ptTeachingAmount ?? (isTrainer ? payslip.bonusAmount : 0);
  const commAmount = payslip.commissionAmount ?? (!isTrainer ? payslip.bonusAmount : 0);
  const kpiBonus = payslip.kpiBonusAmount ?? (payslip as any).kpiBonus ?? (payslip as any).bonusKpi ?? 0;

  const month = periodMonth ?? new Date().getMonth() + 1;
  const year = periodYear ?? new Date().getFullYear();
  const totalLateEarly = (payslip.lateCount || 0) + (payslip.earlyLeaveCount || 0);
  const isLocked = payslip.status === 'PAID' || payslip.status === 'APPROVED' || payslip.status === 'FINALIZED';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết phiếu lương"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[680px] max-w-full bg-white h-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border-l border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <div className="pt-6 pb-4 pr-6 pl-0 flex items-center justify-between shrink-0 bg-white border-b border-[#F1F5F9]">
          <div className="flex items-center min-h-[28px] border-l-[4px] border-[#064343] pl-5 min-w-0">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-tight tracking-[-0.025em] py-0.5">
              Chi tiết phiếu lương
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#64748B] hidden sm:inline">Trạng thái:</span>
              <Badge
                variant={isLocked ? 'active' : 'inactive'}
                className="text-[13px] font-normal leading-[16px] px-2.5 py-[3px] rounded-[6px]"
              >
                {isLocked ? 'Đã khóa' : 'Đã tính'}
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
                value={payslip.employeeCode}
                isHighlight
              />

              <InfoItem
                label="Họ và tên"
                value={payslip.employeeName}
              />

              <InfoItem
                label="Vai trò"
                value={isTrainer ? 'Huấn luyện viên' : 'Lễ tân'}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl">
            <div className="border-b border-[#F1F5F9] pb-2 mb-4">
              <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                THÔNG TIN KỲ LƯƠNG
              </h4>
            </div>

            <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
              <InfoItem
                label="Kỳ lương"
                value={`Tháng ${month}/${year}`}
              />

              <InfoItem
                label="Công thực tế"
                value={
                  payslip.workedShifts && payslip.workedShifts > 0
                    ? isTrainer
                      ? `${payslip.workedShifts} công`
                      : `${payslip.workedShifts} giờ`
                    : '—'
                }
              />

              <InfoItem
                label="Đi trễ / Về sớm"
                value={totalLateEarly > 0 ? `${totalLateEarly} lần` : '—'}
              />

              <InfoItem
                label="Lương cứng"
                value={payslip.baseSalary && payslip.baseSalary > 0 ? formatVND(payslip.baseSalary) : '—'}
                isHighlight
              />

              <InfoItem
                label="Thù lao PT"
                value={ptAmount > 0 ? formatVND(ptAmount) : '—'}
              />

              <InfoItem
                label="Hoa hồng"
                value={commAmount > 0 ? formatVND(commAmount) : '—'}
              />

              <InfoItem
                label="Thưởng KPI"
                value={kpiBonus > 0 ? formatVND(kpiBonus) : '—'}
              />

              <InfoItem
                label="Khấu trừ vi phạm"
                value={
                  payslip.penaltyAmount && payslip.penaltyAmount > 0 ? (
                    <span className="text-[#EE0033] font-semibold">
                      -{formatVND(payslip.penaltyAmount)}
                    </span>
                  ) : '—'
                }
              />

              <InfoItem
                label="Tổng nhận"
                value={
                  payslip.totalSalary && payslip.totalSalary > 0 ? (
                    <span className="text-[16px] font-bold text-[#064343]">
                      {formatVND(payslip.totalSalary)}
                    </span>
                  ) : '—'
                }
                isHighlight
              />
            </div>
          </div>
        </div>

        <div className="h-[72px] px-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
          >
            <span>Đóng</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="h-[40px] px-5 min-w-[120px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>In phiếu lương</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PayslipDetailModal;
