import apiClient from '@/lib/api/core/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import type {
  CreatePenaltyRulePayload,
  PagedPenaltyRuleResult,
  PenaltyRuleDetail,
  PenaltyRuleQueryParams,
  UpdatePenaltyRulePayload,
} from '@/types/penaltyRule';

export const penaltyRuleService = {
  list: (params?: PenaltyRuleQueryParams) =>
    apiClient.get<unknown, ApiResponse<PagedPenaltyRuleResult>>(
      ENDPOINTS.adminPenaltyRules.list,
      { params }
    ),

  byId: (id: string) =>
    apiClient.get<unknown, ApiResponse<PenaltyRuleDetail>>(
      ENDPOINTS.adminPenaltyRules.byId(id)
    ),

  create: (payload: CreatePenaltyRulePayload) =>
    apiClient.post<unknown, ApiResponse<PenaltyRuleDetail>>(
      ENDPOINTS.adminPenaltyRules.create,
      payload
    ),

  update: (id: string, payload: UpdatePenaltyRulePayload) =>
    apiClient.put<unknown, ApiResponse<PenaltyRuleDetail>>(
      ENDPOINTS.adminPenaltyRules.update(id),
      payload
    ),

  delete: (id: string) =>
    apiClient.delete<unknown, ApiResponse<null>>(
      ENDPOINTS.adminPenaltyRules.delete(id)
    ),

  discontinue: (id: string) =>
    apiClient.patch<unknown, ApiResponse<null>>(
      ENDPOINTS.adminPenaltyRules.discontinue(id)
    ),
};

export default penaltyRuleService;

