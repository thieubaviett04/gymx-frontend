'use client';

import React from 'react';
import { DataTable, EditPencilIcon, EyeViewIcon, TrashBinIcon } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { formatVND } from '@/lib/utils/formatters';
import type { PayslipSummaryDto } from '@/types/payroll';
import type { PayrollBonusItem } from '@/types/payrollBonus';

export type RewardTableRecord = PayrollBonusItem | PayslipSummaryDto | any;

interface RewardTableProps {
  items: RewardTableRecord[];
  isLoading: boolean;
  isPeriodLocked: boolean;
  pageIndex: number;
  pageSize: number;
  onView: (item: RewardTableRecord) => void;
  onEdit: (item: RewardTableRecord) => void;
  onRevoke: (item: RewardTableRecord) => void;
  onClearFilter?: () => void;
}

export function RewardTable({
  items,
  isLoading,
  isPeriodLocked,
  pageIndex,
  pageSize,
  onView,
  onEdit,
  onRevoke,
  onClearFilter,
}: RewardTableProps) {
  const columns: ColumnDef<RewardTableRecord>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: 'w-[5%]',
      render: (_, idx) => (pageIndex - 1) * pageSize + idx + 1,
    },
    {
      key: 'employeeCode',
      header: 'Mã NV',
      width: 'w-[10%]',
      className: 'whitespace-nowrap font-medium text-[#064343]',
      render: (item) => item.employeeCode,
    },
    {
      key: 'employeeName',
      header: 'Họ và tên',
      width: 'w-[18%]',
      truncate: true,
      pr: 'pr-4',
      render: (item) => (
        <button
          type="button"
          onClick={() => onView(item)}
          className="text-left font-normal text-[#202939] hover:underline cursor-pointer truncate block w-full"
        >
          {item.employeeName || item.fullName || '—'}
        </button>
      ),
    },
    {
      key: 'position',
      header: 'Vai trò',
      width: 'w-[13%]',
      className: 'whitespace-nowrap',
      render: (item) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {item.position === 'TRAINER'
            ? 'Huấn luyện viên'
            : item.position === 'RECEPTIONIST'
            ? 'Lễ tân'
            : item.position}
        </span>
      ),
    },
    {
      key: 'bonusType',
      header: 'Hình thức thưởng',
      width: 'w-[15%]',
      className: 'whitespace-nowrap',
      render: (item) => {
        const typeText =
          item.bonusType === 'KPI'
            ? 'Thưởng KPI'
            : item.bonusType === 'HOLIDAY'
            ? 'Thưởng lễ tết'
            : item.bonusType || '—';
        return (
          <span className="font-normal text-[#202939]">
            {typeText}
          </span>
        );
      },
    },
    {
      key: 'amount',
      header: 'Tiền thưởng',
      width: 'w-[13%]',
      className: 'whitespace-nowrap',
      render: (item) => {
        const bonus = item.amount ?? item.kpiBonusAmount ?? item.kpiBonus ?? 0;
        return bonus > 0 ? (
          <span className="font-medium text-[#064343]">+{formatVND(bonus)}</span>
        ) : (
          <span className="text-[#94A3B8]">0 ₫</span>
        );
      },
    },
    {
      key: 'reason',
      header: 'Nội dung',
      width: 'w-[16%]',
      truncate: true,
      pr: 'pr-4',
      render: (item) => {
        const text = item.reason || item.note || '—';
        return (
          <span className="text-[14px] font-normal text-[#475569] truncate block" title={text}>
            {text}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: 'w-[10%]',
      headerClassName: 'text-left pl-[15px]',
      render: (item) => {
        const bonusAmount = item.amount ?? item.kpiBonusAmount ?? item.kpiBonus ?? 0;
        const hasBonus = bonusAmount > 0;
        const itemLocked =
          isPeriodLocked ||
          item.payrollPeriodStatus === 'CONFIRMED' ||
          item.payrollPeriodStatus === 'LOCKED';

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
              onClick={() => onEdit(item)}
              disabled={itemLocked}
              title="Chỉnh sửa khen thưởng"
              className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#064343]/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Chỉnh sửa"
            >
              <EditPencilIcon className="w-[18px] h-[18px]" color="#064343" />
            </button>

            {hasBonus && (
              <button
                type="button"
                onClick={() => onRevoke(item)}
                disabled={itemLocked}
                title="Thu hồi khen thưởng"
                className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#EE464C]/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Thu hồi"
              >
                <TrashBinIcon className="w-[18px] h-[18px]" color="#EE464C" />
              </button>
            )}
          </div>
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

export default RewardTable;
