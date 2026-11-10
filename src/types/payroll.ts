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

