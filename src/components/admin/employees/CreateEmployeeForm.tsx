'use client';

import React, { useEffect, useRef } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useUiStore } from '@/lib/store/uiStore';
import { Alert } from '@/components/ui';
import { FolderOpenIcon, TrashBinIcon } from '@/components/ui/icons';
import type { CreateEmployeeFormProps } from '@/types/employee';
import { SPECIALIZATION_OPTIONS } from '@/types/employee';
import { useCreateEmployeeForm } from '@/lib/hooks';
import {
  BasicInfoSection,
  ContactSalarySection,
  TrainerExpertiseSection,
} from './sections';

// Re-export for any legacy import paths
export { SPECIALIZATION_OPTIONS };

export function CreateEmployeeForm({ onSuccess, onCancel }: CreateEmployeeFormProps) {
  const setHeaderRightContent = useUiStore((s) => s.setHeaderRightContent);

  const {
    formData,
    errors,
    toast,
    isSubmitting,
    isTrainer,
    isReceptionist,
    changeField,
    clearFieldError,
    clearAllErrors,
    handleCancel,
    handleSubmit,
    dismissToast,
  } = useCreateEmployeeForm({ onSuccess, onCancel });

  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  // Header actions: Hủy bỏ & Lưu lại
  useEffect(() => {
    setHeaderRightContent(
      <div className="flex items-center gap-3">
        {/* Nút Hủy bỏ (icon thùng rác như bảng dữ liệu, font regular) */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="h-[44px] px-5 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#2F3D50] text-[14px] font-normal leading-[20px] rounded-[10px] shadow-2xs transition-all cursor-pointer inline-flex items-center gap-2 active:scale-[0.98] disabled:opacity-50"
        >
          <TrashBinIcon className="w-5 h-5" color="#EE464C" />
          <span>Hủy bỏ</span>
        </button>

        {/* Nút Lưu lại (chuẩn Figma Node 1438:11069, font regular) */}
        <button
          type="button"
          onClick={() => handleSubmitRef.current()}
          disabled={isSubmitting}
          className="h-[44px] px-5 bg-[#064343] hover:bg-[#053737] text-white text-[14px] font-normal leading-[20px] tracking-[0.01em] rounded-[10px] shadow-2xs transition-all cursor-pointer inline-flex items-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <FolderOpenIcon className="w-5 h-5 text-white" />
              <span>Lưu lại</span>
            </>
          )}
        </button>
      </div>
    );

    return () => {
      setHeaderRightContent(null);
    };
  }, [isSubmitting, handleCancel, setHeaderRightContent]);

  return (
    <div className="w-full flex-1 flex flex-col min-h-full">
      {/* Toast Alert – Canh giữa chính xác theo khung nhìn nội dung */}
      {toast && (
        <div className="fixed top-3.5 md:top-4 left-1/2 lg:left-[calc(50%+130px)] -translate-x-1/2 z-[100] max-w-[500px] w-auto pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <Alert
            size="sm"
            variant={toast.type === 'success' ? 'success' : 'danger'}
            onClose={dismissToast}
            className="w-auto min-w-[280px] max-w-[500px] shadow-[0px_8px_24px_rgba(0,0,0,0.15)] border border-[#E5E5E5] bg-white"
          >
            <p className="text-[13px] font-normal !font-normal text-[#202939] leading-snug whitespace-nowrap">
              {toast.message}
            </p>
          </Alert>
        </div>
      )}

      {/* ─── Card duy nhất ─── */}
      <div className="relative w-full flex-1 bg-white rounded-[12px] p-6 sm:p-[28px_32px] border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col min-h-[calc(100vh-140px)]">
        {/* Thanh stroke 4px sát mép ngoài bên trái vuông góc theo đúng thiết kế */}
        <div className="absolute left-0 top-7 w-[4px] h-6 bg-[#064343] rounded-none" />

        {/* Header Title & Badge thông báo */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
            Thêm mới nhân viên
          </h2>

          {isReceptionist && (
            <div className="inline-flex items-center gap-2 text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-[8px] px-3.5 py-1.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="font-normal">
                Thông tin chuyên môn không dành cho <strong className="font-semibold text-red-700">Lễ tân</strong>.
              </span>
            </div>
          )}

          {formData.position && !isTrainer && !isReceptionist && (
            <div className="inline-flex items-center gap-2 text-[13px] text-slate-600 bg-slate-50 border border-slate-200 rounded-[8px] px-3.5 py-1.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-normal">
                Thông tin chuyên môn chỉ áp dụng cho vai trò <strong className="font-semibold text-[#064343]">Huấn luyện viên</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Toàn bộ các trường do người dùng nhập */}
        <form
          onSubmit={handleSubmit}
          onFocusCapture={clearAllErrors}
          className="flex flex-col space-y-8"
        >
          <BasicInfoSection
            formData={formData}
            errors={errors}
            onChangeField={changeField}
            onClearFieldError={clearFieldError}
          />

          <ContactSalarySection
            formData={formData}
            errors={errors}
            onChangeField={changeField}
            onClearFieldError={clearFieldError}
          />

          <TrainerExpertiseSection
            formData={formData}
            errors={errors}
            isTrainer={isTrainer}
            onChangeField={changeField}
            onClearFieldError={clearFieldError}
          />
        </form>
      </div>
    </div>
  );
}

export default CreateEmployeeForm;
