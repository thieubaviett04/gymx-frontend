'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  CreatePenaltyRulePayload,
  PenaltyRuleDetail,
  PenaltyRuleFormData,
  PenaltyRuleFormErrors,
  PenaltyRuleSeverity,
  PenaltyRuleStatus,
  PenaltyRuleSummary,
  RuleTargetAudience,
  UpdatePenaltyRulePayload,
} from '@/types/penaltyRule';
import { normalizeAudience } from '@/types/penaltyRule';

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTomorrowString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const y = tomorrow.getFullYear();
  const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const d = String(tomorrow.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const INITIAL_RULE_FORM: PenaltyRuleFormData = {
  name: '',
  violationType: 'GENERAL',
  fineAmount: '',
  severityLevel: 'LOW',
  effectiveDate: getTodayString(),
  status: 'ACTIVE',
  description: '',
};

const normalizeStatus = (s?: string | null): PenaltyRuleStatus => {
  if (!s) return 'ACTIVE';
  const norm = s.toUpperCase();
  if (norm === 'APPLIED') return 'ACTIVE';
  if (norm === 'DISCONTINUED') return 'INACTIVE';
  return norm as PenaltyRuleStatus;
};

interface UsePenaltyRuleFormOptions {
  initialData?: PenaltyRuleDetail | PenaltyRuleSummary | null;
  isEdit?: boolean;
}

export function usePenaltyRuleForm({ initialData, isEdit = false }: UsePenaltyRuleFormOptions = {}) {
  const [formData, setFormData] = useState<PenaltyRuleFormData>(() => {
    if (initialData) {
      const effDate = initialData.effectiveDate || (initialData as any).effectiveFrom || '';
      return {
        name: initialData.name || '',
        violationType: normalizeAudience(initialData.violationType ?? (initialData as any).targetAudience),
        fineAmount: initialData.fineAmount ?? '',
        severityLevel: initialData.severityLevel || 'LOW',
        effectiveDate: effDate ? effDate.split('T')[0] : getTodayString(),
        status: normalizeStatus(initialData.status),
        description: initialData.description || '',
      };
    }
    return {
      ...INITIAL_RULE_FORM,
      effectiveDate: getTodayString(),
    };
  });

  const [errors, setErrors] = useState<PenaltyRuleFormErrors>({});

  useEffect(() => {
    if (initialData) {
      const effDate = initialData.effectiveDate || (initialData as any).effectiveFrom || '';
      setFormData({
        name: initialData.name || '',
        violationType: normalizeAudience(initialData.violationType ?? (initialData as any).targetAudience),
        fineAmount: initialData.fineAmount ?? '',
        severityLevel: initialData.severityLevel || 'LOW',
        effectiveDate: effDate ? effDate.split('T')[0] : getTodayString(),
        status: normalizeStatus(initialData.status),
        description: initialData.description || '',
      });
      setErrors({});
    } else {
      setFormData({
        ...INITIAL_RULE_FORM,
        effectiveDate: getTodayString(),
      });
      setErrors({});
    }
  }, [initialData]);

  const handleChange = useCallback(
    <K extends keyof PenaltyRuleFormData>(field: K, value: PenaltyRuleFormData[K]) => {
      const todayStr = getTodayString();
      let nextStatus = formData.status;
      let nextDate = formData.effectiveDate;

      if (field === 'status') {
        const statusVal = normalizeStatus(value as PenaltyRuleStatus);
        nextStatus = statusVal;
        if (statusVal === 'PENDING') {
          const isFuture = formData.effectiveDate && formData.effectiveDate > todayStr;
          nextDate = isFuture ? formData.effectiveDate : getTomorrowString();
        } else if (statusVal === 'ACTIVE') {
          const isFuture = formData.effectiveDate && formData.effectiveDate > todayStr;
          nextDate = isFuture ? todayStr : formData.effectiveDate;
        } else if (statusVal === 'INACTIVE' || statusVal === 'DISCONTINUED') {
          nextDate = formData.effectiveDate;
        }
      } else if (field === 'effectiveDate') {
        nextDate = String(value || '');
      }

      setFormData((prev) => {
        const next = {
          ...prev,
          [field]: value,
        };
        if (field === 'violationType') {
          if (value === 'MEMBER') {
            next.fineAmount = 0;
          } else if (value === 'STAFF' && Number(prev.fineAmount) === 0) {
            next.fineAmount = '';
          }
        }
        if (field === 'status') {
          next.status = nextStatus;
          next.effectiveDate = nextDate;
        }
        if (field === 'effectiveDate') {
          next.effectiveDate = nextDate;
        }
        return next;
      });

      setErrors((prev) => {
        const updated = {
          ...prev,
          [field]: undefined,
          ...(field === 'violationType' ? { fineAmount: undefined } : {}),
        };

        if (field === 'status' || field === 'effectiveDate') {
          if (nextStatus === 'INACTIVE' || nextStatus === 'DISCONTINUED') {
            updated.effectiveDate = undefined;
          } else if (!nextDate) {
            updated.effectiveDate = 'Vui lòng chọn ngày áp dụng.';
          } else if (!isEdit && nextDate < todayStr) {
            updated.effectiveDate = 'Ngày bắt đầu áp dụng không được ở trong quá khứ.';
          } else if (nextStatus === 'PENDING' && nextDate <= todayStr) {
            updated.effectiveDate = 'Trạng thái chưa áp dụng không thể chọn ngày hiện tại, quá khứ';
          } else if ((nextStatus === 'ACTIVE' || nextStatus === 'APPLIED') && nextDate > todayStr) {
            updated.effectiveDate = 'Trạng thái đang áp dụng không thể chọn ngày tương lai';
          } else {
            updated.effectiveDate = undefined;
          }
        }

        return updated;
      });
    },
    [formData.effectiveDate, formData.status, isEdit]
  );

  const resetForm = useCallback(() => {
    if (initialData) {
      const effDate = initialData.effectiveDate || (initialData as any).effectiveFrom || '';
      const aud = normalizeAudience(initialData.violationType ?? (initialData as any).targetAudience);
      setFormData({
        name: initialData.name || '',
        violationType: aud,
        fineAmount: aud === 'MEMBER' ? 0 : (initialData.fineAmount ?? ''),
        severityLevel: initialData.severityLevel || 'LOW',
        effectiveDate: effDate ? effDate.split('T')[0] : getTodayString(),
        status: normalizeStatus(initialData.status),
        description: initialData.description || '',
      });
    } else {
      setFormData({
        ...INITIAL_RULE_FORM,
        effectiveDate: getTodayString(),
      });
    }
    setErrors({});
  }, [initialData]);

  const validate = useCallback(() => {
    const newErrors: PenaltyRuleFormErrors = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Vui lòng nhập tên quy định.';
    } else if (trimmedName.length > 150) {
      newErrors.name = 'Tên quy định không được vượt quá 150 ký tự.';
    }

    if (!formData.severityLevel) {
      newErrors.severityLevel = 'Vui lòng chọn mức độ nghiêm trọng.';
    }

    if (formData.violationType === 'MEMBER') {
      // Member rules strictly enforce fineAmount = 0 (strike system only)
    } else if (formData.violationType === 'STAFF') {
      const fine = typeof formData.fineAmount === 'string' ? Number(formData.fineAmount) : formData.fineAmount;
      if (formData.fineAmount === '' || isNaN(fine) || fine <= 0) {
        newErrors.fineAmount = 'Quy định kỷ luật nhân viên yêu cầu nhập số tiền phạt lớn hơn 0 ₫.';
      }
    } else {
      const fine = typeof formData.fineAmount === 'string' ? Number(formData.fineAmount) : formData.fineAmount;
      if (formData.fineAmount === '' || isNaN(fine)) {
        newErrors.fineAmount = 'Vui lòng nhập số tiền phạt.';
      } else if (fine < 0) {
        newErrors.fineAmount = 'Số tiền phạt không được âm.';
      }
    }

    if (formData.status !== 'INACTIVE' && formData.status !== 'DISCONTINUED') {
      if (!formData.effectiveDate) {
        newErrors.effectiveDate = 'Vui lòng chọn ngày bắt đầu áp dụng.';
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [y, m, d] = formData.effectiveDate.split('-').map(Number);
        const selected = new Date(y, m - 1, d);
        selected.setHours(0, 0, 0, 0);

        if (formData.status === 'PENDING') {
          if (selected <= today) {
            newErrors.effectiveDate = 'Trạng thái chưa áp dụng không thể chọn ngày hiện tại, quá khứ';
          }
        } else if (formData.status === 'ACTIVE' || formData.status === 'APPLIED') {
          if (selected > today) {
            newErrors.effectiveDate = 'Trạng thái đang áp dụng không thể chọn ngày tương lai';
          } else if (!isEdit && selected < today) {
            newErrors.effectiveDate = 'Ngày bắt đầu áp dụng không được ở trong quá khứ.';
          }
        } else if (!isEdit && selected < today) {
          newErrors.effectiveDate = 'Ngày bắt đầu áp dụng không được ở trong quá khứ.';
        }
      }
    }

    if (!formData.status) {
      newErrors.status = 'Vui lòng chọn trạng thái.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isEdit]);

  const getCreatePayload = useCallback((): CreatePenaltyRulePayload | null => {
    if (!validate()) return null;
    const aud = formData.violationType || 'GENERAL';
    const isMember = aud === 'MEMBER';
    return {
      name: formData.name.trim(),
      violationType: aud,
      targetAudience: aud,
      fineAmount: isMember ? 0 : Number(formData.fineAmount || 0),
      severityLevel: formData.severityLevel as PenaltyRuleSeverity,
      effectiveDate: formData.effectiveDate.split('T')[0],
      status: normalizeStatus(formData.status),
      description: formData.description.trim() || null,
    };
  }, [formData, validate]);

  const getUpdatePayload = useCallback((mode?: 'DISCONTINUE_AND_CREATE' | null): UpdatePenaltyRulePayload | null => {
    if (!validate()) return null;
    const aud = formData.violationType || 'GENERAL';
    const isMember = aud === 'MEMBER';
    return {
      name: formData.name.trim(),
      violationType: aud,
      targetAudience: aud,
      fineAmount: isMember ? 0 : Number(formData.fineAmount || 0),
      severityLevel: formData.severityLevel as PenaltyRuleSeverity,
      effectiveDate: formData.effectiveDate.split('T')[0],
      status: normalizeStatus(formData.status),
      description: formData.description.trim() || null,
      mode: mode || null,
    };
  }, [formData, validate]);

  const clearError = useCallback((field: keyof PenaltyRuleFormData) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }, []);

  return {
    formData,
    errors,
    setErrors,
    clearError,
    handleChange,
    resetForm,
    validate,
    getCreatePayload,
    getUpdatePayload,
  };
}

export default usePenaltyRuleForm;
