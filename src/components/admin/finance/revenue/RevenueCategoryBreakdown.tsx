'use client';

import React from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { formatVND } from '@/lib/utils/formatters';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { CategoryBreakdownDto } from '@/types/revenue';

interface RevenueCategoryBreakdownProps {
  categories: CategoryBreakdownDto[];
  totalRevenue: number;
  isLoading?: boolean;
}

const DONUT_COLORS = [
  '#064343',
  '#0D7A7A',
  '#059669',
  '#2563EB',
  '#0891B2',
  '#475569',
  '#0D9488',
  '#10B981',
];

export function RevenueCategoryBreakdown({
  categories,
  totalRevenue,
  isLoading = false,
}: RevenueCategoryBreakdownProps) {
  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[480px] bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-5 pb-6 shadow-xs relative overflow-hidden animate-pulse flex flex-col justify-between">
        <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />
        <div className="h-6 w-40 bg-slate-100 rounded" />
        <div className="w-40 h-40 rounded-full bg-slate-100 mx-auto" />
        <div className="space-y-3 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-full bg-slate-50 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const validCategories = categories
    .filter((item) => Number(item.revenue) > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const chartData = validCategories.map((item, idx) => ({
    name: item.categoryName,
    value: item.revenue,
    percentage: item.percentage,
    fill: DONUT_COLORS[idx % DONUT_COLORS.length],
  }));

  const chartConfig = validCategories.reduce<ChartConfig>((acc, item, idx) => {
    acc[`cat_${idx}`] = {
      label: item.categoryName,
      color: DONUT_COLORS[idx % DONUT_COLORS.length],
    };
    return acc;
  }, {
    revenue: {
      label: 'Doanh thu',
    },
  });

  return (
    <div className="w-full h-full min-h-[480px] bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-5 pb-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
      <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />

      <div>
        <div className="pb-3">
          <div className="flex items-center">
            <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              Cơ cấu nguồn thu
            </h2>
          </div>
          <p className="text-[13px] text-[#64748B] mt-1.5 font-normal">
            Phân bổ doanh thu theo danh mục sản phẩm & dịch vụ
          </p>
        </div>

        {validCategories.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-[#64748B]">
            Chưa có dữ liệu phân bổ nguồn thu
          </div>
        ) : (
          <div className="pt-2 flex flex-col items-center">
            <div className="w-full h-[180px] flex items-center justify-center">
              <ChartContainer config={chartConfig} className="w-[180px] h-[180px]">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value, name) => (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#202939]">{name}:</span>
                            <span className="font-bold text-[#064343]">
                              {formatVND(Number(value))}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={0}
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>

            <div className="w-full pt-3 space-y-2">
              {chartData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-[13px] px-2 py-1 rounded-[6px] hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="font-medium text-[#202939] truncate">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-semibold text-[#011010] tabular-nums">
                      {formatVND(item.value)}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-[#475569] tabular-nums">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-[#F1F5F9] flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#64748B]">
          Tổng cộng:
        </span>
        <span className="text-[16px] font-bold text-[#064343] tabular-nums">
          {formatVND(totalRevenue)}
        </span>
      </div>
    </div>
  );
}

export default RevenueCategoryBreakdown;