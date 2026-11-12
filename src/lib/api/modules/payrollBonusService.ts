import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import type {
  BonusEmployeeLookup,
  CreatePayrollBonusPayload,
  PayrollBonusItem,
  PayrollBonusPagedResult,
  PayrollBonusQueryParams,
  UpdatePayrollBonusPayload,
} from '@/types/payrollBonus';

export const payrollBonusService = {
  getBonuses: (params?: PayrollBonusQueryParams) =>
    apiClient.get<unknown, ApiResponse<PayrollBonusPagedResult>>(
      ENDPOINTS.adminPayroll.bonuses.list,
      { params }
    ),

  getEmployeesLookup: (params?: { month?: number; year?: number; search?: string }) =>
    apiClient.get<unknown, ApiResponse<BonusEmployeeLookup[]>>(
      ENDPOINTS.adminPayroll.bonuses.employeesLookup,
      { params }
    ),

  createBonus: (payload: CreatePayrollBonusPayload) =>
    apiClient.post<unknown, ApiResponse<{ createdCount: number }>>(
      ENDPOINTS.adminPayroll.bonuses.list,
      payload
    ),

  updateBonus: (id: string, payload: UpdatePayrollBonusPayload) =>
    apiClient.put<unknown, ApiResponse<PayrollBonusItem>>(
      ENDPOINTS.adminPayroll.bonuses.byId(id),
      payload
    ),

  deleteBonus: (id: string) =>
    apiClient.delete<unknown, ApiResponse<boolean>>(
      ENDPOINTS.adminPayroll.bonuses.byId(id)
    ),
};

export default payrollBonusService;

