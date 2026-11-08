'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui';
import { usePackageForm } from '@/lib/hooks/usePackageForm';
import { FolderOpenIcon } from '@/components/ui/icons';
import { packageService } from '@/lib/api/modules/packageService';
import {
  getPackageStatusBadge,
  type CreatePackagePayload,
  type PackageDetail,
  type PackageSummary,
  type UpdatePackagePayload,
} from '@/types/package';
import {
  PackageInfoSection,
  PackageDescriptionSection,
} from './sections';
import { parsePackageBackendError } from '@/lib/utils/error-helper';

interface PackageFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PackageDetail | PackageSummary | null;
  isEdit?: boolean;
  isSubmitting?: boolean;
  onSubmit: (payload: CreatePackagePayload | UpdatePackagePayload) => Promise<void> | void;
}

export function PackageFormDialog({
  isOpen,
  onClose,
  initialData,
  isEdit = false,
  isSubmitting = false,
  onSubmit,
}: PackageFormDialogProps) {
  const {
    formData,
    errors,
    setErrors,
    clearError,
    handleChange,
    resetForm,
    getCreatePayload,
    getUpdatePayload,
  } = usePackageForm({ initialData, isEdit });

  const { data: categoryData } = useQuery({
    queryKey: ['admin-package-categories-lookup'],
    queryFn: async () => {
      const res = await packageService.categoryLookup();
      return res.data;
    },
    enabled: isOpen,
    staleTime: 0,
    refetchOnMount: true,
  });

  const categories = categoryData || [];

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      if (isEdit) {
        const payload = getUpdatePayload();
        if (!payload) return;
        await onSubmit(payload);
      } else {
        const payload = getCreatePayload();
        if (!payload) return;
        await onSubmit(payload);
      }
      resetForm();
    } catch (err: unknown) {
      const { fieldErrors } = parsePackageBackendError(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    }
  };

  const statusBadge = getPackageStatusBadge(formData.status);

  const isPriceDurationDisabled = false;
  const isStatusDisabled = false;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Chỉnh sửa gói tập' : 'Thêm gói tập mới'}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[880px] max-w-full bg-white h-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border-l border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <div className="pt-6 pb-4 pr-6 pl-0 flex items-center justify-between shrink-0 bg-white border-b border-[#F1F5F9]">
          <div className="flex items-center h-[28px] border-l-[4px] border-[#064343] pl-5 min-w-0">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              {isEdit ? 'Chỉnh sửa gói tập' : 'Thêm gói tập mới'}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {isEdit && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[#64748B] hidden sm:inline">Trạng thái:</span>
                  <Badge
                    variant={statusBadge.variant}
                    className="text-[13px] font-normal leading-[16px] px-2.5 py-[3px] rounded-[6px]"
                  >
                    {statusBadge.label}
                  </Badge>
                </div>

                <div className="hidden sm:block w-[1px] h-4 bg-[#E2E8F0]" />
              </>
            )}

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#525252] flex items-center justify-center transition-colors cursor-pointer ml-1 disabled:opacity-50"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-7 flex-1">
            <PackageInfoSection
              formData={formData}
              errors={errors}
              categories={categories}
              isEdit={isEdit}
              isPriceDurationDisabled={isPriceDurationDisabled}
              isStatusDisabled={isStatusDisabled}
              onChangeField={handleChange}
              onClearError={clearError}
            />

            <PackageDescriptionSection
              value={formData.description}
              onChange={(val) => handleChange('description', val)}
              disabled={isSubmitting}
            />
          </div>

          <div className="h-[72px] px-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              <span>Hủy</span>
            </button>
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
                  <span>{isEdit ? 'Lưu thay đổi' : 'Tạo gói tập'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PackageFormDialog;
