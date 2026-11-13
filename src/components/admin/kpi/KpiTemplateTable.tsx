'use client';

import React from 'react';
import { Badge, DataTable, EyeViewIcon, EditPencilIcon, TrashBinIcon } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { formatVND } from '@/lib/utils/formatters';
import type { KpiTemplateSummary } from '@/types/kpi';

interface KpiTemplateTableProps {
  items: KpiTemplateSummary[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onView?: (template: KpiTemplateSummary) => void;
  onEdit: (template: KpiTemplateSummary) => void;
  onDelete: (template: KpiTemplateSummary) => void;
}

export function KpiTemplateTable({
  items,
  isLoading,
  pageIndex,
  pageSize,
  onView,
  onEdit,
  onDelete,
}: KpiTemplateTableProps) {
  const columns: ColumnDef<KpiTemplateSummary>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: 'w-[4%]',
      render: (_: unknown, idx: number) => (pageIndex - 1) * pageSize + idx + 1,
    },
    {
      key: 'name',
      header: 'Tên mẫu KPI',
      width: 'w-[20%]',
      truncate: true,
      pr: 'pr-4',
      render: (template: KpiTemplateSummary) => (
        <button
          type="button"
          onClick={() => (onView ? onView(template) : onEdit(template))}
          className="text-left font-normal text-[#202939] hover:underline cursor-pointer truncate block w-full"
        >
          {template.name}
        </button>
      ),
    },
    {
      key: 'targetRole',
      header: 'Đối tượng',
      width: 'w-[14%]',
      className: 'whitespace-nowrap',
      render: (template: KpiTemplateSummary) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {template.targetRole === 'TRAINER' ? 'Huấn luyện viên' : 'Lễ tân'}
        </span>
      ),
    },
    {
      key: 'targetRevenue',
      header: 'Doanh thu chỉ tiêu',
      width: 'w-[15%]',
      className: 'whitespace-nowrap',
      render: (template: KpiTemplateSummary) => (
        <span className="font-medium text-[#064343]">
          {formatVND(template.targetRevenue)}
        </span>
      ),
    },
    {
      key: 'targetMetrics',
      header: 'Chỉ tiêu nghiệp vụ',
      width: 'w-[16%]',
      className: 'whitespace-nowrap',
      render: (template: KpiTemplateSummary) => (
        <span className="text-[14px] text-[#202939]">
          {template.targetRole === 'TRAINER'
            ? `${template.targetPtSessions ?? 0} buổi dạy PT`
            : `${template.targetNewMembers ?? 0} hội viên mới`}
        </span>
      ),
    },
    {
      key: 'targetBonusAmount',
      header: 'Mức thưởng',
      width: 'w-[11%]',
      className: 'whitespace-nowrap',
      render: (template: KpiTemplateSummary) => (
        <span className="font-medium text-[#064343]">
          +{formatVND(template.targetBonusAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: 'w-[10%]',
      render: (template: KpiTemplateSummary) => (
        <Badge
          variant={template.status === 'ACTIVE' ? 'active' : 'inactive'}
          className="text-[12px] px-2.5 py-0.5"
        >
          {template.status === 'ACTIVE' ? 'Đang áp dụng' : 'Ngừng áp dụng'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      width: 'w-[9%]',
      headerClassName: 'text-left pl-[15px]',
      className: 'whitespace-nowrap',
      render: (template: KpiTemplateSummary) => (
        <div className="flex items-center gap-[10px]">
          {onView && (
            <button
              type="button"
              onClick={() => onView(template)}
              className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#FFB800]/15 transition-colors cursor-pointer"
              title="Xem chi tiết mẫu KPI"
              aria-label="Xem chi tiết"
            >
              <EyeViewIcon className="w-[18px] h-[18px]" color="#FFB800" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(template)}
            className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#064343]/10 transition-colors cursor-pointer"
            title="Chỉnh sửa mẫu KPI"
            aria-label="Chỉnh sửa"
          >
            <EditPencilIcon className="w-[18px] h-[18px]" color="#064343" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(template)}
            className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#EE464C]/10 transition-colors cursor-pointer"
            title="Xóa mẫu KPI"
            aria-label="Xóa"
          >
            <TrashBinIcon className="w-[18px] h-[18px]" color="#EE464C" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items}
      isLoading={isLoading}
      keyExtractor={(item: KpiTemplateSummary) => item.id}
    />
  );
}

export default KpiTemplateTable;
