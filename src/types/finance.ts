export type ExpenseCategory =
  | 'RENT'
  | 'UTILITIES'
  | 'MAINTENANCE'
  | 'EQUIPMENT'
  | 'OTHER';

export type ExpenseStatus = 'CONFIRMED' | 'CANCELLED';

export interface ExpenseSummaryDto {
  id: string;
  expenseCode: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  description: string;
  status: ExpenseStatus;
  recordedByName: string;
  createdAt: string;
}

export interface ExpenseDetailDto extends ExpenseSummaryDto {
  recordedById: string;
  cancelledById?: string | null;
  cancelledByName?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
}

export interface CreateExpensePayload {
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  description: string;
}

export interface CancelExpensePayload {
  cancellationReason: string;
}

export interface CreateInvoicePayload {
  customerName: string;
  customerPhone?: string;
  memberCode?: string;
  amount: number;
  paymentMethod: string;
  referenceType: string;
  issuedDate: string;
  note?: string;
}

export type InvoiceStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export type InvoiceReferenceType =
  | 'PACKAGE'
  | 'PT_SESSION'
  | 'DAY_TICKET'
  | 'SERVICE_FEE'
  | 'OTHER';

export interface InvoiceSummaryDto {
  id: string;
  invoiceNumber: string;
  memberId?: string | null;
  memberCode?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  referenceType: string;
  referenceId: string;
  subtotal: number;
  totalAmount: number;
  status: InvoiceStatus;
  issuedAt: string;
  paidAt?: string | null;
  paymentMethod?: string | null;
  creatorName?: string | null;
}

export interface ExpenseQueryParams {
  search?: string;
  category?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface InvoiceQueryParams {
  search?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  pageIndex?: number;
  pageSize?: number;
}

