import type { PagedResult } from './api';

export type TargetRole = 'TRAINER' | 'RECEPTIONIST' | 'ALL';
export type BaseRateType = 'MONTHLY' | 'PER_SHIFT' | 'HOURLY';
export type FormulaStatus = 'ACTIVE' | 'INACTIVE';

export interface SalaryFormulaDto {
  id: string;
  name: string;
  targetRole: TargetRole;
  baseRateType: BaseRateType;
  baseRate: number;
  standardWorkDays: number;
  pricePerPtSession: number;
  salesCommissionPercent: number;
  effectiveDate: string;
  status: FormulaStatus;
  description?: string | null;
  creatorName?: string;
  createdAt?: string;
  inUse?: boolean;
}

export interface SalaryFormulaLookupDto {
  id: string;
  name: string;
  targetRole: TargetRole;
  baseRate: number;
  effectiveDate: string;
}

export interface CreateSalaryFormulaRequest {
  name: string;
  targetRole: TargetRole;
  baseRateType: BaseRateType;
  baseRate: number;
  standardWorkDays: number;
  pricePerPtSession: number;
  salesCommissionPercent: number;
  effectiveDate: string;
  description?: string;
}

export interface UpdateSalaryFormulaRequest extends CreateSalaryFormulaRequest {}

export interface ToggleSalaryFormulaStatusRequest {
  isActive: boolean;
}

export interface SalaryFormulaQueryParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  targetRole?: TargetRole | 'ALL';
  status?: FormulaStatus | 'ALL';
}

export type PagedSalaryFormulaResult = PagedResult<SalaryFormulaDto>;

export const TARGET_ROLE_LABELS: Record<TargetRole, string> = {
  ALL: 'Tất cả nhân viên',
  TRAINER: 'Huấn luyện viên',
  RECEPTIONIST: 'Lễ tân',
};

export const BASE_RATE_TYPE_LABELS: Record<BaseRateType, string> = {
  MONTHLY: 'Lương theo tháng',
  PER_SHIFT: 'Lương theo ca',
  HOURLY: 'Lương theo giờ',
};

export const BASE_RATE_TYPE_UNITS: Record<BaseRateType, string> = {
  MONTHLY: '/tháng',
  PER_SHIFT: '/ca',
  HOURLY: '/giờ',
};

export const FORMULA_STATUS_LABELS: Record<FormulaStatus, string> = {
  ACTIVE: 'Đang áp dụng',
  INACTIVE: 'Ngừng áp dụng',
};

export type PayrollPeriodStatus = 'DRAFT' | 'CALCULATED' | 'LOCKED' | 'CONFIRMED' | 'PAID';
export type PayslipStatus = 'DRAFT' | 'APPROVED' | 'PAID' | 'FINALIZED';

export interface PayslipSummaryDto {
  id: string;
  payrollPeriodId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  position: 'RECEPTIONIST' | 'TRAINER' | 'TECHNICIAN' | 'MANAGER' | string;
  baseRateType?: BaseRateType;
  baseSalary: number;
  workedShifts: number;
  standardWorkDays?: number;
  ptSessionsCount?: number;
  ptTeachingAmount?: number;
  salesRevenue?: number;
  commissionAmount?: number;
  kpiBonusAmount?: number;
  bonusAmount: number;
  penaltyAmount: number;
  totalSalary: number;
  status: PayslipStatus;
  generatedAt: string;
  note?: string | null;
  ptSessions?: number;
  salesAmount?: number;
  lateCount?: number;
  earlyLeaveCount?: number;
}

export interface PayslipDetailDto extends PayslipSummaryDto {
  baseSalaryRate?: number;
  salaryFormulaName?: string;
  salaryFormulaType?: 'HOURLY' | 'DAILY' | 'FIXED' | 'HYBRID';
  attendanceRate?: number;
  periodMonth?: number;
  periodYear?: number;
  lateCount?: number;
  earlyLeaveCount?: number;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  paidAt?: string | null;
  ptSessionPrice?: number;
  salesCommissionPercent?: number;
}

export interface PayrollPeriodSummaryDto {
  id: string;
  periodStart: string;
  periodEnd: string;
  salaryFormulaId?: string;
  salaryFormulaName?: string;
  status: PayrollPeriodStatus;
  totalSalary: number;
  totalBaseSalary?: number;
  totalPtAmount?: number;
  totalCommissionAmount?: number;
  totalKpiBonusAmount?: number;
  totalPenaltyAmount?: number;
  totalBonus?: number;
  totalPenalty?: number;
  totalEmployees: number;
  createdAt?: string | null;
  calculatedAt?: string | null;
  lockedAt?: string | null;
  lockedBy?: string | null;
  confirmedAt?: string | null;
  confirmedByName?: string | null;
}

export interface PayrollPeriodDetailDto extends PayrollPeriodSummaryDto {
  payslips: PayslipSummaryDto[];
}

export interface CalculatePayrollRequest {
  month: number;
  year: number;
}

export interface PayrollPeriodQueryParams {
  pageIndex?: number;
  pageSize?: number;
  year?: number;
  status?: PayrollPeriodStatus | 'ALL';
}

export interface PayslipQueryParams {
  pageIndex?: number;
  pageSize?: number;
  periodId?: string;
  employeeId?: string;
  search?: string;
  role?: TargetRole | 'ALL';
  status?: PayslipStatus | 'ALL';
}

export const PAYROLL_PERIOD_STATUS_LABELS: Record<PayrollPeriodStatus, string> = {
  DRAFT: 'Bản nháp',
  CALCULATED: 'Đã tính',
  LOCKED: 'Đã khóa',
  CONFIRMED: 'Đã khóa',
  PAID: 'Đã thanh toán',
};

export const PAYSLIP_STATUS_LABELS: Record<PayslipStatus, string> = {
  DRAFT: 'Bản nháp',
  APPROVED: 'Đã duyệt',
  PAID: 'Đã thanh toán',
  FINALIZED: 'Chính thức',
};


