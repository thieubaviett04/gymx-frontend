'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, ConfirmDialog } from '@/components/ui';
import { packageService } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils/error-helper';
import { ConnectionErrorState } from '@/components/shared';
import type {
  CreatePackagePayload,
  PackageDetail,
  PackageSummary,
  UpdatePackagePayload,
} from '@/types/package';
import {
  PackageToolbar,
  PackageTable,
  PackagePagination,
  PackageFormDialog,
  PackageDetailDialog,
  PackageInUseConflictDialog,
} from '@/components/admin/packages';

export default function AdminPackagesPage() {
  const queryClient = useQueryClient();

  // Search, Filter & Pagination states
  const [search, setSearch] = useState('');
  const [durationFilter, setDurationFilter] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('latest');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialogs state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageDetail | PackageSummary | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeDetailPackage, setActiveDetailPackage] = useState<PackageDetail | PackageSummary | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingPackage, setDeletingPackage] = useState<PackageSummary | null>(null);

  const [isDiscontinueOpen, setIsDiscontinueOpen] = useState(false);
  const [discontinuingPackage, setDiscontinuingPackage] = useState<PackageSummary | null>(null);

  // Conflict modal state (when editing in-use package)
  const [isConflictOpen, setIsConflictOpen] = useState(false);
  const [pendingUpdatePayload, setPendingUpdatePayload] = useState<UpdatePackagePayload | null>(null);

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

  // ─── 1. Query danh sách gói tập ───────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'admin-packages',
      { search, durationFilter, status, sortBy, pageIndex, pageSize },
    ],
    queryFn: async () => {
      const res = await packageService.adminList({
        search: search.trim() || undefined,
        durationFilter: durationFilter !== 'ALL' ? durationFilter : undefined,
        status: status !== 'ALL' ? status : undefined,
        sortBy: sortBy !== 'latest' ? sortBy : undefined,
        pageIndex,
        pageSize,
      });
      return res.data;
    },
  });

  // ─── 2. Mutation Thêm mới gói tập ──────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: CreatePackagePayload) => packageService.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      showToast('success', res.message || 'Thêm mới gói tập thành công.');
      setIsFormOpen(false);
      setEditingPackage(null);
    },
    onError: (err: unknown) => {
      showToast('error', getErrorMessage(err));
    },
  });

  // ─── 3. Mutation Cập nhật gói tập ─────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePackagePayload }) =>
      packageService.update(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      showToast('success', res.message || 'Cập nhật gói tập thành công.');
      setIsFormOpen(false);
      setEditingPackage(null);
      setIsConflictOpen(false);
      setPendingUpdatePayload(null);
    },
    onError: (err: any) => {
      // Kiểm tra nếu lỗi do gói đang có người sử dụng
      const errCode = err?.response?.data?.error?.code || err?.code;
      if (errCode === 'Package.InUse' || err?.response?.status === 409) {
        setIsConflictOpen(true);
        return;
      }
      showToast('error', getErrorMessage(err));
    },
  });

  // ─── 4. Mutation Xóa gói tập ──────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => packageService.delete(id),
    onSuccess: (res) => {
      if (data?.items && data.items.length === 1 && pageIndex > 1) {
        setPageIndex((prev) => prev - 1);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      showToast('success', res.message || 'Xóa gói tập thành công.');
      setIsDeleteOpen(false);
      setDeletingPackage(null);
    },
    onError: (err: any) => {
      const errCode = err?.response?.data?.error?.code || err?.code;
      if (errCode === 'Package.CannotDeleteInUse' || err?.response?.status === 409) {
        showToast(
          'error',
          'Gói tập đang có hội viên sử dụng, không thể xóa. Bạn có thể chọn Ngừng kinh doanh thay thế.'
        );
        setIsDeleteOpen(false);
        setDeletingPackage(null);
        return;
      }
      showToast('error', getErrorMessage(err));
    },
  });

  // ─── 5. Mutation Ngừng kinh doanh gói tập ─────────────────────────────────
  const discontinueMutation = useMutation({
    mutationFn: (id: string) => packageService.discontinue(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      showToast('success', res.message || 'Đã cập nhật trạng thái Ngừng kinh doanh cho gói tập.');
      setIsDiscontinueOpen(false);
      setDiscontinuingPackage(null);
    },
    onError: (err: unknown) => {
      showToast('error', getErrorMessage(err));
    },
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingPackage(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (pkg: PackageSummary) => {
    setEditingPackage(pkg);
    setIsFormOpen(true);
  };

  const handleOpenView = async (pkg: PackageSummary) => {
    try {
      const res = await packageService.adminById(pkg.id);
      setActiveDetailPackage(res.data);
    } catch {
      setActiveDetailPackage(pkg);
    }
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (pkg: PackageSummary) => {
    setDeletingPackage(pkg);
    setIsDeleteOpen(true);
  };

  const handleOpenDiscontinue = (pkg: PackageSummary) => {
    setDiscontinuingPackage(pkg);
    setIsDiscontinueOpen(true);
  };

  const handleFormSubmit = async (payload: CreatePackagePayload | UpdatePackagePayload) => {
    if (editingPackage) {
      setPendingUpdatePayload(payload as UpdatePackagePayload);
      await updateMutation.mutateAsync({
        id: editingPackage.id,
        payload: payload as UpdatePackagePayload,
      });
    } else {
      await createMutation.mutateAsync(payload as CreatePackagePayload);
    }
  };

  const handleConfirmDiscontinueAndCreate = async () => {
    if (!editingPackage || !pendingUpdatePayload) return;
    await updateMutation.mutateAsync({
      id: editingPackage.id,
      payload: { ...pendingUpdatePayload, mode: 'DISCONTINUE_AND_CREATE' },
    });
  };

  const handleConfirmDiscontinueOnly = async () => {
    if (!editingPackage || !pendingUpdatePayload) return;
    await updateMutation.mutateAsync({
      id: editingPackage.id,
      payload: { ...pendingUpdatePayload, mode: 'DISCONTINUE_ONLY' },
    });
  };

  const handleConfirmDelete = async () => {
    if (!deletingPackage) return;
    await deleteMutation.mutateAsync(deletingPackage.id);
  };

  const handleConfirmDiscontinue = async () => {
    if (!discontinuingPackage) return;
    await discontinueMutation.mutateAsync(discontinuingPackage.id);
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-6">
      {/* Toast Alert – Top Center */}
      {toast && (
        <div className="fixed top-3.5 md:top-4 left-1/2 lg:left-[calc(50%+130px)] -translate-x-1/2 z-[100] max-w-[500px] w-auto pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <Alert
            size="sm"
            variant={toast.type === 'success' ? 'success' : 'danger'}
            onClose={() => setToast(null)}
            className="w-auto min-w-[280px] max-w-[500px] shadow-[0px_8px_24px_rgba(0,0,0,0.15)] border border-[#E5E5E5] bg-white"
          >
            <p className="text-[13px] font-normal text-[#202939] leading-snug whitespace-nowrap">
              {toast.message}
            </p>
          </Alert>
        </div>
      )}

      {/* Toolbar: Search, Filters & Add Button */}
      <PackageToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPageIndex(1);
        }}
        selectedDuration={durationFilter}
        onDurationChange={(dur) => {
          setDurationFilter(dur);
          setPageIndex(1);
        }}
        selectedStatus={status}
        onStatusChange={(st) => {
          setStatus(st);
          setPageIndex(1);
        }}
        selectedSort={sortBy}
        onSortChange={(sort) => {
          setSortBy(sort);
          setPageIndex(1);
        }}
        onAddNew={handleOpenCreate}
      />

      {/* DataTable Container */}
      <div className="bg-white rounded-[8px] p-4 sm:p-[16px_24px] shadow-xs flex-1 flex flex-col justify-between">
        {isError ? (
          <ConnectionErrorState onRetry={() => refetch()} />
        ) : (
          <>
            <div className="flex-1 flex flex-col">
              <PackageTable
                items={data?.items || []}
                isLoading={isLoading}
                pageIndex={pageIndex}
                pageSize={pageSize}
                onView={handleOpenView}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onClearFilter={
                  search || durationFilter !== 'ALL' || status !== 'ALL' || sortBy !== 'latest'
                    ? () => {
                        setSearch('');
                        setDurationFilter('ALL');
                        setStatus('ALL');
                        setSortBy('latest');
                        setPageIndex(1);
                      }
                    : undefined
                }
              />
            </div>

            {/* Pagination Controls */}
            {data && data.totalCount > 0 && (
              <PackagePagination
                pageIndex={data.pageIndex}
                pageSize={data.pageSize}
                totalCount={data.totalCount}
                totalPages={data.totalPages}
                hasPreviousPage={data.hasPreviousPage}
                hasNextPage={data.hasNextPage}
                onPageChange={(page) => setPageIndex(page)}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPageIndex(1);
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Form Modal Tạo mới / Sửa gói tập */}
      <PackageFormDialog
        isOpen={isFormOpen}
        initialData={editingPackage}
        isEdit={!!editingPackage}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPackage(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Detail Slide-over Drawer */}
      <PackageDetailDialog
        isOpen={isDetailOpen}
        packageData={activeDetailPackage}
        onClose={() => {
          setIsDetailOpen(false);
          setActiveDetailPackage(null);
        }}
        onEdit={(pkg) => {
          setIsDetailOpen(false);
          setActiveDetailPackage(null);
          setEditingPackage(pkg);
          setIsFormOpen(true);
        }}
        onDiscontinue={(pkg) => {
          setIsDetailOpen(false);
          setActiveDetailPackage(null);
          handleOpenDiscontinue(pkg as PackageSummary);
        }}
      />

      {/* Dialog xung đột khi sửa gói đang dùng */}
      <PackageInUseConflictDialog
        isOpen={isConflictOpen}
        packageCode={editingPackage?.packageCode}
        packageName={editingPackage?.name}
        activeCount={editingPackage?.activeMembersCount}
        isLoading={updateMutation.isPending}
        onClose={() => {
          setIsConflictOpen(false);
          setPendingUpdatePayload(null);
        }}
        onDiscontinueAndCreate={handleConfirmDiscontinueAndCreate}
        onDiscontinueOnly={handleConfirmDiscontinueOnly}
      />

      {/* Dialog xác nhận Ngừng kinh doanh */}
      <ConfirmDialog
        isOpen={isDiscontinueOpen}
        size="sm"
        type="warning"
        onClose={() => {
          if (discontinueMutation.isPending) return;
          setIsDiscontinueOpen(false);
          setDiscontinuingPackage(null);
        }}
        onConfirm={handleConfirmDiscontinue}
        title="Xác nhận ngừng kinh doanh"
        description={
          discontinuingPackage ? (
            <span>
              Bạn có chắc muốn chuyển gói tập{' '}
              <strong className="text-[#064343] font-semibold">
                &quot;{discontinuingPackage.packageCode} - {discontinuingPackage.name}&quot;
              </strong>{' '}
              sang trạng thái ngừng kinh doanh? Gói sẽ không thể bán mới cho hội viên.
            </span>
          ) : (
            'Bạn có chắc muốn ngừng kinh doanh gói tập này?'
          )
        }
        confirmText="Ngừng kinh doanh"
        cancelText="Hủy bỏ"
        isLoading={discontinueMutation.isPending}
      />

      {/* Confirm Delete Popup */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        size="sm"
        state="delete"
        onClose={() => {
          if (deleteMutation.isPending) return;
          setIsDeleteOpen(false);
          setDeletingPackage(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa gói tập"
        description={
          deletingPackage ? (
            <span>
              Bạn có chắc muốn xóa gói tập{' '}
              <strong className="text-[#064343] font-semibold">
                &quot;{deletingPackage.packageCode}&quot;
              </strong>{' '}
              khỏi hệ thống?
            </span>
          ) : (
            'Bạn có chắc muốn xóa gói tập này chứ?'
          )
        }
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
