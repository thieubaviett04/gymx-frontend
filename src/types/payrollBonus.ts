export type PayrollBonusType = 'KPI' | 'HOLIDAY';

export type PayrollBonusTargetType = 'INDIVIDUAL' | 'ALL' | 'BY_POSITION';

export interface PayrollBonusItem {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  fullName?: string;
  position: 'TRAINER' | 'RECEPTIONIST' | string;
  month: number;
  year: number;
  amount: number;
  bonusType: 'KPI' | 'HOLIDAY' | string;
  reason: string;
  monthlyPerformance?: string;
  payrollPeriodStatus?: string;
  createdAt?: string;
}

export interface PayrollBonusPagedResult {
  items: PayrollBonusItem[];
  totalBonusAmount: number;
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface BonusEmployeeLookup {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  position: 'TRAINER' | 'RECEPTIONIST' | string;
  monthlyPerformance?: string;
}

export interface CreatePayrollBonusPayload {
  month: number;
  year: number;
  bonusType: 'KPI' | 'HOLIDAY';
  targetType: 'INDIVIDUAL' | 'ALL' | 'BY_POSITION';
  position?: string;
  employeeIds?: string[];
  employeeId?: string;
  amount: number;
  reason: string;
  content?: string;
}

export interface UpdatePayrollBonusPayload {
  amount: number;
  reason: string;
  content?: string;
  bonusType: 'KPI' | 'HOLIDAY';
}

export interface PayrollBonusQueryParams {
  month?: number;
  year?: number;
  search?: string;
  position?: string;
  bonusType?: string;
  pageIndex?: number;
  pageSize?: number;
}

