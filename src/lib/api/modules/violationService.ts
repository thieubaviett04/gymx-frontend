import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import type {
  CancelViolationPayload,
  CreateViolationPayload,
  EmployeeLookupItem,
  PagedViolationResult,
  PenaltyRuleLookupItem,
  ViolationDetail,
  ViolationQueryParams,
} from '@/types';

export const violationService = {
  getViolations: (params?: ViolationQueryParams) =>
    apiClient.get<unknown, ApiResponse<PagedViolationResult>>(
      ENDPOINTS.adminViolations.list,
      { params }
    ),

  getViolationById: (id: string) =>
    apiClient.get<unknown, ApiResponse<ViolationDetail>>(
      ENDPOINTS.adminViolations.byId(id)
    ),

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

  delete: (id: string, reason?: string) =>
    apiClient.delete<unknown, ApiResponse<{ success: boolean; message: string }>>(
      ENDPOINTS.adminViolations.delete(id),
      { params: reason ? { reason } : undefined }
    ),

  cancel: (id: string, payload?: CancelViolationPayload | string) => {
    const reason = typeof payload === 'string' ? payload : payload?.cancellationReason;
    return violationService.delete(id, reason);
  },

  uploadEvidence: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<unknown, ApiResponse<{ evidenceUrl: string }>>(
      ENDPOINTS.adminViolations.uploadEvidence,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
};

export default violationService;
