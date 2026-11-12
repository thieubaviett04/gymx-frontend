'use client';

import React from 'react';
import { DataTable } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { formatVND } from '@/lib/utils/formatters';
import type { PayslipSummaryDto } from '@/types/payroll';
import { BASE_RATE_TYPE_LABELS } from '@/types/payroll';

interface AttendanceTableProps {
  items: PayslipSummaryDto[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onClearFilter: () => void;
  onViewPayslip: (payslip: PayslipSummaryDto) => void;
}

export function AttendanceTable({
  items,
  isLoading,
  pageIndex,
  pageSize,
  onClearFilter,
  onViewPayslip,
}: AttendanceTableProps) {
  const columns: ColumnDef<PayslipSummaryDto>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: 'w-[4%]',
      render: (_: unknown, idx: number) => (pageIndex - 1) * pageSize + idx + 1,
    },
    {
      key: 'employeeCode',
      header: 'Mã NV',
      width: 'w-[9%]',
      className: 'whitespace-nowrap',
      render: (item: PayslipSummaryDto) => (
        <button
          type="button"
          onClick={() => onViewPayslip(item)}
          className="text-left font-normal text-[#064343] hover:underline cursor-pointer"
        >
          {item.employeeCode || '—'}
        </button>
      ),
    },
    {
      key: 'employeeName',
      header: 'Họ và tên',
      width: 'w-[16%]',
      truncate: true,
      pr: 'pr-4',
      render: (item: PayslipSummaryDto) => (
        <div className="flex items-center gap-[10px]">
          <div className="relative w-[28px] h-[28px] rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
            <span className="font-semibold text-xs text-[#064343]">
              {item.employeeName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onViewPayslip(item)}
            className="text-left font-normal text-[#202939] hover:underline cursor-pointer truncate block w-full"
          >
            {item.employeeName || '—'}
          </button>
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Chức vụ',
      width: 'w-[11%]',
      className: 'whitespace-nowrap',
      render: (item: PayslipSummaryDto) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {item.position === 'TRAINER' ? 'Huấn luyện viên' : 'Lễ tân'}
        </span>
      ),
    },
    {
      key: 'baseRateType',
      header: 'Hình thức',
      width: 'w-[10%]',
      className: 'whitespace-nowrap',
      render: (item: PayslipSummaryDto) => (
        <span className="text-[14px] font-normal text-[#64748B]">
          {item.baseRateType ? BASE_RATE_TYPE_LABELS[item.baseRateType] : 'Theo tháng'}
        </span>
      ),
    },
    {
      key: 'standardWorkDays',
      header: 'Công chuẩn',
      width: 'w-[9%]',
      className: 'whitespace-nowrap',
      render: (item: PayslipSummaryDto) => (
        <span className="text-[14px] text-[#202939]">
          {item.standardWorkDays && item.standardWorkDays > 0 ? `${item.standardWorkDays} ngày` : '26 ngày'}
        </span>
      ),
    },
    {
      key: 'workedShifts',
      header: 'Công thực tế',
      width: 'w-[10%]',
      className: 'whitespace-nowrap',
      render: (item: PayslipSummaryDto) => {
        if (!item.workedShifts || item.workedShifts <= 0) {
          return <span className="text-[14px] text-[#64748B]">—</span>;
        }
        const isTrainer = item.position === 'TRAINER';
        return (
          <span className="font-medium text-[#064343] text-[14px]">
            {isTrainer ? `${item.workedShifts} công` : `${item.workedShifts} giờ`}
          </span>
        );
      },
    },
    {
      key: 'lateEarly',
      header: 'Trễ / Về sớm',
      width: 'w-[10%]',
      className: 'whitespace-nowrap',
      render: (item: PayslipSummaryDto) => {
        const total = (item.lateCount || 0) + (item.earlyLeaveCount || 0);
        return (
          <span className={`text-[14px] ${total > 0 ? 'text-amber-600 font-medium' : 'text-[#64748B]'}`}>
            {total > 0 ? `${total} lần` : '—'}
          </span>
        );
      },
    },
    {
      key: 'ptSessions',
      header: 'Dạy PT',
      width: 'w-[8%]',
      className: 'whitespace-nowrap',
      render: (item: PayslipSummaryDto) => {
        if (item.position !== 'TRAINER') {
          return <span className="text-[14px] text-[#64748B]">—</span>;
        }
        const count = item.ptSessionsCount ?? item.ptSessions ?? 0;
        return (
          <span className="text-[14px] text-[#202939]">
            {count > 0 ? `${count} buổi` : '—'}
          </span>
        );
      },
    },
    {
      key: 'salesAmount',
      header: 'Doanh số gói',
      width: 'w-[12%]',
      className: 'whitespace-nowrap',
      render: (item: PayslipSummaryDto) => {
        const revenue = item.salesRevenue ?? item.salesAmount ?? 0;
        return (
          <span className="text-[14px] text-[#202939]">
            {revenue > 0 ? formatVND(revenue) : '—'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="w-full">
      <DataTable
        data={items}
        columns={columns}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        onClearFilter={onClearFilter}
        rowHeightClass="h-[43px]"
      />
    </div>
  );
}

export default AttendanceTable;
