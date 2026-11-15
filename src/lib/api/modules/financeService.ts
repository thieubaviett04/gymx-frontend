import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse, PagedResult } from '@/types/api';
import type {
  CancelExpensePayload,
  CreateExpensePayload,
  CreateInvoicePayload,
  ExpenseCategory,
  ExpenseDetailDto,
  ExpenseQueryParams,
  ExpenseSummaryDto,
  InvoiceQueryParams,
  InvoiceSummaryDto,
} from '@/types/finance';
import type {
  CategoryBreakdownDto,
  FinancialSummaryDto,
  RevenueAnalyticsDto,
  RevenueExportParams,
  RevenueFilterParams,
  RevenueSlotDto,
} from '@/types/revenue';

function normalizePagedResult<T>(
  data: PagedResult<T>,
  requestedPageIndex = 1,
  requestedPageSize = 10
): PagedResult<T> {
  if (!data) return data;

  const isSwapped =
    (data.pageIndex !== requestedPageIndex && data.pageIndex === requestedPageSize) ||
    (data.items && data.items.length > 0 && data.totalCount < data.items.length) ||
    (data.items &&
      data.items.length === 0 &&
      data.pageIndex === requestedPageSize &&
      data.totalCount === requestedPageIndex);

  if (isSwapped) {
    const actualTotalCount = !data.items || data.items.length === 0 ? 0 : Number(data.pageSize);
    const actualPageIndex = requestedPageIndex;
    const actualPageSize = requestedPageSize;
    const actualTotalPages = Math.max(1, Math.ceil(actualTotalCount / actualPageSize));
    return {
      items: data.items ?? [],
      totalCount: actualTotalCount,
      pageIndex: actualPageIndex,
      pageSize: actualPageSize,
      totalPages: actualTotalPages,
      hasPreviousPage: actualPageIndex > 1,
      hasNextPage: actualPageIndex < actualTotalPages,
    };
  }

  return data;
}

export const financeService = {
  getExpenses: async (params?: ExpenseQueryParams) => {
    const res = await apiClient.get<unknown, ApiResponse<PagedResult<ExpenseSummaryDto>>>(
      ENDPOINTS.adminFinance.expenses.list,
      { params }
    );
    if (res?.data) {
      res.data = normalizePagedResult(
        res.data,
        params?.pageIndex ?? 1,
        params?.pageSize ?? 10
      );
    }
    return res;
  },

  getExpenseCategories: () =>
    apiClient.get<unknown, ApiResponse<ExpenseCategory[]>>(
      ENDPOINTS.adminFinance.expenses.categories
    ),

  getExpenseById: (id: string) =>
    apiClient.get<unknown, ApiResponse<ExpenseDetailDto>>(
      ENDPOINTS.adminFinance.expenses.byId(id)
    ),

  createExpense: (payload: CreateExpensePayload) =>
    apiClient.post<unknown, ApiResponse<ExpenseDetailDto>>(
      ENDPOINTS.adminFinance.expenses.create,
      payload
    ),

  cancelExpense: (id: string, payload: CancelExpensePayload) =>
    apiClient.post<unknown, ApiResponse<ExpenseDetailDto>>(
      ENDPOINTS.adminFinance.expenses.cancel(id),
      payload
    ),

  getInvoices: async (params?: InvoiceQueryParams) => {
    const res = await apiClient.get<unknown, ApiResponse<PagedResult<InvoiceSummaryDto>>>(
      ENDPOINTS.adminFinance.invoices.list,
      { params }
    );
    if (res?.data) {
      res.data = normalizePagedResult(
        res.data,
        params?.pageIndex ?? 1,
        params?.pageSize ?? 10
      );
    }
    return res;
  },

  createInvoice: (payload: CreateInvoicePayload) =>
    apiClient.post<unknown, ApiResponse<InvoiceSummaryDto>>(
      ENDPOINTS.adminFinance.invoices.create,
      payload
    ),

  getRevenueAnalytics: async (params?: RevenueFilterParams) => {
    const queryParams: Record<string, string | number | undefined> = {
      period: params?.period ?? 'today',
      fromDate: params?.fromDate,
      toDate: params?.toDate,
      metric: params?.metric ?? 'revenue',
    };

    return apiClient.get<unknown, ApiResponse<RevenueAnalyticsDto>>(
      ENDPOINTS.adminFinance.analytics.revenue,
      { params: queryParams }
    );
  },

  downloadRevenueReport: async (params?: RevenueExportParams) => {
    const queryParams: Record<string, string | undefined> = {
      period: params?.period ?? 'today',
      fromDate: params?.fromDate,
      toDate: params?.toDate,
      format: params?.format ?? 'excel',
    };

    const response = await apiClient.get(
      ENDPOINTS.adminFinance.analytics.export,
      {
        params: queryParams,
        responseType: 'blob',
      }
    );

    const blob = new Blob([response as unknown as BlobPart], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.setAttribute('download', `Bao_Cao_Doanh_Thu_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  getRevenueSummary: async (params?: RevenueFilterParams) => {
    const res = await financeService.getRevenueAnalytics(params);
    return {
      success: true,
      data: res.data.summary,
    } as ApiResponse<FinancialSummaryDto>;
  },

  getRevenueChart: async (params?: RevenueFilterParams) => {
    const res = await financeService.getRevenueAnalytics(params);
    return {
      success: true,
      data: res.data.chartData,
    } as ApiResponse<RevenueSlotDto[]>;
  },

  getRevenueByCategory: async (params?: RevenueFilterParams) => {
    const res = await financeService.getRevenueAnalytics(params);
    return {
      success: true,
      data: res.data.categoryBreakdown,
    } as ApiResponse<CategoryBreakdownDto[]>;
  },

  exportRevenueExcel: async (params?: RevenueExportParams) => {
    return financeService.downloadRevenueReport(params);
  },
};
