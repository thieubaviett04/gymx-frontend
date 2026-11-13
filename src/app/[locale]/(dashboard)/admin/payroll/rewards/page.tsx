'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, ConfirmDialog } from '@/components/ui';
import { payrollBonusService } from '@/lib/api/modules/payrollBonusService';
import { payrollPeriodService } from '@/lib/api/modules/payrollPeriodService';
import { getErrorMessage } from '@/lib/utils/error-helper';
import { formatVND } from '@/lib/utils/formatters';
import type { TargetRole } from '@/types/payroll';
import type { PayrollBonusItem } from '@/types/payrollBonus';
import {
  RewardConfigCard,
  RewardDetailSlidePanel,
  RewardFormData,
  RewardPagination,
  RewardTable,
  RewardToolbar,
} from '@/components/admin/payroll/rewards';

export default function AdminPayrollRewardsPage() {
  const queryClient = useQueryClient();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const defaultFormState: RewardFormData = {
    rewardType: 'KPI',
    periodId: `${currentMonth}-${currentYear}`,
    targetId: '',
    amount: 0,
    note: '',
  };

  const [formData, setFormData] = useState<RewardFormData>(defaultFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string>(
    `${currentMonth}-${currentYear}`
  );

  const [search, setSearch] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<TargetRole | 'ALL'>('ALL');
  const [selectedBonusType, setSelectedBonusType] = useState<'ALL' | 'KPI' | 'HOLIDAY'>('ALL');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [isSlidePanelOpen, setIsSlidePanelOpen] = useState<boolean>(false);
  const [isSlidePanelEditing, setIsSlidePanelEditing] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<PayrollBonusItem | null>(null);

  const [revokingItem, setRevokingItem] = useState<PayrollBonusItem | null>(null);
  const [isRevokeOpen, setIsRevokeOpen] = useState<boolean>(false);

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

  const lookupMonth = effectiveMonth ?? currentMonth;
  const lookupYear = effectiveYear ?? currentYear;

  const { data: employeesLookupData } = useQuery({
    queryKey: ['admin-bonus-employees-lookup', lookupMonth, lookupYear],
    queryFn: async () => {
      const res = await payrollBonusService.getEmployeesLookup({
        month: lookupMonth,
        year: lookupYear,
      });
      return res.data || [];
    },
  });

  const employeesLookup = employeesLookupData || [];

  const {
    data: bonusesData,
    isLoading: isLoadingBonuses,
  } = useQuery({
    queryKey: [
      'admin-payroll-bonuses',
      effectiveMonth,
      effectiveYear,
      search,
      selectedRole,
      selectedBonusType,
      pageIndex,
      pageSize,
    ],
    queryFn: async () => {
      const res = await payrollBonusService.getBonuses({
        month: effectiveMonth,
        year: effectiveYear,
        search: search.trim() || undefined,
        position: selectedRole === 'ALL' ? undefined : selectedRole,
        bonusType: selectedBonusType === 'ALL' ? undefined : selectedBonusType,
        pageIndex,
        pageSize,
      });
      return res.data;
    },
  });

  const bonusItems = bonusesData?.items || [];
  const totalCount = bonusesData?.totalCount ?? bonusItems.length;
  const totalPages = bonusesData?.totalPages ?? (Math.ceil(totalCount / pageSize) || 1);
  const totalBonusAmount = bonusesData?.totalBonusAmount ?? 0;

  const handleChangeFormField = <K extends keyof RewardFormData>(
    field: K,
    value: RewardFormData[K]
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

  const invalidatePayrollCaches = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-payroll-bonuses'] });
    queryClient.invalidateQueries({ queryKey: ['admin-bonus-employees-lookup'] });
    queryClient.invalidateQueries({ queryKey: ['admin-payroll-periods-list'] });
    queryClient.invalidateQueries({ queryKey: ['admin-payroll-period-detail'] });
    queryClient.invalidateQueries({ queryKey: ['admin-payroll-payslips'] });
    queryClient.invalidateQueries({ queryKey: ['staff-payroll-my-payslips'] });
  };

  const createBonusMutation = useMutation({
    mutationFn: async (payload: {
      month: number;
      year: number;
      bonusType: 'KPI' | 'HOLIDAY';
      targetType: 'INDIVIDUAL' | 'ALL' | 'BY_POSITION';
      employeeId?: string;
      amount: number;
      reason: string;
    }) => {
      return await payrollBonusService.createBonus(payload);
    },
    onSuccess: () => {
      invalidatePayrollCaches();
      showToast('success', 'Đã lưu thiết lập khen thưởng thành công.');
      setFormData({
        ...defaultFormState,
        periodId: formData.periodId || `${currentMonth}-${currentYear}`,
      });
      setFormErrors({});
    },
    onError: (err: unknown) => {
      const axiosErr = err as any;
      const errorCode = axiosErr?.response?.data?.error?.code;
      const status = axiosErr?.response?.status;
      if (status === 409 || errorCode === 'Payroll.PeriodAlreadyConfirmed') {
        showToast(
          'error',
          'Kỳ tính lương này đã được chốt và khóa sổ, không thể thêm hoặc sửa khen thưởng.'
        );
      } else {
        showToast('error', getErrorMessage(err) || 'Không thể lưu khen thưởng.');
      }
    },
  });

  const updateBonusMutation = useMutation({
    mutationFn: async ({
      id,
      amount,
      reason,
      bonusType,
    }: {
      id: string;
      amount: number;
      reason: string;
      bonusType: 'KPI' | 'HOLIDAY';
    }) => {
      return await payrollBonusService.updateBonus(id, {
        amount,
        reason,
        bonusType,
      });
    },
    onSuccess: () => {
      invalidatePayrollCaches();
      showToast('success', 'Đã cập nhật khen thưởng thành công.');
      setIsSlidePanelOpen(false);
      setActiveItem(null);
    },
    onError: (err: unknown) => {
      const axiosErr = err as any;
      const errorCode = axiosErr?.response?.data?.error?.code;
      const status = axiosErr?.response?.status;
      if (status === 409 || errorCode === 'Payroll.PeriodAlreadyConfirmed') {
        showToast(
          'error',
          'Kỳ tính lương này đã được chốt và khóa sổ, không thể thêm hoặc sửa khen thưởng.'
        );
      } else {
        showToast('error', getErrorMessage(err) || 'Không thể cập nhật khen thưởng.');
      }
    },
  });

  const deleteBonusMutation = useMutation({
    mutationFn: async (id: string) => {
      return await payrollBonusService.deleteBonus(id);
    },
    onSuccess: () => {
      invalidatePayrollCaches();
      showToast('success', 'Đã thu hồi khoản khen thưởng thành công.');
      setIsRevokeOpen(false);
      setRevokingItem(null);
    },
    onError: (err: unknown) => {
      const axiosErr = err as any;
      const errorCode = axiosErr?.response?.data?.error?.code;
      const status = axiosErr?.response?.status;
      if (status === 409 || errorCode === 'Payroll.PeriodAlreadyConfirmed') {
        showToast(
          'error',
          'Kỳ tính lương này đã được chốt và khóa sổ, không thể xóa khen thưởng.'
        );
      } else {
        showToast('error', getErrorMessage(err) || 'Không thể thu hồi tiền thưởng.');
      }
    },
  });

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const targetPeriodKey = formData.periodId || `${currentMonth}-${currentYear}`;
    const targetPeriodOption =
      periodOptions.find((p) => p.id === targetPeriodKey) || periodOptions[0];
    const isTargetLocked = !!targetPeriodOption?.isLocked;

    if (!formData.rewardType) {
      errors.rewardType = 'Vui lòng chọn hình thức thưởng.';
    }

    if (!targetPeriodKey) {
      errors.periodId = 'Vui lòng chọn kỳ tính lương.';
    } else if (isTargetLocked) {
      errors.periodId = 'Kỳ tính lương này đã được chốt và khóa sổ. Không thể thêm khoản khen thưởng mới.';
    }

    if (formData.rewardType === 'KPI' && !formData.targetId) {
      errors.targetId = 'Vui lòng chọn nhân viên khen thưởng.';
    }

    if (formData.amount <= 0) {
      errors.amount = 'Số tiền khen thưởng phải lớn hơn 0.';
    }

    if (formData.note && formData.note.length > 500) {
      errors.note = 'Nội dung khen thưởng không vượt quá 500 ký tự.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const isHolidayAll =
      formData.rewardType === 'HOLIDAY' && (!formData.targetId || formData.targetId === 'ALL');
    const targetType = isHolidayAll ? 'ALL' : 'INDIVIDUAL';
    const employeeId = isHolidayAll ? undefined : formData.targetId;

    createBonusMutation.mutate({
      month: targetPeriodOption.month,
      year: targetPeriodOption.year,
      bonusType: formData.rewardType,
      targetType,
      employeeId,
      amount: formData.amount,
      reason: formData.note.trim(),
    });
  };

  const handleResetForm = () => {
    setFormData({
      ...defaultFormState,
      periodId: formData.periodId || `${currentMonth}-${currentYear}`,
    });
    setFormErrors({});
  };

  const handleOpenViewSlide = (item: PayrollBonusItem) => {
    setActiveItem(item);
    setIsSlidePanelEditing(false);
    setIsSlidePanelOpen(true);
  };

  const handleOpenEditSlide = (item: PayrollBonusItem) => {
    setActiveItem(item);
    setIsSlidePanelEditing(true);
    setIsSlidePanelOpen(true);
  };

  const handleOpenRevoke = (item: PayrollBonusItem) => {
    setRevokingItem(item);
    setIsRevokeOpen(true);
  };

  const handleSaveSlidePanel = async (
    id: string,
    payload: { amount: number; note: string; bonusType: 'KPI' | 'HOLIDAY' }
  ) => {
    await updateBonusMutation.mutateAsync({
      id,
      amount: payload.amount,
      reason: payload.note,
      bonusType: payload.bonusType,
    });
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedPeriodKey !== `${currentMonth}-${currentYear}` ||
    selectedRole !== 'ALL' ||
    selectedBonusType !== 'ALL';

  const isSubmitting = createBonusMutation.isPending || updateBonusMutation.isPending;

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

      <RewardConfigCard
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
                Quỹ thưởng
              </span>
              <span className="text-[13px] font-semibold text-[#10B981] leading-none">
                {formatVND(totalBonusAmount)}
              </span>
            </div>

            <div className="w-[1px] h-4 bg-[#E2E8F0] shrink-0" />

            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#64748B] leading-none">
                Đã duyệt
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
                Các khoản khen thưởng
              </h2>
            </div>
            <p className="text-[13px] text-[#64748B] mt-1.5 font-normal">
              Danh sách các nhân viên nhận thưởng qua các kỳ lương
            </p>
          </div>

          <RewardToolbar
            periodOptions={periodOptions}
            selectedPeriodId={selectedPeriodKey}
            onPeriodChange={(id) => {
              setSelectedPeriodKey(id);
              if (id !== 'ALL') {
                handleChangeFormField('periodId', id);
              }
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
            selectedBonusType={selectedBonusType}
            onBonusTypeChange={(type) => {
              setSelectedBonusType(type);
              setPageIndex(1);
            }}
            onResetFilters={() => {
              setSearch('');
              setSelectedPeriodKey(`${currentMonth}-${currentYear}`);
              setSelectedRole('ALL');
              setSelectedBonusType('ALL');
              setPageIndex(1);
            }}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        <RewardTable
          items={bonusItems}
          isLoading={isLoadingBonuses}
          isPeriodLocked={isSelectedPeriodLocked}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onView={handleOpenViewSlide}
          onEdit={handleOpenEditSlide}
          onRevoke={handleOpenRevoke}
          onClearFilter={() => {
            setSearch('');
            setSelectedPeriodKey(`${currentMonth}-${currentYear}`);
            setSelectedRole('ALL');
            setSelectedBonusType('ALL');
            setPageIndex(1);
          }}
        />

        <RewardPagination
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

      <RewardDetailSlidePanel
        isOpen={isSlidePanelOpen}
        onClose={() => {
          setIsSlidePanelOpen(false);
          setActiveItem(null);
        }}
        payslip={activeItem}
        periodLabel={periodLabel}
        isPeriodLocked={isSelectedPeriodLocked}
        initialIsEditing={isSlidePanelEditing}
        onSave={handleSaveSlidePanel}
        isSubmitting={updateBonusMutation.isPending}
      />

      <ConfirmDialog
        isOpen={isRevokeOpen}
        onClose={() => {
          setIsRevokeOpen(false);
          setRevokingItem(null);
        }}
        onConfirm={() => {
          if (revokingItem) {
            deleteBonusMutation.mutate(revokingItem.id);
          }
        }}
        title="Thu hồi khoản khen thưởng"
        description={`Bạn có muốn thu hồi mức thưởng của ${revokingItem?.employeeName || revokingItem?.fullName || 'nhân viên này'}?`}
        confirmText="Thu hồi"
        cancelText="Hủy"
        type="danger"
        isLoading={deleteBonusMutation.isPending}
      />
    </div>
  );
}
