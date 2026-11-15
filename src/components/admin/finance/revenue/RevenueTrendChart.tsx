'use client';

import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatVND } from '@/lib/utils/formatters';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { AnalyticsPeriod, ChartDisplayType, RevenueSlotDto } from '@/types/revenue';

interface RevenueTrendChartProps {
  slots: RevenueSlotDto[];
  period?: AnalyticsPeriod;
  isLoading?: boolean;
}

const chartConfig = {
  revenue: {
    label: 'Doanh thu',
    color: '#064343',
  },
} satisfies ChartConfig;

function formatYAxisTick(val: number) {
  if (val === 0) return '0 ₫';
  if (val >= 1000000000) {
    const b = val / 1000000000;
    return `${Number.isInteger(b) ? b : b.toFixed(1)} tỷ`;
  }
  if (val >= 1000000) {
    const m = val / 1000000;
    return `${Number.isInteger(m) ? m : m.toFixed(0)} tr`;
  }
  if (val >= 1000) {
    const k = val / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(0)}k`;
  }
  return `${val} ₫`;
}

function formatSlotDisplayLabel(raw: string) {
  if (raw.includes('-') && raw.length === 10) {
    const parts = raw.split('-');
    return `${parts[2]}/${parts[1]}`;
  }
  return raw;
}

export function RevenueTrendChart({
  slots,
  period = 'this_month',
  isLoading = false,
}: RevenueTrendChartProps) {
  const [displayType, setDisplayType] = useState<ChartDisplayType>('bar');

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[480px] bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-5 pb-6 shadow-xs relative overflow-hidden animate-pulse flex flex-col justify-between">
        <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />
        <div className="h-6 w-48 bg-slate-100 rounded" />
        <div className="h-72 w-full bg-slate-50 rounded" />
        <div className="h-4 w-full bg-slate-100 rounded" />
      </div>
    );
  }

  const chartData = slots.map((item) => ({
    ...item,
    displayLabel: formatSlotDisplayLabel(item.label),
  }));

  const totalRevenue = slots.reduce((acc, s) => acc + s.revenue, 0);

  return (
    <div className="w-full h-full min-h-[480px] bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-5 pb-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
      <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div>
          <div className="flex items-center">
            <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              Xu hướng doanh thu
            </h2>
          </div>
          <p className="text-[13px] text-[#64748B] mt-1.5 font-normal">
            Tổng cộng: <span className="font-semibold text-[#064343]">{formatVND(totalRevenue)}</span> trong kỳ ghi nhận
          </p>
        </div>

        <div className="inline-flex p-0.5 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setDisplayType('bar')}
            className={cn(
              'h-[30px] px-2.5 rounded-[6px] text-[12px] font-medium transition-all flex items-center gap-1.5 cursor-pointer select-none',
              displayType === 'bar'
                ? 'bg-white text-[#064343] font-semibold shadow-xs'
                : 'text-[#64748B] hover:text-[#011010]'
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Cột</span>
          </button>
          <button
            type="button"
            onClick={() => setDisplayType('area')}
            className={cn(
              'h-[30px] px-2.5 rounded-[6px] text-[12px] font-medium transition-all flex items-center gap-1.5 cursor-pointer select-none',
              displayType === 'area'
                ? 'bg-white text-[#064343] font-semibold shadow-xs'
                : 'text-[#64748B] hover:text-[#011010]'
            )}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Đường</span>
          </button>
        </div>
      </div>

      <div className="w-full pt-4 flex-1 flex flex-col justify-end">
        <ChartContainer config={chartConfig} className="w-full h-[340px]">
          {displayType === 'bar' ? (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#F1F5F9"
              />
              <XAxis
                dataKey="displayLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                tick={{ fill: '#64748B' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                tickFormatter={formatYAxisTick}
                tick={{ fill: '#64748B' }}
                width={50}
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(6, 67, 67, 0.05)' }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <span className="font-bold text-[#064343]">
                        {formatVND(Number(value))}
                      </span>
                    )}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill="#064343"
                radius={[4, 4, 0, 0]}
                maxBarSize={period === 'today' ? 44 : 32}
              />
            </BarChart>
          ) : (
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#064343" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#064343" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#F1F5F9"
              />
              <XAxis
                dataKey="displayLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                tick={{ fill: '#64748B' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                tickFormatter={formatYAxisTick}
                tick={{ fill: '#64748B' }}
                width={50}
              />
              <ChartTooltip
                cursor={{ stroke: '#064343', strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <span className="font-bold text-[#064343]">
                        {formatVND(Number(value))}
                      </span>
                    )}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#064343"
                strokeWidth={2}
                fill="url(#fillRevenue)"
              />
            </AreaChart>
          )}
        </ChartContainer>
      </div>
    </div>
  );
}

export default RevenueTrendChart;
