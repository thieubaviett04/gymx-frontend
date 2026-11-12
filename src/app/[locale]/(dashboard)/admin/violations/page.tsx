'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, ConfirmDialog } from '@/components/ui';
import {
  ViolationConfigCard,
  ViolationTable,
  ViolationToolbar,
  ViolationPagination,
  ViolationDetailSlidePanel,
} from '@/components/admin/violations';
import type { ViolationFormData } from '@/components/admin/violations';
import { violationService } from '@/lib/api/modules/violationService';
import { payrollPeriodService } from '@/lib/api/modules/payrollPeriodService';
import { formatVND } from '@/lib/utils/formatters';
import type { TargetRole } from '@/types/payroll';
import type { ViolationSummaryItem } from '@/types';

const getLocalCurrentDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getOccurredAtIso = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString();
  const cleanDateStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = cleanDateStr.split('-');
  if (parts.length >= 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      const now = new Date();
      const todayYear = now.getFullYear();
      const todayMonth = now.getMonth() + 1;
      const todayDay = now.getDate();
      if (y === todayYear && m === todayMonth && d === todayDay) {
        return now.toISOString();
      }
      const dateObj = new Date(y, m - 1, d, 8, 0, 0);
      if (dateObj > now) {
        return now.toISOString();
      }
      return dateObj.toISOString();
    }
  }
  return new Date().toISOString();
};

