'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  FolderOpenIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type { CreateKpiTemplatePayload, KpiRole, KpiTemplateStatus } from '@/types/kpi';

interface KpiTemplateFormCardProps {
  onSubmit: (payload: CreateKpiTemplatePayload) => Promise<void>;
  isSubmitting?: boolean;
}

interface FormState {
  name: string;
  targetRole: KpiRole | '';
  status: KpiTemplateStatus | '';
  targetRevenue: number | '';
  targetBonusAmount: number | '';
  targetPtSessions: number | '';
  targetNewMembers: number | '';
  description: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  targetRole: '',
  status: '',
  targetRevenue: '',
  targetBonusAmount: '',
  targetPtSessions: '',
  targetNewMembers: '',
  description: '',
};

export function KpiTemplateFormCard({
  onSubmit,
  isSubmitting = false,
}: KpiTemplateFormCardProps) {
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isTrainer = formData.targetRole !== 'RECEPTIONIST';

  const clearErrors = () => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  };

  const handleRoleChange = (role: KpiRole) => {
    clearErrors();
    setFormData((prev) => ({
      ...prev,
      targetRole: role,
    }));
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên mẫu KPI.';
    }
    if (!formData.targetRole) {
      newErrors.targetRole = 'Vui lòng chọn đối tượng áp dụng.';
    }
    if (!formData.status) {
      newErrors.status = 'Vui lòng chọn trạng thái.';
    }
    if (formData.targetRevenue === '' || Number(formData.targetRevenue) <= 0) {
      newErrors.targetRevenue = 'Chỉ tiêu doanh thu phải lớn hơn 0.';
    }
    if (formData.targetBonusAmount === '' || Number(formData.targetBonusAmount) <= 0) {
      newErrors.targetBonusAmount = 'Mức thưởng chỉ tiêu phải lớn hơn 0.';
    }
    if (
      formData.targetRole === 'TRAINER' &&
      (formData.targetPtSessions === '' || Number(formData.targetPtSessions) < 0)
    ) {
      newErrors.targetPtSessions = 'Vui lòng nhập số buổi dạy PT hợp lệ.';
    }
    if (
      formData.targetRole === 'RECEPTIONIST' &&
      (formData.targetNewMembers === '' || Number(formData.targetNewMembers) < 0)
    ) {
      newErrors.targetNewMembers = 'Vui lòng nhập số hội viên mới hợp lệ.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        targetRole: (formData.targetRole || 'TRAINER') as KpiRole,
        targetRevenue: Number(formData.targetRevenue),
        targetBonusAmount: Number(formData.targetBonusAmount),
        targetPtSessions:
          formData.targetRole === 'TRAINER' ? Number(formData.targetPtSessions) : null,
        targetNewMembers:
          formData.targetRole === 'RECEPTIONIST' ? Number(formData.targetNewMembers) : null,
        description: formData.description.trim() || undefined,
        status: (formData.status || 'ACTIVE') as KpiTemplateStatus,
      });
      handleReset();
    } catch {
    }
  };

  return (
    <div className="bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-4 pb-5 sm:pt-5 sm:pb-6 shadow-xs space-y-6 relative overflow-hidden">
      <div className="absolute left-0 top-[24px] sm:top-[28px] w-[4px] h-6 bg-[#064343] rounded-none" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
        <div className="flex items-center">
          <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
            Mẫu định mức KPI
          </h2>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
          >
            <span>Đặt lại</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
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
                <span>Lưu mẫu KPI</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            className="flex flex-col gap-1.5 min-w-0"
            onClick={clearErrors}
            onPointerDown={clearErrors}
          >
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Tên mẫu KPI <span className="text-[#EE0033]">*</span>
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
                disabled={isSubmitting}
                value={formData.name}
                onPointerDown={clearErrors}
                onFocus={clearErrors}
                onClick={clearErrors}
                onChange={(e) => {
                  clearErrors();
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                }}
                placeholder="Nhập"
                className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
              />
            </div>
            {errors.name && (
              <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
                {errors.name}
              </p>
            )}
          </div>

          <div
            className="flex flex-col gap-1.5 min-w-0"
            onClick={clearErrors}
            onPointerDown={clearErrors}
          >
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Đối tượng áp dụng <span className="text-[#EE0033]">*</span>
            </label>
            <Select
              value={formData.targetRole || undefined}
              onValueChange={(val) => {
                clearErrors();
                handleRoleChange(val as KpiRole);
              }}
              onOpenChange={(open) => {
                if (open) clearErrors();
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger
                onFocus={clearErrors}
                onClick={clearErrors}
                onPointerDown={clearErrors}
                className="h-[42px] w-full rounded-[8px] bg-slate-50 px-3.5 py-2 text-[14px] text-[#202939] border-slate-200 shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer"
              >
                <SelectValue placeholder="Chọn" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E2E8F0] shadow-md z-50">
                <SelectItem value="TRAINER" className="text-[13px] cursor-pointer">
                  Huấn luyện viên
                </SelectItem>
                <SelectItem value="RECEPTIONIST" className="text-[13px] cursor-pointer">
                  Lễ tân
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div
            className="flex flex-col gap-1.5 min-w-0"
            onClick={clearErrors}
            onPointerDown={clearErrors}
          >
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Trạng thái <span className="text-[#EE0033]">*</span>
            </label>
            <Select
              value={formData.status || undefined}
              onValueChange={(val) => {
                clearErrors();
                setFormData((prev) => ({ ...prev, status: val as KpiTemplateStatus }));
              }}
              onOpenChange={(open) => {
                if (open) clearErrors();
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger
                onFocus={clearErrors}
                onClick={clearErrors}
                onPointerDown={clearErrors}
                className="h-[42px] w-full rounded-[8px] bg-slate-50 px-3.5 py-2 text-[14px] text-[#202939] border-slate-200 shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer"
              >
                <SelectValue placeholder="Chọn" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E2E8F0] shadow-md z-50">
                <SelectItem value="ACTIVE" className="text-[13px] cursor-pointer">
                  Đang áp dụng
                </SelectItem>
                <SelectItem value="INACTIVE" className="text-[13px] cursor-pointer">
                  Ngừng áp dụng
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div
            className="flex flex-col gap-1.5 min-w-0"
            onClick={clearErrors}
            onPointerDown={clearErrors}
          >
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Chỉ tiêu doanh thu <span className="text-[#EE0033]">*</span>
            </label>
            <div
              className={cn(
                'h-[42px] px-3.5 py-2 rounded-[8px] flex items-center transition-colors border',
                errors.targetRevenue
                  ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                  : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
              )}
            >
              <input
                type="number"
                min="0"
                step="1000000"
                disabled={isSubmitting}
                value={formData.targetRevenue}
                onPointerDown={clearErrors}
                onFocus={clearErrors}
                onClick={clearErrors}
                onChange={(e) => {
                  clearErrors();
                  setFormData((prev) => ({
                    ...prev,
                    targetRevenue: e.target.value === '' ? '' : Number(e.target.value),
                  }));
                }}
                placeholder="Nhập"
                className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
              />
              <div className="flex items-center gap-2 pl-2 select-none shrink-0">
                <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                <span className="text-[13px] font-semibold text-[#064343]">
                  VND
                </span>
              </div>
            </div>
            {errors.targetRevenue && (
              <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
                {errors.targetRevenue}
              </p>
            )}
          </div>

          <div
            className="flex flex-col gap-1.5 min-w-0"
            onClick={clearErrors}
            onPointerDown={clearErrors}
          >
            <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
              Mức thưởng chỉ tiêu <span className="text-[#EE0033]">*</span>
            </label>
            <div
              className={cn(
                'h-[42px] px-3.5 py-2 rounded-[8px] flex items-center transition-colors border',
                errors.targetBonusAmount
                  ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                  : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
              )}
            >
              <input
                type="number"
                min="0"
                step="500000"
                disabled={isSubmitting}
                value={formData.targetBonusAmount}
                onPointerDown={clearErrors}
                onFocus={clearErrors}
                onClick={clearErrors}
                onChange={(e) => {
                  clearErrors();
                  setFormData((prev) => ({
                    ...prev,
                    targetBonusAmount: e.target.value === '' ? '' : Number(e.target.value),
                  }));
                }}
                placeholder="Nhập"
                className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
              />
              <div className="flex items-center gap-2 pl-2 select-none shrink-0">
                <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                <span className="text-[13px] font-semibold text-[#064343]">
                  VND
                </span>
              </div>
            </div>
            {errors.targetBonusAmount && (
              <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
                {errors.targetBonusAmount}
              </p>
            )}
          </div>

          {isTrainer ? (
            <div
              className="flex flex-col gap-1.5 min-w-0"
              onClick={clearErrors}
              onPointerDown={clearErrors}
            >
              <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                Chỉ tiêu số buổi dạy PT <span className="text-[#EE0033]">*</span>
              </label>
              <div
                className={cn(
                  'h-[42px] px-3.5 py-2 rounded-[8px] flex items-center transition-colors border',
                  errors.targetPtSessions
                    ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                    : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                )}
              >
                <input
                  type="number"
                  min="0"
                  step="1"
                  disabled={isSubmitting}
                  value={formData.targetPtSessions}
                  onPointerDown={clearErrors}
                  onFocus={clearErrors}
                  onClick={clearErrors}
                  onChange={(e) => {
                    clearErrors();
                    setFormData((prev) => ({
                      ...prev,
                      targetPtSessions:
                        e.target.value === '' ? '' : Number(e.target.value),
                    }));
                  }}
                  placeholder="Nhập"
                  className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
                />
              </div>
              {errors.targetPtSessions && (
                <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
                  {errors.targetPtSessions}
                </p>
              )}
            </div>
          ) : (
            <div
              className="flex flex-col gap-1.5 min-w-0"
              onClick={clearErrors}
              onPointerDown={clearErrors}
            >
              <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                Chỉ tiêu số hội viên mới <span className="text-[#EE0033]">*</span>
              </label>
              <div
                className={cn(
                  'h-[42px] px-3.5 py-2 rounded-[8px] flex items-center transition-colors border',
                  errors.targetNewMembers
                    ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                    : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                )}
              >
                <input
                  type="number"
                  min="0"
                  step="1"
                  disabled={isSubmitting}
                  value={formData.targetNewMembers}
                  onPointerDown={clearErrors}
                  onFocus={clearErrors}
                  onClick={clearErrors}
                  onChange={(e) => {
                    clearErrors();
                    setFormData((prev) => ({
                      ...prev,
                      targetNewMembers:
                        e.target.value === '' ? '' : Number(e.target.value),
                    }));
                  }}
                  placeholder="Nhập"
                  className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
                />
              </div>
              {errors.targetNewMembers && (
                <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
                  {errors.targetNewMembers}
                </p>
              )}
            </div>
          )}
        </div>

        <div
          className="flex flex-col gap-1.5 min-w-0"
          onClick={clearErrors}
          onPointerDown={clearErrors}
        >
          <label className="text-[13px] font-medium text-[#202939]">
            Mô tả & Tiêu chuẩn đánh giá
          </label>
          <Textarea
            rows={3}
            disabled={isSubmitting}
            value={formData.description || ''}
            onPointerDown={clearErrors}
            onFocus={clearErrors}
            onClick={clearErrors}
            onChange={(e) => {
              clearErrors();
              setFormData((prev) => ({ ...prev, description: e.target.value }));
            }}
            placeholder="Nhập"
            className="bg-slate-50 border-slate-200 focus:bg-white focus:border-[#064343] placeholder:text-slate-400"
          />
        </div>
      </form>
    </div>
  );
}

export default KpiTemplateFormCard;
