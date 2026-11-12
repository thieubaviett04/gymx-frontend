'use client';

import React from 'react';
import { Badge, DataTable, EyeViewIcon } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { formatDate, formatVND } from '@/lib/utils/formatters';
import type { PayrollPeriodSummaryDto } from '@/types/payroll';

interface PeriodListViewProps {
  items: PayrollPeriodSummaryDto[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onClearFilter?: () => void;
  onViewDetail: (period: PayrollPeriodSummaryDto) => void;
}

export function PeriodListView({
  items,
  isLoading,
  pageIndex,
  pageSize,
  onClearFilter,
  onViewDetail,
}: PeriodListViewProps) {
  const columns: ColumnDef<PayrollPeriodSummaryDto>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: 'w-[4%]',
      render: (_: unknown, idx: number) => (pageIndex - 1) * pageSize + idx + 1,
    },
    {
      key: 'period',
      header: 'Kỳ lương',
      width: 'w-[14%]',
      truncate: true,
      pr: 'pr-4',
      render: (item: PayrollPeriodSummaryDto) => {
        const date = new Date(item.periodStart);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return (
          <button
            type="button"
            onClick={() => onViewDetail(item)}
            className="text-left font-medium text-[#064343] hover:underline cursor-pointer truncate block w-full"
          >
            Tháng {month}/{year}
          </button>
        );
      },
    },
    {
      key: 'totalSalary',
      header: 'Tổng lương',
      width: 'w-[16%]',
      className: 'whitespace-nowrap',
      render: (item: PayrollPeriodSummaryDto) => (
        <span className="font-semibold text-[#064343] text-[14px]">
          {item.totalSalary && item.totalSalary > 0 ? formatVND(item.totalSalary) : '—'}
        </span>
      ),
    },
    {
      key: 'totalBonus',
      header: 'Hoa hồng & PT',
      width: 'w-[14%]',
      className: 'whitespace-nowrap',
      render: (item: PayrollPeriodSummaryDto) => {
        const bonus = ((item.totalPtAmount || 0) + (item.totalCommissionAmount || 0)) || item.totalBonus || 0;
        return (
          <span className="text-[14px] font-normal text-[#202939]">
            {bonus > 0 ? formatVND(bonus) : '—'}
          </span>
        );
      },
    },
    {
      key: 'totalPenalty',
      header: 'Khấu trừ phạt',
      width: 'w-[13%]',
      className: 'whitespace-nowrap',
      render: (item: PayrollPeriodSummaryDto) => {
        const penalty = item.totalPenaltyAmount ?? item.totalPenalty ?? 0;
        return (
          <span className={`text-[14px] ${penalty > 0 ? 'text-[#EE0033] font-medium' : 'text-[#64748B]'}`}>
            {penalty > 0 ? `-${formatVND(penalty)}` : '—'}
          </span>
        );
      },
    },
    {
      key: 'totalEmployees',
      header: 'Nhân sự',
      width: 'w-[11%]',
      className: 'whitespace-nowrap',
      render: (item: PayrollPeriodSummaryDto) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {item.totalEmployees && item.totalEmployees > 0 ? `${item.totalEmployees} nhân viên` : '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      width: 'w-[13%]',
      className: 'whitespace-nowrap',
      render: (item: PayrollPeriodSummaryDto) => {
        const rawDate = item.createdAt || item.calculatedAt;
        const formatted = rawDate ? formatDate(rawDate) : '';
        return (
          <span className="text-[14px] font-normal text-[#202939]">
            {formatted || '—'}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: 'w-[9%]',
      className: 'whitespace-nowrap',
      render: (item: PayrollPeriodSummaryDto) => {
        const isConfirmed = item.status === 'CONFIRMED' || item.status === 'LOCKED';
        return (
          <Badge variant={isConfirmed ? 'active' : 'inactive'}>
            {isConfirmed ? 'Đã khóa' : 'Đã tính'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: 'w-[6%]',
      headerClassName: 'text-left pl-[15px]',
      className: 'whitespace-nowrap',
      render: (item: PayrollPeriodSummaryDto) => (
        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => onViewDetail(item)}
            title="Xem chi tiết kỳ lương"
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

export default PeriodListView;
