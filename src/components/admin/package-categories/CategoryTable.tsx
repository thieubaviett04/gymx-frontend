'use client';

import React from 'react';
import { Badge, DataTable, EditPencilIcon, EyeViewIcon, TrashBinIcon } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { formatDate } from '@/lib/utils/formatters';
import type { PackageCategorySummary } from '@/types/packageCategory';

interface CategoryTableProps {
  items: PackageCategorySummary[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  onView: (category: PackageCategorySummary) => void;
  onEdit: (category: PackageCategorySummary) => void;
  onDelete: (category: PackageCategorySummary) => void;
  onClearFilter?: () => void;
}

export function CategoryTable({
  items,
  isLoading,
  pageIndex,
  pageSize,
  onView,
  onEdit,
  onDelete,
  onClearFilter,
}: CategoryTableProps) {
  const columns: ColumnDef<PackageCategorySummary>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: 'w-[5%]',
      render: (_, idx) => (pageIndex - 1) * pageSize + idx + 1,
    },
    {
      key: 'code',
      header: 'Mã danh mục',
      width: 'w-[11%]',
      truncate: true,
      pr: 'pr-2',
      render: (cat) => (
        <span className="text-[#064343] font-normal">{cat.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Tên danh mục',
      width: 'w-[16%]',
      truncate: true,
      pr: 'pr-4',
      render: (cat) => (
        <button
          type="button"
          onClick={() => onView(cat)}
          className="text-left font-normal text-[#202939] hover:underline cursor-pointer truncate block w-full"
        >
          {cat.name}
        </button>
      ),
    },
    {
      key: 'description',
      header: 'Mô tả',
      width: 'w-[22%]',
      truncate: true,
      pr: 'pr-6',
      render: (cat) => cat.description || '—',
    },
    {
      key: 'packagesCount',
      header: 'Số gói',
      width: 'w-[8%]',
      className: 'whitespace-nowrap',
      render: (cat) =>
        cat.packagesCount > 0 ? (
          <span
            title={`Có ${cat.packagesCount} gói tập đang thuộc danh mục này`}
            className="text-[14px] text-[#202939] font-normal"
          >
            {cat.packagesCount} gói
          </span>
        ) : (
          <span className="text-[14px] text-[#202939] font-normal">0 gói</span>
        ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: 'w-[11%]',
      className: 'whitespace-nowrap',
      render: (cat) => (
        <Badge variant={cat.status === 'ACTIVE' ? 'active' : 'inactive'}>
          {cat.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </Badge>
      ),
    },
    {
      key: 'createdDate',
      header: 'Ngày tạo',
      width: 'w-[9%]',
      className: 'whitespace-nowrap',
      render: (cat) => formatDate(cat.createdDate),
    },
    {
      key: 'lastModifiedDate',
      header: 'Cập nhật',
      width: 'w-[9%]',
      className: 'whitespace-nowrap',
      render: (cat) => formatDate(cat.lastModifiedDate) || '—',
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: 'w-[9%]',
      headerClassName: 'text-left pl-[15px]',
      className: 'whitespace-nowrap',
      render: (cat) => (
        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => onView(cat)}
            title="Xem chi tiết"
            className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#FFB800]/15 transition-colors cursor-pointer"
            aria-label="Xem chi tiết"
          >
            <EyeViewIcon className="w-[18px] h-[18px]" color="#FFB800" />
          </button>

          <button
            type="button"
            onClick={() => onEdit(cat)}
            title="Chỉnh sửa thông tin"
            className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#064343]/10 transition-colors cursor-pointer"
            aria-label="Chỉnh sửa"
          >
            <EditPencilIcon className="w-[18px] h-[18px]" color="#064343" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(cat)}
            title="Xóa danh mục"
            className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#EE464C]/10 transition-colors cursor-pointer"
            aria-label="Xóa danh mục"
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
      keyExtractor={(cat) => cat.id}
      onClearFilter={onClearFilter}
      rowHeightClass="h-[43px]"
    />
  );
}

export default CategoryTable;
