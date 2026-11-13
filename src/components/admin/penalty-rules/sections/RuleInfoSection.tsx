'use client';

import React from 'react';
import {
  DatePicker,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type {
  PenaltyRuleFormData,
  PenaltyRuleFormErrors,
  PenaltyRuleSeverity,
  PenaltyRuleStatus,
  RuleTargetAudience,
} from '@/types/penaltyRule';
import {
  PENALTY_RULE_SEVERITY_LABELS,
  PENALTY_RULE_STATUS_LABELS,
  RULE_AUDIENCE_LABELS,
} from '@/types/penaltyRule';

interface RuleInfoSectionProps {
  formData: PenaltyRuleFormData;
  errors: PenaltyRuleFormErrors;
  isEdit?: boolean;
  disabled?: boolean;
  onChangeField: <K extends keyof PenaltyRuleFormData>(field: K, value: PenaltyRuleFormData[K]) => void;
  onClearError?: (field: keyof PenaltyRuleFormData) => void;
}

export function RuleInfoSection({
  formData,
  errors,
  isEdit = false,
  disabled = false,
  onChangeField,
  onClearError,
}: RuleInfoSectionProps) {
  const isDateDisabled =
    disabled ||
    formData.status === 'INACTIVE' ||
    formData.status === 'DISCONTINUED';

  return (
    <div className="bg-white">
      <div className="border-b border-[#F1F5F9] pb-2 mb-4">
        <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
          THÔNG TIN QUY ĐỊNH
        </h4>
      </div>

      <div className="px-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <div className="flex flex-col gap-1.5 min-w-0 sm:col-span-2" onClick={() => onClearError?.('name')}>
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Tên quy định <span className="text-[#EE0033]">*</span>
          </label>
          <div
            className={cn(
              'h-[42px] px-3.5 py-2 rounded-[8px] flex items-center transition-colors border',
              errors.name
                ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            )}
          >
            <input
              type="text"
              disabled={disabled}
              value={formData.name}
              onFocus={() => onClearError?.('name')}
              onChange={(e) => onChangeField('name', e.target.value)}
              placeholder="Nhập tên quy định vi phạm..."
              maxLength={150}
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none disabled:cursor-not-allowed disabled:text-[#94A3B8]"
            />
          </div>
          {errors.name && (
            <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
              {errors.name}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Đối tượng áp dụng <span className="text-[#EE0033]">*</span>
          </label>
          <Select
            value={formData.violationType || 'GENERAL'}
            disabled={disabled}
            onValueChange={(val) => onChangeField('violationType', val as RuleTargetAudience)}
          >
            <SelectTrigger
              disabled={disabled}
              className="h-[42px] w-full rounded-[8px] bg-slate-50 px-3.5 py-2 text-[14px] text-[#2F3D50] shadow-none data-[placeholder]:text-[#697586] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] border-slate-200"
            >
              <SelectValue placeholder="Chọn đối tượng áp dụng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GENERAL">{RULE_AUDIENCE_LABELS.GENERAL}</SelectItem>
              <SelectItem value="MEMBER">{RULE_AUDIENCE_LABELS.MEMBER}</SelectItem>
              <SelectItem value="STAFF">{RULE_AUDIENCE_LABELS.STAFF}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-0" onClick={() => onClearError?.('severityLevel')}>
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Mức độ vi phạm <span className="text-[#EE0033]">*</span>
          </label>
          <Select
            value={formData.severityLevel || undefined}
            disabled={disabled}
            onValueChange={(val) => onChangeField('severityLevel', val as PenaltyRuleSeverity)}
          >
            <SelectTrigger
              disabled={disabled}
              onFocus={() => onClearError?.('severityLevel')}
              className={cn(
                'h-[42px] w-full rounded-[8px] px-3.5 py-2 text-[14px] text-[#2F3D50] shadow-none cursor-pointer transition-colors',
                errors.severityLevel
                  ? 'border-[#EE464C] bg-[#FFF5F5] focus:border-[#EE464C] focus:ring-1 focus:ring-[#EE464C]'
                  : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]'
              )}
            >
              <SelectValue placeholder="Chọn mức độ vi phạm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">{PENALTY_RULE_SEVERITY_LABELS.LOW}</SelectItem>
              <SelectItem value="MEDIUM">{PENALTY_RULE_SEVERITY_LABELS.MEDIUM}</SelectItem>
              <SelectItem value="HIGH">{PENALTY_RULE_SEVERITY_LABELS.HIGH}</SelectItem>
            </SelectContent>
          </Select>
          {errors.severityLevel && (
            <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
              {errors.severityLevel}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0" onClick={() => onClearError?.('fineAmount')}>
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Số tiền phạt <span className="text-[#EE0033]">*</span>
          </label>
          {formData.violationType === 'MEMBER' ? (
            <div className="h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center justify-between select-none">
              <span className="text-[14px] font-normal text-[#202939]">
                Nhắc nhở
              </span>
              <div className="flex items-center gap-2 pl-2 select-none shrink-0">
                <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                <span className="text-[13px] font-semibold text-[#064343]">
                  Tích lũy
                </span>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'h-[42px] px-3.5 py-2 rounded-[8px] flex items-center justify-between transition-colors border',
                errors.fineAmount
                  ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                  : 'bg-slate-50 border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
              )}
            >
              <input
                type="number"
                min="0"
                step="50000"
                disabled={disabled}
                value={formData.fineAmount}
                onFocus={() => onClearError?.('fineAmount')}
                onChange={(e) => onChangeField('fineAmount', e.target.value)}
                placeholder="Nhập số tiền phạt"
                className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none disabled:cursor-not-allowed disabled:text-[#94A3B8]"
              />
              <div className="flex items-center gap-2 pl-2 select-none shrink-0">
                <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                <span className="text-[13px] font-semibold text-[#064343]">
                  VND
                </span>
              </div>
            </div>
          )}
          {errors.fineAmount && formData.violationType !== 'MEMBER' && (
            <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
              {errors.fineAmount}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0" onClick={() => onClearError?.('effectiveDate')}>
          <label className={`text-[13px] font-medium flex items-center gap-1 ${isDateDisabled ? 'text-[#94A3B8]' : 'text-[#202939]'}`}>
            Ngày bắt đầu áp dụng <span className={isDateDisabled ? 'text-[#CBD5E1]' : 'text-[#EE0033]'}>*</span>
          </label>
          <DatePicker
            value={formData.effectiveDate}
            disabled={isDateDisabled}
            onChange={(val) => onChangeField('effectiveDate', val)}
            onFocus={() => onClearError?.('effectiveDate')}
            hasError={Boolean(errors.effectiveDate)}
            error={errors.effectiveDate}
            placeholder="Chọn ngày áp dụng"
            className={
              isDateDisabled
                ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-50 cursor-not-allowed select-none text-[#94A3B8]'
                : ''
            }
          />
          {errors.effectiveDate && !isDateDisabled && (
            <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5">
              {errors.effectiveDate}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0 sm:col-span-2" onClick={() => onClearError?.('status')}>
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Trạng thái áp dụng <span className="text-[#EE0033]">*</span>
          </label>
          <Select
            value={formData.status === 'APPLIED' ? 'ACTIVE' : formData.status === 'DISCONTINUED' ? 'INACTIVE' : formData.status || 'ACTIVE'}
            disabled={disabled}
            onValueChange={(val) => onChangeField('status', val as PenaltyRuleStatus)}
          >
            <SelectTrigger
              disabled={disabled}
              onFocus={() => onClearError?.('status')}
              className={cn(
                'h-[42px] w-full rounded-[8px] px-3.5 py-2 text-[14px] text-[#2F3D50] shadow-none cursor-pointer transition-colors',
                errors.status
                  ? 'border-[#EE464C] bg-[#FFF5F5] focus:border-[#EE464C] focus:ring-1 focus:ring-[#EE464C]'
                  : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]'
              )}
            >
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {!isEdit ? (
                <>
                  <SelectItem value="ACTIVE">{PENALTY_RULE_STATUS_LABELS.ACTIVE}</SelectItem>
                  <SelectItem value="PENDING">{PENALTY_RULE_STATUS_LABELS.PENDING}</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="ACTIVE">{PENALTY_RULE_STATUS_LABELS.ACTIVE}</SelectItem>
                  <SelectItem value="PENDING">{PENALTY_RULE_STATUS_LABELS.PENDING}</SelectItem>
                  <SelectItem value="INACTIVE">{PENALTY_RULE_STATUS_LABELS.INACTIVE}</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
              {errors.status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RuleInfoSection;