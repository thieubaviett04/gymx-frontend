'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import {
  DatePicker,
  FolderOpenIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type {
  CreateSalaryFormulaRequest,
  TargetRole,
  BaseRateType,
} from '@/types/payroll';
import { TARGET_ROLE_LABELS, BASE_RATE_TYPE_LABELS } from '@/types/payroll';

interface FormulaConfigCardProps {
  formData: CreateSalaryFormulaRequest;
  onChangeField: <K extends keyof CreateSalaryFormulaRequest>(
    field: K,
    value: CreateSalaryFormulaRequest[K]
  ) => void;
  errors: Record<string, string>;
  onClearError: (field: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  isSubmitting?: boolean;
}

export function FormulaConfigCard({
  formData,
  onChangeField,
  errors,
  onClearError,
  onSubmit,
  onReset,
  isSubmitting = false,
}: FormulaConfigCardProps) {
  const isTrainerDisabled = formData.targetRole === 'RECEPTIONIST';

  const unitLabel = formData.baseRateType === 'PER_SHIFT'
    ? 'Ca'
    : formData.baseRateType === 'HOURLY'
    ? 'Giờ'
    : 'Ngày';

  const baseRateLabel = formData.baseRateType === 'PER_SHIFT'
    ? 'Lương cơ bản / ca'
    : formData.baseRateType === 'HOURLY'
    ? 'Lương cơ bản / giờ'
    : 'Lương cơ bản';

  const workUnitLabel = formData.baseRateType === 'PER_SHIFT'
    ? 'Số ca chuẩn'
    : formData.baseRateType === 'HOURLY'
    ? 'Số giờ chuẩn'
    : 'Công chuẩn';

  return (
    <div className="bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-4 pb-5 sm:pt-5 sm:pb-6 shadow-xs space-y-6 relative overflow-hidden">
      <div className="absolute left-0 top-[24px] sm:top-[28px] w-[4px] h-6 bg-[#064343] rounded-none" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
        <div className="flex items-center">
          <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
            Công thức lương
          </h2>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
          <div className="hidden lg:flex items-center gap-1.5 text-[13px] whitespace-nowrap">
            <span className="text-[#64748B]">Tổng lương :</span>
            <span className="font-semibold text-[#10B981]">Lương cứng + Hoa hồng - Vi phạm</span>
          </div>

          <div className="hidden lg:block w-[1px] h-4 bg-[#E2E8F0]" />

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
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <FolderOpenIcon className="w-4 h-4 text-white" />
                  <span>Lưu công thức</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1.5 min-w-0" onClick={() => onClearError('name')}>
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Tên công thức <span className="text-[#EE0033]">*</span>
          </label>
          <div
            className={cn(
              'h-[42px] px-3.5 bg-slate-50 border rounded-[8px] flex items-center transition-colors',
              errors.name
                ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            )}
          >
            <input
              type="text"
              value={formData.name}
              onFocus={() => onClearError('name')}
              onChange={(e) => {
                onClearError('name');
                onChangeField('name', e.target.value);
              }}
              placeholder="Nhập"
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none"
            />
          </div>
          {errors.name && (
            <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
              {errors.name}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0" onClick={() => onClearError('targetRole')}>
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Đối tượng áp dụng <span className="text-[#EE0033]">*</span>
          </label>
          <Select
            value={formData.targetRole || undefined}
            onValueChange={(val) => {
              onClearError('targetRole');
              onChangeField('targetRole', val as TargetRole);
              if (val === 'RECEPTIONIST') {
                onChangeField('pricePerPtSession', 0);
              }
            }}
          >
            <SelectTrigger
              onFocus={() => onClearError('targetRole')}
              className={cn(
                'h-[42px] w-full rounded-[8px] px-3.5 text-[14px] text-[#202939] shadow-none data-[placeholder]:text-slate-400 cursor-pointer transition-colors',
                errors.targetRole
                  ? 'border-[#EE464C] bg-[#FFF5F5] focus:border-[#EE464C] focus:ring-1 focus:ring-[#EE464C]'
                  : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]'
              )}
            >
              <SelectValue placeholder="Chọn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{TARGET_ROLE_LABELS.ALL}</SelectItem>
              <SelectItem value="TRAINER">{TARGET_ROLE_LABELS.TRAINER}</SelectItem>
              <SelectItem value="RECEPTIONIST">{TARGET_ROLE_LABELS.RECEPTIONIST}</SelectItem>
            </SelectContent>
          </Select>
          {errors.targetRole && (
            <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
              {errors.targetRole}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0" onClick={() => onClearError('baseRateType')}>
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Hình thức lương <span className="text-[#EE0033]">*</span>
          </label>
          <Select
            value={formData.baseRateType || undefined}
            onValueChange={(val) => {
              onClearError('baseRateType');
              onChangeField('baseRateType', val as BaseRateType);
            }}
          >
            <SelectTrigger
              onFocus={() => onClearError('baseRateType')}
              className={cn(
                'h-[42px] w-full rounded-[8px] px-3.5 text-[14px] text-[#202939] shadow-none data-[placeholder]:text-slate-400 cursor-pointer transition-colors',
                errors.baseRateType
                  ? 'border-[#EE464C] bg-[#FFF5F5] focus:border-[#EE464C] focus:ring-1 focus:ring-[#EE464C]'
                  : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]'
              )}
            >
              <SelectValue placeholder="Chọn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY">{BASE_RATE_TYPE_LABELS.MONTHLY}</SelectItem>
              <SelectItem value="PER_SHIFT">{BASE_RATE_TYPE_LABELS.PER_SHIFT}</SelectItem>
              <SelectItem value="HOURLY">{BASE_RATE_TYPE_LABELS.HOURLY}</SelectItem>
            </SelectContent>
          </Select>
          {errors.baseRateType && (
            <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
              {errors.baseRateType}
            </p>
          )}
        </div>
      </div>

      <div
        className={cn(
          'grid grid-cols-1 gap-6',
          isTrainerDisabled ? 'md:grid-cols-2' : 'md:grid-cols-3'
        )}
      >
        <div className="flex flex-col gap-1.5 min-w-0" onClick={() => onClearError('baseRate')}>
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            {baseRateLabel} <span className="text-[#EE0033]">*</span>
          </label>
          <div
            className={cn(
              'h-[42px] px-3.5 bg-slate-50 border rounded-[8px] flex items-center justify-between transition-colors',
              errors.baseRate
                ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            )}
          >
            <input
              type="number"
              min={0}
              step={50000}
              value={formData.baseRate ? formData.baseRate : ''}
              onFocus={() => onClearError('baseRate')}
              onChange={(e) => {
                onClearError('baseRate');
                const rawVal = e.target.value;
                onChangeField('baseRate', rawVal === '' ? 0 : Number(rawVal));
              }}
              placeholder="Nhập"
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="flex items-center gap-2 pl-2 select-none shrink-0">
              <div className="w-[1px] h-4 bg-[#CDD5DF]" />
              <span className="text-[13px] font-semibold text-[#064343]">VND</span>
            </div>
          </div>
          {errors.baseRate && (
            <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
              {errors.baseRate}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0" onClick={() => onClearError('standardWorkDays')}>
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            {workUnitLabel} <span className="text-[#EE0033]">*</span>
          </label>
          <div
            className={cn(
              'h-[42px] px-3.5 bg-slate-50 border rounded-[8px] flex items-center justify-between transition-colors',
              errors.standardWorkDays
                ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            )}
          >
            <input
              type="number"
              min={1}
              max={formData.baseRateType === 'HOURLY' ? 500 : 100}
              value={formData.standardWorkDays ? formData.standardWorkDays : ''}
              onFocus={() => onClearError('standardWorkDays')}
              onChange={(e) => {
                onClearError('standardWorkDays');
                const rawVal = e.target.value;
                onChangeField('standardWorkDays', rawVal === '' ? 0 : Number(rawVal));
              }}
              placeholder="Nhập"
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="flex items-center gap-2 pl-2.5 border-l border-[#064343] shrink-0">
              <span className="text-[13px] font-medium text-[#064343]">{unitLabel}</span>
            </div>
          </div>
          {errors.standardWorkDays && (
            <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
              {errors.standardWorkDays}
            </p>
          )}
        </div>

        {!isTrainerDisabled && (
          <div className="flex flex-col gap-1.5 min-w-0" onClick={() => onClearError('pricePerPtSession')}>
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Thù lao PT <span className="text-[#EE0033]">*</span>
            </label>
            <div
              className={cn(
                'h-[42px] px-3.5 bg-slate-50 border rounded-[8px] flex items-center justify-between transition-colors',
                errors.pricePerPtSession
                  ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                  : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
              )}
            >
              <input
                type="number"
                min={0}
                step={10000}
                value={formData.pricePerPtSession ? formData.pricePerPtSession : ''}
                onFocus={() => onClearError('pricePerPtSession')}
                onChange={(e) => {
                  onClearError('pricePerPtSession');
                  const rawVal = e.target.value;
                  onChangeField('pricePerPtSession', rawVal === '' ? 0 : Number(rawVal));
                }}
                placeholder="Nhập"
                className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="flex items-center gap-2 pl-2 select-none shrink-0">
                <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                <span className="text-[13px] font-semibold text-[#064343]">VND</span>
              </div>
            </div>
            {errors.pricePerPtSession && (
              <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
                {errors.pricePerPtSession}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1.5 min-w-0" onClick={() => onClearError('effectiveDate')}>
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Ngày hiệu lực <span className="text-[#EE0033]">*</span>
          </label>
          <DatePicker
            value={formData.effectiveDate}
            onChange={(val) => {
              onClearError('effectiveDate');
              onChangeField('effectiveDate', val);
            }}
            placeholder="Chọn ngày áp dụng"
            error={errors.effectiveDate}
            className="h-[42px] rounded-[8px] bg-slate-50 border-slate-200"
          />
          {errors.effectiveDate && (
            <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
              {errors.effectiveDate}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939]">
            Ghi chú
          </label>
          <div
            className={cn(
              'h-[42px] px-3.5 bg-slate-50 border rounded-[8px] flex items-center transition-all',
              'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            )}
          >
            <input
              type="text"
              value={formData.description || ''}
              onChange={(e) => onChangeField('description', e.target.value)}
              placeholder="Nhập"
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-medium text-[#202939]">
              Hoa hồng bán gói
            </label>
            <span className="text-[13px] font-normal text-[#064343]">
              {formData.salesCommissionPercent}%
            </span>
          </div>

          <div className="h-[42px] px-1 flex items-center">
            <Slider
              value={formData.salesCommissionPercent}
              min={0}
              max={30}
              step={0.5}
              onChange={(val) => {
                onClearError('salesCommissionPercent');
                onChangeField('salesCommissionPercent', val);
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormulaConfigCard;
