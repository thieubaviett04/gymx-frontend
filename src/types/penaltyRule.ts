export type PenaltyRuleStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'APPLIED' | 'DISCONTINUED';
export type PenaltyRuleSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export type RuleTargetAudience = 'GENERAL' | 'MEMBER' | 'STAFF';

export const RULE_AUDIENCE_LABELS: Record<RuleTargetAudience, string> = {
  GENERAL: 'Chung',
  MEMBER: 'Hội viên',
  STAFF: 'Nhân viên',
};

export const PENALTY_RULE_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Đang áp dụng',
  APPLIED: 'Đang áp dụng',
  INACTIVE: 'Ngừng áp dụng',
  DISCONTINUED: 'Ngừng áp dụng',
  PENDING: 'Chờ áp dụng',
};

export const PENALTY_RULE_SEVERITY_LABELS: Record<PenaltyRuleSeverity, string> = {
  LOW: 'Nhẹ',
  MEDIUM: 'Trung bình',
  HIGH: 'Nghiêm trọng',
};

export function normalizeAudience(val: unknown): RuleTargetAudience {
  if (val === undefined || val === null) return 'GENERAL';
  if (typeof val === 'number') {
    if (val === 1) return 'MEMBER';
    if (val === 2) return 'STAFF';
    return 'GENERAL';
  }
  const str = String(val).trim().toUpperCase();
  if (str === 'MEMBER' || str === '1' || str === 'HOIVIEN' || str === 'HỘI VIÊN') return 'MEMBER';
  if (str === 'STAFF' || str === '2' || str === 'NHANVIEN' || str === 'NHÂN VIÊN') return 'STAFF';
  return 'GENERAL';
}

export function getRuleAudienceLabel(rule: unknown): string {
  if (!rule) return 'Chung';
  if (typeof rule === 'string' || typeof rule === 'number') {
    const norm = normalizeAudience(rule);
    return RULE_AUDIENCE_LABELS[norm] || 'Chung';
  }
  const r = rule as Record<string, unknown>;
  const raw = r.violationType ?? r.targetAudience ?? r.audience;
  const norm = normalizeAudience(raw);
  return RULE_AUDIENCE_LABELS[norm] || 'Chung';
}

export function getRuleFineLabel(rule?: {
  violationType?: unknown;
  targetAudience?: unknown;
  fineAmount?: number | null;
} | null): string {
  if (!rule) return 'Nhắc nhở';
  const norm = normalizeAudience(rule.violationType ?? rule.targetAudience);
  if (norm === 'MEMBER' || !rule.fineAmount || Number(rule.fineAmount) === 0) {
    return 'Nhắc nhở';
  }
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(rule.fineAmount));
}

export function getPenaltyRuleStatusBadge(
  status?: string | null,
  effectiveDate?: string | null
): {
  label: string;
  variant: 'active' | 'inactive' | 'discontinued';
} {
  const norm = (status || '').toUpperCase();
  if (norm === 'DISCONTINUED' || norm === 'INACTIVE') {
    return {
      label: PENALTY_RULE_STATUS_LABELS[norm] || 'Ngừng áp dụng',
      variant: 'discontinued',
    };
  }

  if (norm === 'PENDING') {
    if (effectiveDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const datePart = effectiveDate.split('T')[0];
      const [y, m, d] = datePart.split('-').map(Number);
      const eff = new Date(y, m - 1, d);
      eff.setHours(0, 0, 0, 0);
      if (!isNaN(eff.getTime()) && eff <= today) {
        return {
          label: 'Đang áp dụng',
          variant: 'active',
        };
      }
    }
    return {
      label: PENALTY_RULE_STATUS_LABELS[norm] || 'Chờ áp dụng',
      variant: 'inactive',
    };
  }

  return {
    label: PENALTY_RULE_STATUS_LABELS[norm] || 'Đang áp dụng',
    variant: 'active',
  };
}

export function isPenaltyRuleActive(rule: { status?: string | null; effectiveDate?: string | null }): boolean {
  const norm = (rule.status || '').toUpperCase();
  if (norm === 'DISCONTINUED' || norm === 'INACTIVE') return false;
  if (!rule.effectiveDate) return norm === 'ACTIVE' || norm === 'APPLIED';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const datePart = rule.effectiveDate.split('T')[0];
  const [y, m, d] = datePart.split('-').map(Number);
  const eff = new Date(y, m - 1, d);
  eff.setHours(0, 0, 0, 0);
  return !isNaN(eff.getTime()) && eff <= today;
}

export interface PenaltyRuleSummary {
  id: string;
  ruleCode: string;
  name: string;
  violationType?: RuleTargetAudience | string;
  targetAudience?: RuleTargetAudience | string;
  fineAmount: number;
  severityLevel: PenaltyRuleSeverity;
  status: PenaltyRuleStatus;
  effectiveDate: string;
  description: string | null;
  violationsCount: number;
  createdDate: string;
  lastModifiedDate?: string | null;
}

export interface PenaltyRuleDetail extends PenaltyRuleSummary {
  previousRuleId: string | null;
  previousRuleCode: string | null;
}

export interface CreatePenaltyRulePayload {
  name: string;
  violationType?: string;
  targetAudience?: string;
  fineAmount: number;
  severityLevel: PenaltyRuleSeverity;
  effectiveDate: string;
  status?: PenaltyRuleStatus;
  description?: string | null;
}

export interface UpdatePenaltyRulePayload {
  name: string;
  violationType?: string;
  targetAudience?: string;
  fineAmount: number;
  severityLevel: PenaltyRuleSeverity;
  effectiveDate: string;
  status: PenaltyRuleStatus;
  description?: string | null;
  mode?: 'DISCONTINUE_AND_CREATE' | null;
}

export interface PenaltyRuleQueryParams {
  search?: string;
  severity?: string;
  status?: string;
  targetAudience?: string;
  violationType?: string;
  sortBy?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface PagedPenaltyRuleResult {
  items: PenaltyRuleSummary[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PenaltyRuleFormData {
  name: string;
  violationType: RuleTargetAudience;
  fineAmount: string | number;
  severityLevel: PenaltyRuleSeverity | '';
  effectiveDate: string;
  status: PenaltyRuleStatus;
  description: string;
}

export type PenaltyRuleFormErrors = Partial<Record<keyof PenaltyRuleFormData | 'general', string>>;
