export type AnalyticsPeriod = 'today' | '7days' | 'this_month' | 'this_year' | 'custom';
export type AnalyticsMetric = 'revenue' | 'expense' | 'profit' | 'transactions';
export type ChartDisplayType = 'bar' | 'area';
export type AnalyticsViewMode = 'visual' | 'table';

export interface FinancialSummaryDto {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  totalTransactions: number;
  revenueGrowthRate: number;
  averageOrderValue: number;
}

export interface RevenueSlotDto {
  label: string;
  revenue: number;
  expense: number;
  profit: number;
  transactions: number;
  percentage: number;
}

export interface CategoryBreakdownDto {
  categoryName: string;
  revenue: number;
  percentage: number;
}

export interface RevenueAnalyticsDto {
  hasData: boolean;
  summary: FinancialSummaryDto;
  chartData: RevenueSlotDto[];
  categoryBreakdown: CategoryBreakdownDto[];
}

export interface RevenueFilterParams {
  period?: AnalyticsPeriod;
  fromDate?: string;
  toDate?: string;
  metric?: AnalyticsMetric;
  branchId?: string;
  year?: number;
  periodType?: string;
}

export interface RevenueExportParams {
  period?: AnalyticsPeriod;
  fromDate?: string;
  toDate?: string;
  format?: 'excel' | 'csv';
  branchId?: string;
}

