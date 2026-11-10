import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import type {
  CreateViolationPayload,
  EmployeeLookupItem,
  PenaltyRuleLookupItem,
  ViolationDetail,
} from '@/types';

export const violationService = {
  getEmployeesLookup: (search?: string) =>
    apiClient.get<unknown, ApiResponse<EmployeeLookupItem[]>>(
      ENDPOINTS.adminViolations.employeesLookup,
      { params: search ? { search } : undefined }
    ),

  getPenaltyRulesLookup: (targetAudience?: string) =>
    apiClient.get<unknown, ApiResponse<PenaltyRuleLookupItem[]>>(
      ENDPOINTS.adminPenaltyRules.lookup,
      { params: targetAudience ? { targetAudience } : undefined }
    ),

  create: (payload: CreateViolationPayload) =>
    apiClient.post<unknown, ApiResponse<ViolationDetail>>(
      ENDPOINTS.adminViolations.create,
      payload
    ),
};

export default violationService;

