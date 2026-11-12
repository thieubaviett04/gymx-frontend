'use client';

import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, TrashBinIcon } from '@/components/ui';
import { formatDate, formatVND } from '@/lib/utils/formatters';
import type { PayrollPeriodDetailDto, PayslipSummaryDto, TargetRole } from '@/types/payroll';
import { TARGET_ROLE_LABELS } from '@/types/payroll';
import { PeriodDetailTable } from './PeriodDetailTable';
import { PayrollPagination } from './PayrollPagination';

interface PeriodDetailViewProps {
  period: PayrollPeriodDetailDto;
  onBack?: () => void;
  onLockPeriod?: () => void;
  onExportExcel?: () => void;
  onViewPayslip: (payslip: PayslipSummaryDto) => void;
  isLocking?: boolean;
}

export function PeriodDetailView({
  period,
  onViewPayslip,
}: PeriodDetailViewProps) {
  const isConfirmed = period.status === 'CONFIRMED' || period.status === 'LOCKED';
  const startDate = new Date(period.periodStart);
  const month = startDate.getMonth() + 1;
  const year = startDate.getFullYear();

  const [search, setSearch] = useState('');
  const [role, setRole] = useState<TargetRole | 'ALL'>('ALL');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPtAmount = period.totalPtAmount ?? period.payslips.reduce((sum, p) => sum + (p.ptTeachingAmount || 0), 0);
  const totalCommissionAmount = period.totalCommissionAmount ?? period.payslips.reduce((sum, p) => sum + (p.commissionAmount || 0), 0);
  const totalPenaltyAmount = period.totalPenaltyAmount ?? period.totalPenalty ?? period.payslips.reduce((sum, p) => sum + (p.penaltyAmount || 0), 0);
  const totalNet = period.totalSalary || period.payslips.reduce((sum, p) => sum + (p.totalSalary || 0), 0);

  const periodCode = `BL${month < 10 ? '0' + month : month}${year}`;
  const calculatorName = period.confirmedByName || period.lockedBy || 'Admin GymFitness';
  const calculatedDate = period.calculatedAt
    ? formatDate(period.calculatedAt)
    : `01/${month < 10 ? '0' + month : month}/${year}`;
  const totalEmployees = period.totalEmployees || period.payslips.length;

  const filteredPayslips = useMemo(() => {
    return period.payslips.filter((item) => {
      const matchSearch = search.trim()
        ? item.employeeName.toLowerCase().includes(search.toLowerCase()) ||
          item.employeeCode.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchRole = role !== 'ALL' ? item.position === role : true;
      return matchSearch && matchRole;
    });
  }, [period.payslips, search, role]);

  const paginatedPayslips = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredPayslips.slice(start, start + pageSize);
  }, [filteredPayslips, pageIndex, pageSize]);

  const hasFilter = Boolean(search || role !== 'ALL');

  const handleClearFilter = () => {
    setSearch('');
    setRole('ALL');
    setPageIndex(1);
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-6">
      <div className="w-full bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-4 pb-5 sm:pt-5 sm:pb-6 shadow-xs space-y-5 relative overflow-hidden shrink-0">
        <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div className="flex items-center">
            <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              Chi tiết bảng lương
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-[#64748B]">Trạng thái:</span>
            <Badge variant={isConfirmed ? 'active' : 'inactive'}>
              {isConfirmed ? 'Đã khóa' : 'Đã tính'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5 pt-1">
          <div className="flex flex-col gap-1">
            <span className="text-[14px] font-medium text-[#697586]">Mã bảng lương</span>
            <span className="text-[14px] font-medium text-[#202939]">{periodCode || '—'}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[14px] font-medium text-[#697586]">Người tính</span>
            <span className="text-[14px] font-medium text-[#202939]">{calculatorName || '—'}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[14px] font-medium text-[#697586]">Ngày tính</span>
            <span className="text-[14px] font-medium text-[#011010]">{calculatedDate || '—'}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[14px] font-medium text-[#697586]">Tổng nhân viên</span>
            <span className="text-[14px] font-medium text-[#011010]">{totalEmployees && totalEmployees > 0 ? `${totalEmployees} nhân sự` : '—'}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[14px] font-medium text-[#697586]">Tổng lương</span>
            <span className="text-[14px] font-semibold text-[#064343]">{totalNet > 0 ? formatVND(totalNet) : '—'}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[14px] font-medium text-[#697586]">Thù lao dạy PT</span>
            <span className="text-[14px] font-semibold text-[#064343]">{totalPtAmount > 0 ? formatVND(totalPtAmount) : '—'}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[14px] font-medium text-[#697586]">Hoa hồng bán gói</span>
            <span className="text-[14px] font-semibold text-[#064343]">{totalCommissionAmount > 0 ? formatVND(totalCommissionAmount) : '—'}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[14px] font-medium text-[#697586]">Khấu trừ vi phạm</span>
            <span className="text-[14px] font-semibold text-[#EF4444]">{totalPenaltyAmount > 0 ? `-${formatVND(totalPenaltyAmount)}` : '—'}</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-4 pb-5 sm:pt-5 sm:pb-6 shadow-xs flex-1 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />

        <div className="flex-1 flex flex-col justify-between space-y-6">
          <div className="space-y-6 flex-1 flex flex-col">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1 shrink-0">
              <div>
                <div className="flex items-center">
                  <h3 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
                    Nhân viên nhận lương
                  </h3>
                </div>
                <p className="text-[13px] text-[#64748B] mt-1.5 font-normal">
                  Chi tiết các khoản lương cứng, ngày công, thù lao PT, hoa hồng và tiền phạt của từng nhân sự
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-[240px] md:w-[280px] lg:w-[300px] h-[48px] px-3.5 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center transition-all focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343] shrink-0">
                  <Search className="w-4 h-4 text-[#697586] mr-2.5 shrink-0 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPageIndex(1);
                    }}
                    placeholder="Tìm theo tên hoặc mã NV..."
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setPageIndex(1);
                      }}
                      className="text-[#697586] hover:text-[#202939] p-0.5 cursor-pointer ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="w-full sm:w-[170px] shrink-0">
                  <Select
                    value={role}
                    onValueChange={(val) => {
                      setRole(val as TargetRole | 'ALL');
                      setPageIndex(1);
                    }}
                  >
                    <SelectTrigger className="h-[48px] w-full rounded-[8px] bg-slate-50 px-3.5 text-[14px] text-[#202939] border-slate-200 shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
                      <SelectValue placeholder="Chức vụ" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[180px]">
                      <SelectItem value="ALL" className="text-[14px] py-2 cursor-pointer">
                        Tất cả chức vụ
                      </SelectItem>
                      <SelectItem value="TRAINER" className="text-[14px] py-2 cursor-pointer">
                        {TARGET_ROLE_LABELS.TRAINER}
                      </SelectItem>
                      <SelectItem value="RECEPTIONIST" className="text-[14px] py-2 cursor-pointer">
                        {TARGET_ROLE_LABELS.RECEPTIONIST}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasFilter && (
                  <button
                    type="button"
                    onClick={handleClearFilter}
                    className="h-[48px] px-5 min-w-[130px] bg-white border border-[#E2E8F0] active:scale-[0.98] text-[14px] font-normal leading-[20px] text-[#EE464C] rounded-[8px] shadow-2xs transition-transform flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    title="Xóa bộ lọc"
                  >
                    <TrashBinIcon className="w-4 h-4 text-[#EE464C]" color="#EE464C" />
                    <span>Xóa bộ lọc</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <PeriodDetailTable
                items={paginatedPayslips}
                pageIndex={pageIndex}
                pageSize={pageSize}
                onClearFilter={handleClearFilter}
                onViewPayslip={onViewPayslip}
              />
            </div>
          </div>

          {filteredPayslips.length > 0 && (
            <PayrollPagination
              pageIndex={pageIndex}
              pageSize={pageSize}
              totalCount={filteredPayslips.length}
              totalPages={Math.ceil(filteredPayslips.length / pageSize) || 1}
              hasPreviousPage={pageIndex > 1}
              hasNextPage={pageIndex * pageSize < filteredPayslips.length}
              onPageChange={(p) => setPageIndex(p)}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setPageIndex(1);
              }}
              itemUnit="nhân sự"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PeriodDetailView;
