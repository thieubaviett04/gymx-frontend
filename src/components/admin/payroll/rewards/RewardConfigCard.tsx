'use client';

import React, { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  FolderOpenIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatVND } from '@/lib/utils/formatters';
import type { PayrollPeriodSummaryDto, PayslipSummaryDto } from '@/types/payroll';
import type { BonusEmployeeLookup } from '@/types/payrollBonus';

export type RewardType = 'KPI' | 'HOLIDAY';

export interface RewardFormData {
  rewardType: RewardType;
  periodId: string;
  targetId: string;
  amount: number;
  note: string;
}

interface RewardConfigCardProps {
  formData: RewardFormData;
  onChangeField: <K extends keyof RewardFormData>(field: K, value: RewardFormData[K]) => void;
  periods?: PayrollPeriodSummaryDto[];
  periodOptions?: Array<{ id: string; label: string; isLocked?: boolean }>;
  payslips?: PayslipSummaryDto[];
  employees?: BonusEmployeeLookup[];
  errors: Record<string, string>;
  onClearError: (field: string) => void;
  onClearAllErrors?: () => void;
  statsText?: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  isSubmitting?: boolean;
}

export function RewardConfigCard({
  formData,
  onChangeField,
  periods,
  periodOptions,
  payslips,
  employees,
  errors,
  onClearError,
  onClearAllErrors,
  statsText,
  onSubmit,
  onReset,
  isSubmitting = false,
}: RewardConfigCardProps) {
  const [isAmountFocused, setIsAmountFocused] = useState(false);

  const clearErrors = () => {
    if (onClearAllErrors) {
      onClearAllErrors();
    }
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearErrors();
    onClearError('amount');
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    onChangeField('amount', rawVal ? parseInt(rawVal, 10) : 0);
  };

  const employeeItems = useMemo(() => {
    if (employees && employees.length > 0) {
      return employees.map((emp) => ({
        id: emp.employeeId,
        label: `${emp.fullName} (${emp.employeeCode}) - ${emp.position === 'TRAINER' ? 'Huấn luyện viên' : 'Lễ tân'}`,
        performance: emp.monthlyPerformance,
        baseSalary: undefined,
      }));
    }
    if (payslips && payslips.length > 0) {
      return payslips.map((ps) => ({
        id: ps.id,
        label: `${ps.employeeName} (${ps.employeeCode}) - ${ps.position === 'TRAINER' ? 'Huấn luyện viên' : 'Lễ tân'}`,
        performance: undefined,
        baseSalary: ps.baseSalary,
      }));
    }
    return [];
  }, [employees, payslips]);

  const selectedEmployee = employeeItems.find((e) => e.id === formData.targetId);

  const periodItems = useMemo(() => {
    if (periodOptions && periodOptions.length > 0) {
      return periodOptions;
    }
    const now = new Date();
    const startMonth = now.getMonth();
    const startYear = now.getFullYear();
    const list = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(startYear, startMonth + i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const key = `${m}-${y}`;
      list.push({
        id: key,
        label: `Tháng ${m}/${y}`,
        isLocked: false,
      });
    }
    return list;
  }, [periodOptions]);

  const isKpi = formData.rewardType === 'KPI';

  return (
    <div className="bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-4 pb-5 sm:pt-5 sm:pb-6 shadow-xs space-y-6 relative overflow-hidden">
      <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center sm:-translate-y-[5px]">
          <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
            Khen thưởng
          </h2>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 ml-auto sm:ml-0 flex-wrap">
          {statsText && (
            <div className="flex items-center gap-3 sm:gap-4">
              {statsText}
              <div className="hidden sm:block w-[1px] h-4 bg-[#E2E8F0]" />
            </div>
          )}

          <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={onReset}
              disabled={isSubmitting}
              className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              <span>Đặt lại</span>
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="h-[40px] px-5 min-w-[120px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Đang phê duyệt...</span>
                </>
              ) : (
                <>
                  <FolderOpenIcon className="w-4 h-4 text-white" />
                  <span>Phê duyệt thưởng</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          <div className="flex flex-col gap-1.5 min-w-0" onClick={clearErrors}>
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Hình thức thưởng <span className="text-[#EE0033]">*</span>
            </label>
            <Select
              value={formData.rewardType || undefined}
              onValueChange={(val) => {
                clearErrors();
                onClearError('rewardType');
                onChangeField('rewardType', val as RewardType);
              }}
            >
              <SelectTrigger
                onFocus={clearErrors}
                className={cn(
                  'h-[42px] px-3.5 rounded-[8px] text-[14px] text-[#202939] cursor-pointer transition-colors',
                  errors.rewardType
                    ? 'border-[#EE464C] bg-[#FFF5F5] focus:border-[#EE464C] focus:ring-1 focus:ring-[#EE464C]'
                    : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]'
                )}
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
            {errors.rewardType && (
              <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">{errors.rewardType}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0" onClick={clearErrors}>
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Kỳ tính lương <span className="text-[#EE0033]">*</span>
            </label>
            <Select
              value={formData.periodId || undefined}
              onValueChange={(val) => {
                clearErrors();
                onClearError('periodId');
                onChangeField('periodId', val);
                onChangeField('targetId', '');
              }}
            >
              <SelectTrigger
                onFocus={clearErrors}
                className={cn(
                  'h-[42px] px-3.5 rounded-[8px] text-[14px] text-[#202939] cursor-pointer transition-colors',
                  errors.periodId
                    ? 'border-[#EE464C] bg-[#FFF5F5] focus:border-[#EE464C] focus:ring-1 focus:ring-[#EE464C]'
                    : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]'
                )}
              >
                <SelectValue placeholder="Chọn" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E2E8F0] shadow-md z-50">
                {periodItems.map((p) => (
                  <SelectItem
                    key={p.id}
                    value={p.id}
                    disabled={p.isLocked}
                    className="text-[13px] cursor-pointer"
                  >
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.periodId && (
              <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">{errors.periodId}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0" onClick={clearErrors}>
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Nhân viên khen thưởng {isKpi && <span className="text-[#EE0033]">*</span>}
            </label>
            <Select
              value={formData.targetId || undefined}
              onValueChange={(val) => {
                clearErrors();
                onClearError('targetId');
                onChangeField('targetId', val);
              }}
            >
              <SelectTrigger
                onFocus={clearErrors}
                className={cn(
                  'h-[42px] px-3.5 rounded-[8px] text-[14px] text-[#202939] cursor-pointer transition-colors',
                  errors.targetId
                    ? 'border-[#EE464C] bg-[#FFF5F5] focus:border-[#EE464C] focus:ring-1 focus:ring-[#EE464C]'
                    : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]'
                )}
              >
                <SelectValue placeholder={isKpi ? 'Chọn' : 'Tất cả nhân sự'} />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E2E8F0] shadow-md z-50 max-h-[300px]">
                {!isKpi && (
                  <SelectItem value="ALL" className="text-[13px] cursor-pointer font-medium text-[#064343]">
                    Tất cả nhân sự
                  </SelectItem>
                )}
                {employeeItems.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id} className="text-[13px] cursor-pointer">
                    {emp.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.targetId && (
              <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">{errors.targetId}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0" onClick={clearErrors}>
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Số tiền khen thưởng <span className="text-[#EE0033]">*</span>
            </label>
            <div
              className={cn(
                'h-[42px] px-3.5 rounded-[8px] flex items-center transition-colors border',
                errors.amount
                  ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                  : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
              )}
            >
              <input
                type="text"
                value={
                  isAmountFocused
                    ? (formData.amount > 0 ? String(formData.amount) : '')
                    : (formData.amount > 0 ? formData.amount.toLocaleString('vi-VN') : '')
                }
                onFocus={() => {
                  clearErrors();
                  setIsAmountFocused(true);
                }}
                onBlur={() => setIsAmountFocused(false)}
                onChange={handleAmountInputChange}
                placeholder="Nhập"
                className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none font-normal"
              />
              <span className="text-[13px] font-medium text-[#64748B] ml-2">
                ₫
              </span>
            </div>
            {errors.amount && (
              <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">{errors.amount}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 min-w-0" onClick={clearErrors}>
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Nội dung
          </label>
          <div
            className={cn(
              'min-h-[76px] p-3 rounded-[8px] flex transition-colors border',
              errors.note
                ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            )}
          >
            <textarea
              rows={2}
              maxLength={500}
              value={formData.note}
              onFocus={clearErrors}
              onChange={(e) => {
                clearErrors();
                onClearError('note');
                onChangeField('note', e.target.value);
              }}
              placeholder="Nhập"
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none resize-none leading-relaxed"
            />
          </div>
          {errors.note && (
            <p className="text-xs text-red-500 mt-0.5">{errors.note}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RewardConfigCard;
