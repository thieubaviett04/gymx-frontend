'use client';

import React, { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { employeeService } from '@/lib/api';
import { useUiStore } from '@/lib/store/uiStore';
import { Alert, Badge } from '@/components/ui';
import { EditPencilIcon, FolderOpenIcon } from '@/components/ui/icons';
import type { EmployeeDetail, EmployeeDetailPageProps } from '@/types/employee';
import { ConnectionErrorState } from '@/components/shared';
import { useEmployeeDetailForm } from '@/lib/hooks';
import { formatPosition, formatDateTime } from '@/lib/utils';
import {
  GeneralInfoTab,
  TrainerProfileTab,
  HistoryTab,
  NotesTab,
} from './tabs';

export function EmployeeDetailPage({ id: propId }: EmployeeDetailPageProps) {
  const params = useParams();
  const router = useRouter();
  const setHeaderRightContent = useUiStore((s) => s.setHeaderRightContent);

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

  const employee: EmployeeDetail | undefined = employeeRes?.data;

  const {
    activeTab,
    isEditing,
    formData,
    errors,
    toast,
    isSaving,
    isTrainer,
    changeTab,
    startEdit,
    cancelEdit,
    saveEdit,
    changeField,
    clearFieldError,
    dismissToast,
  } = useEmployeeDetailForm(employeeId, employee);

  const startEditRef = useRef(startEdit);
  startEditRef.current = startEdit;

  const cancelEditRef = useRef(cancelEdit);
  cancelEditRef.current = cancelEdit;

  const saveEditRef = useRef(saveEdit);
  saveEditRef.current = saveEdit;

  useEffect(() => {
    if (activeTab === 'history' || activeTab === 'notes') {
      setHeaderRightContent(
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/employees')}
            className="h-[44px] px-5 bg-white border border-[#CDD5DF] text-[#525252] text-[14px] font-normal leading-[20px] rounded-[10px] hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center justify-center active:scale-[0.98]"
          >
            <span>Quay lại</span>
          </button>
        </div>
      );
    } else if (isEditing) {
      setHeaderRightContent(
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => cancelEditRef.current()}
            disabled={isSaving}
            className="h-[44px] min-w-[90px] px-5 bg-white border border-[#CDD5DF] text-[#525252] text-[14px] font-normal leading-[20px] rounded-[10px] hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center justify-center active:scale-[0.98] disabled:opacity-50"
          >
            <span>Hủy</span>
          </button>

          <button
            type="button"
            onClick={() => saveEditRef.current()}
            disabled={isSaving}
            className="h-[44px] min-w-[120px] px-5 bg-[#064343] hover:bg-[#053737] text-white text-[14px] font-normal leading-[20px] rounded-[10px] shadow-[0px_6px_30px_0px_rgba(175,190,211,0.15)] transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <FolderOpenIcon className="w-5 h-5 text-white" />
            )}
            <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      );
    } else {
      setHeaderRightContent(
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/employees')}
            className="h-[44px] px-5 bg-white border border-[#CDD5DF] text-[#525252] text-[14px] font-normal leading-[20px] rounded-[10px] hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center justify-center active:scale-[0.98]"
          >
            <span>Quay lại</span>
          </button>

          <button
            type="button"
            onClick={() => startEditRef.current()}
            className="h-[44px] px-5 bg-[#064343] hover:bg-[#053737] text-white text-[14px] font-normal leading-[20px] rounded-[10px] shadow-[0px_6px_30px_0px_rgba(175,190,211,0.15)] transition-all cursor-pointer inline-flex items-center gap-2 active:scale-[0.98]"
          >
            <EditPencilIcon className="w-5 h-5" color="#FFFFFF" />
            <span>Chỉnh sửa</span>
          </button>
        </div>
      );
    }

    return () => {
      setHeaderRightContent(null);
    };
  }, [activeTab, isEditing, isSaving, router, setHeaderRightContent]);

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-[12px] p-8 border border-[#E2E8F0] shadow-xs flex flex-col items-center justify-center min-h-[460px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#064343]" />
        <p className="text-[14px] text-[#64748B]">Đang tải thông tin chi tiết nhân viên...</p>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="w-full bg-white rounded-[12px] p-8 border border-[#E2E8F0] shadow-xs min-h-[460px] flex flex-col justify-center">
        <ConnectionErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const currentPosition = isEditing ? formData.position : employee?.position;
  const currentStatus = isEditing ? formData.employmentStatus : employee?.employmentStatus;
  const isActive = (currentStatus || 'ACTIVE').toUpperCase() === 'ACTIVE';

  return (
    <div className="w-full flex-1 flex flex-col min-h-full">
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

      <div className="relative w-full flex-1 bg-white rounded-[12px] p-6 sm:p-[28px_32px] border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col min-h-[calc(100vh-140px)]">
        <div className="absolute left-0 top-7 w-[4px] h-6 bg-[#064343] rounded-none" />

        <div className="flex items-center">
          <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
            {isEditing ? 'Chỉnh sửa thông tin nhân viên' : 'Chi tiết nhân viên'}
          </h2>
        </div>

        <div className="w-full flex flex-col xl:flex-row xl:items-center justify-between gap-4 my-6">
          <div className="flex items-center gap-2 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => changeTab('general')}
              className={`px-4 py-2 rounded-[8px] text-[13px] leading-5 font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'general'
                  ? 'bg-[#064343] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                  : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#202939] hover:bg-slate-100 font-medium'
              }`}
            >
              Thông tin chung
            </button>
            {isTrainer && (
              <button
                type="button"
                onClick={() => changeTab('trainer')}
                className={`px-4 py-2 rounded-[8px] text-[13px] leading-5 font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'trainer'
                    ? 'bg-[#064343] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                    : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#202939] hover:bg-slate-100 font-medium'
                }`}
              >
                Chuyên môn &amp; Đánh giá
              </button>
            )}
            <button
              type="button"
              onClick={() => changeTab('history')}
              className={`px-4 py-2 rounded-[8px] text-[13px] leading-5 font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-[#064343] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                  : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#202939] hover:bg-slate-100 font-medium'
              }`}
            >
              Lịch sử
            </button>
            <button
              type="button"
              onClick={() => changeTab('notes')}
              className={`px-4 py-2 rounded-[8px] text-[13px] leading-5 font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'bg-[#064343] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                  : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#202939] hover:bg-slate-100 font-medium'
              }`}
            >
              Ghi chú
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] justify-start xl:justify-end shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-medium text-[14px]">Mã nhân viên:</span>
              <span className="font-semibold text-[14px] text-[#064343]">
                {employee.employeeCode || '—'}
              </span>
            </div>

            <div className="hidden sm:block w-[1px] h-4 bg-[#E2E8F0]" />

            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-medium text-[14px]">Ngày tạo:</span>
              <span className="text-[#202939] font-medium text-[14px]">
                {formatDateTime(employee.createdDate)}
              </span>
            </div>

            <div className="hidden sm:block w-[1px] h-4 bg-[#E2E8F0]" />

            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-medium text-[14px]">Chức danh:</span>
              <span className="text-[14px] font-semibold text-[#064343]">
                {formatPosition(currentPosition)}
              </span>
            </div>

            <div className="hidden sm:block w-[1px] h-4 bg-[#E2E8F0]" />

            <div className="flex items-center gap-2">
              <span className="text-[#64748B] font-medium text-[14px]">Trạng thái:</span>
              <Badge
                variant={isActive ? 'active' : 'discontinued'}
                className="text-[13px] font-normal leading-[18px] px-3 py-[4px] rounded-[6px]"
              >
                {isActive ? 'Đang làm việc' : 'Đã nghỉ việc'}
              </Badge>
            </div>
          </div>
        </div>

        {activeTab === 'general' && (
          <GeneralInfoTab
            employee={employee}
            isEditing={isEditing}
            formData={formData}
            errors={errors}
            onChangeField={changeField}
            onClearFieldError={clearFieldError}
          />
        )}

        {activeTab === 'trainer' && isTrainer && (
          <TrainerProfileTab
            employee={employee}
            isEditing={isEditing}
            formData={formData}
            errors={errors}
            onChangeField={changeField}
            onClearFieldError={clearFieldError}
          />
        )}

        {activeTab === 'history' && <HistoryTab />}

        {activeTab === 'notes' && <NotesTab />}
      </div>
    </div>
  );
}

export default EmployeeDetailPage;
