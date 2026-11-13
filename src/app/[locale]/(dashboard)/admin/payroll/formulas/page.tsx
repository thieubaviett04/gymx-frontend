'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, ConfirmDialog } from '@/components/ui';
import { salaryFormulaService } from '@/lib/api';
import { getErrorMessage, parseSalaryFormulaBackendError } from '@/lib/utils/error-helper';
import { ConnectionErrorState } from '@/components/shared';
import type {
  BaseRateType,
  CreateSalaryFormulaRequest,
  FormulaStatus,
  SalaryFormulaDto,
  TargetRole,
  UpdateSalaryFormulaRequest,
} from '@/types/payroll';
import {
  FormulaConfigCard,
  FormulaToolbar,
  FormulaTable,
  FormulaPagination,
  SalaryFormulaDetailDialog,
} from '@/components/admin/payroll/formulas';

export default function AdminSalaryFormulasPage() {
  const queryClient = useQueryClient();

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const defaultFormState: CreateSalaryFormulaRequest = {
    name: '',
    targetRole: '' as TargetRole,
    baseRateType: '' as BaseRateType,
    baseRate: 0,
    standardWorkDays: 0,
    pricePerPtSession: 0,
    salesCommissionPercent: 10,
    effectiveDate: getTodayString(),
    description: '',
  };

  const [formData, setFormData] = useState<CreateSalaryFormulaRequest>(defaultFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editingFormula, setEditingFormula] = useState<SalaryFormulaDto | null>(null);

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<TargetRole | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<FormulaStatus | 'ALL'>('ALL');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailEditing, setIsDetailEditing] = useState(false);
  const [activeFormula, setActiveFormula] = useState<SalaryFormulaDto | null>(null);

  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [togglingFormula, setTogglingFormula] = useState<SalaryFormulaDto | null>(null);

  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-salary-formulas', { search, selectedRole, selectedStatus, pageIndex, pageSize }],
    queryFn: async () => {
      const res = await salaryFormulaService.list({
        search: search.trim() || undefined,
        targetRole: selectedRole !== 'ALL' ? selectedRole : undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        pageIndex,
        pageSize,
      });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateSalaryFormulaRequest) => salaryFormulaService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-salary-formulas'] });
      showToast('success', 'Đã lưu công thức tính lương mới thành công.');
      setFormData(defaultFormState);
    },
    onError: (err: unknown) => {
      const { generalError, fieldErrors } = parseSalaryFormulaBackendError(err);
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors(fieldErrors);
      }
      showToast('error', generalError || getErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSalaryFormulaRequest }) =>
      salaryFormulaService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-salary-formulas'] });
      showToast('success', 'Đã cập nhật thay đổi chính sách lương thành công.');
      setIsDetailOpen(false);
      setIsDetailEditing(false);
      setActiveFormula(null);
    },
    onError: (err: unknown) => {
      const { generalError, isCannotModifyInUse } = parseSalaryFormulaBackendError(err);
      if (isCannotModifyInUse) {
        showToast('error', 'Không thể sửa công thức này do đã dùng trong kỳ tính lương đã khóa.');
      } else {
        showToast('error', generalError || getErrorMessage(err));
      }
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      salaryFormulaService.toggleStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-salary-formulas'] });
      showToast(
        'success',
        variables.isActive
          ? 'Đã kích hoạt áp dụng thành công.'
          : 'Đã tạm ngưng áp dụng thành công.'
      );
      setIsToggleOpen(false);
      setTogglingFormula(null);
    },
    onError: (err: unknown) => {
      showToast('error', getErrorMessage(err));
    },
  });

  const handleClearError = (field: string) => {
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleChangeField = <K extends keyof CreateSalaryFormulaRequest>(
    field: K,
    value: CreateSalaryFormulaRequest[K]
  ) => {
    handleClearError(field as string);
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    createMutation.mutate({
      ...formData,
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
    });
  };

  const handleResetForm = () => {
    setFormData(defaultFormState);
    setFormErrors({});
  };

  const handleOpenEdit = (formula: SalaryFormulaDto) => {
    setActiveFormula(formula);
    setIsDetailEditing(true);
    setIsDetailOpen(true);
  };

  const handleOpenDetail = (formula: SalaryFormulaDto) => {
    setActiveFormula(formula);
    setIsDetailEditing(false);
    setIsDetailOpen(true);
  };

  const handleOpenToggle = (formula: SalaryFormulaDto) => {
    setTogglingFormula(formula);
    setIsToggleOpen(true);
  };

  const handleConfirmToggle = () => {
    if (!togglingFormula) return;
    const nextActive = togglingFormula.status !== 'ACTIVE';
    toggleStatusMutation.mutate({ id: togglingFormula.id, isActive: nextActive });
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-6 sm:space-y-7">
      {toast && (
        <div className="fixed top-3.5 md:top-4 left-1/2 lg:left-[calc(50%+130px)] -translate-x-1/2 z-[100] max-w-[90vw] md:max-w-[620px] w-auto pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <Alert
            size="sm"
            variant={toast.type === 'success' ? 'success' : 'danger'}
            onClose={() => setToast(null)}
            className="w-auto min-w-[280px] max-w-[90vw] md:max-w-[620px] shadow-[0px_8px_24px_rgba(0,0,0,0.15)] border border-[#E5E5E5] bg-white pr-3"
          >
            <p className="text-[13px] font-normal text-[#202939] leading-snug break-words">
              {toast.message}
            </p>
          </Alert>
        </div>
      )}

      <FormulaConfigCard
        formData={formData}
        onChangeField={handleChangeField}
        errors={formErrors}
        onClearError={handleClearError}
        onSubmit={handleSaveForm}
        onReset={handleResetForm}
        isSubmitting={createMutation.isPending}
      />

      <div className="bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-4 pb-5 sm:pt-5 sm:pb-6 shadow-xs space-y-6 relative overflow-hidden">
        <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center">
              <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
                Các chính sách lương
              </h2>
            </div>
            <p className="text-[13px] text-[#64748B] mt-1.5 font-normal">
              Danh sách toàn bộ các phiên bản công thức tính lương đã thiết lập trong hệ thống
            </p>
          </div>

          <FormulaToolbar
            searchValue={search}
            onSearchChange={(val) => {
              setSearch(val);
              setPageIndex(1);
            }}
            selectedRole={selectedRole}
            onRoleChange={(role) => {
              setSelectedRole(role);
              setPageIndex(1);
            }}
            selectedStatus={selectedStatus}
            onStatusChange={(status) => {
              setSelectedStatus(status);
              setPageIndex(1);
            }}
          />
        </div>

        {isError ? (
          <ConnectionErrorState onRetry={() => refetch()} />
        ) : (
          <div>
            <FormulaTable
              items={data?.items || []}
              isLoading={isLoading}
              pageIndex={data?.pageIndex || pageIndex}
              pageSize={data?.pageSize || pageSize}
              onView={handleOpenDetail}
              onEdit={handleOpenEdit}
              onToggleStatus={handleOpenToggle}
              onClearFilter={() => {
                setSearch('');
                setSelectedRole('ALL');
                setSelectedStatus('ALL');
                setPageIndex(1);
              }}
            />

            <FormulaPagination
              pageIndex={data?.pageIndex || pageIndex}
              pageSize={data?.pageSize || pageSize}
              totalCount={data?.totalCount || 0}
              totalPages={data?.totalPages || 0}
              hasPreviousPage={data?.hasPreviousPage || false}
              hasNextPage={data?.hasNextPage || false}
              onPageChange={(page) => setPageIndex(page)}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPageIndex(1);
              }}
            />
          </div>
        )}
      </div>

      <SalaryFormulaDetailDialog
        isOpen={isDetailOpen}
        formula={activeFormula}
        initialIsEditing={isDetailEditing}
        onClose={() => {
          setIsDetailOpen(false);
          setIsDetailEditing(false);
          setActiveFormula(null);
        }}
        onSave={async (id, payload) => {
          await updateMutation.mutateAsync({ id, payload });
        }}
        isSubmitting={updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={isToggleOpen}
        size="sm"
        state="custom"
        type={togglingFormula?.status === 'ACTIVE' ? 'warning' : 'success'}
        onClose={() => {
          if (toggleStatusMutation.isPending) return;
          setIsToggleOpen(false);
          setTogglingFormula(null);
        }}
        onConfirm={handleConfirmToggle}
        title={
          togglingFormula?.status === 'ACTIVE'
            ? 'Xác nhận ngừng áp dụng?'
            : 'Xác nhận kích hoạt?'
        }
        description={
          togglingFormula ? (
            <span>
              Bạn có chắc chắn muốn {togglingFormula.status === 'ACTIVE' ? 'ngừng áp dụng' : 'kích hoạt'}{' '}
              <strong className="text-[#064343] font-semibold">
                &quot;{togglingFormula.name}&quot;
              </strong>{' '}
              không?
            </span>
          ) : (
            'Bạn có chắc chắn muốn thực hiện thao tác này?'
          )
        }
        confirmText="Xác nhận"
        cancelText="Hủy bỏ"
        isLoading={toggleStatusMutation.isPending}
      />
    </div>
  );
}
