'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Calendar, ShieldAlert } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { FolderOpenIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import type {
  CreateSalaryFormulaRequest,
  SalaryFormulaDto,
  TargetRole,
  BaseRateType,
} from '@/types/payroll';
import {
  TARGET_ROLE_LABELS,
  BASE_RATE_TYPE_LABELS,
} from '@/types/payroll';
import { parseSalaryFormulaBackendError } from '@/lib/utils/error-helper';

interface SalaryFormulaFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SalaryFormulaDto | null;
  isSubmitting?: boolean;
  onSubmit: (payload: CreateSalaryFormulaRequest) => Promise<void> | void;
}

export function SalaryFormulaFormDialog({
  isOpen,
  onClose,
  initialData,
  isSubmitting = false,
  onSubmit,
}: SalaryFormulaFormDialogProps) {
  const isEdit = Boolean(initialData);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<CreateSalaryFormulaRequest>({
    name: '',
    targetRole: 'ALL',
    baseRateType: 'MONTHLY',
    baseRate: 5000000,
    standardWorkDays: 26,
    pricePerPtSession: 150000,
    salesCommissionPercent: 5,
    effectiveDate: getTodayString(),
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lockedInUse, setLockedInUse] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          targetRole: initialData.targetRole,
          baseRateType: initialData.baseRateType,
          baseRate: initialData.baseRate,
          standardWorkDays: initialData.standardWorkDays,
          pricePerPtSession: initialData.pricePerPtSession,
          salesCommissionPercent: initialData.salesCommissionPercent,
          effectiveDate: initialData.effectiveDate?.split('T')[0] || getTodayString(),
          description: initialData.description || '',
        });
        setLockedInUse(Boolean(initialData.inUse));
      } else {
        setFormData({
          name: '',
          targetRole: 'ALL',
          baseRateType: 'MONTHLY',
          baseRate: 5000000,
          standardWorkDays: 26,
          pricePerPtSession: 150000,
          salesCommissionPercent: 5,
          effectiveDate: getTodayString(),
          description: '',
        });
        setLockedInUse(false);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleRoleChange = (role: TargetRole) => {
    clearError('targetRole');
    setFormData((prev) => ({
      ...prev,
      targetRole: role,
      pricePerPtSession: role === 'RECEPTIONIST' ? 0 : prev.pricePerPtSession,
    }));
  };

  const handleBaseRateTypeChange = (type: BaseRateType) => {
    clearError('baseRateType');
    setFormData((prev) => ({
      ...prev,
      baseRateType: type,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên công thức tính lương.';
    }

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Vui lòng chọn ngày hiệu lực.';
    }

    if (formData.baseRate < 0) {
      newErrors.baseRate = 'Mức lương cơ bản không được âm.';
    }

    const maxUnits = formData.baseRateType === 'HOURLY' ? 500 : formData.baseRateType === 'PER_SHIFT' ? 100 : 31;
    const unitText = formData.baseRateType === 'HOURLY' ? 'giờ' : formData.baseRateType === 'PER_SHIFT' ? 'ca' : 'ngày';

    if (formData.standardWorkDays < 1 || formData.standardWorkDays > maxUnits) {
      newErrors.standardWorkDays = `Số ${unitText} chuẩn phải từ 1 đến ${maxUnits} ${unitText}.`;
    }

    if (formData.targetRole !== 'RECEPTIONIST' && formData.pricePerPtSession < 0) {
      newErrors.pricePerPtSession = 'Thù lao dạy PT không được âm.';
    }

    if (formData.salesCommissionPercent < 0 || formData.salesCommissionPercent > 100) {
      newErrors.salesCommissionPercent = 'Hoa hồng phải từ 0% đến 100%.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || lockedInUse) return;

    if (!validate()) return;

    try {
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      });
    } catch (err: unknown) {
      const { fieldErrors, isCannotModifyInUse } = parseSalaryFormulaBackendError(err);
      if (isCannotModifyInUse) {
        setLockedInUse(true);
      }
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    }
  };

  const isTrainerDisabled = formData.targetRole === 'RECEPTIONIST';
  const isReadOnly = lockedInUse || isSubmitting;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Chỉnh sửa công thức tính lương' : 'Thêm mới công thức tính lương'}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[680px] max-w-full bg-white h-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border-l border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <div className="pt-6 pb-4 pr-6 pl-0 flex items-center justify-between shrink-0 bg-white border-b border-[#F1F5F9]">
          <div className="flex items-center h-[28px] border-l-[4px] border-[#064343] pl-5 min-w-0">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              {isEdit ? 'Chỉnh sửa công thức tính lương' : 'Thêm mới công thức tính lương'}
            </h2>
          </div>

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

        {lockedInUse && (
          <div className="mx-6 mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-[8px] flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[13px] text-amber-800 leading-snug">
              <strong className="font-semibold">Công thức đang được áp dụng:</strong> Công thức này đã được sử dụng trong kỳ tính lương đã chốt. Để đảm bảo tính toàn vẹn dữ liệu kế toán, nội dung công thức đã bị khóa chỉnh sửa.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-7 flex-1">
            <div className="space-y-4">
              <h3 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase border-b border-[#F1F5F9] pb-2">
                1. Thông tin chung
              </h3>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Tên công thức tính lương <span className="text-[#EE464C]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  disabled={isReadOnly}
                  onFocus={() => clearError('name')}
                  onChange={(e) => {
                    clearError('name');
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                  }}
                  placeholder="Nhập"
                  className={cn(
                    'w-full h-[42px] px-3.5 rounded-[8px] border text-[14px] text-[#202939] placeholder-[#9EA5C0] outline-none transition-colors',
                    isReadOnly && 'bg-slate-100 cursor-not-allowed text-[#64748B]',
                    errors.name
                      ? 'border-[#EE464C] bg-[#FFF5F5] focus:border-[#EE464C]'
                      : 'border-[#E2E8F0] bg-white focus:border-[#064343]'
                  )}
                />
                {errors.name && (
                  <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Đối tượng áp dụng <span className="text-[#EE464C]">*</span>
                  </label>
                  <Select
                    value={formData.targetRole}
                    disabled={isReadOnly}
                    onValueChange={(val) => handleRoleChange(val as TargetRole)}
                  >
                    <SelectTrigger
                      className={cn(
                        'w-full h-[42px] px-3.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[14px] text-[#202939] focus:border-[#064343]',
                        isReadOnly && 'bg-slate-100 cursor-not-allowed'
                      )}
                    >
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg">
                      <SelectItem value="ALL" className="text-[14px] py-2 cursor-pointer">
                        {TARGET_ROLE_LABELS.ALL}
                      </SelectItem>
                      <SelectItem value="TRAINER" className="text-[14px] py-2 cursor-pointer">
                        {TARGET_ROLE_LABELS.TRAINER}
                      </SelectItem>
                      <SelectItem value="RECEPTIONIST" className="text-[14px] py-2 cursor-pointer">
                        {TARGET_ROLE_LABELS.RECEPTIONIST}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Ngày hiệu lực <span className="text-[#EE464C]">*</span>
                  </label>
                  <div
                    className={cn(
                      'h-[42px] px-3.5 rounded-[8px] border transition-colors flex items-center justify-between',
                      isReadOnly && 'bg-slate-100 cursor-not-allowed',
                      errors.effectiveDate
                        ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                        : 'border-[#E2E8F0] bg-white focus-within:border-[#064343]'
                    )}
                  >
                    <input
                      type="date"
                      value={formData.effectiveDate}
                      disabled={isReadOnly}
                      onFocus={() => clearError('effectiveDate')}
                      onChange={(e) => {
                        clearError('effectiveDate');
                        setFormData((prev) => ({ ...prev, effectiveDate: e.target.value }));
                      }}
                      className="w-full bg-transparent text-[14px] text-[#202939] outline-none cursor-pointer disabled:cursor-not-allowed"
                    />
                    <Calendar className="w-4 h-4 text-[#64748B] pointer-events-none shrink-0" />
                  </div>
                  {errors.effectiveDate && (
                    <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1">
                      {errors.effectiveDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[#202939]">
                  Mô tả / Ghi chú chính sách
                </label>
                <textarea
                  value={formData.description || ''}
                  disabled={isReadOnly}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={2}
                  placeholder="Nhập"
                  className={cn(
                    'w-full p-3 rounded-[8px] border border-[#E2E8F0] text-[14px] text-[#202939] placeholder-[#9EA5C0] outline-none transition-colors focus:border-[#064343] resize-none',
                    isReadOnly && 'bg-slate-100 cursor-not-allowed text-[#64748B]'
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase border-b border-[#F1F5F9] pb-2">
                2. Lương cơ bản & Ngày công
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Hình thức tính lương <span className="text-[#EE464C]">*</span>
                  </label>
                  <Select
                    value={formData.baseRateType}
                    disabled={isReadOnly}
                    onValueChange={(val) => handleBaseRateTypeChange(val as BaseRateType)}
                  >
                    <SelectTrigger
                      className={cn(
                        'w-full h-[42px] px-3.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[14px] text-[#202939] focus:border-[#064343]',
                        isReadOnly && 'bg-slate-100 cursor-not-allowed'
                      )}
                    >
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg">
                      <SelectItem value="MONTHLY" className="text-[14px] py-2 cursor-pointer">
                        {BASE_RATE_TYPE_LABELS.MONTHLY}
                      </SelectItem>
                      <SelectItem value="PER_SHIFT" className="text-[14px] py-2 cursor-pointer">
                        {BASE_RATE_TYPE_LABELS.PER_SHIFT}
                      </SelectItem>
                      <SelectItem value="HOURLY" className="text-[14px] py-2 cursor-pointer">
                        {BASE_RATE_TYPE_LABELS.HOURLY}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Mức lương cứng (VNĐ) <span className="text-[#EE464C]">*</span>
                  </label>
                  <div
                    className={cn(
                      'h-[42px] px-3.5 rounded-[8px] border transition-colors flex items-center justify-between',
                      isReadOnly && 'bg-slate-100 cursor-not-allowed',
                      errors.baseRate
                        ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                        : 'border-[#E2E8F0] bg-white focus-within:border-[#064343]'
                    )}
                  >
                    <input
                      type="number"
                      min={0}
                      step={50000}
                      value={formData.baseRate}
                      disabled={isReadOnly}
                      onFocus={() => clearError('baseRate')}
                      onChange={(e) => {
                        clearError('baseRate');
                        setFormData((prev) => ({
                          ...prev,
                          baseRate: Number(e.target.value) || 0,
                        }));
                      }}
                      className="w-full bg-transparent text-[14px] text-[#202939] outline-none disabled:cursor-not-allowed font-medium"
                    />
                    <div className="flex items-center gap-2 pl-2 select-none shrink-0">
                      <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                      <span className="text-[13px] font-semibold text-[#064343]">
                        VND
                      </span>
                    </div>
                  </div>
                  {errors.baseRate && (
                    <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1">
                      {errors.baseRate}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Ngày công chuẩn trong tháng (ngày) <span className="text-[#EE464C]">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={formData.standardWorkDays}
                  disabled={isReadOnly}
                  onFocus={() => clearError('standardWorkDays')}
                  onChange={(e) => {
                    clearError('standardWorkDays');
                    setFormData((prev) => ({
                      ...prev,
                      standardWorkDays: Number(e.target.value) || 0,
                    }));
                  }}
                  className={cn(
                    'w-full h-[42px] px-3.5 rounded-[8px] border text-[14px] text-[#202939] outline-none transition-colors',
                    isReadOnly && 'bg-slate-100 cursor-not-allowed text-[#64748B]',
                    errors.standardWorkDays
                      ? 'border-[#EE464C] bg-[#FFF5F5] focus:border-[#EE464C]'
                      : 'border-[#E2E8F0] bg-white focus:border-[#064343]'
                  )}
                />
                <p className="text-[12px] text-[#64748B] mt-1">
                  Mặc định là 26 ngày công chuẩn/tháng để tính tỷ lệ ngày công thực tế.
                </p>
                {errors.standardWorkDays && (
                  <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1">
                    {errors.standardWorkDays}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase border-b border-[#F1F5F9] pb-2">
                3. Thù lao dạy PT & Hoa hồng
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Thù lao mỗi buổi dạy PT (VNĐ)
                  </label>
                  <div
                    className={cn(
                      'h-[42px] px-3.5 rounded-[8px] border transition-colors flex items-center justify-between',
                      (isReadOnly || isTrainerDisabled) && 'bg-slate-100 cursor-not-allowed',
                      errors.pricePerPtSession
                        ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                        : 'border-[#E2E8F0] bg-white focus-within:border-[#064343]'
                    )}
                  >
                    <input
                      type="number"
                      min={0}
                      step={10000}
                      value={formData.pricePerPtSession}
                      disabled={isReadOnly || isTrainerDisabled}
                      onFocus={() => clearError('pricePerPtSession')}
                      onChange={(e) => {
                        clearError('pricePerPtSession');
                        setFormData((prev) => ({
                          ...prev,
                          pricePerPtSession: Number(e.target.value) || 0,
                        }));
                      }}
                      className="w-full bg-transparent text-[14px] text-[#202939] outline-none disabled:cursor-not-allowed font-medium"
                    />
                    <div className="flex items-center gap-2 pl-2 select-none shrink-0">
                      <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                      <span className="text-[13px] font-semibold text-[#064343]">
                        VND
                      </span>
                    </div>
                  </div>
                  {isTrainerDisabled && (
                    <p className="text-[12px] text-[#64748B] mt-1">
                      Không áp dụng cho vị trí Lễ tân.
                    </p>
                  )}
                  {errors.pricePerPtSession && (
                    <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1">
                      {errors.pricePerPtSession}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    % Hoa hồng bán gói tập
                  </label>
                  <div
                    className={cn(
                      'h-[42px] px-3.5 rounded-[8px] border transition-colors flex items-center justify-between',
                      isReadOnly && 'bg-slate-100 cursor-not-allowed',
                      errors.salesCommissionPercent
                        ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                        : 'border-[#E2E8F0] bg-white focus-within:border-[#064343]'
                    )}
                  >
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={formData.salesCommissionPercent}
                      disabled={isReadOnly}
                      onFocus={() => clearError('salesCommissionPercent')}
                      onChange={(e) => {
                        clearError('salesCommissionPercent');
                        setFormData((prev) => ({
                          ...prev,
                          salesCommissionPercent: Number(e.target.value) || 0,
                        }));
                      }}
                      className="w-full bg-transparent text-[14px] text-[#202939] outline-none disabled:cursor-not-allowed font-medium"
                    />
                    <span className="text-[13px] font-medium text-[#064343] shrink-0 ml-2">
                      %
                    </span>
                  </div>
                  <p className="text-[12px] text-[#64748B] mt-1">
                    Tỷ lệ trích thưởng trực tiếp từ giá trị hợp đồng gói tập nhân viên bán được.
                  </p>
                  {errors.salesCommissionPercent && (
                    <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1">
                      {errors.salesCommissionPercent}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="h-[72px] px-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              <span>{lockedInUse ? 'Đóng' : 'Hủy'}</span>
            </button>

            {!lockedInUse && (
              <button
                type="submit"
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
                    <span>{isEdit ? 'Lưu thay đổi' : 'Tạo công thức'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default SalaryFormulaFormDialog;

