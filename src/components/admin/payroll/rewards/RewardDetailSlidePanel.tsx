'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import {
  Badge,
  EditPencilIcon,
  FolderOpenIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatVND } from '@/lib/utils/formatters';

interface RewardDetailSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  payslip: any | null;
  periodLabel: string;
  isPeriodLocked: boolean;
  initialIsEditing?: boolean;
  onSave?: (id: string, payload: { amount: number; note: string; bonusType: 'KPI' | 'HOLIDAY' }) => Promise<void> | void;
  isSubmitting?: boolean;
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

export function RewardDetailSlidePanel({
  isOpen,
  onClose,
  payslip,
  periodLabel,
  isPeriodLocked,
  initialIsEditing = false,
  onSave,
  isSubmitting = false,
}: RewardDetailSlidePanelProps) {
  const [isEditing, setIsEditing] = useState(initialIsEditing);

  const [rewardType, setRewardType] = useState<'KPI' | 'HOLIDAY'>('KPI');
  const [amount, setAmount] = useState<number>(0);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [note, setNote] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (payslip) {
      const curBonus = payslip.amount ?? payslip.kpiBonusAmount ?? payslip.kpiBonus ?? 0;
      setAmount(curBonus);
      setNote(payslip.reason || payslip.note || '');
      const bType =
        payslip.bonusType ||
        ((payslip.reason || payslip.note || '').toLowerCase().includes('tết') ||
        (payslip.reason || payslip.note || '').toLowerCase().includes('lễ')
          ? 'HOLIDAY'
          : 'KPI');
      setRewardType(bType === 'HOLIDAY' ? 'HOLIDAY' : 'KPI');
      setErrors({});
    }
  }, [payslip]);

  useEffect(() => {
    if (isOpen) {
      setIsEditing(initialIsEditing);
    }
  }, [isOpen, initialIsEditing]);

  if (!isOpen || !payslip) return null;

  const isTrainer = payslip.position === 'TRAINER';
  const roleName = isTrainer
    ? 'Huấn luyện viên'
    : payslip.position === 'RECEPTIONIST'
    ? 'Lễ tân'
    : payslip.position || 'Nhân viên';
  const currentBonus = payslip.amount ?? payslip.kpiBonusAmount ?? payslip.kpiBonus ?? 0;
  const locked =
    isPeriodLocked ||
    payslip.payrollPeriodStatus === 'CONFIRMED' ||
    payslip.payrollPeriodStatus === 'LOCKED';

  const clearAllErrors = () => {
    setErrors({});
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearAllErrors();
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setAmount(rawVal ? parseInt(rawVal, 10) : 0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !onSave) return;

    const newErrors: Record<string, string> = {};
    if (amount <= 0) {
      newErrors.amount = 'Số tiền khen thưởng phải lớn hơn 0.';
    }
    if (note && note.length > 500) {
      newErrors.note = 'Nội dung khen thưởng không vượt quá 500 ký tự.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSave(payslip.id, {
      amount,
      note: note.trim(),
      bonusType: rewardType,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? 'Chỉnh sửa khen thưởng' : 'Chi tiết khen thưởng'}
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
              {isEditing ? 'Chỉnh sửa khen thưởng' : 'Chi tiết khen thưởng'}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#64748B] hidden sm:inline">Trạng thái:</span>
              <Badge
                variant={locked ? 'active' : 'inactive'}
                className="text-[13px] font-normal leading-[16px] px-2.5 py-[3px] rounded-[6px]"
              >
                {locked ? 'Đã khóa' : 'Đã duyệt'}
              </Badge>
            </div>

            <div className="w-[1px] h-4 bg-[#E2E8F0]" />

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
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          {!isEditing ? (
            <>
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
                    value={payslip.employeeName || payslip.fullName}
                  />

                  <InfoItem
                    label="Vai trò"
                    value={roleName}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl">
                <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                  <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                    THÔNG TIN KHEN THƯỞNG
                  </h4>
                </div>

                <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
                  <InfoItem
                    label="Kỳ tính lương"
                    value={payslip.month && payslip.year ? `Tháng ${payslip.month}/${payslip.year}` : periodLabel}
                  />

                  <InfoItem
                    label="Hình thức thưởng"
                    value={rewardType === 'KPI' ? 'Thưởng KPI' : 'Thưởng lễ tết'}
                  />

                  <InfoItem
                    label="Số tiền khen thưởng"
                    value={currentBonus > 0 ? `+${formatVND(currentBonus)}` : '0 ₫'}
                    isHighlight
                  />

                  {payslip.monthlyPerformance && (
                    <InfoItem
                      label="Hiệu suất tháng"
                      value={payslip.monthlyPerformance}
                    />
                  )}

                  {payslip.baseSalary > 0 && (
                    <InfoItem
                      label="Lương cơ bản"
                      value={formatVND(payslip.baseSalary)}
                    />
                  )}

                  <InfoItem
                    label="Trạng thái kỳ lương"
                    value={locked ? 'Đã khóa' : 'Đã duyệt'}
                  />

                  <InfoItem
                    label="Nội dung khen thưởng"
                    value={payslip.reason || payslip.note || '—'}
                    className="sm:col-span-3"
                  />
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
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
                    value={payslip.employeeName || payslip.fullName}
                  />

                  <InfoItem
                    label="Vai trò"
                    value={roleName}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl">
                <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                  <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                    ĐIỀU CHỈNH KHEN THƯỞNG
                  </h4>
                </div>

                <div className="px-5 space-y-5">
                  <div className="flex flex-col gap-1.5 min-w-0" onClick={clearAllErrors}>
                    <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                      Hình thức thưởng <span className="text-[#EE0033]">*</span>
                    </label>
                    <Select
                      value={rewardType}
                      onValueChange={(val) => {
                        clearAllErrors();
                        setRewardType(val as 'KPI' | 'HOLIDAY');
                      }}
                    >
                      <SelectTrigger
                        onFocus={clearAllErrors}
                        className="h-[42px] px-3.5 bg-slate-50 border border-slate-200 rounded-[8px] text-[14px] text-[#202939] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]"
                      >
                        <SelectValue placeholder="Chọn" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E2E8F0] shadow-md z-50">
                        <SelectItem value="KPI" className="text-[13px] cursor-pointer">
                          Thưởng KPI
                        </SelectItem>
                        <SelectItem value="HOLIDAY" className="text-[13px] cursor-pointer">
                          Thưởng lễ tết
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0" onClick={clearAllErrors}>
                    <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                      Số tiền khen thưởng <span className="text-[#EE0033]">*</span>
                    </label>
                    <div
                      className={cn(
                        'h-[42px] px-3.5 bg-slate-50 border rounded-[8px] flex items-center transition-all',
                        errors.amount
                          ? 'border-red-400 bg-red-50/20'
                          : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                      )}
                    >
                      <input
                        type="text"
                        value={
                          isAmountFocused
                            ? (amount > 0 ? String(amount) : '')
                            : (amount > 0 ? amount.toLocaleString('vi-VN') : '')
                        }
                        onFocus={() => {
                          clearAllErrors();
                          setIsAmountFocused(true);
                        }}
                        onBlur={() => setIsAmountFocused(false)}
                        onChange={handleAmountInputChange}
                        placeholder="Nhập"
                        className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none font-normal"
                      />
                      <div className="flex items-center gap-2 pl-2 select-none shrink-0">
                        <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                        <span className="text-[13px] font-semibold text-[#064343]">
                          VND
                        </span>
                      </div>
                    </div>
                    {errors.amount && (
                      <p className="text-xs text-red-500 mt-0.5">{errors.amount}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0" onClick={clearAllErrors}>
                    <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                      Nội dung khen thưởng
                    </label>
                    <div
                      className={cn(
                        'p-3 bg-slate-50 border rounded-[8px] flex transition-all',
                        errors.note
                          ? 'border-red-400 bg-red-50/20'
                          : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                      )}
                    >
                      <textarea
                        rows={3}
                        maxLength={500}
                        value={note}
                        onFocus={clearAllErrors}
                        onChange={(e) => {
                          clearAllErrors();
                          setNote(e.target.value);
                        }}
                        placeholder="Nhập"
                        className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none resize-none"
                      />
                    </div>
                    {errors.note && (
                      <p className="text-xs text-red-500 mt-0.5">{errors.note}</p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="h-[72px] px-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3 shrink-0">
          {!isEditing ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
              >
                <span>Đóng</span>
              </button>

              {!locked && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="h-[40px] px-5 min-w-[120px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <EditPencilIcon className="w-4 h-4 text-white" />
                  <span>Chỉnh sửa</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
                className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
              >
                <span>Hủy</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="h-[40px] px-5 min-w-[120px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <FolderOpenIcon className="w-4 h-4 text-white" />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RewardDetailSlidePanel;
