'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Loader2 } from 'lucide-react';
import {
  Badge,
  DatePicker,
  EditPencilIcon,
  FolderOpenIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime, formatVND } from '@/lib/utils/formatters';
import { parseSalaryFormulaBackendError } from '@/lib/utils/error-helper';
import type {
  BaseRateType,
  SalaryFormulaDto,
  TargetRole,
  UpdateSalaryFormulaRequest,
} from '@/types/payroll';
import {
  TARGET_ROLE_LABELS,
  BASE_RATE_TYPE_LABELS,
  BASE_RATE_TYPE_UNITS,
} from '@/types/payroll';

interface SalaryFormulaDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formula: SalaryFormulaDto | null;
  initialIsEditing?: boolean;
  onSave?: (id: string, payload: UpdateSalaryFormulaRequest) => Promise<void> | void;
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

export function SalaryFormulaDetailDialog({
  isOpen,
  onClose,
  formula,
  initialIsEditing = false,
  onSave,
  isSubmitting = false,
}: SalaryFormulaDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(initialIsEditing);

  const [formData, setFormData] = useState<UpdateSalaryFormulaRequest>({
    name: '',
    targetRole: 'ALL',
    baseRateType: 'MONTHLY',
    baseRate: 0,
    standardWorkDays: 26,
    pricePerPtSession: 0,
    salesCommissionPercent: 10,
    effectiveDate: '',
    description: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formula) {
      setFormData({
        name: formula.name,
        targetRole: formula.targetRole,
        baseRateType: formula.baseRateType,
        baseRate: formula.baseRate,
        standardWorkDays: formula.standardWorkDays,
        pricePerPtSession: formula.pricePerPtSession,
        salesCommissionPercent: formula.salesCommissionPercent,
        effectiveDate: formula.effectiveDate?.split('T')[0] || '',
        description: formula.description || '',
      });
      setFormErrors({});
    }
  }, [formula]);

  useEffect(() => {
    if (isOpen) {
      setIsEditing(initialIsEditing);
    }
  }, [isOpen, initialIsEditing]);

  if (!isOpen || !formula) return null;

  const isActive = formula.status === 'ACTIVE';
  const hasDescription = Boolean(formula.description && formula.description.trim());

  const isHourly = formula.baseRateType === 'HOURLY';
  const isShift = formula.baseRateType === 'PER_SHIFT';
  const workUnitLabel = isHourly ? 'Số giờ chuẩn' : isShift ? 'Số ca chuẩn' : 'Ngày công chuẩn';
  const unitName = isHourly ? 'giờ/tháng' : isShift ? 'ca/tháng' : 'ngày/tháng';

  const editIsHourly = formData.baseRateType === 'HOURLY';
  const editIsShift = formData.baseRateType === 'PER_SHIFT';
  const editBaseRateLabel = editIsHourly
    ? 'Lương cơ bản / giờ'
    : editIsShift
    ? 'Lương cơ bản / ca'
    : 'Lương cơ bản / tháng';
  const editWorkUnitLabel = editIsHourly
    ? 'Số giờ chuẩn'
    : editIsShift
    ? 'Số ca chuẩn'
    : 'Công chuẩn';
  const editUnitText = editIsHourly ? 'Giờ' : editIsShift ? 'Ca' : 'Ngày';
  const editMaxUnits = editIsHourly ? 500 : editIsShift ? 100 : 31;

  const clearError = (field: string) => {
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
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
    if (formData.standardWorkDays < 1 || formData.standardWorkDays > editMaxUnits) {
      newErrors.standardWorkDays = `Số ${editUnitText.toLowerCase()} chuẩn phải từ 1 đến ${editMaxUnits} ${editUnitText.toLowerCase()}.`;
    }
    if (formData.targetRole !== 'RECEPTIONIST' && formData.pricePerPtSession < 0) {
      newErrors.pricePerPtSession = 'Thù lao dạy PT không được âm.';
    }
    if (formData.salesCommissionPercent < 0 || formData.salesCommissionPercent > 100) {
      newErrors.salesCommissionPercent = 'Hoa hồng phải từ 0% đến 100%.';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formula || !onSave || isSubmitting) return;
    if (!validateForm()) return;
    try {
      await onSave(formula.id, {
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      });
    } catch (err: unknown) {
      const { fieldErrors } = parseSalaryFormulaBackendError(err);
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    }
  };

  const handleCancelEdit = () => {
    if (isSubmitting) return;
    if (formula) {
      setFormData({
        name: formula.name,
        targetRole: formula.targetRole,
        baseRateType: formula.baseRateType,
        baseRate: formula.baseRate,
        standardWorkDays: formula.standardWorkDays,
        pricePerPtSession: formula.pricePerPtSession,
        salesCommissionPercent: formula.salesCommissionPercent,
        effectiveDate: formula.effectiveDate?.split('T')[0] || '',
        description: formula.description || '',
      });
    }
    setFormErrors({});
    if (initialIsEditing) {
      onClose();
    } else {
      setIsEditing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? 'Chỉnh sửa chính sách lương' : 'Chi tiết chính sách lương'}
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
              {isEditing ? 'Chỉnh sửa chính sách lương' : 'Chi tiết chính sách lương'}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#64748B] hidden sm:inline">Trạng thái:</span>
              <Badge
                variant={isActive ? 'active' : 'inactive'}
                className="text-[13px] font-normal leading-[16px] px-2.5 py-[3px] rounded-[6px]"
              >
                {isActive ? 'Đang áp dụng' : 'Ngừng áp dụng'}
              </Badge>
            </div>

            <div className="hidden sm:block w-[1px] h-4 bg-[#E2E8F0]" />

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
          {formula.inUse && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-[8px] flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[13px] text-amber-800 leading-snug">
                <strong className="font-semibold">Công thức đang được áp dụng:</strong> Công thức này đã được sử dụng trong kỳ tính lương đã chốt và bị khóa chỉnh sửa để bảo đảm tính nhất quán dữ liệu kế toán.
              </div>
            </div>
          )}

          {!isEditing ? (
            <>
              <div className="bg-white rounded-xl">
                <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                  <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                    THÔNG TIN CÔNG THỨC LƯƠNG
                  </h4>
                </div>

                <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6 sm:gap-y-7">
                  <InfoItem
                    label="Tên công thức"
                    value={formula.name}
                    className="sm:col-span-3"
                  />

                  <InfoItem
                    label="Đối tượng áp dụng"
                    value={TARGET_ROLE_LABELS[formula.targetRole] || formula.targetRole}
                  />

                  <InfoItem
                    label="Hình thức lương"
                    value={BASE_RATE_TYPE_LABELS[formula.baseRateType] || formula.baseRateType}
                  />

                  <InfoItem
                    label="Mức lương cơ bản"
                    value={`${formatVND(formula.baseRate)} ${BASE_RATE_TYPE_UNITS[formula.baseRateType] || ''}`}
                    isHighlight
                  />

                  <InfoItem
                    label={workUnitLabel}
                    value={`${formula.standardWorkDays} ${unitName}`}
                  />

                  {formula.targetRole !== 'RECEPTIONIST' && (
                    <InfoItem
                      label="Thù lao dạy kèm"
                      value={formatVND(formula.pricePerPtSession)}
                    />
                  )}

                  <InfoItem
                    label="Hoa hồng bán gói"
                    value={`${formula.salesCommissionPercent}%`}
                  />

                  <InfoItem
                    label="Ngày hiệu lực"
                    value={formatDate(formula.effectiveDate)}
                  />

                  <InfoItem
                    label="Người tạo"
                    value={formula.creatorName || 'Admin GymX Master'}
                  />

                  {formula.createdAt && (
                    <InfoItem
                      label="Thời gian tạo"
                      value={formatDateTime(formula.createdAt)}
                    />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl pt-2">
                <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                  <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                    MÔ TẢ CÔNG THỨC
                  </h4>
                </div>

                {hasDescription ? (
                  <div className="px-5">
                    <div className="text-[14px] text-[#202939] leading-relaxed whitespace-pre-line break-words">
                      {formula.description}
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center justify-center py-12 sm:py-14">
                    <img
                      src="/images/empty-rating.svg"
                      alt="Chưa có mô tả chi tiết"
                      className="w-[104px] h-[121px] object-contain mb-4"
                    />
                    <p className="text-[16px] text-[#000000] font-normal leading-7 text-center">
                      Chưa có mô tả chi tiết cho chính sách lương này
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleSave} noValidate className="space-y-8">
              <div className="bg-white rounded-xl">
                <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                  <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                    THÔNG TIN CHÍNH SÁCH
                  </h4>
                </div>

                <div className="px-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="flex flex-col gap-1.5 min-w-0 sm:col-span-2">
                    <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                      Tên công thức tính lương <span className="text-[#EE0033]">*</span>
                    </label>
                    <div
                      className={cn(
                        'h-[42px] px-3.5 bg-slate-50 border rounded-[8px] flex items-center transition-all',
                        formErrors.name
                          ? 'border-red-400 bg-red-50/20'
                          : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]',
                        formula.inUse && 'bg-slate-100 cursor-not-allowed select-none'
                      )}
                    >
                      <input
                        type="text"
                        value={formData.name}
                        disabled={formula.inUse || isSubmitting}
                        onFocus={() => clearError('name')}
                        onChange={(e) => {
                          clearError('name');
                          setFormData((prev) => ({ ...prev, name: e.target.value }));
                        }}
                        placeholder="Nhập"
                        className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed disabled:text-[#94A3B8]"
                      />
                    </div>
                    {formErrors.name && (
                      <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                      Đối tượng áp dụng <span className="text-[#EE0033]">*</span>
                    </label>
                    <Select
                      value={formData.targetRole}
                      disabled={formula.inUse || isSubmitting}
                      onValueChange={(val) => {
                        clearError('targetRole');
                        setFormData((prev) => ({
                          ...prev,
                          targetRole: val as TargetRole,
                          pricePerPtSession: val === 'RECEPTIONIST' ? 0 : prev.pricePerPtSession,
                        }));
                      }}
                    >
                      <SelectTrigger
                        disabled={formula.inUse || isSubmitting}
                        className={cn(
                          'h-[42px] w-full rounded-[8px] bg-slate-50 px-3.5 text-[14px] text-[#202939] shadow-none data-[placeholder]:text-slate-400 focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]',
                          formErrors.targetRole ? 'border-red-400 bg-red-50/20' : 'border-slate-200',
                          formula.inUse && 'cursor-not-allowed opacity-60 bg-slate-100'
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
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                      Hình thức lương <span className="text-[#EE0033]">*</span>
                    </label>
                    <Select
                      value={formData.baseRateType}
                      disabled={formula.inUse || isSubmitting}
                      onValueChange={(val) => {
                        clearError('baseRateType');
                        setFormData((prev) => ({ ...prev, baseRateType: val as BaseRateType }));
                      }}
                    >
                      <SelectTrigger
                        disabled={formula.inUse || isSubmitting}
                        className={cn(
                          'h-[42px] w-full rounded-[8px] bg-slate-50 px-3.5 text-[14px] text-[#202939] shadow-none data-[placeholder]:text-slate-400 focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]',
                          formErrors.baseRateType ? 'border-red-400 bg-red-50/20' : 'border-slate-200',
                          formula.inUse && 'cursor-not-allowed opacity-60 bg-slate-100'
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
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                      {editBaseRateLabel} <span className="text-[#EE0033]">*</span>
                    </label>
                    <div
                      className={cn(
                        'h-[42px] px-3.5 bg-slate-50 border rounded-[8px] flex items-center justify-between transition-all',
                        formErrors.baseRate
                          ? 'border-red-400 bg-red-50/20'
                          : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]',
                        formula.inUse && 'bg-slate-100 cursor-not-allowed select-none'
                      )}
                    >
                      <input
                        type="number"
                        min={0}
                        step={50000}
                        value={formData.baseRate ? formData.baseRate : ''}
                        disabled={formula.inUse || isSubmitting}
                        onFocus={() => clearError('baseRate')}
                        onChange={(e) => {
                          clearError('baseRate');
                          const rawVal = e.target.value;
                          setFormData((prev) => ({ ...prev, baseRate: rawVal === '' ? 0 : Number(rawVal) }));
                        }}
                        placeholder="Nhập"
                        className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed disabled:text-[#94A3B8] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="flex items-center gap-2 pl-2 select-none shrink-0">
                        <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                        <span className="text-[13px] font-semibold text-[#064343]">VND</span>
                      </div>
                    </div>
                    {formErrors.baseRate && (
                      <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                        {formErrors.baseRate}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                      {editWorkUnitLabel} <span className="text-[#EE0033]">*</span>
                    </label>
                    <div
                      className={cn(
                        'h-[42px] px-3.5 bg-slate-50 border rounded-[8px] flex items-center justify-between transition-all',
                        formErrors.standardWorkDays
                          ? 'border-red-400 bg-red-50/20'
                          : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]',
                        formula.inUse && 'bg-slate-100 cursor-not-allowed select-none'
                      )}
                    >
                      <input
                        type="number"
                        min={1}
                        max={editMaxUnits}
                        value={formData.standardWorkDays ? formData.standardWorkDays : ''}
                        disabled={formula.inUse || isSubmitting}
                        onFocus={() => clearError('standardWorkDays')}
                        onChange={(e) => {
                          clearError('standardWorkDays');
                          const rawVal = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            standardWorkDays: rawVal === '' ? 0 : Number(rawVal),
                          }));
                        }}
                        placeholder="Nhập"
                        className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed disabled:text-[#94A3B8] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="flex items-center gap-2 pl-2.5 border-l border-[#064343] shrink-0">
                        <span className="text-[13px] font-medium text-[#064343]">{editUnitText}</span>
                      </div>
                    </div>
                    {formErrors.standardWorkDays && (
                      <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                        {formErrors.standardWorkDays}
                      </p>
                    )}
                  </div>

                  {formData.targetRole !== 'RECEPTIONIST' && (
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                        Thù lao PT <span className="text-[#EE0033]">*</span>
                      </label>
                      <div
                        className={cn(
                          'h-[42px] px-3.5 bg-slate-50 border rounded-[8px] flex items-center justify-between transition-all',
                          formErrors.pricePerPtSession
                            ? 'border-red-400 bg-red-50/20'
                            : 'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]',
                          formula.inUse && 'bg-slate-100 cursor-not-allowed select-none opacity-60'
                        )}
                      >
                        <input
                          type="number"
                          min={0}
                          step={10000}
                          value={formData.pricePerPtSession ? formData.pricePerPtSession : ''}
                          disabled={formula.inUse || isSubmitting}
                          onFocus={() => clearError('pricePerPtSession')}
                          onChange={(e) => {
                            clearError('pricePerPtSession');
                            const rawVal = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              pricePerPtSession: rawVal === '' ? 0 : Number(rawVal),
                            }));
                          }}
                          placeholder="Nhập"
                          className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed disabled:text-[#94A3B8] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <div className="flex items-center gap-2 pl-2 select-none shrink-0">
                          <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                          <span className="text-[13px] font-semibold text-[#064343]">VND</span>
                        </div>
                      </div>
                      {formErrors.pricePerPtSession && (
                        <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                          {formErrors.pricePerPtSession}
                        </p>
                      )}
                    </div>
                  )}

                  <div className={cn('flex flex-col gap-1.5 min-w-0', formData.targetRole === 'RECEPTIONIST' ? 'sm:col-span-2' : '')}>
                    <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                      Ngày hiệu lực <span className="text-[#EE0033]">*</span>
                    </label>
                    <DatePicker
                      value={formData.effectiveDate}
                      onChange={(val) => {
                        clearError('effectiveDate');
                        setFormData((prev) => ({ ...prev, effectiveDate: val }));
                      }}
                      disabled={formula.inUse || isSubmitting}
                      placeholder="Chọn ngày áp dụng"
                      error={formErrors.effectiveDate}
                      className="h-[42px] rounded-[8px] bg-slate-50 border-slate-200"
                    />
                    {formErrors.effectiveDate && (
                      <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                        {formErrors.effectiveDate}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0 sm:col-span-2">
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
                        disabled={formula.inUse || isSubmitting}
                        onChange={(val) => {
                          clearError('salesCommissionPercent');
                          setFormData((prev) => ({ ...prev, salesCommissionPercent: val }));
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl pt-2">
                <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                  <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                    MÔ TẢ &amp; GHI CHÚ
                  </h4>
                </div>

                <div className="px-5">
                  <textarea
                    value={formData.description || ''}
                    disabled={formula.inUse || isSubmitting}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Nhập ghi chú hoặc mô tả về chính sách tính lương..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[8px] p-3 text-[14px] text-[#202939] placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] transition-all resize-none disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
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

              {!formula.inUse && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="h-[40px] px-5 min-w-[120px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <EditPencilIcon className="w-4 h-4" color="#FFFFFF" />
                  <span>Chỉnh sửa</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
              >
                <span>Hủy</span>
              </button>

              {!formula.inUse && (
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalaryFormulaDetailDialog;
