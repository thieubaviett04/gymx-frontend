'use client';

import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { FolderOpenIcon } from '@/components/ui/icons';
import { usePenaltyRuleForm } from '@/lib/hooks/usePenaltyRuleForm';
import type {
  CreatePenaltyRulePayload,
  PenaltyRuleDetail,
  PenaltyRuleSummary,
} from '@/types/penaltyRule';
import { RuleInfoSection, RuleDescriptionSection } from './sections';
import { parsePenaltyRuleBackendError } from '@/lib/utils/error-helper';

interface RuleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PenaltyRuleDetail | PenaltyRuleSummary | null;
  isSubmitting?: boolean;
  onSubmit: (payload: CreatePenaltyRulePayload) => Promise<void> | void;
}

export function RuleFormDialog({
  isOpen,
  onClose,
  initialData,
  isSubmitting = false,
  onSubmit,
}: RuleFormDialogProps) {
  const {
    formData,
    errors,
    setErrors,
    clearError,
    handleChange,
    resetForm,
    getCreatePayload,
  } = usePenaltyRuleForm({ initialData, isEdit: false });

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const payload = getCreatePayload();
    if (!payload) return;
    try {
      await onSubmit(payload);
      resetForm();
    } catch (err: unknown) {
      const { fieldErrors } = parsePenaltyRuleBackendError(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Thêm mới quy định phạt"
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
              Thêm mới quy định phạt
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
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
            <RuleInfoSection
              formData={formData}
              errors={errors}
              isEdit={false}
              disabled={isSubmitting}
              onChangeField={handleChange}
              onClearError={clearError}
            />
            <RuleDescriptionSection
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
                  <span>Tạo quy định</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RuleFormDialog;

