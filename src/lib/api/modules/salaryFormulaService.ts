import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import type {
  CreateSalaryFormulaRequest,
  PagedSalaryFormulaResult,
  SalaryFormulaDto,
  SalaryFormulaLookupDto,
  SalaryFormulaQueryParams,
  ToggleSalaryFormulaStatusRequest,
  UpdateSalaryFormulaRequest,
} from '@/types';

export const salaryFormulaService = {
  list: (params?: SalaryFormulaQueryParams) =>
    apiClient.get<unknown, ApiResponse<PagedSalaryFormulaResult>>(
      ENDPOINTS.adminPayroll.formulas.list,
      { params }
    ),

  lookup: () =>
    apiClient.get<unknown, ApiResponse<SalaryFormulaLookupDto[]>>(
      ENDPOINTS.adminPayroll.formulas.lookup
    ),

  byId: (id: string) =>
    apiClient.get<unknown, ApiResponse<SalaryFormulaDto>>(
      ENDPOINTS.adminPayroll.formulas.byId(id)
    ),

  create: (payload: CreateSalaryFormulaRequest) =>
    apiClient.post<unknown, ApiResponse<SalaryFormulaDto>>(
      ENDPOINTS.adminPayroll.formulas.create,
      payload
    ),

  update: (id: string, payload: UpdateSalaryFormulaRequest) =>
    apiClient.put<unknown, ApiResponse<SalaryFormulaDto>>(
      ENDPOINTS.adminPayroll.formulas.update(id),
      payload
    ),

  toggleStatus: (id: string, isActive: boolean) =>
    apiClient.patch<unknown, ApiResponse<SalaryFormulaDto>>(
      ENDPOINTS.adminPayroll.formulas.toggleStatus(id),
      { isActive } satisfies ToggleSalaryFormulaStatusRequest
    ),
};

export default salaryFormulaService;

