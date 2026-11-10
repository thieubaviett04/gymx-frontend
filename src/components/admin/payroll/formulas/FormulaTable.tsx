'use client';

import React from 'react';
import { Power } from 'lucide-react';
import { Badge, DataTable, EditPencilIcon, EyeViewIcon } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { formatDate, formatVND } from '@/lib/utils/formatters';
import type { SalaryFormulaDto } from '@/types/payroll';
import {
  TARGET_ROLE_LABELS,
  BASE_RATE_TYPE_UNITS,
  BASE_RATE_TYPE_LABELS,
  FORMULA_STATUS_LABELS,
} from '@/types/payroll';

interface FormulaTableProps {
  items: SalaryFormulaDto[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onView: (formula: SalaryFormulaDto) => void;
  onEdit: (formula: SalaryFormulaDto) => void;
  onToggleStatus: (formula: SalaryFormulaDto) => void;
  onClearFilter?: () => void;
}

export function FormulaTable({
  items,
  isLoading,
  pageIndex,
  pageSize,
  onView,
  onEdit,
  onToggleStatus,
  onClearFilter,
}: FormulaTableProps) {
  const columns: ColumnDef<SalaryFormulaDto>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: 'w-[4%]',
      render: (_, idx) => (pageIndex - 1) * pageSize + idx + 1,
    },
    {
      key: 'name',
      header: 'Tên công thức',
      width: 'w-[20%]',
      truncate: true,
      pr: 'pr-4',
      render: (formula) => (
        <button
          type="button"
          onClick={() => onView(formula)}
          className="text-left font-normal text-[#202939] hover:underline cursor-pointer truncate block w-full"
        >
          {formula.name}
        </button>
      ),
    },
    {
      key: 'targetRole',
      header: 'Đối tượng',
      width: 'w-[12%]',
      className: 'whitespace-nowrap',
      render: (formula) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {TARGET_ROLE_LABELS[formula.targetRole] || formula.targetRole}
        </span>
      ),
    },
    {
      key: 'baseRate',
      header: 'Lương cơ bản',
      width: 'w-[12%]',
      className: 'whitespace-nowrap',
      render: (formula) => (
        <span className="font-medium text-[#064343]">
          {formatVND(formula.baseRate)}
          <span className="text-[12px] font-normal text-[#64748B] ml-1">
            {BASE_RATE_TYPE_UNITS[formula.baseRateType] || ''}
          </span>
        </span>
      ),
    },
    {
      key: 'baseRateType',
      header: 'Hình thức lương',
      width: 'w-[13%]',
      className: 'whitespace-nowrap',
      render: (formula) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {BASE_RATE_TYPE_LABELS[formula.baseRateType] || formula.baseRateType}
        </span>
      ),
    },
    {
      key: 'salesCommissionPercent',
      header: 'Hoa hồng',
      width: 'w-[8%]',
      className: 'whitespace-nowrap',
      render: (formula) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {formula.salesCommissionPercent}%
        </span>
      ),
    },
    {
      key: 'effectiveDate',
      header: 'Ngày hiệu lực',
      width: 'w-[11%]',
      className: 'whitespace-nowrap',
      render: (formula) => formatDate(formula.effectiveDate),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: 'w-[10%]',
      className: 'whitespace-nowrap',
      render: (formula) => {
        const isActive = formula.status === 'ACTIVE';
        return (
          <Badge variant={isActive ? 'active' : 'inactive'}>
            {FORMULA_STATUS_LABELS[formula.status] || formula.status}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: 'w-[10%]',
      headerClassName: 'text-left pl-[15px]',
      render: (formula) => (
        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => onView(formula)}
            title="Xem chi tiết"
            className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#FFB800]/15 transition-colors cursor-pointer"
            aria-label="Xem chi tiết"
          >
            <EyeViewIcon className="w-[18px] h-[18px]" color="#FFB800" />
          </button>

          <button
            type="button"
            onClick={() => onEdit(formula)}
            title="Chỉnh sửa công thức"
            className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#064343]/10 transition-colors cursor-pointer"
            aria-label="Chỉnh sửa"
          >
            <EditPencilIcon className="w-[18px] h-[18px]" color="#064343" />
          </button>

          <button
            type="button"
            onClick={() => onToggleStatus(formula)}
            title={formula.status === 'ACTIVE' ? 'Ngừng áp dụng công thức' : 'Kích hoạt công thức'}
            className={`w-[28px] h-[28px] rounded-[6px] flex items-center justify-center transition-colors cursor-pointer ${
              formula.status === 'ACTIVE'
                ? 'hover:bg-red-50 text-red-600'
                : 'hover:bg-emerald-50 text-emerald-600'
            }`}
            aria-label={formula.status === 'ACTIVE' ? 'Ngừng áp dụng' : 'Kích hoạt'}
          >
            <Power className="w-[16px] h-[16px] stroke-[2.2]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <DataTable
        data={items}
        columns={columns}
        isLoading={isLoading}
        keyExtractor={(formula) => formula.id}
        onClearFilter={onClearFilter}
        rowHeightClass="h-[43px]"
      />
    </div>
  );
}

export default FormulaTable;
