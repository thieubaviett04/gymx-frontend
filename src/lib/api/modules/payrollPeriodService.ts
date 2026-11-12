import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse, PagedResult } from '@/types/api';
import type {
  CalculatePayrollRequest,
  PayrollPeriodDetailDto,
  PayrollPeriodQueryParams,
  PayrollPeriodSummaryDto,
  PayslipDetailDto,
  PayslipQueryParams,
  PayslipSummaryDto,
  UpdateKpiBonusRequest,
} from '@/types/payroll';

export const payrollPeriodService = {
  getPeriods: (params?: PayrollPeriodQueryParams) =>
    apiClient.get<unknown, ApiResponse<PagedResult<PayrollPeriodSummaryDto>>>(
      ENDPOINTS.adminPayroll.periods.list,
      { params }
    ),

  getPeriodById: (id: string) =>
    apiClient.get<unknown, ApiResponse<PayrollPeriodDetailDto>>(
      ENDPOINTS.adminPayroll.periods.byId(id)
    ),

  calculate: (payload: CalculatePayrollRequest) =>
    apiClient.post<unknown, ApiResponse<PayrollPeriodDetailDto>>(
      ENDPOINTS.adminPayroll.periods.calculate,
      payload
    ),

  lockPeriod: (id: string) =>
    apiClient.post<unknown, ApiResponse<PayrollPeriodDetailDto>>(
      ENDPOINTS.adminPayroll.periods.lock(id)
    ),

  getPayslips: (params?: PayslipQueryParams) =>
    apiClient.get<unknown, ApiResponse<PagedResult<PayslipSummaryDto>>>(
      ENDPOINTS.adminPayroll.payslips.list,
      { params }
    ),

  getPayslipById: (id: string) =>
    apiClient.get<unknown, ApiResponse<PayslipDetailDto>>(
      ENDPOINTS.adminPayroll.payslips.byId(id)
    ),

  updateKpiBonus: (id: string, payload: UpdateKpiBonusRequest) =>
    apiClient.patch<unknown, ApiResponse<PayslipDetailDto>>(
      ENDPOINTS.adminPayroll.payslips.updateKpiBonus(id),
      payload
    ),

  getMyPayslips: () =>
    apiClient.get<unknown, ApiResponse<PayslipSummaryDto[]>>(
      ENDPOINTS.staffPayroll.myPayslips
    ),
};

export default payrollPeriodService;
