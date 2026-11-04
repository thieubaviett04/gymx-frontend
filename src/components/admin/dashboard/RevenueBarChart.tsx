'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export type RevenueFilter = 'day' | 'week' | 'month' | 'year';

interface MonthData {
  month: string;
  revenue: number; // in millions VND (tr)
  formatted: string;
}

const YEAR_DATA: MonthData[] = [
  { month: 'T1', revenue: 620, formatted: '620.000.000 ₫' },
  { month: 'T2', revenue: 540, formatted: '540.000.000 ₫' },
  { month: 'T3', revenue: 710, formatted: '710.000.000 ₫' },
  { month: 'T4', revenue: 680, formatted: '680.000.000 ₫' },
  { month: 'T5', revenue: 840, formatted: '840.000.000 ₫' },
  { month: 'T6', revenue: 890, formatted: '890.000.000 ₫' },
  { month: 'T7', revenue: 950, formatted: '950.000.000 ₫' },
  { month: 'T8', revenue: 790, formatted: '790.000.000 ₫' },
  { month: 'T9', revenue: 730, formatted: '730.000.000 ₫' },
  { month: 'T10', revenue: 860, formatted: '860.000.000 ₫' },
  { month: 'T11', revenue: 920, formatted: '920.000.000 ₫' },
  { month: 'T12', revenue: 88.08, formatted: '88.080.000 ₫' },
];

const Y_TICKS = [
  { label: '1.0 tỷ', value: 1000 },
  { label: '750tr', value: 750 },
  { label: '500tr', value: 500 },
  { label: '250tr', value: 250 },
  { label: '0tr', value: 0 },
];

export function RevenueBarChart() {
  const [activeFilter, setActiveFilter] = useState<RevenueFilter>('year');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const filters: { label: string; value: RevenueFilter }[] = [
    { label: 'Ngày', value: 'day' },
    { label: 'Tuần', value: 'week' },
    { label: 'Tháng', value: 'month' },
    { label: 'Năm', value: 'year' },
  ];

  const maxVal = 1000;

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#EDEDED] shadow-xs flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F8FAFC]">
        <div>
          <span className="text-xs font-bold text-[#666666] tracking-wider uppercase">
            Doanh thu
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#011010] font-heading mt-0.5 tracking-tight">
            88.080.000₫
          </h2>
        </div>

        {/* Segmented Filter Control per Figma 1344:1428 */}
        <div className="inline-flex p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] self-start sm:self-auto">
          {filters.map((tab) => {
            const isActive = activeFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveFilter(tab.value)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer',
                  isActive
                    ? 'bg-[#064343] text-white font-semibold shadow-xs'
                    : 'text-[#666666] hover:text-[#011010] hover:bg-white/80'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Area */}
      <div className="pt-6 relative">
        <div className="flex h-64 sm:h-72 w-full">
          {/* Y-axis benchmarks per Figma 1344:1473 */}
          <div className="flex flex-col justify-between items-end pr-3 sm:pr-4 py-1 text-xs text-[#A1A1A1] font-mono select-none w-12 sm:w-14 shrink-0">
            {Y_TICKS.map((tick) => (
              <span key={tick.label} className="leading-none text-[11px] sm:text-xs">
                {tick.label}
              </span>
            ))}
          </div>

          {/* Grid lines and Bars */}
          <div className="relative flex-1 flex flex-col justify-between">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-1">
              {Y_TICKS.map((tick) => (
                <div
                  key={`line-${tick.label}`}
                  className="w-full border-b border-[#F1F5F9] border-dashed"
                />
              ))}
            </div>

            {/* Bars container */}
            <div className="relative h-full flex items-end justify-between gap-1.5 sm:gap-3 px-1 sm:px-2 z-10">
              {YEAR_DATA.map((item, idx) => {
                const heightPercent = Math.min(
                  100,
                  Math.max(6, (item.revenue / maxVal) * 100)
                );
                const isHovered = hoveredIndex === idx;
                const isCurrent = idx === YEAR_DATA.length - 1; // T12 current

                return (
                  <div
                    key={item.month}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Tooltip on hover */}
                    <div
                      className={cn(
                        'absolute -top-10 px-2.5 py-1 rounded-lg bg-[#011010] text-white text-[11px] font-semibold tracking-tight shadow-lg transition-all duration-150 pointer-events-none z-30 whitespace-nowrap',
                        isHovered
                          ? 'opacity-100 scale-100 translate-y-0'
                          : 'opacity-0 scale-95 translate-y-1'
                      )}
                    >
                      <span className="text-[#BAFD00] font-bold mr-1">
                        {item.month}:
                      </span>
                      {item.formatted}
                    </div>

                    {/* Bar */}
                    <div className="w-full max-w-[42px] relative flex items-end justify-center h-full">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={cn(
                          'w-full rounded-t-md transition-all duration-300 relative',
                          isCurrent
                            ? 'bg-gradient-to-t from-[#064343] to-[#BAFD00] shadow-[0_0_12px_rgba(186,253,0,0.35)]'
                            : isHovered
                            ? 'bg-[#085555]'
                            : 'bg-[#064343]/85 group-hover:bg-[#064343]'
                        )}
                      >
                        {/* Glow highlight on top */}
                        <div
                          className={cn(
                            'absolute top-0 left-0 right-0 h-1 rounded-t-md',
                            isCurrent ? 'bg-[#BAFD00]' : 'bg-white/30'
                          )}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* X-axis Month Labels */}
        <div className="flex pl-12 sm:pl-14 pt-3 justify-between items-center px-1 sm:px-2">
          {YEAR_DATA.map((item, idx) => {
            const isHovered = hoveredIndex === idx;
            const isCurrent = idx === YEAR_DATA.length - 1;

            return (
              <span
                key={`label-${item.month}`}
                className={cn(
                  'flex-1 text-center text-xs transition-colors duration-150 font-medium select-none',
                  isHovered || isCurrent
                    ? 'text-[#064343] font-bold'
                    : 'text-[#A1A1A1]'
                )}
              >
                {item.month}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RevenueBarChart;
