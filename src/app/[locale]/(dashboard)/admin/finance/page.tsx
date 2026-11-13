'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from '@/components/ui';
import { financeService } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils/error-helper';
import { formatVND } from '@/lib/utils/formatters';
import {
  FinanceTopBar,
  ReceiptsToolbar,
  ReceiptsTable,
  ExpensesToolbar,
  ExpensesTable,
  CreateExpenseSlidePanel,
  ExpenseDetailSlidePanel,
  CancelExpenseModal,
  CreateReceiptSlidePanel,
  ReceiptDetailSlidePanel,
  FinancePagination,
} from '@/components/admin/finance';
import type {
  CreateExpensePayload,
  ExpenseSummaryDto,
  InvoiceSummaryDto,
} from '@/types/finance';
import type { CreateReceiptPayload } from '@/components/admin/finance';

function getDateRangeFromMonthYear(
  month: string,
  year: string
): { fromDate?: string; toDate?: string } {
  if (year === 'ALL' && month === 'ALL') {
    return { fromDate: undefined, toDate: undefined };
  }

  if (year !== 'ALL' && month === 'ALL') {
    const y = parseInt(year, 10);
    return {
      fromDate: `${y}-01-01`,
      toDate: `${y}-12-31`,
    };
  }

  const m = parseInt(month, 10);
  const currentYear = new Date().getFullYear();
  const y = year !== 'ALL' ? parseInt(year, 10) : currentYear;

  const formattedMonth = String(m).padStart(2, '0');
  const fromDate = `${y}-${formattedMonth}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const toDate = `${y}-${formattedMonth}-${String(lastDay).padStart(2, '0')}`;

  return { fromDate, toDate };
}

export default function AdminFinancePage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'receipts' | 'expenses'>('receipts');

  const [receiptSearch, setReceiptSearch] = useState('');
  const [receiptStatus, setReceiptStatus] = useState('ALL');
  const [receiptMonth, setReceiptMonth] = useState('ALL');
  const [receiptYear, setReceiptYear] = useState('ALL');
  const [receiptPageIndex, setReceiptPageIndex] = useState(1);
  const [receiptPageSize, setReceiptPageSize] = useState(10);

  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('ALL');
  const [expenseStatus, setExpenseStatus] = useState('ALL');
  const [expenseMonth, setExpenseMonth] = useState('ALL');
  const [expenseYear, setExpenseYear] = useState('ALL');
  const [expensePageIndex, setExpensePageIndex] = useState(1);
  const [expensePageSize, setExpensePageSize] = useState(10);

  const { fromDate: receiptFromDate, toDate: receiptToDate } = useMemo(() => {
    return getDateRangeFromMonthYear(receiptMonth, receiptYear);
  }, [receiptMonth, receiptYear]);

  const { fromDate: expenseFromDate, toDate: expenseToDate } = useMemo(() => {
    return getDateRangeFromMonthYear(expenseMonth, expenseYear);
  }, [expenseMonth, expenseYear]);

  const [isCreateReceiptOpen, setIsCreateReceiptOpen] = useState(false);
  const [selectedViewInvoice, setSelectedViewInvoice] = useState<InvoiceSummaryDto | null>(null);

  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [cancellingExpense, setCancellingExpense] = useState<ExpenseSummaryDto | null>(null);

  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const {
    data: receiptsData,
    isLoading: isLoadingReceipts,
  } = useQuery({
    queryKey: [
      'admin-finance-invoices',
      {
        search: receiptSearch,
        status: receiptStatus !== 'ALL' ? receiptStatus : undefined,
        fromDate: receiptFromDate || undefined,
        toDate: receiptToDate || undefined,
        pageIndex: receiptPageIndex,
        pageSize: receiptPageSize,
      },
    ],
    queryFn: async () => {
      const res = await financeService.getInvoices({
        search: receiptSearch || undefined,
        status: receiptStatus !== 'ALL' ? receiptStatus : undefined,
        fromDate: receiptFromDate || undefined,
        toDate: receiptToDate || undefined,
        pageIndex: receiptPageIndex,
        pageSize: receiptPageSize,
      });
      return res.data;
    },
    enabled: activeTab === 'receipts',
  });

  const {
    data: expensesData,
    isLoading: isLoadingExpenses,
  } = useQuery({
    queryKey: [
      'admin-finance-expenses',
      {
        search: expenseSearch,
        category: expenseCategory !== 'ALL' ? expenseCategory : undefined,
        status: expenseStatus !== 'ALL' ? expenseStatus : undefined,
        fromDate: expenseFromDate || undefined,
        toDate: expenseToDate || undefined,
        pageIndex: expensePageIndex,
        pageSize: expensePageSize,
      },
    ],
    queryFn: async () => {
      const res = await financeService.getExpenses({
        search: expenseSearch || undefined,
        category: expenseCategory !== 'ALL' ? expenseCategory : undefined,
        status: expenseStatus !== 'ALL' ? expenseStatus : undefined,
        fromDate: expenseFromDate || undefined,
        toDate: expenseToDate || undefined,
        pageIndex: expensePageIndex,
        pageSize: expensePageSize,
      });
      return res.data;
    },
    enabled: activeTab === 'expenses',
  });

  const totalReceiptsAmount = useMemo(() => {
    return (receiptsData?.items || []).reduce((acc, cur) => acc + (cur.totalAmount || 0), 0);
  }, [receiptsData?.items]);

  const totalExpensesAmount = useMemo(() => {
    return (expensesData?.items || [])
      .filter((e) => e.status !== 'CANCELLED')
      .reduce((acc, cur) => acc + (cur.amount || 0), 0);
  }, [expensesData?.items]);

  const createExpenseMutation = useMutation({
    mutationFn: (payload: CreateExpensePayload) => financeService.createExpense(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-finance-expenses'] });
      setIsCreateExpenseOpen(false);
      showToast('success', 'Đã lập phiếu chi vận hành thành công.');
    },
    onError: (err) => {
      const msg = getErrorMessage(err) || 'Không thể tạo phiếu chi. Vui lòng kiểm tra lại.';
      showToast('error', msg);
    },
  });

  const cancelExpenseMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      financeService.cancelExpense(id, { cancellationReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-finance-expenses'] });
      setCancellingExpense(null);
      showToast('success', 'Đã hủy phiếu chi thành công.');
    },
    onError: (err) => {
      const msg = getErrorMessage(err) || 'Không thể hủy phiếu chi.';
      showToast('error', msg);
    },
  });

  const createReceiptMutation = useMutation({
    mutationFn: (payload: CreateReceiptPayload) => {
      return financeService.createInvoice({
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        amount: payload.amount,
        paymentMethod: payload.paymentMethod,
        referenceType: payload.category,
        issuedDate: payload.receiptDate,
        note: payload.note,
      });
    },
    onSuccess: (res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-finance-invoices'] });
      setIsCreateReceiptOpen(false);
      showToast(
        'success',
        `Đã lập phiếu thu thành công cho khách hàng ${vars.customerName} (${formatVND(vars.amount)}).`
      );
    },
    onError: (err) => {
      const msg = getErrorMessage(err) || 'Không thể tạo phiếu thu. Vui lòng kiểm tra lại.';
      showToast('error', msg);
    },
  });

  const handleExportExcel = () => {
    showToast('success', 'Đang kết xuất tệp dữ liệu ra Excel...');
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-6 sm:space-y-7">
      {toast && (
        <div className="fixed top-3.5 md:top-4 left-1/2 lg:left-[calc(50%+130px)] -translate-x-1/2 z-[100] max-w-[500px] w-auto pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <Alert
            size="sm"
            variant={
              toast.type === 'success'
                ? 'success'
                : toast.type === 'warning'
                ? 'warning'
                : 'danger'
            }
            onClose={() => setToast(null)}
            className="w-auto min-w-[280px] max-w-[500px] shadow-[0px_8px_24px_rgba(0,0,0,0.15)] border border-[#E5E5E5] bg-white"
          >
            <p className="text-[13px] font-normal text-[#202939] leading-snug whitespace-nowrap">
              {toast.message}
            </p>
          </Alert>
        </div>
      )}

      <FinanceTopBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        onOpenCreateExpense={() => setIsCreateExpenseOpen(true)}
        onOpenCreateReceipt={() => setIsCreateReceiptOpen(true)}
        onExportExcel={handleExportExcel}
        totalAmount={activeTab === 'receipts' ? totalReceiptsAmount : totalExpensesAmount}
        totalCount={activeTab === 'receipts' ? (receiptsData?.totalCount || 0) : (expensesData?.totalCount || 0)}
      />

      {activeTab === 'receipts' && (
        <div className="bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-4 pb-5 sm:pt-5 sm:pb-6 shadow-xs flex-1 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-6 flex-1 flex flex-col">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1 shrink-0">
                <div>
                  <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
                    Danh sách phiếu thu
                  </h2>
                  <p className="text-[13px] text-[#64748B] mt-1.5 font-normal">
                    Quản lý các khoản thu dịch vụ và gói tập
                  </p>
                </div>

                <ReceiptsToolbar
                  search={receiptSearch}
                  onSearchChange={(val) => {
                    setReceiptSearch(val);
                    setReceiptPageIndex(1);
                  }}
                  status={receiptStatus}
                  onStatusChange={(val) => {
                    setReceiptStatus(val);
                    setReceiptPageIndex(1);
                  }}
                  month={receiptMonth}
                  onMonthChange={(val) => {
                    setReceiptMonth(val);
                    setReceiptPageIndex(1);
                  }}
                  year={receiptYear}
                  onYearChange={(val) => {
                    setReceiptYear(val);
                    setReceiptPageIndex(1);
                  }}
                  onReset={() => {
                    setReceiptSearch('');
                    setReceiptStatus('ALL');
                    setReceiptMonth('ALL');
                    setReceiptYear('ALL');
                    setReceiptPageIndex(1);
                  }}
                />
              </div>

              <div className="flex-1 flex flex-col">
                <ReceiptsTable
                  items={receiptsData?.items || []}
                  isLoading={isLoadingReceipts}
                  pageIndex={receiptPageIndex}
                  pageSize={receiptPageSize}
                  onClearFilter={() => {
                    setReceiptSearch('');
                    setReceiptStatus('ALL');
                    setReceiptMonth('ALL');
                    setReceiptYear('ALL');
                    setReceiptPageIndex(1);
                  }}
                  onView={(invoice) => setSelectedViewInvoice(invoice)}
                />
              </div>
            </div>

            <FinancePagination
              pageIndex={receiptPageIndex}
              pageSize={receiptPageSize}
              totalCount={receiptsData?.totalCount || 0}
              totalPages={receiptsData?.totalPages || 0}
              hasPreviousPage={receiptsData?.hasPreviousPage || false}
              hasNextPage={receiptsData?.hasNextPage || false}
              onPageChange={setReceiptPageIndex}
              onPageSizeChange={(size) => {
                setReceiptPageSize(size);
                setReceiptPageIndex(1);
              }}
              itemUnit="phiếu thu"
            />
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="bg-white rounded-[8px] border border-[#E2E8F0] px-5 sm:px-6 pt-4 pb-5 sm:pt-5 sm:pb-6 shadow-xs flex-1 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute left-0 top-[20px] sm:top-[24px] w-[4px] h-6 bg-[#064343] rounded-none" />
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-6 flex-1 flex flex-col">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1 shrink-0">
                <div>
                  <h2 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
                    Danh sách phiếu chi
                  </h2>
                  <p className="text-[13px] text-[#64748B] mt-1.5 font-normal">
                    Quản lý chi phí vận hành phòng gym
                  </p>
                </div>

                <ExpensesToolbar
                  search={expenseSearch}
                  onSearchChange={(val) => {
                    setExpenseSearch(val);
                    setExpensePageIndex(1);
                  }}
                  category={expenseCategory}
                  onCategoryChange={(val) => {
                    setExpenseCategory(val);
                    setExpensePageIndex(1);
                  }}
                  status={expenseStatus}
                  onStatusChange={(val) => {
                    setExpenseStatus(val);
                    setExpensePageIndex(1);
                  }}
                  month={expenseMonth}
                  onMonthChange={(val) => {
                    setExpenseMonth(val);
                    setExpensePageIndex(1);
                  }}
                  year={expenseYear}
                  onYearChange={(val) => {
                    setExpenseYear(val);
                    setExpensePageIndex(1);
                  }}
                  onReset={() => {
                    setExpenseSearch('');
                    setExpenseCategory('ALL');
                    setExpenseStatus('ALL');
                    setExpenseMonth('ALL');
                    setExpenseYear('ALL');
                    setExpensePageIndex(1);
                  }}
                />
              </div>

              <div className="flex-1 flex flex-col">
                <ExpensesTable
                  items={expensesData?.items || []}
                  isLoading={isLoadingExpenses}
                  pageIndex={expensePageIndex}
                  pageSize={expensePageSize}
                  onClearFilter={() => {
                    setExpenseSearch('');
                    setExpenseCategory('ALL');
                    setExpenseStatus('ALL');
                    setExpenseMonth('ALL');
                    setExpenseYear('ALL');
                    setExpensePageIndex(1);
                  }}
                  onView={(expense) => setSelectedExpenseId(expense.id)}
                  onCancel={(expense) => setCancellingExpense(expense)}
                />
              </div>
            </div>

            <FinancePagination
              pageIndex={expensePageIndex}
              pageSize={expensePageSize}
              totalCount={expensesData?.totalCount || 0}
              totalPages={expensesData?.totalPages || 0}
              hasPreviousPage={expensesData?.hasPreviousPage || false}
              hasNextPage={expensesData?.hasNextPage || false}
              onPageChange={setExpensePageIndex}
              onPageSizeChange={(size) => {
                setExpensePageSize(size);
                setExpensePageIndex(1);
              }}
              itemUnit="phiếu chi"
            />
          </div>
        </div>
      )}

      <CreateReceiptSlidePanel
        isOpen={isCreateReceiptOpen}
        onClose={() => setIsCreateReceiptOpen(false)}
        onSubmit={async (payload) => {
          await createReceiptMutation.mutateAsync(payload);
        }}
        isSubmitting={createReceiptMutation.isPending}
      />

      <ReceiptDetailSlidePanel
        isOpen={Boolean(selectedViewInvoice)}
        onClose={() => setSelectedViewInvoice(null)}
        invoice={selectedViewInvoice}
      />

      <CreateExpenseSlidePanel
        isOpen={isCreateExpenseOpen}
        onClose={() => setIsCreateExpenseOpen(false)}
        onSubmit={async (payload) => {
          await createExpenseMutation.mutateAsync(payload);
        }}
        isSubmitting={createExpenseMutation.isPending}
      />

      <ExpenseDetailSlidePanel
        isOpen={Boolean(selectedExpenseId)}
        onClose={() => setSelectedExpenseId(null)}
        expenseId={selectedExpenseId}
        onCancelRequest={(expense) => {
          setCancellingExpense(expense);
        }}
      />

      <CancelExpenseModal
        isOpen={Boolean(cancellingExpense)}
        onClose={() => setCancellingExpense(null)}
        expense={cancellingExpense}
        onConfirm={async (id, reason) => {
          await cancelExpenseMutation.mutateAsync({ id, reason });
        }}
        isSubmitting={cancelExpenseMutation.isPending}
      />
    </div>
  );
}
