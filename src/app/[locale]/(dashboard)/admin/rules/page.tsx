'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, ConfirmDialog } from '@/components/ui';
import { penaltyRuleService } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils/error-helper';
import { ConnectionErrorState } from '@/components/shared';
import type {
  CreatePenaltyRulePayload,
  PenaltyRuleDetail,
  PenaltyRuleSummary,
  UpdatePenaltyRulePayload,
} from '@/types/penaltyRule';
import {
  RuleToolbar,
  RuleTable,
  RulePagination,
  RuleFormDialog,
  RuleDetailDialog,
  RulePrintPreviewDialog,
} from '@/components/admin/penalty-rules';

export default function AdminPenaltyRulesPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [targetAudience, setTargetAudience] = useState('ALL');
  const [severity, setSeverity] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeRule, setActiveRule] = useState<PenaltyRuleDetail | PenaltyRuleSummary | null>(null);
  const [isDetailEditing, setIsDetailEditing] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingRule, setDeletingRule] = useState<PenaltyRuleSummary | null>(null);

  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

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
    queryKey: [
      'admin-penalty-rules',
      { search, targetAudience, severity, status, pageIndex, pageSize },
    ],
    queryFn: async () => {
      const aud = targetAudience !== 'ALL' ? targetAudience : undefined;
      const res = await penaltyRuleService.list({
        search: search.trim() || undefined,
        targetAudience: aud,
        violationType: aud,
        severity: severity !== 'ALL' ? severity : undefined,
        status: status !== 'ALL' ? status : undefined,
        pageIndex,
        pageSize,
      });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePenaltyRulePayload) => penaltyRuleService.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-penalty-rules'] });
      showToast('success', res.message || 'Thêm quy định phạt thành công.');
      setIsFormOpen(false);
    },
    onError: (err: unknown) => {
      showToast('error', getErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePenaltyRulePayload }) =>
      penaltyRuleService.update(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-penalty-rules'] });
      showToast('success', res.message || 'Cập nhật quy định phạt thành công.');
      setIsFormOpen(false);
      setIsDetailOpen(false);
      setIsDetailEditing(false);
      setActiveRule(null);
    },
    onError: (err: unknown) => {
      showToast('error', getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => penaltyRuleService.delete(id),
    onSuccess: (res) => {
      if (data?.items && data.items.length === 1 && pageIndex > 1) {
        setPageIndex((prev) => prev - 1);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-penalty-rules'] });
      showToast('success', res.message || 'Xóa quy định phạt thành công.');
      setIsDeleteOpen(false);
      setDeletingRule(null);
    },
    onError: (err: unknown) => {
      showToast('error', getErrorMessage(err));
    },
  });

  const handleOpenCreate = () => {
    setIsFormOpen(true);
  };

  const handleOpenEdit = async (rule: PenaltyRuleSummary) => {
    try {
      const res = await penaltyRuleService.byId(rule.id);
      setActiveRule(res.data);
    } catch {
      setActiveRule(rule);
    }
    setIsDetailEditing(true);
    setIsDetailOpen(true);
  };

  const handleOpenView = async (rule: PenaltyRuleSummary) => {
    try {
      const res = await penaltyRuleService.byId(rule.id);
      setActiveRule(res.data);
    } catch {
      setActiveRule(rule);
    }
    setIsDetailEditing(false);
    setIsDetailOpen(true);
  };

  const handleDetailSave = async (payload: UpdatePenaltyRulePayload) => {
    if (!activeRule) return;
    await updateMutation.mutateAsync({
      id: activeRule.id,
      payload,
    });
  };

  const handleOpenDelete = (rule: PenaltyRuleSummary) => {
    setDeletingRule(rule);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (payload: CreatePenaltyRulePayload) => {
    await createMutation.mutateAsync(payload);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRule) return;
    await deleteMutation.mutateAsync(deletingRule.id);
  };

  const hasFilter =
    !!search ||
    targetAudience !== 'ALL' ||
    severity !== 'ALL' ||
    status !== 'ALL';

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

      <RuleToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPageIndex(1);
        }}
        selectedAudience={targetAudience}
        onAudienceChange={(aud) => {
          setTargetAudience(aud);
          setPageIndex(1);
        }}
        selectedSeverity={severity}
        onSeverityChange={(sev) => {
          setSeverity(sev);
          setPageIndex(1);
        }}
        selectedStatus={status}
        onStatusChange={(st) => {
          setStatus(st);
          setPageIndex(1);
        }}
        onAddNew={handleOpenCreate}
        onPrintPreview={() => setIsPrintPreviewOpen(true)}
      />

      <div className="bg-white rounded-[8px] p-4 sm:p-[16px_24px] shadow-xs flex-1 flex flex-col justify-between">
        {isError ? (
          <ConnectionErrorState onRetry={() => refetch()} />
        ) : (
          <>
            <div className="flex-1 flex flex-col">
              <RuleTable
                items={data?.items || []}
                isLoading={isLoading}
                pageIndex={pageIndex}
                pageSize={pageSize}
                onView={handleOpenView}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onClearFilter={
                  hasFilter
                    ? () => {
                        setSearch('');
                        setTargetAudience('ALL');
                        setSeverity('ALL');
                        setStatus('ALL');
                        setPageIndex(1);
                      }
                    : undefined
                }
              />
            </div>

            {data && data.totalCount > 0 && (
              <RulePagination
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

      <RuleFormDialog
        isOpen={isFormOpen}
        isSubmitting={createMutation.isPending}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <RuleDetailDialog
        isOpen={isDetailOpen}
        rule={activeRule}
        initialIsEditing={isDetailEditing}
        isSubmitting={updateMutation.isPending}
        onClose={() => {
          setIsDetailOpen(false);
          setActiveRule(null);
          setIsDetailEditing(false);
        }}
        onSave={handleDetailSave}
      />

      <RulePrintPreviewDialog
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        rules={data?.items || []}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        size="sm"
        state="delete"
        onClose={() => {
          if (deleteMutation.isPending) return;
          setIsDeleteOpen(false);
          setDeletingRule(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa quy định nội quy?"
        description={
          deletingRule ? (
            <span>
              Bạn có chắc chắn muốn xóa quy định{' '}
              <strong className="text-[#064343] font-semibold">
                &quot;{deletingRule.ruleCode}&quot;
              </strong>{' '}
              không? Quy định sẽ bị ẩn khỏi danh sách áp dụng.
            </span>
          ) : (
            'Bạn có chắc chắn muốn xóa quy định này không?'
          )
        }
        confirmText="Đồng ý"
        cancelText="Hủy bỏ"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
