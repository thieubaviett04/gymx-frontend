'use client';

import React from 'react';
import { DataTable, EyeViewIcon } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { formatVND } from '@/lib/utils/formatters';
import type { PayslipSummaryDto } from '@/types/payroll';

interface PeriodDetailTableProps {
  items: PayslipSummaryDto[];
  isLoading?: boolean;
  pageIndex?: number;
  pageSize?: number;
  onClearFilter?: () => void;
  onViewPayslip: (payslip: PayslipSummaryDto) => void;
}

export function PeriodDetailTable({
  items,
  isLoading = false,
  pageIndex = 1,
  pageSize = 10,
  onClearFilter,
  onViewPayslip,
}: PeriodDetailTableProps) {
  const columns: ColumnDef<PayslipSummaryDto>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: 'w-[5%]',
      render: (_: unknown, idx: number) => (pageIndex - 1) * pageSize + idx + 1,
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
          <span className="text-[14px] text-[#202939]">
            {isTrainer ? `${item.workedShifts} công` : `${item.workedShifts} giờ`}
          </span>
        );
      },
    },
    {
      key: 'baseSalary',
      header: 'Lương cứng',
      width: 'w-[11%]',
      className: 'whitespace-nowrap',
      render: (item: PayslipSummaryDto) => (
        <span className="text-[14px] text-[#202939]">
          {item.baseSalary && item.baseSalary > 0 ? formatVND(item.baseSalary) : '—'}
        </span>
      ),
    },
    {
      key: 'remunerationAndCommission',
      header: 'Thù lao & Hoa hồng',
      width: 'w-[14%]',
      className: 'whitespace-nowrap',
      render: (item: PayslipSummaryDto) => {
        const pt = item.ptTeachingAmount ?? 0;
        const comm = item.commissionAmount ?? 0;
        const total = pt + comm;
        return (
          <span className="text-[14px] text-[#202939]">
            {total > 0 ? formatVND(total) : '—'}
          </span>
        );
      },
    },
    {
      key: 'bonus',
      header: 'Thưởng',
      width: 'w-[11%]',
      className: 'whitespace-nowrap',
      render: (item: PayslipSummaryDto) => {
        const pt = item.ptTeachingAmount ?? 0;
        const comm = item.commissionAmount ?? 0;
        const kpi = item.kpiBonusAmount ?? (item as any).kpiBonus ?? 0;
        const diff = Math.max(0, (item.bonusAmount ?? 0) - (pt + comm));
        const bonus = kpi > 0 ? kpi : diff;
        return (
          <span className={`text-[14px] ${bonus > 0 ? 'text-[#064343] font-medium' : 'text-[#64748B]'}`}>
            {bonus > 0 ? `+${formatVND(bonus)}` : '—'}
          </span>
        );
      },
    },
    {
      key: 'penaltyAmount',
      header: 'Khấu trừ phạt',
      width: 'w-[10%]',
      className: 'whitespace-nowrap',
      render: (item: PayslipSummaryDto) => (
        <span className={`text-[14px] ${item.penaltyAmount && item.penaltyAmount > 0 ? 'text-[#EE0033] font-medium' : 'text-[#64748B]'}`}>
          {item.penaltyAmount && item.penaltyAmount > 0 ? `-${formatVND(item.penaltyAmount)}` : '—'}
        </span>
      ),
    },
    {
      key: 'totalSalary',
      header: 'Thực nhận',
      width: 'w-[12%]',
      className: 'whitespace-nowrap',
      render: (item: PayslipSummaryDto) => (
        <span className="font-semibold text-[#064343] text-[14px]">
          {item.totalSalary && item.totalSalary > 0 ? formatVND(item.totalSalary) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: 'w-[7%]',
      headerClassName: 'text-left pl-[15px]',
      className: 'whitespace-nowrap',
      render: (item: PayslipSummaryDto) => (
        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => onViewPayslip(item)}
            title="Xem chi tiết phiếu lương"
            className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#FFB800]/15 transition-colors cursor-pointer"
            aria-label="Xem chi tiết"
          >
            <EyeViewIcon className="w-[18px] h-[18px]" color="#FFB800" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full flex-1 flex flex-col">
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

export default PeriodDetailTable;
