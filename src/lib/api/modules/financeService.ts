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

function normalizePagedResult<T>(
  data: PagedResult<T>,
  requestedPageIndex = 1,
  requestedPageSize = 10
): PagedResult<T> {
  if (!data) return data;

  // Backend bug in InvoiceRepository.cs:
  // `new PagedResult<InvoiceSummaryDto>(items, pageIndex, pageSize, totalCount)`
  // passes arguments in wrong order for constructor `(items, totalCount, pageIndex, pageSize)`.
  // As a result:
  // - data.totalCount holds pageIndex
  // - data.pageIndex holds pageSize
  // - data.pageSize holds actual totalCount
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
};
