'use client';

import React from 'react';
import { Badge, DataTable, EyeViewIcon } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { EmptySearchState } from '@/components/shared';
import { formatDate, formatVND } from '@/lib/utils/formatters';
import type { InvoiceSummaryDto } from '@/types/finance';

interface ReceiptsTableProps {
  items: InvoiceSummaryDto[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onClearFilter: () => void;
  onView?: (invoice: InvoiceSummaryDto) => void;
}

export const REFERENCE_TYPE_LABELS: Record<string, string> = {
  PACKAGE: 'Gói tập hội viên',
  PT_SESSION: 'Dịch vụ PT 1:1',
  DAY_TICKET: 'Vé tập theo ngày',
  SERVICE_FEE: 'Phí dịch vụ & Tiện ích',
  OTHER: 'Bán lẻ & Thu khác',
  // Tương thích ngược
  PT_PACKAGE: 'Dịch vụ PT 1:1',
  GENERAL: 'Bán lẻ & Thu khác',
};

export function getReferenceTypeLabel(type?: string | null): string {
  if (!type) return 'Bán lẻ & Thu khác';
  return REFERENCE_TYPE_LABELS[type.toUpperCase()] || type;
}

export function getCustomerDisplayName(item: InvoiceSummaryDto): string {
  if (item.customerName) {
    return item.memberCode ? `${item.customerName} (${item.memberCode})` : item.customerName;
  }
  return item.memberCode ? `Hội viên ${item.memberCode}` : 'Khách vãng lai';
}

export function ReceiptsTable({
  items,
  isLoading,
  pageIndex,
  pageSize,
  onClearFilter,
  onView,
}: ReceiptsTableProps) {
  const columns: ColumnDef<InvoiceSummaryDto>[] = [
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
      key: 'invoiceNumber',
      header: 'Số phiếu thu',
      width: 'w-[13%]',
      className: 'whitespace-nowrap',
      render: (item: InvoiceSummaryDto) => (
        <button
          type="button"
          onClick={() => onView?.(item)}
          className="text-left font-normal text-[#064343] hover:underline cursor-pointer text-[14px]"
        >
          {item.invoiceNumber}
        </button>
      ),
    },
    {
      key: 'date',
      header: 'Ngày thu',
      width: 'w-[10%]',
      className: 'whitespace-nowrap',
      render: (item: InvoiceSummaryDto) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {formatDate(item.paidAt || item.issuedAt)}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Đối tượng',
      width: 'w-[17%]',
      truncate: true,
      pr: 'pr-3',
      render: (item: InvoiceSummaryDto) => {
        const displayName = getCustomerDisplayName(item);
        return (
          <div className="flex items-center gap-[10px] min-w-0">
            <div className="relative w-[28px] h-[28px] rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
              <span className="font-normal text-xs text-[#064343]">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onView?.(item)}
              className="text-left font-normal text-[#202939] hover:underline cursor-pointer truncate block w-full text-[14px]"
              title={displayName}
            >
              {displayName}
            </button>
          </div>
        );
      },
    },
    {
      key: 'referenceType',
      header: 'Nguồn thu',
      width: 'w-[15%]',
      truncate: true,
      pr: 'pr-3',
      render: (item: InvoiceSummaryDto) => (
        <span
          className="text-[14px] font-normal text-[#202939] truncate block"
          title={getReferenceTypeLabel(item.referenceType)}
        >
          {getReferenceTypeLabel(item.referenceType)}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Số tiền thu',
      width: 'w-[13%]',
      className: 'whitespace-nowrap',
      render: (item: InvoiceSummaryDto) => (
        <span className="font-medium text-[#064343] text-[14px]">
          +{formatVND(item.totalAmount)}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Phương thức',
      width: 'w-[11%]',
      className: 'whitespace-nowrap',
      render: (item: InvoiceSummaryDto) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {item.paymentMethod || 'Tiền mặt'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: 'w-[11%]',
      className: 'whitespace-nowrap',
      render: (item: InvoiceSummaryDto) => {
        if (item.status === 'PAID') {
          return (
            <Badge variant="active" className="text-[12px] px-2.5 py-0.5 font-normal">
              Đã thu tiền
            </Badge>
          );
        }
        if (item.status === 'PENDING') {
          return (
            <Badge variant="upcoming" className="text-[12px] px-2.5 py-0.5 font-normal">
              Chờ thanh toán
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
      render: (item: InvoiceSummaryDto) => (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => onView?.(item)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-[#064343] transition-colors cursor-pointer"
            title="Xem chi tiết phiếu thu"
            aria-label="Xem chi tiết"
          >
            <EyeViewIcon className="w-4 h-4" />
          </button>
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
            title="Chưa có dữ liệu phiếu thu nào"
            message="Toàn bộ các khoản thu từ hóa đơn và gói tập sẽ được hiển thị tại đây."
            onClearFilter={onClearFilter}
          />
        }
      />
    </div>
  );
}

export default ReceiptsTable;
