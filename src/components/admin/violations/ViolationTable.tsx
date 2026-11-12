'use client';

import React from 'react';
import { Badge, DataTable, EyeViewIcon, TrashBinIcon } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { formatVND } from '@/lib/utils/formatters';
import type { ViolationSummaryItem } from '@/types';

interface ViolationTableProps {
  items: ViolationSummaryItem[];
  isLoading?: boolean;
  pageIndex?: number;
  pageSize?: number;
  onClearFilter?: () => void;
  onView: (item: ViolationSummaryItem) => void;
  onCancel: (item: ViolationSummaryItem) => void;
  isPeriodLocked?: boolean;
}

export function ViolationTable({
  items,
  isLoading = false,
  pageIndex = 1,
  pageSize = 10,
  onClearFilter,
  onView,
  onCancel,
  isPeriodLocked = false,
}: ViolationTableProps) {
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${hours}:${mins} ${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const columns: ColumnDef<ViolationSummaryItem>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: 'w-[5%]',
      render: (_: unknown, idx: number) => (pageIndex - 1) * pageSize + idx + 1,
    },
    {
      key: 'violationCode',
      header: 'Mã biên bản',
      width: 'w-[12%]',
      className: 'whitespace-nowrap',
      render: (item) => (
        <span className="font-semibold text-[13px] text-[#064343]">
          {item.violationCode}
        </span>
      ),
    },
    {
      key: 'employeeName',
      header: 'Nhân viên',
      width: 'w-[17%]',
      truncate: true,
      pr: 'pr-4',
      render: (item) => (
        <div className="flex items-center gap-[10px]">
          <div className="relative w-[28px] h-[28px] rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
            <span className="font-semibold text-xs text-[#064343]">
              {item.employeeName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onView(item)}
            className="text-left font-normal text-[#202939] hover:underline cursor-pointer truncate block w-full"
          >
            {item.employeeName || '—'}
          </button>
        </div>
      ),
    },
    {
      key: 'employeePosition',
      header: 'Chức vụ',
      width: 'w-[11%]',
      className: 'whitespace-nowrap',
      render: (item) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {item.employeePosition === 'TRAINER'
            ? 'Huấn luyện viên'
            : item.employeePosition === 'RECEPTIONIST'
            ? 'Lễ tân'
            : item.employeePosition}
        </span>
      ),
    },
    {
      key: 'ruleName',
      header: 'Quy định vi phạm',
      width: 'w-[16%]',
      truncate: true,
      pr: 'pr-4',
      render: (item) => (
        <span className="text-[14px] font-normal text-[#202939] truncate block" title={item.ruleName}>
          {item.ruleName || item.ruleCode || '—'}
        </span>
      ),
    },
    {
      key: 'occurredAt',
      header: 'Thời gian vi phạm',
      width: 'w-[13%]',
      className: 'whitespace-nowrap',
      render: (item) => (
        <span className="text-[13px] font-normal text-[#475569]">
          {formatDateTime(item.occurredAt)}
        </span>
      ),
    },
    {
      key: 'fineAmount',
      header: 'Tiền phạt',
      width: 'w-[12%]',
      className: 'whitespace-nowrap',
      render: (item) => (
        <span className="font-medium text-[#EE0033]">
          -{formatVND(item.fineAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: 'w-[11%]',
      className: 'whitespace-nowrap',
      render: (item) => {
        const isCancelled = item.status === 'CANCELLED';
        return (
          <Badge
            variant={isCancelled ? 'inactive' : 'active'}
            className="text-[12px] font-medium leading-[16px] px-2.5 py-[3px] rounded-[6px]"
          >
            {isCancelled ? 'Đã hủy' : 'Đang hiệu lực'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: 'w-[8%]',
      headerClassName: 'text-left pl-[15px]',
      render: (item) => {
        const isCancelled = item.status === 'CANCELLED';
        const disabled = isPeriodLocked || isCancelled;

        return (
          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={() => onView(item)}
              title="Xem chi tiết"
              className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#FFB800]/15 transition-colors cursor-pointer"
              aria-label="Xem chi tiết"
            >
              <EyeViewIcon className="w-[18px] h-[18px]" color="#FFB800" />
            </button>

            <button
              type="button"
              onClick={() => onCancel(item)}
              title={disabled ? 'Không thể xóa biên bản' : 'Xóa biên bản vi phạm'}
              disabled={disabled}
              className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#EE464C]/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Xóa biên bản"
            >
              <TrashBinIcon className="w-[18px] h-[18px]" color="#EE464C" />
            </button>
          </div>
        );
      },
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

export default ViolationTable;

