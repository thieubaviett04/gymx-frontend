'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui';
import { employeeService } from '@/lib/api';
import type {
  CreateEmployeePayload,
  EmployeeDetail,
  EmployeeSummary,
  UpdateEmployeePayload,
} from '@/types/employee';
import {
  EmployeeToolbar,
  EmployeeTable,
  EmployeePagination,
  EmployeeFormDialog,
  EmployeeDetailDialog,
} from '@/components/dashboard/admin/employees';

export default function AdminEmployeesPage() {
  const queryClient = useQueryClient();

  // Search, Filter & Pagination states
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialogs state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeEmployee, setActiveEmployee] = useState<EmployeeDetail | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<EmployeeSummary | null>(null);

  // Toast notification state
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

  // ─── 1. Query danh sách nhân viên ──────────────────────────────────────────
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-employees', { search, position, status, pageIndex, pageSize }],
    queryFn: async () => {
      const res = await employeeService.list({
        search: search.trim() || undefined,
        position: position || undefined,
        status: status || undefined,
        pageIndex,
        pageSize,
      });
      return res.data;
    },
  });

  // ─── 2. Mutation Thêm mới ──────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: CreateEmployeePayload) => employeeService.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      showToast('success', res.message || 'Thêm mới nhân viên thành công.');
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error?.description ||
        err?.response?.data?.error?.message ||
        err?.message ||
        'Có lỗi xảy ra khi tạo nhân viên.';
      showToast('error', msg);
    },
  });

  // ─── 3. Mutation Cập nhật ──────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEmployeePayload }) =>
      employeeService.update(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      showToast('success', res.message || 'Cập nhật thông tin nhân viên thành công.');
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error?.description ||
        err?.response?.data?.error?.message ||
        err?.message ||
        'Có lỗi xảy ra khi cập nhật nhân viên.';
      showToast('error', msg);
    },
  });

  // ─── 4. Mutation Xóa nhân viên ─────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      showToast('success', res.message || 'Xóa nhân viên thành công.');
      setIsDeleteOpen(false);
      setDeletingEmployee(null);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error?.description ||
        err?.response?.data?.error?.message ||
        err?.message ||
        'Có lỗi xảy ra khi xóa nhân viên.';
      showToast('error', msg);
    },
  });

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setFormMode('create');
    setActiveEmployee(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = async (emp: EmployeeSummary) => {
    try {
      setIsFetchingDetail(true);
      const res = await employeeService.byId(emp.id);
      setActiveEmployee(res.data);
      setFormMode('edit');
      setIsFormOpen(true);
    } catch {
      showToast('error', 'Không thể tải thông tin chi tiết nhân viên.');
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleOpenView = async (emp: EmployeeSummary) => {
    try {
      setIsFetchingDetail(true);
      const res = await employeeService.byId(emp.id);
      setActiveEmployee(res.data);
      setIsDetailOpen(true);
    } catch {
      showToast('error', 'Không thể tải thông tin chi tiết nhân viên.');
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleOpenDelete = (emp: EmployeeSummary) => {
    setDeletingEmployee(emp);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;
    await deleteMutation.mutateAsync(deletingEmployee.id);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-in slide-in-from-top-2 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header matching Figma AppLayout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-[#064343]" />
            <span>Phân hệ Quản trị</span>
          </div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Quản lý nhân viên
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Quản lý hồ sơ nhân sự, phân quyền vai trò và chuyên môn huấn luyện viên.
          </p>
        </div>
      </div>

      {/* Toolbar: Search, Role Filter, Status Filter & Add Button */}
      <EmployeeToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPageIndex(1);
        }}
        selectedPosition={position}
        onPositionChange={(pos) => {
          setPosition(pos);
          setPageIndex(1);
        }}
        selectedStatus={status}
        onStatusChange={(st) => {
          setStatus(st);
          setPageIndex(1);
        }}
        onAddNew={handleOpenCreate}
      />

      {/* Main Table View */}
      {isError ? (
        <div className="w-full bg-white rounded-xl border border-red-200 p-8 text-center shadow-xs">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-[#0F172A] mb-1">
            Không thể tải danh sách nhân viên
          </h3>
          <p className="text-xs text-[#64748B] mb-4">
            {(error as any)?.message || 'Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#064343] text-white text-xs font-semibold rounded-lg hover:bg-[#053737] cursor-pointer"
          >
            Tải lại trang
          </button>
        </div>
      ) : (
        <>
          <EmployeeTable
            items={data?.items || []}
            isLoading={isLoading || isFetchingDetail}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />

          {/* Phân trang */}
          {data && data.totalCount > 0 && (
            <EmployeePagination
              pageIndex={data.pageIndex}
              pageSize={data.pageSize}
              totalCount={data.totalCount}
              totalPages={data.totalPages}
              hasPreviousPage={data.hasPreviousPage}
              hasNextPage={data.hasNextPage}
              onPageChange={(p) => setPageIndex(p)}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setPageIndex(1);
              }}
            />
          )}
        </>
      )}

      {/* Form Popup Thêm mới / Cập nhật */}
      <EmployeeFormDialog
        isOpen={isFormOpen}
        mode={formMode}
        employee={activeEmployee}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onClose={() => setIsFormOpen(false)}
        onSubmitCreate={async (payload) => {
          await createMutation.mutateAsync(payload);
        }}
        onSubmitUpdate={async (id, payload) => {
          await updateMutation.mutateAsync({ id, payload });
        }}
      />

      {/* Detail Dialog Xem chi tiết */}
      <EmployeeDetailDialog
        isOpen={isDetailOpen}
        employee={activeEmployee}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(emp) => {
          setActiveEmployee(emp);
          setFormMode('edit');
          setIsFormOpen(true);
        }}
      />

      {/* Confirm Delete Popup chuẩn Figma 51:376 */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingEmployee(null);
        }}
        onConfirm={handleConfirmDelete}
        state="delete"
        title="Xác nhận xóa nhân viên"
        description={
          deletingEmployee ? (
            <>
              Bạn có chắc chắn muốn xóa nhân viên{' '}
              <strong className="text-[#064343] font-bold">
                {deletingEmployee.fullName} ({deletingEmployee.employeeCode})
              </strong>{' '}
              không?
              <span className="block text-xs text-red-500 mt-2 font-medium">
                Tài khoản đăng nhập của nhân viên này sẽ bị vô hiệu hóa.
              </span>
            </>
          ) : (
            'Bạn có chắc chắn muốn xóa nhân viên này không?'
          )
        }
        confirmText="Có, tôi đồng ý"
        cancelText="Không"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
