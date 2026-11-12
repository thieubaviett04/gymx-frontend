'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, ConfirmDialog } from '@/components/ui';
import { payrollPeriodService } from '@/lib/api';
import { parsePayrollPeriodBackendError } from '@/lib/utils/error-helper';
import { ConnectionErrorState } from '@/components/shared';
import type {
  PayrollPeriodDetailDto,
  PayrollPeriodStatus,
  PayrollPeriodSummaryDto,
  PayslipSummaryDto,
  TargetRole,
} from '@/types/payroll';
import {
  PayrollTopBar,
  AttendanceToolbar,
  AttendanceTable,
  PeriodToolbar,
  PeriodListView,
  PeriodDetailView,
  PayslipDetailModal,
  PayrollPagination,
} from '@/components/admin/payroll/periods';

export default function AdminPayrollPage() {
  const queryClient = useQueryClient();
  const today = new Date();

  const [activeTab, setActiveTab] = useState<'attendance' | 'periods'>('attendance');
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [search, setSearch] = useState('');
  const [role, setRole] = useState<TargetRole | 'ALL'>('ALL');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [periodSearch, setPeriodSearch] = useState('');
  const [periodYear, setPeriodYear] = useState(today.getFullYear());
  const [periodStatusFilter, setPeriodStatusFilter] = useState<PayrollPeriodStatus | 'ALL'>('ALL');
  const [periodPageIndex, setPeriodPageIndex] = useState(1);
  const [periodPageSize, setPeriodPageSize] = useState(10);

  const [selectedPeriodDetail, setSelectedPeriodDetail] = useState<PayrollPeriodDetailDto | null>(null);
  const [activePayslip, setActivePayslip] = useState<PayslipSummaryDto | null>(null);
  const [isLockConfirmOpen, setIsLockConfirmOpen] = useState(false);
  const [isCalculateConfirmOpen, setIsCalculateConfirmOpen] = useState(false);

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

  const {
    data: periodsData,
    isLoading: isLoadingPeriods,
    isError: isErrorPeriods,
    refetch: refetchPeriods,
  } = useQuery({
    queryKey: ['admin-payroll-periods', { year: periodYear, status: periodStatusFilter, pageIndex: periodPageIndex, pageSize: periodPageSize }],
    queryFn: async () => {
      const res = await payrollPeriodService.getPeriods({
        year: periodYear,
        status: periodStatusFilter !== 'ALL' ? periodStatusFilter : undefined,
        pageIndex: periodPageIndex,
        pageSize: periodPageSize,
      });
      return res.data;
    },
  });

  const {
    data: currentPeriodDetail,
    isLoading: isLoadingCurrentPeriod,
    refetch: refetchCurrentPeriod,
  } = useQuery({
    queryKey: ['admin-payroll-current-month', { month: selectedMonth, year: selectedYear }],
    queryFn: async () => {
      const periods = periodsData?.items || [];
      const matched = periods.find((p) => {
        const d = new Date(p.periodStart);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      });
      if (!matched) return null;
      const res = await payrollPeriodService.getPeriodById(matched.id);
      return res.data;
    },
    enabled: Boolean(periodsData?.items),
  });

  const calculateMutation = useMutation({
    mutationFn: (payload: { month: number; year: number }) =>
      payrollPeriodService.calculate(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-payroll-periods'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payroll-current-month'] });
      showToast('success', `Đã tạo bảng lương Tháng ${selectedMonth}/${selectedYear} thành công.`);
      setIsCalculateConfirmOpen(false);
      if (res?.data) {
        setSelectedPeriodDetail(res.data);
        setActiveTab('periods');
      }
    },
    onError: (err) => {
      const { generalError } = parsePayrollPeriodBackendError(err);
      showToast('error', generalError);
      setIsCalculateConfirmOpen(false);
    },
  });

  const lockMutation = useMutation({
    mutationFn: (id: string) => payrollPeriodService.lockPeriod(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-payroll-periods'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payroll-current-month'] });
      showToast('success', 'Đã khóa kỳ lương và đóng sổ kế toán thành công.');
      setIsLockConfirmOpen(false);
      if (res?.data) {
        setSelectedPeriodDetail(res.data);
      }
    },
    onError: (err) => {
      const { generalError } = parsePayrollPeriodBackendError(err);
      showToast('error', generalError);
      setIsLockConfirmOpen(false);
    },
  });

  const handleExportExcel = () => {
    showToast('success', 'Đang tạo và tải tệp Excel dữ liệu...');
  };

  const handleViewPeriodDetail = async (periodSummary: PayrollPeriodSummaryDto) => {
    try {
      const res = await payrollPeriodService.getPeriodById(periodSummary.id);
      setSelectedPeriodDetail(res.data);
      setActiveTab('periods');
    } catch {
      showToast('error', 'Không thể tải chi tiết kỳ lương.');
    }
  };

  const activePeriod = selectedPeriodDetail || currentPeriodDetail;
  const currentPeriodStatus = activePeriod?.status || null;

  const filteredAttendanceItems = (currentPeriodDetail?.payslips || []).filter((item) => {
    const matchSearch = search.trim()
      ? item.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        item.employeeCode.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchRole = role !== 'ALL' ? item.position === role : true;
    return matchSearch && matchRole;
  });

  const filteredPeriodItems = useMemo(() => {
    const items = periodsData?.items || [];
    const term = periodSearch.trim().toLowerCase();
    return items.filter((p) => {
      const date = new Date(p.periodStart);
      const label = `tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
      const matchSearch = !term
        ? true
        : label.includes(term) ||
          (p.salaryFormulaName && p.salaryFormulaName.toLowerCase().includes(term));
      const matchStatus = periodStatusFilter === 'ALL'
        ? true
        : periodStatusFilter === 'CONFIRMED' || periodStatusFilter === 'LOCKED'
        ? p.status === 'CONFIRMED' || p.status === 'LOCKED'
        : p.status === periodStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [periodsData?.items, periodSearch, periodStatusFilter]);

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

      <PayrollTopBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedPeriodDetail(null);
        }}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        periodStatus={currentPeriodStatus}
        isCalculating={calculateMutation.isPending}
        isLocking={lockMutation.isPending}
        onCalculate={() => setIsCalculateConfirmOpen(true)}
        onLockPeriod={() => setIsLockConfirmOpen(true)}
        onExportExcel={handleExportExcel}
        onViewPeriodDetail={() => {
          if (currentPeriodDetail) {
            setSelectedPeriodDetail(currentPeriodDetail);
            setActiveTab('periods');
          }
        }}
        isInDetailMode={Boolean(selectedPeriodDetail)}
      />

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-4 pb-5 sm:pt-5 sm:pb-6 shadow-xs flex-1 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-6 flex-1 flex flex-col">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1 shrink-0">
                <div>
                  <div className="flex items-center">
                    <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
                      Bảng chấm công
                    </h2>
                  </div>
                  <p className="text-[13px] text-[#64748B] mt-1.5 font-normal">
                    Dữ liệu giờ công, ca trực, buổi dạy PT và khấu trừ vi phạm thực tế trong tháng
                  </p>
                </div>

                <AttendanceToolbar
                  month={selectedMonth}
                  year={selectedYear}
                  onMonthChange={(m) => setSelectedMonth(m)}
                  onYearChange={(y) => setSelectedYear(y)}
                  search={search}
                  onSearchChange={(s) => {
                    setSearch(s);
                    setPageIndex(1);
                  }}
                  role={role}
                  onRoleChange={(r) => {
                    setRole(r);
                    setPageIndex(1);
                  }}
                />
              </div>

              <div className="flex-1 flex flex-col">
                <AttendanceTable
                  items={filteredAttendanceItems}
                  isLoading={isLoadingCurrentPeriod}
                  pageIndex={pageIndex}
                  pageSize={pageSize}
                  onClearFilter={() => {
                    setSearch('');
                    setRole('ALL');
                    setPageIndex(1);
                  }}
                  onViewPayslip={(payslip) => setActivePayslip(payslip)}
                />
              </div>
            </div>

            <PayrollPagination
              pageIndex={pageIndex}
              pageSize={pageSize}
              totalCount={filteredAttendanceItems.length}
              totalPages={Math.ceil(filteredAttendanceItems.length / pageSize) || 1}
              hasPreviousPage={pageIndex > 1}
              hasNextPage={pageIndex * pageSize < filteredAttendanceItems.length}
              onPageChange={(p) => setPageIndex(p)}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setPageIndex(1);
              }}
              itemUnit="nhân viên"
            />
          </div>
        </div>
      )}

      {activeTab === 'periods' && selectedPeriodDetail ? (
        <PeriodDetailView
          period={selectedPeriodDetail}
          onBack={() => setSelectedPeriodDetail(null)}
          onLockPeriod={() => setIsLockConfirmOpen(true)}
          onExportExcel={handleExportExcel}
          onViewPayslip={(payslip) => setActivePayslip(payslip)}
          isLocking={lockMutation.isPending}
        />
      ) : activeTab === 'periods' && (
        <div className="bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-4 pb-5 sm:pt-5 sm:pb-6 shadow-xs flex-1 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />

          {isErrorPeriods ? (
            <ConnectionErrorState onRetry={() => refetchPeriods()} />
          ) : (
            <div className="flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1 shrink-0">
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
                        Danh sách các kỳ tính lương
                      </h2>
                    </div>
                    <p className="text-[13px] text-[#64748B] mt-1.5 font-normal">
                      Lịch sử các kỳ tính lương, tổng quỹ lương thực chi và trạng thái khóa sổ kế toán
                    </p>
                  </div>

                  <PeriodToolbar
                    search={periodSearch}
                    onSearchChange={(val) => {
                      setPeriodSearch(val);
                      setPeriodPageIndex(1);
                    }}
                    year={periodYear}
                    onYearChange={(y) => {
                      setPeriodYear(y);
                      setPeriodPageIndex(1);
                    }}
                    status={periodStatusFilter}
                    onStatusChange={(st) => {
                      setPeriodStatusFilter(st);
                      setPeriodPageIndex(1);
                    }}
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <PeriodListView
                    items={filteredPeriodItems}
                    isLoading={isLoadingPeriods}
                    pageIndex={periodPageIndex}
                    pageSize={periodPageSize}
                    onClearFilter={() => {
                      setPeriodSearch('');
                      setPeriodStatusFilter('ALL');
                      setPeriodPageIndex(1);
                    }}
                    onViewDetail={handleViewPeriodDetail}
                  />
                </div>
              </div>

              <PayrollPagination
                pageIndex={periodPageIndex}
                pageSize={periodPageSize}
                totalCount={periodsData?.totalCount || filteredPeriodItems.length}
                totalPages={periodsData?.totalPages || Math.ceil(filteredPeriodItems.length / periodPageSize) || 1}
                hasPreviousPage={periodPageIndex > 1}
                hasNextPage={periodPageIndex * periodPageSize < (periodsData?.totalCount || filteredPeriodItems.length)}
                onPageChange={(p) => setPeriodPageIndex(p)}
                onPageSizeChange={(sz) => {
                  setPeriodPageSize(sz);
                  setPeriodPageIndex(1);
                }}
                itemUnit="kỳ lương"
              />
            </div>
          )}
        </div>
      )}

      <PayslipDetailModal
        isOpen={Boolean(activePayslip)}
        onClose={() => setActivePayslip(null)}
        payslip={activePayslip}
        periodMonth={selectedMonth}
        periodYear={selectedYear}
      />

      <ConfirmDialog
        isOpen={isCalculateConfirmOpen}
        size="md"
        type="warning"
        onClose={() => setIsCalculateConfirmOpen(false)}
        onConfirm={() => {
          calculateMutation.mutate({
            month: selectedMonth,
            year: selectedYear,
          });
        }}
        title="Xác nhận tính toán bảng lương?"
        description={`Hệ thống sẽ tổng hợp số liệu chấm công, buổi dạy PT, hoa hồng và phạt của Tháng ${selectedMonth}/${selectedYear} để lập bảng lương. Bạn có chắc chắn muốn thực hiện?`}
        confirmText="Xác nhận tính"
        cancelText="Hủy bỏ"
        isLoading={calculateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={isLockConfirmOpen}
        size="md"
        type="warning"
        onClose={() => setIsLockConfirmOpen(false)}
        onConfirm={() => {
          if (activePeriod) {
            lockMutation.mutate(activePeriod.id);
          }
        }}
        title="Xác nhận khóa kỳ lương vĩnh viễn?"
        description={`Sau khi khóa kỳ lương Tháng ${selectedMonth}/${selectedYear}, bảng lương sẽ được chốt cố định để chi trả và KHÔNG THỂ chỉnh sửa hay tính lại. Toàn bộ biên bản phạt vi phạm trong kỳ cũng sẽ bị khóa vĩnh viễn. Bạn có chắc chắn muốn khóa sổ?`}
        confirmText="Xác nhận khóa"
        cancelText="Hủy bỏ"
        isLoading={lockMutation.isPending}
      />
    </div>
  );
}
