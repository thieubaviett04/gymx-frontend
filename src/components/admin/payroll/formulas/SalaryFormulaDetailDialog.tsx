'use client';

import React from 'react';
import { X, Calendar, Edit3, ShieldAlert, User, Clock } from 'lucide-react';
import { Badge } from '@/components/ui';
import { formatDate, formatDateTime, formatVND } from '@/lib/utils/formatters';
import type { SalaryFormulaDto } from '@/types/payroll';
import {
  TARGET_ROLE_LABELS,
  BASE_RATE_TYPE_LABELS,
  BASE_RATE_TYPE_UNITS,
  FORMULA_STATUS_LABELS,
} from '@/types/payroll';

interface SalaryFormulaDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formula: SalaryFormulaDto | null;
  onEdit: (formula: SalaryFormulaDto) => void;
}

export function SalaryFormulaDetailDialog({
  isOpen,
  onClose,
  formula,
  onEdit,
}: SalaryFormulaDetailDialogProps) {
  if (!isOpen || !formula) return null;

  const isActive = formula.status === 'ACTIVE';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết công thức tính lương"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[680px] max-w-full bg-white h-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border-l border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <div className="pt-6 pb-4 pr-6 pl-0 flex items-center justify-between shrink-0 bg-white border-b border-[#F1F5F9]">
          <div className="flex items-center h-[28px] border-l-[4px] border-[#064343] pl-5 min-w-0 gap-3">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-none tracking-[-0.025em] truncate">
              Chi tiết công thức tính lương
            </h2>
            <Badge variant={isActive ? 'active' : 'inactive'} className="shrink-0">
              {FORMULA_STATUS_LABELS[formula.status] || formula.status}
            </Badge>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#525252] flex items-center justify-center transition-colors cursor-pointer ml-1"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {formula.inUse && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-[8px] flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[13px] text-amber-800 leading-snug">
                <strong className="font-semibold">Công thức đang được áp dụng:</strong> Công thức này đã được sử dụng trong kỳ tính lương đã chốt và bị khóa chỉnh sửa để bảo đảm dữ liệu.
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase border-b border-[#F1F5F9] pb-2">
              1. Thông tin chung
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[12px] font-medium text-[#64748B]">Tên công thức</span>
                <p className="text-[15px] font-semibold text-[#202939] mt-0.5">
                  {formula.name}
                </p>
              </div>

              <div>
                <span className="text-[12px] font-medium text-[#64748B]">Đối tượng áp dụng</span>
                <p className="text-[14px] font-normal text-[#202939] mt-0.5">
                  {TARGET_ROLE_LABELS[formula.targetRole] || formula.targetRole}
                </p>
              </div>

              <div>
                <span className="text-[12px] font-medium text-[#64748B]">Ngày hiệu lực</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-[14px] text-[#202939]">
                  <Calendar className="w-4 h-4 text-[#064343]" />
                  <span>{formatDate(formula.effectiveDate)}</span>
                </div>
              </div>

              {formula.createdAt && (
                <div>
                  <span className="text-[12px] font-medium text-[#64748B]">Thời gian tạo</span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[14px] text-[#202939]">
                    <Clock className="w-4 h-4 text-[#64748B]" />
                    <span>{formatDateTime(formula.createdAt)}</span>
                  </div>
                </div>
              )}

              {formula.creatorName && (
                <div>
                  <span className="text-[12px] font-medium text-[#64748B]">Người tạo</span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[14px] text-[#202939]">
                    <User className="w-4 h-4 text-[#64748B]" />
                    <span>{formula.creatorName}</span>
                  </div>
                </div>
              )}
            </div>

            {formula.description && (
              <div>
                <span className="text-[12px] font-medium text-[#64748B]">Mô tả / Ghi chú</span>
                <p className="text-[14px] text-[#202939] mt-1 bg-slate-50 p-3 rounded-[8px] border border-slate-200">
                  {formula.description}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase border-b border-[#F1F5F9] pb-2">
              2. Lương cơ bản & Ngày công
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[12px] font-medium text-[#64748B]">Hình thức lương</span>
                <p className="text-[14px] font-normal text-[#202939] mt-0.5">
                  {BASE_RATE_TYPE_LABELS[formula.baseRateType] || formula.baseRateType}
                </p>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[12px] font-medium text-[#64748B]">Mức lương cơ bản</span>
                <p className="text-[16px] font-semibold text-[#064343] mt-0.5">
                  {formatVND(formula.baseRate)}
                  <span className="text-[13px] font-normal text-[#64748B] ml-1">
                    {BASE_RATE_TYPE_UNITS[formula.baseRateType] || ''}
                  </span>
                </p>
              </div>

              <div>
                <span className="text-[12px] font-medium text-[#64748B]">Ngày công chuẩn</span>
                <p className="text-[15px] font-semibold text-[#202939] mt-0.5">
                  {formula.standardWorkDays} ngày/tháng
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase border-b border-[#F1F5F9] pb-2">
              3. Thù lao dạy PT & Hoa hồng
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[12px] font-medium text-[#64748B]">Thù lao mỗi buổi dạy PT</span>
                <p className="text-[15px] font-semibold text-[#202939] mt-0.5">
                  {formula.targetRole === 'RECEPTIONIST'
                    ? 'Không áp dụng (Lễ tân)'
                    : `${formatVND(formula.pricePerPtSession)}/buổi`}
                </p>
              </div>

              <div>
                <span className="text-[12px] font-medium text-[#64748B]">Hoa hồng bán gói tập</span>
                <p className="text-[15px] font-semibold text-[#202939] mt-0.5">
                  {formula.salesCommissionPercent}%
                </p>
              </div>
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

          {!formula.inUse && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(formula);
              }}
              className="h-[40px] px-5 min-w-[120px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-4 h-4 text-white" />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalaryFormulaDetailDialog;
