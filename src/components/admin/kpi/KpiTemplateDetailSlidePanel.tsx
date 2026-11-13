'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import {
  Badge,
  FolderOpenIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  EditPencilIcon,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatVND, formatDate } from '@/lib/utils/formatters';
import { kpiService } from '@/lib/api/modules/kpiService';
import type { UpdateKpiTemplatePayload, KpiRole, KpiTemplateStatus, KpiTemplateDetail } from '@/types/kpi';

interface KpiTemplateDetailSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string | null;
  mode?: 'view' | 'edit';
  onSave?: (id: string, payload: UpdateKpiTemplatePayload) => Promise<void>;
  isSaving?: boolean;
}

function InfoItem({
  label,
  value,
  className = '',
}: {
  label: string;
  value?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
      <span className="text-[13px] font-medium text-[#64748B] leading-none">
        {label}
      </span>
      <div className="text-[14px] leading-relaxed break-words font-medium text-[#011010]">
        {value !== undefined && value !== null && value !== '' ? value : '—'}
      </div>
    </div>
  );
}

export function KpiTemplateDetailSlidePanel({
  isOpen,
  onClose,
  templateId,
  mode = 'view',
  onSave,
  isSaving = false,
}: KpiTemplateDetailSlidePanelProps) {
  const [isEditing, setIsEditing] = useState<boolean>(mode === 'edit');

  useEffect(() => {
    setIsEditing(mode === 'edit');
  }, [mode, isOpen]);
  const { data: detailData, isLoading } = useQuery({
    queryKey: ['admin-kpi-template-detail', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const res = await kpiService.getTemplateById(templateId);
      return res.data as KpiTemplateDetail;
    },
    enabled: Boolean(isOpen && templateId),
  });

  const [formData, setFormData] = useState<UpdateKpiTemplatePayload>({
    name: '',
    targetRole: 'TRAINER',
    targetRevenue: 0,
    targetBonusAmount: 0,
    targetPtSessions: null,
    targetNewMembers: null,
    description: '',
    status: 'ACTIVE',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (detailData) {
      setFormData({
        name: detailData.name || '',
        targetRole: detailData.targetRole || 'TRAINER',
        targetRevenue: detailData.targetRevenue || 0,
        targetBonusAmount: detailData.targetBonusAmount || 0,
        targetPtSessions: detailData.targetPtSessions ?? null,
        targetNewMembers: detailData.targetNewMembers ?? null,
        description: detailData.description || '',
        status: detailData.status || 'ACTIVE',
      });
      setErrors({});
    }
  }, [detailData]);

  if (!isOpen || !templateId) return null;

  const isTrainer = formData.targetRole === 'TRAINER';
  const isActive = formData.status === 'ACTIVE';

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
      targetPtSessions: role === 'TRAINER' ? 30 : null,
      targetNewMembers: role === 'RECEPTIONIST' ? 15 : null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên mẫu KPI.';
    }
    if (formData.targetRevenue <= 0) {
      newErrors.targetRevenue = 'Chỉ tiêu doanh thu phải lớn hơn 0.';
    }
    if (formData.targetBonusAmount <= 0) {
      newErrors.targetBonusAmount = 'Mức thưởng chỉ tiêu phải lớn hơn 0.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (onSave) {
        await onSave(templateId, formData);
      }
      if (mode === 'edit') {
        onClose();
      } else {
        setIsEditing(false);
      }
    } catch {
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? 'Chỉnh sửa mẫu KPI' : 'Chi tiết mẫu KPI'}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[680px] max-w-full bg-white h-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border-l border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <div className="pt-6 pb-4 pr-6 pl-0 flex items-center justify-between shrink-0 bg-white border-b border-[#F1F5F9]">
          <div className="flex items-center h-[28px] border-l-[4px] border-[#064343] pl-5 min-w-0">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              {isEditing ? 'Chỉnh sửa mẫu KPI' : 'Chi tiết mẫu KPI'}
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

            <div className="w-[1px] h-4 bg-[#E2E8F0]" />

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#525252] flex items-center justify-center transition-colors cursor-pointer ml-1 disabled:opacity-50"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#064343]" />
            <p className="text-[13px] text-slate-500 font-medium">Đang tải dữ liệu mẫu KPI...</p>
          </div>
        ) : !detailData ? (
          <div className="flex-1 flex items-center justify-center text-[14px] text-[#64748B]">
            Không tìm thấy thông tin mẫu KPI.
          </div>
        ) : !isEditing ? (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div className="bg-white rounded-xl">
              <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  THÔNG TIN MẪU KPI
                </h4>
              </div>

              <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
                <InfoItem label="Tên mẫu KPI" value={detailData.name} />
                <InfoItem
                  label="Đối tượng áp dụng"
                  value={detailData.targetRole === 'TRAINER' ? 'Huấn luyện viên' : 'Lễ tân'}
                />
                <InfoItem
                  label="Ngày tạo"
                  value={formatDate(detailData.createdDate)}
                />

                <InfoItem
                  label="Doanh thu chỉ tiêu"
                  value={formatVND(detailData.targetRevenue)}
                />
                <InfoItem
                  label={
                    detailData.targetRole === 'TRAINER'
                      ? 'Chỉ tiêu số buổi dạy PT'
                      : 'Chỉ tiêu số hội viên mới'
                  }
                  value={
                    detailData.targetRole === 'TRAINER'
                      ? `${detailData.targetPtSessions ?? 0} buổi`
                      : `${detailData.targetNewMembers ?? 0} hội viên`
                  }
                />
                <InfoItem
                  label="Mức thưởng chỉ tiêu"
                  value={
                    <span className="font-semibold text-emerald-600">
                      +{formatVND(detailData.targetBonusAmount)}
                    </span>
                  }
                />
              </div>
            </div>

            <div className="bg-white rounded-xl">
              <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  MÔ TẢ & TIÊU CHUẨN ĐÁNH GIÁ
                </h4>
              </div>

              <div className="px-5">
                <p className="text-[14px] text-[#011010] leading-relaxed whitespace-pre-wrap break-words">
                  {detailData.description || 'Chưa có mô tả cho mẫu KPI này.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div className="bg-white rounded-xl">
              <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  THÔNG TIN CHUNG
                </h4>
              </div>

              <div className="px-5 space-y-5">
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
                      'h-[42px] px-3.5 rounded-[8px] flex items-center transition-colors border',
                      errors.name
                        ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                        : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                    )}
                  >
                    <input
                      type="text"
                      disabled={isSaving}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div
                    className="flex flex-col gap-1.5 min-w-0"
                    onClick={clearErrors}
                    onPointerDown={clearErrors}
                  >
                    <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                      Đối tượng áp dụng <span className="text-[#EE0033]">*</span>
                    </label>
                    <Select
                      value={formData.targetRole}
                      onValueChange={(val) => {
                        clearErrors();
                        handleRoleChange(val as KpiRole);
                      }}
                      onOpenChange={(open) => {
                        if (open) clearErrors();
                      }}
                      disabled={isSaving}
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
                      value={formData.status || 'ACTIVE'}
                      onValueChange={(val) => {
                        clearErrors();
                        setFormData((prev) => ({ ...prev, status: val as KpiTemplateStatus }));
                      }}
                      onOpenChange={(open) => {
                        if (open) clearErrors();
                      }}
                      disabled={isSaving}
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
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl">
              <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  CHỈ TIÊU ĐIỀU CHỈNH
                </h4>
              </div>

              <div className="px-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div
                    className="flex flex-col gap-1.5 min-w-0"
                    onClick={clearErrors}
                    onPointerDown={clearErrors}
                  >
                    <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                      Doanh thu chỉ tiêu <span className="text-[#EE0033]">*</span>
                    </label>
                    <div
                      className={cn(
                        'h-[42px] px-3.5 rounded-[8px] flex items-center transition-colors border',
                        errors.targetRevenue
                          ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                          : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                      )}
                    >
                      <input
                        type="number"
                        min="0"
                        step="1000000"
                        disabled={isSaving}
                        value={formData.targetRevenue || ''}
                        onPointerDown={clearErrors}
                        onFocus={clearErrors}
                        onClick={clearErrors}
                        onChange={(e) => {
                          clearErrors();
                          setFormData((prev) => ({
                            ...prev,
                            targetRevenue: Number(e.target.value),
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
                        'h-[42px] px-3.5 rounded-[8px] flex items-center transition-colors border',
                        errors.targetBonusAmount
                          ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                          : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                      )}
                    >
                      <input
                        type="number"
                        min="0"
                        step="500000"
                        disabled={isSaving}
                        value={formData.targetBonusAmount || ''}
                        onPointerDown={clearErrors}
                        onFocus={clearErrors}
                        onClick={clearErrors}
                        onChange={(e) => {
                          clearErrors();
                          setFormData((prev) => ({
                            ...prev,
                            targetBonusAmount: Number(e.target.value),
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
                </div>

                {isTrainer ? (
                  <div
                    className="flex flex-col gap-1.5 min-w-0"
                    onClick={clearErrors}
                    onPointerDown={clearErrors}
                  >
                    <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                      Chỉ tiêu số buổi dạy PT
                    </label>
                    <div
                      className={cn(
                        'h-[42px] px-3.5 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center transition-colors',
                        'focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                      )}
                    >
                      <input
                        type="number"
                        min="0"
                        step="1"
                        disabled={isSaving}
                        value={formData.targetPtSessions ?? ''}
                        onPointerDown={clearErrors}
                        onFocus={clearErrors}
                        onClick={clearErrors}
                        onChange={(e) => {
                          clearErrors();
                          setFormData((prev) => ({
                            ...prev,
                            targetPtSessions:
                              e.target.value === '' ? null : Number(e.target.value),
                          }));
                        }}
                        placeholder="Nhập"
                        className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex flex-col gap-1.5 min-w-0"
                    onClick={clearErrors}
                    onPointerDown={clearErrors}
                  >
                    <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                      Chỉ tiêu số hội viên mới
                    </label>
                    <div
                      className={cn(
                        'h-[42px] px-3.5 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center transition-colors',
                        'focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                      )}
                    >
                      <input
                        type="number"
                        min="0"
                        step="1"
                        disabled={isSaving}
                        value={formData.targetNewMembers ?? ''}
                        onPointerDown={clearErrors}
                        onFocus={clearErrors}
                        onClick={clearErrors}
                        onChange={(e) => {
                          clearErrors();
                          setFormData((prev) => ({
                            ...prev,
                            targetNewMembers:
                              e.target.value === '' ? null : Number(e.target.value),
                          }));
                        }}
                        placeholder="Nhập"
                        className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl">
              <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  TIÊU CHUẨN ĐÁNH GIÁ & MÔ TẢ
                </h4>
              </div>

              <div className="px-5">
                <div
                  className={cn(
                    'p-3 bg-slate-50 border border-slate-200 rounded-[8px] flex transition-all',
                    'focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                  )}
                  onClick={clearErrors}
                  onPointerDown={clearErrors}
                >
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={formData.description || ''}
                    onPointerDown={clearErrors}
                    onFocus={clearErrors}
                    onClick={clearErrors}
                    onChange={(e) => {
                      clearErrors();
                      setFormData((prev) => ({ ...prev, description: e.target.value }));
                    }}
                    placeholder="Nhập"
                    disabled={isSaving}
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none resize-none disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </form>
        )}

        <div className="h-[68px] px-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3 shrink-0">
          {!isEditing ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="h-[40px] px-5 min-w-[110px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <EditPencilIcon className="w-4 h-4" color="#FFFFFF" />
                <span>Chỉnh sửa</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  if (mode === 'edit') {
                    onClose();
                  } else {
                    setIsEditing(false);
                  }
                }}
                disabled={isSaving}
                className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="h-[40px] px-5 min-w-[120px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
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

export default KpiTemplateDetailSlidePanel;
