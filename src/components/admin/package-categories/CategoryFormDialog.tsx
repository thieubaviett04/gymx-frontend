'use client';

import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui';
import { FolderOpenIcon } from '@/components/ui/icons';
import { useCategoryForm } from '@/lib/hooks/useCategoryForm';
import type {
  CreatePackageCategoryPayload,
  PackageCategoryDetail,
  PackageCategorySummary,
  UpdatePackageCategoryPayload,
} from '@/types/packageCategory';
import { CategoryInfoSection, CategoryDescriptionSection } from './sections';

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PackageCategoryDetail | PackageCategorySummary | null;
  isEdit?: boolean;
  isSubmitting?: boolean;
  onSubmit: (payload: CreatePackageCategoryPayload | UpdatePackageCategoryPayload) => Promise<void> | void;
}

export function CategoryFormDialog({
  isOpen,
  onClose,
  initialData,
  isEdit = false,
  isSubmitting = false,
  onSubmit,
}: CategoryFormDialogProps) {
  const {
    formData,
    errors,
    handleChange,
    resetForm,
    getCreatePayload,
    getUpdatePayload,
  } = useCategoryForm({ initialData, isEdit });

  React.useEffect(() => {
    if (isOpen && !isEdit) {
      resetForm();
    }
  }, [isOpen, isEdit, resetForm]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (isEdit) {
      const payload = getUpdatePayload();
      if (!payload) return;
      await onSubmit(payload);
    } else {
      const payload = getCreatePayload();
      if (!payload) return;
      await onSubmit(payload);
      resetForm();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[680px] max-w-full bg-white h-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border-l border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <div className="pt-6 pb-4 pr-6 pl-0 flex items-center justify-between shrink-0 bg-white border-b border-[#F1F5F9]">
          <div className="flex items-center h-[28px] border-l-[4px] border-[#064343] pl-5 min-w-0">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {isEdit && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[#64748B] hidden sm:inline">Trạng thái:</span>
                  <Badge
                    variant={formData.status === 'ACTIVE' ? 'active' : 'inactive'}
                    className="text-[13px] font-normal leading-[16px] px-2.5 py-[3px] rounded-[6px]"
                  >
                    {formData.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
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
            <CategoryInfoSection
              formData={formData}
              errors={errors}
              isEdit={isEdit}
              onChangeField={handleChange}
            />
            <CategoryDescriptionSection
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
                  <span>{isEdit ? 'Lưu thay đổi' : 'Tạo danh mục'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryFormDialog;
