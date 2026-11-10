'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Calculator, CalendarDays } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Alert, ConfirmDialog } from '@/components/ui';
import { salaryFormulaService } from '@/lib/api';
import { getErrorMessage, parseSalaryFormulaBackendError } from '@/lib/utils/error-helper';
import { ConnectionErrorState } from '@/components/shared';
import type {
  CreateSalaryFormulaRequest,
  FormulaStatus,
  SalaryFormulaDto,
  TargetRole,
  UpdateSalaryFormulaRequest,
} from '@/types/payroll';
import {
  FormulaToolbar,
  FormulaTable,
  FormulaPagination,
  SalaryFormulaFormDialog,
  SalaryFormulaDetailDialog,
} from '@/components/admin/payroll/formulas';

export default function AdminSalaryFormulasPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<TargetRole | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<FormulaStatus | 'ALL'>('ALL');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<SalaryFormulaDto | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
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
      showToast('success', 'Tạo công thức tính lương mới thành công.');
      setIsFormOpen(false);
      setEditingFormula(null);
    },
    onError: (err: unknown) => {
      const { generalError } = parseSalaryFormulaBackendError(err);
      showToast('error', generalError || getErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSalaryFormulaRequest }) =>
      salaryFormulaService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-salary-formulas'] });
      showToast('success', 'Cập nhật công thức tính lương thành công.');
      setIsFormOpen(false);
      setEditingFormula(null);
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
          ? 'Đã kích hoạt áp dụng công thức thành công.'
          : 'Đã tạm ngưng áp dụng công thức.'
      );
      setIsToggleOpen(false);
      setTogglingFormula(null);
    },
    onError: (err: unknown) => {
      showToast('error', getErrorMessage(err));
    },
  });

  const handleFormSubmit = async (payload: CreateSalaryFormulaRequest) => {
    if (editingFormula) {
      await updateMutation.mutateAsync({ id: editingFormula.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleOpenEdit = (formula: SalaryFormulaDto) => {
    setEditingFormula(formula);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (formula: SalaryFormulaDto) => {
    setActiveFormula(formula);
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
    <div className="w-full flex-1 flex flex-col space-y-6">
      {toast && (
        <div className="fixed top-3.5 md:top-4 left-1/2 lg:left-[calc(50%+130px)] -translate-x-1/2 z-[100] max-w-[500px] w-auto pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <Alert
            size="sm"
            variant={toast.type === 'success' ? 'success' : 'danger'}
            onClose={() => setToast(null)}
            className="w-auto min-w-[280px] max-w-[500px] shadow-[0px_8px_24px_rgba(0,0,0,0.15)] border border-[#E5E5E5] bg-white"
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <p className="text-[13px] font-normal text-[#202939] leading-snug whitespace-nowrap">
                {toast.message}
              </p>
            </div>
          </Alert>
        </div>
      )}

      <div className="bg-white rounded-[8px] p-5 sm:p-6 shadow-xs border border-[#F1F5F9]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-tight tracking-[-0.025em]">
              Quản lý Bảng lương & Chính sách chi trả
            </h1>
            <p className="text-[13px] text-[#64748B] mt-1">
              Thiết lập công thức tính lương và theo dõi bảng lương định kỳ của nhân viên GymX
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-[#E2E8F0] -mb-5 sm:-mb-6 pt-1">
          <Link
            href="/admin/payroll"
            className="flex items-center gap-2 px-4 py-2.5 text-[14px] font-medium text-[#64748B] hover:text-[#064343] transition-colors border-b-2 border-transparent hover:border-[#064343]"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Bảng tính lương theo kỳ</span>
          </Link>
          <Link
            href="/admin/payroll/formulas"
            className="flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-[#064343] border-b-2 border-[#064343] bg-[#064343]/5 rounded-t-md"
          >
            <Calculator className="w-4 h-4" />
            <span>Công thức tính lương</span>
          </Link>
        </div>
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
        onAddNew={() => {
          setEditingFormula(null);
          setIsFormOpen(true);
        }}
      />

      {isError ? (
        <ConnectionErrorState onRetry={() => refetch()} />
      ) : (
        <div className="bg-white rounded-[8px] p-5 shadow-xs border border-[#F1F5F9]">
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

      <SalaryFormulaFormDialog
        isOpen={isFormOpen}
        initialData={editingFormula}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFormula(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <SalaryFormulaDetailDialog
        isOpen={isDetailOpen}
        formula={activeFormula}
        onClose={() => {
          setIsDetailOpen(false);
          setActiveFormula(null);
        }}
        onEdit={(formula) => {
          setIsDetailOpen(false);
          setActiveFormula(null);
          handleOpenEdit(formula);
        }}
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
            ? 'Xác nhận ngừng áp dụng công thức?'
            : 'Xác nhận kích hoạt công thức?'
        }
        description={
          togglingFormula ? (
            <span>
              Bạn có chắc chắn muốn {togglingFormula.status === 'ACTIVE' ? 'ngừng áp dụng' : 'kích hoạt'}{' '}
              công thức{' '}
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
