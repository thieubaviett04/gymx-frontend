'use client';

import React from 'react';
import { Badge, DataTable, EditPencilIcon, EyeViewIcon, TrashBinIcon } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { formatDate, formatVND } from '@/lib/utils/formatters';
import type { PenaltyRuleSummary } from '@/types/penaltyRule';
import {
  getPenaltyRuleStatusBadge,
  getRuleAudienceLabel,
  getRuleFineLabel,
  PENALTY_RULE_SEVERITY_LABELS,
  PENALTY_RULE_STATUS_LABELS,
} from '@/types/penaltyRule';

interface RuleTableProps {
  items: PenaltyRuleSummary[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onView: (rule: PenaltyRuleSummary) => void;
  onEdit: (rule: PenaltyRuleSummary) => void;
  onDelete: (rule: PenaltyRuleSummary) => void;
  onClearFilter?: () => void;
}

export function RuleTable({
  items,
  isLoading,
  pageIndex,
  pageSize,
  onView,
  onEdit,
  onDelete,
  onClearFilter,
}: RuleTableProps) {
  const columns: ColumnDef<PenaltyRuleSummary>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: 'w-[4%]',
      render: (_, idx) => (pageIndex - 1) * pageSize + idx + 1,
    },
    {
      key: 'ruleCode',
      header: 'Mã điều khoản',
      width: 'w-[10%]',
      truncate: true,
      pr: 'pr-2',
      render: (rule) => (
        <span className="text-[#064343] font-normal text-[14px]">
          {rule.ruleCode}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Tên điều khoản',
      width: 'w-[22%]',
      truncate: true,
      pr: 'pr-4',
      render: (rule) => (
        <button
          type="button"
          onClick={() => onView(rule)}
          className="text-left font-normal text-[#202939] hover:underline cursor-pointer truncate block w-full"
        >
          {rule.name}
        </button>
      ),
    },
    {
      key: 'violationType',
      header: 'Đối tượng',
      width: 'w-[11%]',
      className: 'whitespace-nowrap',
      render: (rule) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {getRuleAudienceLabel(rule)}
        </span>
      ),
    },
    {
      key: 'severityLevel',
      header: 'Mức độ',
      width: 'w-[10%]',
      className: 'whitespace-nowrap',
      render: (rule) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {PENALTY_RULE_SEVERITY_LABELS[rule.severityLevel] || rule.severityLevel}
        </span>
      ),
    },
    {
      key: 'fineAmount',
      header: 'Tiền phạt',
      width: 'w-[12%]',
      className: 'whitespace-nowrap',
      render: (rule) => (
        <span className="font-medium text-[#064343]">
          {getRuleFineLabel(rule)}
        </span>
      ),
    },
    {
      key: 'effectiveDate',
      header: 'Ngày hiệu lực',
      width: 'w-[11%]',
      className: 'whitespace-nowrap',
      render: (rule) => formatDate(rule.effectiveDate || (rule as any).effectiveFrom),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: 'w-[10%]',
      className: 'whitespace-nowrap',
      render: (rule) => {
        const badge = getPenaltyRuleStatusBadge(rule.status, rule.effectiveDate || (rule as any).effectiveFrom);
        return (
          <Badge variant={badge.variant}>
            {badge.label}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: 'w-[10%]',
      headerClassName: 'text-left pl-[15px]',
      render: (rule) => (
        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => onView(rule)}
            title="Xem chi tiết"
            className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#FFB800]/15 transition-colors cursor-pointer"
            aria-label="Xem chi tiết"
          >
            <EyeViewIcon className="w-[18px] h-[18px]" color="#FFB800" />
          </button>

          <button
            type="button"
            onClick={() => onEdit(rule)}
            title="Chỉnh sửa thông tin"
            className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#064343]/10 transition-colors cursor-pointer"
            aria-label="Chỉnh sửa"
          >
            <EditPencilIcon className="w-[18px] h-[18px]" color="#064343" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(rule)}
            title="Xóa quy định"
            className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#EE464C]/10 transition-colors cursor-pointer"
            aria-label="Xóa quy định"
          >
            <TrashBinIcon className="w-[18px] h-[18px]" color="#EE464C" />
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
        keyExtractor={(rule) => rule.id}
        onClearFilter={onClearFilter}
        rowHeightClass="h-[43px]"
      />
    </div>
  );
}

export default RuleTable;
