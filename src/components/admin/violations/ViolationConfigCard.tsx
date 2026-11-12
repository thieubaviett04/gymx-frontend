'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import {
  DatePicker,
  FolderOpenIcon,
  LinkChainIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatVND } from '@/lib/utils/formatters';
import { violationService } from '@/lib/api/modules/violationService';
import type { EmployeeLookupItem, PenaltyRuleLookupItem } from '@/types';

export interface ViolationFormData {
  periodId: string;
  employeeId: string;
  penaltyRuleId: string;
  fineAmount: number;
  occurredAt: string;
  evidenceUrl: string;
  note: string;
}

interface ViolationConfigCardProps {
  formData: ViolationFormData;
  onChangeField: <K extends keyof ViolationFormData>(field: K, value: ViolationFormData[K]) => void;
  periodOptions?: Array<{ id: string; label: string; isLocked?: boolean }>;
  employees: EmployeeLookupItem[];
  penaltyRules: PenaltyRuleLookupItem[];
  errors: Record<string, string>;
  onClearError: (field: string) => void;
  onClearAllErrors?: () => void;
  statsText?: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  isSubmitting?: boolean;
}

export function ViolationConfigCard({
  formData,
  onChangeField,
  periodOptions,
  employees,
  penaltyRules,
  errors,
  onClearError,
  onClearAllErrors,
  statsText,
  onSubmit,
  onReset,
  isSubmitting = false,
}: ViolationConfigCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [uploadError, setUploadError] = useState('');

  React.useEffect(() => {
    if (!formData.evidenceUrl && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [formData.evidenceUrl]);

  const clearErrors = () => {
    setUploadError('');
    if (onClearAllErrors) {
      onClearAllErrors();
    }
  };

  const periodItems = useMemo(() => {
    if (periodOptions && periodOptions.length > 0) {
      return periodOptions;
    }
    const now = new Date();
    const startMonth = now.getMonth();
    const startYear = now.getFullYear();
    const items = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(startYear, startMonth + i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      items.push({
        id: `${m}-${y}`,
        label: `Tháng ${m}/${y}`,
        isLocked: false,
      });
    }
    return items;
  }, [periodOptions]);

  const selectedEmployee = employees.find((e) => e.id === formData.employeeId);
  const selectedRule = penaltyRules.find((r) => r.id === formData.penaltyRuleId);

  const isTrainer = (emp?: EmployeeLookupItem | null) =>
    emp?.position?.toUpperCase() === 'TRAINER';

  const filteredRules = useMemo(() => {
    if (!selectedEmployee) {
      return penaltyRules;
    }
    const audience = isTrainer(selectedEmployee) ? 'TRAINER' : 'STAFF';
    return penaltyRules.filter(
      (r) => r.targetAudience === 'GENERAL' || r.targetAudience === audience
    );
  }, [penaltyRules, selectedEmployee]);

  const filteredEmployees = useMemo(() => {
    if (!selectedRule || selectedRule.targetAudience === 'GENERAL') {
      return employees;
    }
    const targetAudience = selectedRule.targetAudience;
    if (targetAudience === 'TRAINER') {
      return employees.filter((e) => isTrainer(e));
    }
    if (targetAudience === 'STAFF') {
      return employees.filter((e) => !isTrainer(e));
    }
    return employees;
  }, [employees, selectedRule]);

  const handleSelectRule = (ruleId: string) => {
    clearErrors();
    onClearError('penaltyRuleId');
    onClearError('fineAmount');
    onChangeField('penaltyRuleId', ruleId);
    const rule = penaltyRules.find((r) => r.id === ruleId);
    if (rule) {
      onChangeField('fineAmount', rule.fineAmount);
      if (formData.employeeId && rule.targetAudience !== 'GENERAL') {
        const emp = employees.find((e) => e.id === formData.employeeId);
        if (emp) {
          const empAudience = isTrainer(emp) ? 'TRAINER' : 'STAFF';
          if (rule.targetAudience !== empAudience) {
            onChangeField('employeeId', '');
          }
        }
      }
    }
  };

  const handleSelectEmployee = (empId: string) => {
    clearErrors();
    onClearError('employeeId');
    onChangeField('employeeId', empId);

    if (formData.penaltyRuleId) {
      const emp = employees.find((e) => e.id === empId);
      const rule = penaltyRules.find((r) => r.id === formData.penaltyRuleId);
      if (emp && rule && rule.targetAudience !== 'GENERAL') {
        const empAudience = isTrainer(emp) ? 'TRAINER' : 'STAFF';
        if (rule.targetAudience !== empAudience) {
          onChangeField('penaltyRuleId', '');
          onChangeField('fineAmount', 0);
        }
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExtension) {
      setUploadError('Chỉ chấp nhận các tệp định dạng JPG, PNG, WEBP hoặc PDF.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Dung lượng tệp không được vượt quá 10MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsUploadingEvidence(true);
      clearErrors();
      onClearError('evidenceUrl');

      const res = await violationService.uploadEvidence(file);
      if (res?.data?.evidenceUrl) {
        onChangeField('evidenceUrl', res.data.evidenceUrl);
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error?.description ||
        err?.response?.data?.error?.message ||
        err?.message ||
        'Tải lên tệp bằng chứng thất bại.';
      setUploadError(errorMsg);
    } finally {
      setIsUploadingEvidence(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-4 pb-5 sm:pt-5 sm:pb-6 shadow-xs space-y-5 relative overflow-hidden">
      <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center sm:-translate-y-[5px]">
          <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
            Ghi nhận vi phạm
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
              className="h-[40px] px-5 min-w-[130px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Đang ghi nhận...</span>
                </>
              ) : (
                <>
                  <FolderOpenIcon className="w-4 h-4 text-white" />
                  <span>Ghi nhận vi phạm</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <div className="flex flex-col gap-1.5 min-w-0" onClick={clearErrors}>
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Kỳ tính lương <span className="text-[#EE0033]">*</span>
            </label>
            <Select
              key={`period-${formData.periodId || 'default'}`}
              value={formData.periodId || undefined}
              onValueChange={(val) => {
                clearErrors();
                onClearError('periodId');
                onChangeField('periodId', val);
              }}
            >
              <SelectTrigger
                onFocus={clearErrors}
                className={cn(
                  'h-[42px] px-3.5 bg-slate-50 border rounded-[8px] text-[14px] text-[#202939] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]',
                  errors.periodId ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
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
              <p className="text-xs text-red-500 mt-0.5">{errors.periodId}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0" onClick={clearErrors}>
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Quy định vi phạm <span className="text-[#EE0033]">*</span>
            </label>
            <Select
              key={`rule-${formData.penaltyRuleId || 'empty'}`}
              value={formData.penaltyRuleId || undefined}
              onValueChange={handleSelectRule}
            >
              <SelectTrigger
                onFocus={clearErrors}
                className={cn(
                  'h-[42px] px-3.5 bg-slate-50 border rounded-[8px] text-[14px] text-[#202939] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]',
                  errors.penaltyRuleId ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                )}
              >
                <SelectValue placeholder="Chọn" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E2E8F0] shadow-md z-50 max-h-[300px]">
                {filteredRules.map((rule) => (
                  <SelectItem key={rule.id} value={rule.id} className="text-[13px] cursor-pointer">
                    {rule.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.penaltyRuleId && (
              <p className="text-xs text-red-500 mt-0.5">{errors.penaltyRuleId}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0" onClick={clearErrors}>
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Nhân viên vi phạm <span className="text-[#EE0033]">*</span>
            </label>
            <Select
              key={`emp-${formData.employeeId || 'empty'}`}
              value={formData.employeeId || undefined}
              onValueChange={handleSelectEmployee}
            >
              <SelectTrigger
                onFocus={clearErrors}
                className={cn(
                  'h-[42px] px-3.5 bg-slate-50 border rounded-[8px] text-[14px] text-[#202939] focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]',
                  errors.employeeId ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                )}
              >
                <SelectValue placeholder="Chọn" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E2E8F0] shadow-md z-50 max-h-[300px]">
                {filteredEmployees.map((emp) => {
                  const roleLabel = emp.position === 'TRAINER' ? 'Huấn luyện viên' : 'Lễ tân';
                  return (
                    <SelectItem key={emp.id} value={emp.id} className="text-[13px] cursor-pointer">
                      {emp.fullName} ({emp.employeeCode}) - {roleLabel}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.employeeId && (
              <p className="text-xs text-red-500 mt-0.5">{errors.employeeId}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Số tiền phạt <span className="text-[#EE0033]">*</span>
            </label>
            <div
              className={cn(
                'h-[42px] px-3.5 bg-slate-50 border rounded-[8px] flex items-center transition-all',
                errors.fineAmount
                  ? 'border-red-400 bg-red-50/20'
                  : 'border-slate-200'
              )}
            >
              <input
                type="text"
                readOnly
                value={formData.fineAmount > 0 ? formatVND(formData.fineAmount) : '0 ₫'}
                className="w-full bg-transparent text-[14px] text-[#064343] font-medium outline-none cursor-default"
              />
            </div>
            {errors.fineAmount && (
              <p className="text-xs text-red-500 mt-0.5">{errors.fineAmount}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0" onClick={clearErrors}>
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Ngày vi phạm <span className="text-[#EE0033]">*</span>
            </label>
            <DatePicker
              value={formData.occurredAt}
              onChange={(val) => {
                clearErrors();
                onClearError('occurredAt');
                onChangeField('occurredAt', val);
              }}
              error={Boolean(errors.occurredAt)}
              onFocus={clearErrors}
              disabledDays={(date) => date > new Date()}
            />
            {errors.occurredAt && (
              <p className="text-xs text-red-500 mt-0.5">{errors.occurredAt}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0" onClick={clearErrors}>
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Bằng chứng vi phạm
            </label>
            <div
              className={cn(
                'h-[42px] px-3.5 bg-slate-50 border rounded-[8px] flex items-center justify-between gap-2 transition-all',
                errors.evidenceUrl || uploadError
                  ? 'border-red-400 bg-red-50/20'
                  : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
              )}
            >
              <input
                type="text"
                maxLength={1000}
                value={formData.evidenceUrl}
                onFocus={clearErrors}
                disabled={isUploadingEvidence}
                onChange={(e) => {
                  clearErrors();
                  onClearError('evidenceUrl');
                  onChangeField('evidenceUrl', e.target.value);
                }}
                placeholder={isUploadingEvidence ? 'Đang tải tệp lên...' : 'Chọn tệp hoặc nhập liên kết'}
                className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none font-normal truncate disabled:opacity-60"
              />

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {formData.evidenceUrl && !isUploadingEvidence && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeField('evidenceUrl', '');
                    setUploadError('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1 text-[#94A3B8] hover:text-[#EE0033] rounded transition-colors cursor-pointer shrink-0"
                  title="Xóa tệp / liên kết"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                disabled={isUploadingEvidence}
                onClick={() => fileInputRef.current?.click()}
                className="p-1 text-[#064343] hover:bg-slate-200/60 rounded transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                title={isUploadingEvidence ? 'Đang tải lên...' : 'Tải tệp lên'}
              >
                {isUploadingEvidence ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#064343]" />
                ) : (
                  <LinkChainIcon className="w-4 h-4 text-[#064343]" color="#064343" />
                )}
              </button>
            </div>
            {(errors.evidenceUrl || uploadError) && (
              <p className="text-xs text-red-500 mt-0.5">{errors.evidenceUrl || uploadError}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 min-w-0" onClick={clearErrors}>
          <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
            Ghi chú
          </label>
          <div
            className={cn(
              'min-h-[76px] p-3 bg-slate-50 border rounded-[8px] flex transition-all',
              errors.note
                ? 'border-red-400 bg-red-50/20'
                : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
            )}
          >
            <textarea
              rows={2}
              maxLength={1000}
              value={formData.note}
              onFocus={clearErrors}
              onChange={(e) => {
                clearErrors();
                onClearError('note');
                onChangeField('note', e.target.value);
              }}
              placeholder="Nhập"
              className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none resize-none leading-relaxed font-normal"
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

export default ViolationConfigCard;
