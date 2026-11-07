'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, ConfirmDialog } from '@/components/ui';
import { packageCategoryService } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils/error-helper';
import { ConnectionErrorState } from '@/components/shared';
import type {
  CreatePackageCategoryPayload,
  PackageCategorySummary,
  UpdatePackageCategoryPayload,
} from '@/types/packageCategory';
import {
  CategoryToolbar,
  CategoryTable,
  CategoryFormDialog,
  CategoryDetailDialog,
  CategoryPagination,
} from '@/components/admin/package-categories';

export default function AdminPackageCategoriesPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<PackageCategorySummary | null>(null);
  const [isDetailEditing, setIsDetailEditing] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<PackageCategorySummary | null>(null);
  const [deleteBlockCategory, setDeleteBlockCategory] = useState<PackageCategorySummary | null>(null);

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
    queryKey: ['admin-package-categories', { search, status, pageIndex, pageSize }],
    queryFn: async () => {
      const res = await packageCategoryService.list({
        search: search.trim() || undefined,
        status: status !== 'ALL' ? status : undefined,
        pageIndex,
        pageSize,
      });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePackageCategoryPayload) =>
      packageCategoryService.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-package-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-package-categories-lookup'] });
      showToast('success', res.message || 'Thêm mới danh mục thành công.');
      setIsFormOpen(false);
    },
    onError: (err: unknown) => {
      const apiError = (err as { response?: { data?: { error?: { code?: string; message?: string } } } })?.response?.data?.error;
      const code = apiError?.code;
      if (code === 'PackageCategory.CodeAlreadyExists') {
        showToast('error', 'Mã danh mục đã tồn tại trong hệ thống.');
      } else if (code === 'PackageCategory.NameAlreadyExists') {
        showToast('error', 'Tên danh mục đã tồn tại trong hệ thống.');
      } else {
        showToast('error', getErrorMessage(err));
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePackageCategoryPayload }) =>
      packageCategoryService.update(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-package-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-package-categories-lookup'] });
      showToast('success', res.message || 'Cập nhật danh mục thành công.');
      setIsDetailOpen(false);
      setActiveCategory(null);
      setIsDetailEditing(false);
    },
    onError: (err: unknown) => {
      const apiError = (err as { response?: { data?: { error?: { code?: string; message?: string } } } })?.response?.data?.error;
      const code = apiError?.code;
      if (code === 'PackageCategory.NameAlreadyExists') {
        showToast('error', 'Tên danh mục đã tồn tại trong hệ thống.');
      } else {
        showToast('error', getErrorMessage(err));
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => packageCategoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-package-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-package-categories-lookup'] });
      showToast('success', 'Xóa danh mục thành công.');
      setIsDeleteOpen(false);
      setDeletingCategory(null);
    },
    onError: (err: unknown) => {
      const apiError = (err as { response?: { data?: { error?: { code?: string; message?: string } } } })?.response?.data?.error;
      if (apiError?.code === 'PackageCategory.CannotDeleteInUse') {
        setIsDeleteOpen(false);
        if (deletingCategory) {
          setDeleteBlockCategory({
            ...deletingCategory,
            packagesCount: Math.max(deletingCategory.packagesCount, 1),
          });
        }
      } else {
        showToast('error', getErrorMessage(err));
      }
    },
  });

  const handleOpenAdd = () => {
    setIsFormOpen(true);
  };

  const handleOpenView = (category: PackageCategorySummary) => {
    setActiveCategory(category);
    setIsDetailEditing(false);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (category: PackageCategorySummary) => {
    setActiveCategory(category);
    setIsDetailEditing(true);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (category: PackageCategorySummary) => {
    if (category.packagesCount > 0) {
      setDeleteBlockCategory(category);
      return;
    }
    setDeletingCategory(category);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (payload: CreatePackageCategoryPayload | UpdatePackageCategoryPayload) => {
    await createMutation.mutateAsync(payload as CreatePackageCategoryPayload);
  };

  const handleDetailSave = async (payload: UpdatePackageCategoryPayload) => {
    if (!activeCategory) return;
    await updateMutation.mutateAsync({
      id: activeCategory.id,
      payload,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    await deleteMutation.mutateAsync(deletingCategory.id);
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
            <p className="text-[13px] font-normal text-[#202939] leading-snug whitespace-nowrap">
              {toast.message}
            </p>
          </Alert>
        </div>
      )}

      <CategoryToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPageIndex(1);
        }}
        selectedStatus={status}
        onStatusChange={(st) => {
          setStatus(st);
          setPageIndex(1);
        }}
        onAddNew={handleOpenAdd}
      />

      {isError ? (
        <ConnectionErrorState onRetry={() => refetch()} />
      ) : (
        <div className="w-full bg-white rounded-[8px] p-4 sm:p-[16px_24px] shadow-xs flex-1 flex flex-col justify-between">
          <CategoryTable
            items={data?.items || []}
            isLoading={isLoading}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onClearFilter={() => {
              setSearch('');
              setStatus('ALL');
              setPageIndex(1);
            }}
          />

          <CategoryPagination
            pageIndex={data?.pageIndex || pageIndex}
            pageSize={data?.pageSize || pageSize}
            totalCount={data?.totalCount || 0}
            totalPages={data?.totalPages || 0}
            hasPreviousPage={data?.hasPreviousPage || false}
            hasNextPage={data?.hasNextPage || false}
            onPageChange={(page) => setPageIndex(page)}
            onPageSizeChange={(size) => setPageSize(size)}
          />
        </div>
      )}

      <CategoryFormDialog
        key={isFormOpen ? 'open' : 'closed'}
        isOpen={isFormOpen}
        isSubmitting={createMutation.isPending}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <CategoryDetailDialog
        isOpen={isDetailOpen}
        category={activeCategory}
        initialIsEditing={isDetailEditing}
        isSubmitting={updateMutation.isPending}
        onClose={() => {
          setIsDetailOpen(false);
          setActiveCategory(null);
          setIsDetailEditing(false);
        }}
        onSave={handleDetailSave}
      />

      <ConfirmDialog
        isOpen={!!deleteBlockCategory}
        size="sm"
        type="warning"
        singleButton
        onClose={() => setDeleteBlockCategory(null)}
        onConfirm={() => setDeleteBlockCategory(null)}
        title="Không thể xóa danh mục"
        description={
          deleteBlockCategory ? (
            <span>
              Danh mục{' '}
              <strong className="text-[#064343] font-semibold">
                &quot;{deleteBlockCategory.name}&quot; ({deleteBlockCategory.code})
              </strong>{' '}
              hiện đang có{' '}
              <strong className="text-amber-700 font-semibold">
                {deleteBlockCategory.packagesCount} gói tập
              </strong>{' '}
              liên kết, không thể xóa khỏi hệ thống.
            </span>
          ) : (
            'Danh mục này hiện đang có gói tập liên kết, không thể xóa.'
          )
        }
        confirmText="Đã hiểu"
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        size="sm"
        state="delete"
        onClose={() => {
          if (deleteMutation.isPending) return;
          setIsDeleteOpen(false);
          setDeletingCategory(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa danh mục?"
        description={
          deletingCategory ? (
            <span>
              Bạn có chắc chắn muốn xóa danh mục{' '}
              <strong className="text-[#064343] font-semibold">
                &quot;{deletingCategory.name}&quot; ({deletingCategory.code})
              </strong>{' '}
              không? Thao tác này sẽ xóa mềm danh mục khỏi hệ thống.
            </span>
          ) : (
            'Bạn có chắc chắn muốn xóa danh mục này không?'
          )
        }
        confirmText="Đồng ý"
        cancelText="Hủy bỏ"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
