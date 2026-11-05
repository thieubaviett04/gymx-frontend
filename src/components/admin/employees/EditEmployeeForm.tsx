'use client';

import React, { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { employeeService } from '@/lib/api';
import { useUiStore } from '@/lib/store/uiStore';
import { Alert } from '@/components/ui';
import { FolderOpenIcon, TrashBinIcon } from '@/components/ui/icons';
import type { EmployeeDetail, EditEmployeeFormProps } from '@/types/employee';
import { SPECIALIZATION_OPTIONS } from '@/types/employee';
import { useEmployeeDetailForm } from '@/lib/hooks';
import {
  BasicInfoSection,
  ContactSalarySection,
  TrainerExpertiseSection,
} from './sections';

// Re-export for any legacy import paths
export { SPECIALIZATION_OPTIONS };

interface EditEmployeeFormInnerProps {
  employee: EmployeeDetail;
  employeeId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function EditEmployeeFormInner({
  employee,
  employeeId,
  onSuccess,
  onCancel,
}: EditEmployeeFormInnerProps) {
  const router = useRouter();
  const setHeaderRightContent = useUiStore((s) => s.setHeaderRightContent);

  const {
    formData,
    errors,
    toast,
    isSaving,
    isTrainer,
    changeField,
    clearFieldError,
    saveEdit,
    dismissToast,
  } = useEmployeeDetailForm(employeeId, employee);

  const saveEditRef = useRef(saveEdit);
  saveEditRef.current = saveEdit;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push(`/admin/employees/${employeeId}`);
    }
  };

  const handleCancelRef = useRef(handleCancel);
  handleCancelRef.current = handleCancel;

  // Header actions: Hủy bỏ & Lưu lại
  useEffect(() => {
    setHeaderRightContent(
      <div className="flex items-center gap-3">
        {/* Nút Hủy bỏ (icon thùng rác như bảng dữ liệu, font regular) */}
        <button
          type="button"
          onClick={() => handleCancelRef.current()}
          disabled={isSaving}
          className="h-[44px] px-5 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#2F3D50] text-[14px] font-normal leading-[20px] rounded-[10px] shadow-2xs transition-all cursor-pointer inline-flex items-center gap-2 active:scale-[0.98] disabled:opacity-50"
        >
          <TrashBinIcon className="w-5 h-5" color="#EE464C" />
          <span>Hủy bỏ</span>
        </button>

        {/* Nút Lưu lại (chuẩn Figma Node 1438:11069, font regular) */}
        <button
          type="button"
          onClick={() => saveEditRef.current()}
          disabled={isSaving}
          className="h-[44px] px-5 bg-[#064343] hover:bg-[#053737] text-white text-[14px] font-normal leading-[20px] tracking-[0.01em] rounded-[10px] shadow-2xs transition-all cursor-pointer inline-flex items-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? (
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
  }, [isSaving, setHeaderRightContent]);

  return (
    <div className="w-full flex-1 flex flex-col min-h-full">
      {/* Toast Alert */}
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

      {/* Card Form */}
      <div className="relative w-full flex-1 bg-white rounded-[12px] p-6 sm:p-[28px_32px] border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col min-h-[calc(100vh-140px)]">
        <div className="absolute left-0 top-7 w-[4px] h-6 bg-[#064343] rounded-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
            Chỉnh sửa thông tin nhân viên
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveEdit();
          }}
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
            isNationalIdDisabled
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

export function EditEmployeeForm({ id: propId, onSuccess, onCancel }: EditEmployeeFormProps) {
  const params = useParams();
  const router = useRouter();
  const employeeId = propId || (params?.id as string);

  const {
    data: employeeRes,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin-employee', employeeId],
    queryFn: () => employeeService.byId(employeeId),
    enabled: !!employeeId,
  });

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/admin/employees');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex-1 min-h-[400px] flex flex-col items-center justify-center bg-white rounded-[12px] border border-[#E2E8F0] p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#064343] mb-3" />
        <p className="text-[14px] text-[#697586]">Đang tải thông tin nhân viên...</p>
      </div>
    );
  }

  if (isError || !employeeRes?.data) {
    return (
      <div className="w-full flex-1 min-h-[400px] flex flex-col items-center justify-center bg-white rounded-[12px] border border-[#E2E8F0] p-12 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <h3 className="text-lg font-semibold text-[#202939] mb-1">Không thể tải thông tin nhân viên</h3>
        <p className="text-sm text-[#697586] mb-4">Vui lòng thử tải lại hoặc quay lại danh sách.</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#064343] text-white rounded-lg text-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Thử lại
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-white border border-[#E5E5E5] text-slate-700 rounded-lg text-sm cursor-pointer hover:bg-slate-50"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <EditEmployeeFormInner
      key={employeeRes.data.id}
      employee={employeeRes.data}
      employeeId={employeeId}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}

export default EditEmployeeForm;
