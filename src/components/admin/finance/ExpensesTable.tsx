'use client';

import React from 'react';
import { Badge, DataTable, EyeViewIcon, TrashBinIcon } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { EmptySearchState } from '@/components/shared';
import { formatDate, formatVND } from '@/lib/utils/formatters';
import type { ExpenseSummaryDto } from '@/types/finance';
import { EXPENSE_CATEGORY_LABELS } from './ExpensesToolbar';

interface ExpensesTableProps {
  items: ExpenseSummaryDto[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onClearFilter: () => void;
  onView: (expense: ExpenseSummaryDto) => void;
  onCancel: (expense: ExpenseSummaryDto) => void;
}

export function ExpensesTable({
  items,
  isLoading,
  pageIndex,
  pageSize,
  onClearFilter,
  onView,
  onCancel,
}: ExpensesTableProps) {
  const columns: ColumnDef<ExpenseSummaryDto>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: 'w-[5%]',
      render: (_: unknown, idx: number) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {(pageIndex - 1) * pageSize + idx + 1}
        </span>
      ),
    },
    {
      key: 'expenseCode',
      header: 'Số phiếu chi',
      width: 'w-[13%]',
      className: 'whitespace-nowrap',
      render: (item: ExpenseSummaryDto) => (
        <button
          type="button"
          onClick={() => onView(item)}
          className="text-left font-normal text-[#064343] hover:underline cursor-pointer text-[14px]"
        >
          {item.expenseCode}
        </button>
      ),
    },
    {
      key: 'expenseDate',
      header: 'Ngày chi',
      width: 'w-[10%]',
      className: 'whitespace-nowrap',
      render: (item: ExpenseSummaryDto) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {formatDate(item.expenseDate)}
        </span>
      ),
    },
    {
      key: 'recordedByName',
      header: 'Người lập',
      width: 'w-[15%]',
      truncate: true,
      pr: 'pr-3',
      render: (item: ExpenseSummaryDto) => (
        <div className="flex items-center gap-[10px] min-w-0">
          <div className="relative w-[28px] h-[28px] rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
            <span className="font-normal text-xs text-[#064343]">
              {item.recordedByName?.charAt(0)?.toUpperCase() || 'H'}
            </span>
          </div>
          <span className="text-[14px] font-normal text-[#202939] truncate" title={item.recordedByName || 'Hệ thống'}>
            {item.recordedByName || 'Hệ thống'}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Danh mục chi',
      width: 'w-[14%]',
      className: 'whitespace-nowrap',
      render: (item: ExpenseSummaryDto) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {EXPENSE_CATEGORY_LABELS[item.category] || item.category}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Nội dung chi',
      width: 'w-[18%]',
      truncate: true,
      pr: 'pr-3',
      render: (item: ExpenseSummaryDto) => (
        <span
          className="text-[14px] font-normal text-[#64748B] truncate block"
          title={item.description}
        >
          {item.description}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Số tiền chi',
      width: 'w-[12%]',
      className: 'whitespace-nowrap',
      render: (item: ExpenseSummaryDto) => (
        <span className="font-medium text-[#064343] text-[14px]">
          -{formatVND(item.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: 'w-[8%]',
      className: 'whitespace-nowrap',
      render: (item: ExpenseSummaryDto) => {
        if (item.status === 'CONFIRMED') {
          return (
            <Badge variant="active" className="text-[12px] px-2.5 py-0.5 font-normal">
              Đã chi
            </Badge>
          );
        }
        return (
          <Badge variant="discontinued" className="text-[12px] px-2.5 py-0.5 font-normal">
            Đã hủy
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: 'w-[5%]',
      align: 'right',
      render: (item: ExpenseSummaryDto) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onView(item)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-[#064343] transition-colors cursor-pointer"
            title="Xem chi tiết phiếu chi"
            aria-label="Xem chi tiết"
          >
            <EyeViewIcon className="w-4 h-4" />
          </button>

          {item.status === 'CONFIRMED' && (
            <button
              type="button"
              onClick={() => onCancel(item)}
              className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-[#EE464C] transition-colors cursor-pointer"
              title="Hủy phiếu chi"
              aria-label="Hủy phiếu chi"
            >
              <TrashBinIcon className="w-4 h-4 text-[#EE464C]" color="#EE464C" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        skeletonRowCount={pageSize}
        rowHeightClass="h-[43px]"
        keyExtractor={(item) => item.id}
        emptyState={
          <EmptySearchState
            title="Chưa có dữ liệu phiếu chi nào"
            message="Toàn bộ các phiếu chi phí vận hành phòng tập sẽ hiển thị tại đây."
            onClearFilter={onClearFilter}
          />
        }
      />
    </div>
  );
}

export default ExpensesTable;
