'use client';

import React from 'react';
import { Badge, DataTable, EyeViewIcon, EditPencilIcon, TrashBinIcon } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { EmptySearchState } from '@/components/shared';
import type { EmployeeKpiProgressSummary } from '@/types/kpi';

interface KpiProgressTableProps {
  items: EmployeeKpiProgressSummary[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  month?: number;
  year?: number;
  onClearFilter?: () => void;
  onView: (kpi: EmployeeKpiProgressSummary) => void;
  onEdit?: (kpi: EmployeeKpiProgressSummary) => void;
  onDelete?: (kpi: EmployeeKpiProgressSummary) => void;
}

function getKpiGrade(overallProgress: number): string {
  if (overallProgress >= 100) return 'Loại A';
  if (overallProgress >= 80) return 'Loại B';
  if (overallProgress >= 65) return 'Loại C';
  return 'Loại D';
}

export function KpiProgressTable({
  items,
  isLoading,
  pageIndex,
  pageSize,
  month,
  year,
  onClearFilter,
  onView,
  onEdit,
  onDelete,
}: KpiProgressTableProps) {
  const columns: ColumnDef<EmployeeKpiProgressSummary>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: 'w-[4%]',
      render: (_: unknown, idx: number) => (pageIndex - 1) * pageSize + idx + 1,
    },
    {
      key: 'employeeCode',
      header: 'Mã NV',
      width: 'w-[7%]',
      className: 'whitespace-nowrap',
      render: (item: EmployeeKpiProgressSummary) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {item.employeeCode || '—'}
        </span>
      ),
    },
    {
      key: 'employeeName',
      header: 'Họ và tên',
      width: 'w-[15%]',
      truncate: true,
      pr: 'pr-3',
      render: (item: EmployeeKpiProgressSummary) => (
        <div className="flex items-center gap-[10px]">
          <div className="relative w-[28px] h-[28px] rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
            <span className="font-semibold text-xs text-[#064343]">
              {item.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onView(item)}
            className="text-left font-normal text-[#202939] hover:underline cursor-pointer truncate block w-full"
          >
            {item.fullName || '—'}
          </button>
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Chức vụ',
      width: 'w-[10%]',
      className: 'whitespace-nowrap',
      render: (item: EmployeeKpiProgressSummary) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {item.position === 'TRAINER' ? 'Huấn luyện viên' : 'Lễ tân'}
        </span>
      ),
    },
    {
      key: 'templateName',
      header: 'Mẫu KPI',
      width: 'w-[15%]',
      truncate: true,
      render: (item: EmployeeKpiProgressSummary) => (
        <span className="text-[14px] text-[#202939]" title={item.templateName}>
          {item.templateName}
        </span>
      ),
    },
    {
      key: 'period',
      header: 'Kỳ',
      width: 'w-[7%]',
      className: 'whitespace-nowrap pr-4',
      render: (item: EmployeeKpiProgressSummary) => {
        const m = item.month ?? month;
        const y = item.year ?? year;
        if (!m || !y) return <span className="text-[14px] text-[#64748B]">—</span>;
        const formattedMonth = m < 10 ? `0${m}` : `${m}`;
        return (
          <span className="text-[14px] font-medium text-[#202939]">
            {formattedMonth}/{y}
          </span>
        );
      },
    },
    {
      key: 'overallProgress',
      header: 'Tổng tiến độ',
      width: 'w-[15%]',
      headerClassName: 'pl-5',
      className: 'whitespace-nowrap pl-5',
      render: (item: EmployeeKpiProgressSummary) => {
        const cappedProgress = Math.min(Math.max(item.overallProgress, 0), 100);
        return (
          <div className="flex items-center gap-2.5 w-full">
            <div className="w-[60px] sm:w-[70px] bg-[#E2E8F0] h-2 rounded-full overflow-hidden shrink-0">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  item.status === 'ACHIEVED' ? 'bg-emerald-600' : 'bg-[#064343]'
                }`}
                style={{ width: `${cappedProgress}%` }}
              />
            </div>
            <span className="text-[13px] font-semibold text-[#064343] shrink-0">
              {cappedProgress >= 100 ? '100%' : `${cappedProgress.toFixed(1)}%`}
            </span>
          </div>
        );
      },
    },
    {
      key: 'ranking',
      header: 'Xếp loại',
      width: 'w-[6%]',
      className: 'whitespace-nowrap',
      render: (item: EmployeeKpiProgressSummary) => (
        <span className="text-[14px] font-normal text-[#202939]">
          {getKpiGrade(item.overallProgress)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: 'w-[12%]',
      className: 'whitespace-nowrap',
      render: (item: EmployeeKpiProgressSummary) => (
        <Badge
          variant={item.status === 'ACHIEVED' ? 'active' : 'inactive'}
          className="text-[12px] px-2.5 py-0.5 whitespace-nowrap"
        >
          {item.status === 'ACHIEVED' ? 'Đạt chỉ tiêu' : 'Đang áp dụng'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      width: 'w-[9%]',
      headerClassName: 'text-left pl-[15px]',
      className: 'whitespace-nowrap',
      render: (item: EmployeeKpiProgressSummary) => (
        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => onView(item)}
            className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#FFB800]/15 transition-colors cursor-pointer"
            title="Xem chi tiết tiến độ"
            aria-label="Xem chi tiết"
          >
            <EyeViewIcon className="w-[18px] h-[18px]" color="#FFB800" />
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#064343]/10 transition-colors cursor-pointer"
              title="Điều chỉnh chỉ tiêu"
              aria-label="Điều chỉnh"
            >
              <EditPencilIcon className="w-[18px] h-[18px]" color="#064343" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#EE464C]/10 transition-colors cursor-pointer"
              title="Hủy giao KPI"
              aria-label="Hủy giao KPI"
            >
              <TrashBinIcon className="w-[18px] h-[18px]" color="#EE464C" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items}
      isLoading={isLoading}
      skeletonRowCount={pageSize}
      keyExtractor={(item: EmployeeKpiProgressSummary) => item.id}
      emptyState={
        <EmptySearchState
          title="Chưa có dữ liệu tiến độ KPI nào"
          message="Hãy thử thay đổi từ khóa hoặc điều chỉnh bộ lọc tháng/năm"
          onClearFilter={onClearFilter}
        />
      }
    />
  );
}

export default KpiProgressTable;