export default function AdminViolationsPage() {
  const queryClient = useQueryClient();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const defaultFormState: ViolationFormData = {
    periodId: `${currentMonth}-${currentYear}`,
    employeeId: '',
    penaltyRuleId: '',
    fineAmount: 0,
    occurredAt: getLocalCurrentDateString(),
    evidenceUrl: '',
    note: '',
  };

  const [formData, setFormData] = useState<ViolationFormData>(defaultFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formResetKey, setFormResetKey] = useState<number>(0);

  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string>(
    `${currentMonth}-${currentYear}`
  );

  const [search, setSearch] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<TargetRole | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'CANCELLED'>('ALL');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [isSlidePanelOpen, setIsSlidePanelOpen] = useState<boolean>(false);
  const [activeViolation, setActiveViolation] = useState<ViolationSummaryItem | null>(null);

  const [cancellingViolation, setCancellingViolation] = useState<ViolationSummaryItem | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [cancellationReason, setCancellationReason] = useState<string>('');

  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const { data: periodsData } = useQuery({
    queryKey: ['admin-payroll-periods-list'],
    queryFn: async () => {
      const res = await payrollPeriodService.getPeriods({ pageSize: 50 });
      return res.data?.items || [];
    },
  });

  const periodOptions = useMemo(() => {
    const list: Array<{ id: string; month: number; year: number; label: string; isLocked?: boolean }> = [];

    const lockedPeriodsMap = new Map<string, boolean>();
    if (periodsData && periodsData.length > 0) {
      periodsData.forEach((p) => {
        const start = new Date(p.periodStart);
        const m = start.getMonth() + 1;
        const y = start.getFullYear();
        const isLocked = p.status === 'LOCKED' || p.status === 'CONFIRMED' || p.status === 'PAID';
        lockedPeriodsMap.set(`${m}-${y}`, isLocked);
      });
    }

    const startMonthIndex = currentMonth - 1;
    for (let i = 0; i < 12; i++) {
      const d = new Date(currentYear, startMonthIndex + i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const key = `${m}-${y}`;
      const isLocked = lockedPeriodsMap.get(key) ?? false;
      list.push({
        id: key,
        month: m,
        year: y,
        label: `Tháng ${m}/${y}${isLocked ? ' (Đã khóa)' : ''}`,
        isLocked,
      });
    }

    return list;
  }, [periodsData, currentMonth, currentYear]);

  const isAllPeriods = selectedPeriodKey === 'ALL';
  const selectedOption = useMemo(() => {
    if (isAllPeriods) return null;
    return periodOptions.find((p) => p.id === selectedPeriodKey) || periodOptions[0];
  }, [periodOptions, selectedPeriodKey, isAllPeriods]);

  const effectiveMonth = isAllPeriods ? undefined : (selectedOption?.month ?? currentMonth);
  const effectiveYear = isAllPeriods ? undefined : (selectedOption?.year ?? currentYear);
  const isSelectedPeriodLocked = !isAllPeriods && !!selectedOption?.isLocked;
  const periodLabel = isAllPeriods
    ? 'Tất cả các kỳ (Lịch sử)'
    : `Tháng ${effectiveMonth}/${effectiveYear}`;

  const fromDate = useMemo(() => {
    if (!effectiveMonth || !effectiveYear) return undefined;
    return new Date(effectiveYear, effectiveMonth - 1, 1).toISOString();
  }, [effectiveMonth, effectiveYear]);

  const toDate = useMemo(() => {
    if (!effectiveMonth || !effectiveYear) return undefined;
    return new Date(effectiveYear, effectiveMonth, 0, 23, 59, 59, 999).toISOString();
  }, [effectiveMonth, effectiveYear]);

  const { data: employeesLookupData } = useQuery({
    queryKey: ['employees-violation-lookup'],
    queryFn: async () => {
      const res = await violationService.getEmployeesLookup();
      return res.data || [];
    },
    staleTime: 60000,
  });

  const employeesLookup = employeesLookupData || [];

  const { data: penaltyRulesLookupData } = useQuery({
    queryKey: ['penalty-rules-lookup-all'],
    queryFn: async () => {
      const res = await violationService.getPenaltyRulesLookup();
      return res.data || [];
    },
    staleTime: 60000,
  });

  const penaltyRulesLookup = penaltyRulesLookupData || [];

  const { data: violationsData, isLoading: isLoadingViolations } = useQuery({
    queryKey: [
      'admin-violations-list',
      fromDate,
      toDate,
      search,
      selectedRole,
      selectedStatus,
      pageIndex,
      pageSize,
    ],
    queryFn: async () => {
      const statusParam =
        selectedStatus === 'ALL'
          ? undefined
          : selectedStatus === 'ACTIVE'
          ? 'CONFIRMED'
          : 'CANCELLED';

      const res = await violationService.getViolations({
        fromDate,
        toDate,
        search: search.trim() || undefined,
        status: statusParam,
        pageIndex,
        pageSize,
      });
      return res.data;
    },
  });

  const rawViolationItems = violationsData?.items || [];

  const violationItems = useMemo(() => {
    if (selectedRole === 'ALL') return rawViolationItems;
    return rawViolationItems.filter((item) => item.employeePosition === selectedRole);
  }, [rawViolationItems, selectedRole]);

  const totalCount = violationsData?.totalCount ?? violationItems.length;
  const totalPages = violationsData?.totalPages ?? (Math.ceil(totalCount / pageSize) || 1);

  const totalFineAmount = useMemo(() => {
    return violationItems
      .filter((v) => v.status !== 'CANCELLED')
      .reduce((sum, v) => sum + (v.fineAmount || 0), 0);
  }, [violationItems]);

  const handleChangeFormField = <K extends keyof ViolationFormData>(
    field: K,
    value: ViolationFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFormError = (field: string) => {
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleClearAllErrors = () => {
    setFormErrors({});
  };

  const createViolationMutation = useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      penaltyRuleId: string;
      occurredAt: string;
      evidenceUrl?: string | null;
      note?: string | null;
    }) => {
      return await violationService.create(payload);
    },
    onSuccess: () => {
      showToast('success', 'Đã ghi nhận biên bản vi phạm thành công.');
      queryClient.invalidateQueries({ queryKey: ['admin-violations-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payroll-periods-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payroll-periods'] });
      queryClient.invalidateQueries({ queryKey: ['admin-penalty-rules'] });

      setFormData((prev) => ({
        ...defaultFormState,
        periodId: prev.periodId || `${currentMonth}-${currentYear}`,
        occurredAt: getLocalCurrentDateString(),
      }));
      setFormErrors({});
      setFormResetKey((k) => k + 1);
    },
    onError: (err: any) => {
      const data = err?.response?.data;
      let errorMsg = 'Có lỗi xảy ra khi tạo biên bản vi phạm.';

      if (data?.error?.description) {
        errorMsg = data.error.description;
      } else if (data?.error?.message) {
        errorMsg = data.error.message;
      } else if (data?.errors && typeof data.errors === 'object') {
        const msgs = Object.values(data.errors).flat();
        if (msgs.length > 0) {
          errorMsg = String(msgs[0]);
        }
      } else if (data?.detail) {
        errorMsg = data.detail;
      } else if (data?.message) {
        errorMsg = data.message;
      } else if (data?.title) {
        errorMsg = data.title;
      } else if (err?.message) {
        errorMsg = err.message;
      }

      const errorCode = data?.error?.code || '';
      if (errorCode === 'Violation.PayrollPeriodClosed') {
        setFormErrors({
          periodId: 'Thời gian vi phạm thuộc kỳ tính lương đã được chốt và duyệt.',
        });
      } else if (errorCode === 'Violation.PenaltyRuleNotActive') {
        setFormErrors({
          penaltyRuleId: 'Quy định phạt này đã ngừng áp dụng hoặc chưa kích hoạt.',
        });
      } else if (errorCode === 'Violation.TargetAudienceMismatch') {
        setFormErrors({
          penaltyRuleId: 'Quy định phạt không áp dụng cho đối tượng nhân viên này.',
        });
      } else if (errorCode === 'Violation.OccurredBeforeRuleEffectiveDate') {
        setFormErrors({
          occurredAt: 'Thời gian vi phạm không được xảy ra trước ngày quy định bắt đầu có hiệu lực.',
        });
      }

      showToast('error', errorMsg);
    },
  });

  const cancelViolationMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      return await violationService.delete(id, reason);
    },
    onSuccess: () => {
      showToast('success', 'Xóa biên bản vi phạm thành công.');
      queryClient.invalidateQueries({ queryKey: ['admin-violations-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payroll-periods-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payroll-periods'] });
      setIsCancelModalOpen(false);
      setCancellingViolation(null);
      setCancellationReason('');
      setIsSlidePanelOpen(false);
      setActiveViolation(null);
    },
    onError: (err: any) => {
      const data = err?.response?.data;
      const errorMsg =
        data?.error?.description ||
        data?.error?.message ||
        err?.message ||
        'Không thể xóa biên bản vi phạm.';
      showToast('error', errorMsg);
    },
  });

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const targetPeriodKey = formData.periodId || `${currentMonth}-${currentYear}`;
    const targetPeriodOption =
      periodOptions.find((p) => p.id === targetPeriodKey) || periodOptions[0];
    const isTargetLocked = !!targetPeriodOption?.isLocked;

    if (!targetPeriodKey) {
      errors.periodId = 'Vui lòng chọn kỳ tính lương.';
    } else if (isTargetLocked) {
      errors.periodId = 'Kỳ tính lương này đã được chốt và khóa sổ. Không thể tạo biên bản mới.';
    }

    if (!formData.employeeId) {
      errors.employeeId = 'Vui lòng chọn nhân viên vi phạm.';
    }

    if (!formData.penaltyRuleId) {
      errors.penaltyRuleId = 'Vui lòng chọn quy định vi phạm.';
    }

    if (!formData.occurredAt) {
      errors.occurredAt = 'Vui lòng chọn ngày vi phạm.';
    } else {
      const todayStr = getLocalCurrentDateString();
      if (formData.occurredAt > todayStr) {
        errors.occurredAt = 'Ngày vi phạm không được lớn hơn ngày hiện tại.';
      }
    }

    if (formData.evidenceUrl && formData.evidenceUrl.length > 1000) {
      errors.evidenceUrl = 'Đường dẫn bằng chứng không vượt quá 1000 ký tự.';
    }

    if (formData.note && formData.note.length > 1000) {
      errors.note = 'Ghi chú không vượt quá 1000 ký tự.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    createViolationMutation.mutate({
      employeeId: formData.employeeId,
      penaltyRuleId: formData.penaltyRuleId,
      occurredAt: getOccurredAtIso(formData.occurredAt),
      evidenceUrl: formData.evidenceUrl.trim() || undefined,
      note: formData.note.trim() || undefined,
    });
  };

  const handleResetForm = () => {
    setFormData((prev) => ({
      ...defaultFormState,
      periodId: prev.periodId || `${currentMonth}-${currentYear}`,
      occurredAt: getLocalCurrentDateString(),
    }));
    setFormErrors({});
    setFormResetKey((k) => k + 1);
  };

  const handleOpenViewSlide = (item: ViolationSummaryItem) => {
    setActiveViolation(item);
    setIsSlidePanelOpen(true);
  };

  const handleOpenCancelDialog = (item: ViolationSummaryItem) => {
    setCancellingViolation(item);
    setCancellationReason('');
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancelViolation = () => {
    if (!cancellingViolation) return;
    cancelViolationMutation.mutate({
      id: cancellingViolation.id,
      reason: cancellationReason.trim() || undefined,
    });
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedPeriodKey !== `${currentMonth}-${currentYear}` ||
    selectedRole !== 'ALL' ||
    selectedStatus !== 'ALL';

  const isSubmitting = createViolationMutation.isPending;

  return (
    <div className="w-full flex-1 flex flex-col space-y-6 sm:space-y-7">
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

      <ViolationConfigCard
        key={formResetKey}
        formData={{
          ...formData,
          periodId: formData.periodId || `${currentMonth}-${currentYear}`,
        }}
        onChangeField={(field, val) => {
          if (field === 'periodId') {
            setSelectedPeriodKey(val as string);
            setPageIndex(1);
          }
          handleChangeFormField(field, val);
        }}
        periodOptions={periodOptions}
        employees={employeesLookup}
        penaltyRules={penaltyRulesLookup}
        errors={formErrors}
        onClearError={handleClearFormError}
        onClearAllErrors={handleClearAllErrors}
        statsText={
          <div className="flex items-center gap-[18px]">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#64748B] leading-none">
                Kỳ lương
              </span>
              <span className="text-[12px] sm:text-[13px] font-medium text-[#202939] leading-none">
                {periodLabel}
              </span>
            </div>

            <div className="w-[1px] h-4 bg-[#E2E8F0] shrink-0" />

            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#64748B] leading-none">
                Tổng tiền phạt
              </span>
              <span className="text-[13px] font-semibold text-[#064343] leading-none">
                {formatVND(totalFineAmount)}
              </span>
            </div>

            <div className="w-[1px] h-4 bg-[#E2E8F0] shrink-0" />

            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#64748B] leading-none">
                Đã ghi nhận
              </span>
              <span className="text-[12px] sm:text-[13px] font-medium text-[#202939] leading-none">
                {totalCount < 10 ? `0${totalCount}` : totalCount}
              </span>
            </div>
          </div>
        }
        onSubmit={handleSubmitForm}
        onReset={handleResetForm}
        isSubmitting={isSubmitting}
      />

      <div className="bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-4 pb-5 sm:pt-5 sm:pb-6 shadow-xs space-y-6 relative overflow-hidden">
        <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center">
              <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
                Các biên bản vi phạm
              </h2>
            </div>
            <p className="text-[13px] text-[#64748B] mt-1.5 font-normal">
              Danh sách các nhân viên bị xử phạt vi phạm qua các kỳ lương
            </p>
          </div>

          <ViolationToolbar
            periodOptions={periodOptions}
            selectedPeriodId={selectedPeriodKey}
            onPeriodChange={(key) => {
              setSelectedPeriodKey(key);
              setPageIndex(1);
            }}
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
            hasActiveFilters={hasActiveFilters}
            onResetFilters={() => {
              setSearch('');
              setSelectedPeriodKey(`${currentMonth}-${currentYear}`);
              setSelectedRole('ALL');
              setSelectedStatus('ALL');
              setPageIndex(1);
            }}
          />
        </div>

        <ViolationTable
          items={violationItems}
          isLoading={isLoadingViolations}
          pageIndex={pageIndex}
          pageSize={pageSize}
          isPeriodLocked={isSelectedPeriodLocked}
          onView={handleOpenViewSlide}
          onCancel={handleOpenCancelDialog}
          onClearFilter={() => {
            setSearch('');
            setSelectedPeriodKey(`${currentMonth}-${currentYear}`);
            setSelectedRole('ALL');
            setSelectedStatus('ALL');
            setPageIndex(1);
          }}
        />

        <ViolationPagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          hasPreviousPage={pageIndex > 1}
          hasNextPage={pageIndex < totalPages}
          onPageChange={(page) => setPageIndex(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageIndex(1);
          }}
        />
      </div>

      <ViolationDetailSlidePanel
        isOpen={isSlidePanelOpen}
        onClose={() => {
          setIsSlidePanelOpen(false);
          setActiveViolation(null);
        }}
        violation={activeViolation}
        isPeriodLocked={isSelectedPeriodLocked}
        onCancelViolation={handleOpenCancelDialog}
      />

      <ConfirmDialog
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setCancellingViolation(null);
          setCancellationReason('');
        }}
        onConfirm={handleConfirmCancelViolation}
        title="Xóa biên bản vi phạm"
        description={`Bạn có chắc chắn muốn xóa biên bản vi phạm của ${
          cancellingViolation?.employeeName || 'nhân viên này'
        }?`}
        confirmText="Xóa biên bản"
        cancelText="Quay lại"
        type="danger"
        isLoading={cancelViolationMutation.isPending}
      />
    </div>
  );
}
