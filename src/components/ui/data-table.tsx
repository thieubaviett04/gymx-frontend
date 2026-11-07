'use client';

import React from 'react';
import { EmptySearchState } from '@/components/shared';
import { cn } from '@/lib/utils';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  truncate?: boolean;
  pr?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  keyExtractor?: (item: T, index: number) => string | number;
  emptyState?: React.ReactNode;
  onClearFilter?: () => void;
  className?: string;
  skeletonRowCount?: number;
  rowHeightClass?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  keyExtractor,
  emptyState,
  onClearFilter,
  className,
  skeletonRowCount = 6,
  rowHeightClass = 'h-[43px]',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-8 space-y-4">
          <div className="h-6 bg-slate-100 rounded-md w-1/4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(skeletonRowCount)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return emptyState ? <>{emptyState}</> : <EmptySearchState onClearFilter={onClearFilter} />;
  }

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full text-left border-separate border-spacing-y-[4px] table-fixed">
        <thead>
          <tr className="bg-white">
            {columns.map((col, idx) => {
              const isLast = idx === columns.length - 1;
              return (
                <th
                  key={col.key || idx}
                  className={cn(
                    'py-2.5 px-3 text-[13px] font-medium leading-[17px] text-[#0A0A0A] select-none whitespace-nowrap',
                    !isLast && "relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[16px] after:bg-[#CDD5DF]",
                    col.width,
                    getAlignClass(col.align),
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="text-[14px] leading-[18px]">
          {data.map((item, itemIdx) => {
            const rowKey = keyExtractor ? keyExtractor(item, itemIdx) : itemIdx;
            return (
              <tr
                key={rowKey}
                className={cn('bg-[#F0F5F5] transition-colors hover:bg-[#E3EDED] group', rowHeightClass)}
              >
                {columns.map((col, colIdx) => {
                  const isFirst = colIdx === 0;
                  const isLast = colIdx === columns.length - 1;
                  const rawValue = (item as Record<string, unknown>)[col.key];
                  const content = col.render
                    ? col.render(item, itemIdx)
                    : (rawValue as React.ReactNode);

                  return (
                    <td
                      key={col.key || colIdx}
                      className={cn(
                        rowHeightClass,
                        'px-[10px] py-0 align-middle font-normal text-[#202939]',
                        isFirst && 'rounded-l-[6px]',
                        isLast && 'rounded-r-[6px]',
                        getAlignClass(col.align),
                        col.className
                      )}
                    >
                      {col.truncate ? (
                        <div className={cn('min-w-0', col.pr || 'pr-4')}>
                          <span
                            className="text-[14px] leading-[18px] text-[#202939] truncate block w-full"
                            title={typeof rawValue === 'string' ? rawValue : undefined}
                          >
                            {content}
                          </span>
                        </div>
                      ) : (
                        content
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;

