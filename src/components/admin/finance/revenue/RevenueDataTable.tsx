'use client';

import React, { useMemo } from 'react';
import { DataTable } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { formatVND } from '@/lib/utils/formatters';
import type { RevenueSlotDto } from '@/types/revenue';

interface RevenueDataTableProps {
  slots: RevenueSlotDto[];
  isLoading?: boolean;
}

function formatSlotDisplayLabel(raw: string) {
  if (raw.includes('-') && raw.length === 10) {
    const parts = raw.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return raw;
}

export function RevenueDataTable({
  slots,
  isLoading = false,
}: RevenueDataTableProps) {
  const columns: ColumnDef<RevenueSlotDto>[] = useMemo(
    () => [
      {
        key: 'stt',
        header: 'STT',
        width: 'w-[6%]',
        render: (_: unknown, idx: number) => (
          <span className="text-[14px] font-normal text-[#202939]">
            {idx + 1}
          </span>
        ),
      },
      {
        key: 'label',
        header: 'Mốc thời gian',
        width: 'w-[18%]',
        className: 'whitespace-nowrap',
        render: (item: RevenueSlotDto) => (
          <span className="text-[14px] font-normal text-[#202939]">
            {formatSlotDisplayLabel(item.label)}
          </span>
        ),
      },
      {
        key: 'transactions',
        header: 'Lượt giao dịch',
        width: 'w-[14%]',
        className: 'whitespace-nowrap',
        render: (item: RevenueSlotDto) => (
          <span className="text-[14px] font-normal text-[#202939]">
            {item.transactions} lượt
          </span>
        ),
      },
      {
        key: 'revenue',
        header: 'Doanh thu',
        width: 'w-[18%]',
        className: 'whitespace-nowrap',
        render: (item: RevenueSlotDto) => (
          <span className="text-[14px] font-normal text-[#202939] tabular-nums">
            {formatVND(item.revenue)}
          </span>
        ),
      },
      {
        key: 'expense',
        header: 'Chi phí',
        width: 'w-[14%]',
        className: 'whitespace-nowrap',
        render: (item: RevenueSlotDto) => (
          <span className="text-[14px] font-normal text-[#64748B] tabular-nums">
            {formatVND(item.expense)}
          </span>
        ),
      },
      {
        key: 'profit',
        header: 'Lợi nhuận ròng',
        width: 'w-[18%]',
        className: 'whitespace-nowrap',
        render: (item: RevenueSlotDto) => (
          <span
            className={`text-[14px] font-bold tabular-nums ${
              item.profit >= 0 ? 'text-[#064343]' : 'text-[#EF4444]'
            }`}
          >
            {formatVND(item.profit)}
          </span>
        ),
      },
      {
        key: 'percentage',
        header: 'Tỷ trọng',
        width: 'w-[12%]',
        className: 'whitespace-nowrap',
        render: (item: RevenueSlotDto) => (
          <span className="text-[14px] font-normal text-[#64748B] tabular-nums">
            {item.percentage}%
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="w-full bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-5 pb-6 shadow-xs relative overflow-hidden flex flex-col space-y-5">
      <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <div className="flex items-center">
            <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              Bảng thống kê chi tiết theo mốc thời gian
            </h2>
          </div>
          <p className="text-[13px] text-[#64748B] mt-1.5 font-normal">
            Chi tiết doanh thu, chi phí, lợi nhuận ròng và tỷ trọng từng kỳ
          </p>
        </div>

        <div className="text-[13px] text-[#64748B] shrink-0">
          Tổng cộng: <span className="font-semibold text-[#202939]">{slots.length}</span> mốc ghi nhận
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <DataTable
          columns={columns}
          data={slots}
          isLoading={isLoading}
          keyExtractor={(item) => item.label}
          rowHeightClass="h-[46px]"
        />
      </div>
    </div>
  );
}

export default RevenueDataTable;