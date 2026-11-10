'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, X, AlertCircle } from 'lucide-react';
import { violationService } from '@/lib/api/modules/violationService';
import { formatVND } from '@/lib/utils/formatters';
import type {
  CreateViolationPayload,
  EmployeeLookupItem,
  PenaltyRuleLookupItem,
} from '@/types';

interface ViolationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (violationCode: string) => void;
}

const getLocalCurrentDateTimeString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export function ViolationFormDialog({ isOpen, onClose, onSuccess }: ViolationFormDialogProps) {
  const queryClient = useQueryClient();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [occurredAt, setOccurredAt] = useState<string>(getLocalCurrentDateTimeString);
  const [evidenceUrl, setEvidenceUrl] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedEmployeeId('');
      setSelectedRuleId('');
      setEvidenceUrl('');
      setNote('');
      setErrors({});
      setServerError(null);
      setOccurredAt(getLocalCurrentDateTimeString());
    }
  }, [isOpen]);

  const { data: rawEmployees = [], isLoading: isLoadingEmployees } = useQuery<EmployeeLookupItem[]>({
    queryKey: ['employees-violation-lookup'],
    queryFn: async () => {
      const res = await violationService.getEmployeesLookup();
      return res.data || [];
    },
    enabled: isOpen,
    staleTime: 30000,
  });

  const employees = useMemo(() => {
    return [...rawEmployees].sort((a, b) => {
      if (a.hasShiftToday && !b.hasShiftToday) return -1;
      if (!a.hasShiftToday && b.hasShiftToday) return 1;
      return a.fullName.localeCompare(b.fullName);
    });
  }, [rawEmployees]);

  const selectedEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedEmployeeId);
  }, [employees, selectedEmployeeId]);

  const { data: penaltyRules = [], isLoading: isLoadingRules } = useQuery<PenaltyRuleLookupItem[]>({
    queryKey: ['penalty-rules-lookup', selectedEmployee?.position],
    queryFn: async () => {
      const audienceParam = selectedEmployee?.position === 'TRAINER' ? 'TRAINER' : 'STAFF';
      const res = await violationService.getPenaltyRulesLookup(audienceParam);
      return res.data || [];
    },
    enabled: !!selectedEmployeeId,
    staleTime: 30000,
  });

  const selectedRule = useMemo(() => {
    return penaltyRules.find((r) => r.id === selectedRuleId);
  }, [penaltyRules, selectedRuleId]);

  const createMutation = useMutation({
    mutationFn: async (payload: CreateViolationPayload) => {
      const res = await violationService.create(payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['violations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-penalty-rules'] });
      onSuccess(data.violationCode);
      onClose();
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code || err?.code;
      const message = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message;

      if (code === 'Violation.TargetAudienceMismatch') {
        setErrors((prev) => ({
          ...prev,
          penaltyRuleId: 'Quy định phạt này không áp dụng cho chức vụ của nhân viên được chọn.',
        }));
      } else if (code === 'Violation.OccurredBeforeRuleEffectiveDate') {
        setErrors((prev) => ({
          ...prev,
          occurredAt: 'Thời gian vi phạm không được xảy ra trước ngày quy định bắt đầu có hiệu lực.',
        }));
      } else if (code === 'Violation.FutureDateNotAllowed') {
        setErrors((prev) => ({
          ...prev,
          occurredAt: 'Thời gian vi phạm không được lớn hơn thời điểm hiện tại.',
        }));
      } else if (code === 'Violation.PayrollPeriodClosed') {
        setServerError('Thời gian vi phạm thuộc kỳ tính lương đã được chốt và duyệt. Không thể tạo biên bản cho kỳ này.');
      } else {
        setServerError(message || 'Không thể tạo biên bản vi phạm.');
      }
    },
  });

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setSelectedRuleId('');
    setErrors((prev) => {
      const next = { ...prev };
      delete next.employeeId;
      delete next.penaltyRuleId;
      return next;
    });
    setServerError(null);
  };

  const handleRuleChange = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.penaltyRuleId;
      return next;
    });
    setServerError(null);
  };

  const handleOccurredAtChange = (value: string) => {
    setOccurredAt(value);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.occurredAt;
      return next;
    });
    setServerError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!selectedEmployeeId) {
      newErrors.employeeId = 'Vui lòng chọn nhân viên vi phạm.';
    }
    if (!selectedRuleId) {
      newErrors.penaltyRuleId = 'Vui lòng chọn quy định phạt.';
    }
    if (!occurredAt) {
      newErrors.occurredAt = 'Vui lòng chọn thời gian vi phạm.';
    } else {
      const selectedDate = new Date(occurredAt);
      if (selectedDate > new Date()) {
        newErrors.occurredAt = 'Thời gian vi phạm không được lớn hơn hiện tại.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setServerError(null);

    createMutation.mutate({
      employeeId: selectedEmployeeId,
      penaltyRuleId: selectedRuleId,
      occurredAt: new Date(occurredAt).toISOString(),
      evidenceUrl: evidenceUrl.trim() || null,
      note: note.trim() || null,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ghi nhận vi phạm nhân viên"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[640px] max-w-full bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
      >
        <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between bg-white shrink-0">
          <div className="border-l-[4px] border-[#064343] pl-3">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              Ghi nhận vi phạm nhân viên
            </h2>
            <p className="text-[13px] text-[#64748B] mt-1.5">
              Lập biên bản kỷ luật cho nhân viên phòng gym theo quy định
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={createMutation.isPending}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#525252] flex items-center justify-center transition-colors cursor-pointer ml-1 disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form id="violation-form" onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {serverError && (
            <div className="p-4 rounded-[8px] bg-red-50 border border-red-200 text-red-700 text-[13px] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span className="leading-relaxed">{serverError}</span>
            </div>
          )}

          <div>
            <div className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase border-b border-[#F1F5F9] pb-2 mb-4">
              THÔNG TIN BIÊN BẢN
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-medium text-[#202939] block mb-1.5">
                  Mã biên bản (Tự động)
                </label>
                <div className="bg-slate-100 border border-slate-200 rounded-[8px] h-[42px] px-3.5 flex items-center text-[13px] text-slate-500 font-mono select-none">
                  VP-YYYYMMDD-XXXX (Hệ thống tự động sinh khi lưu)
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#202939] block mb-1.5">
                  Nhân viên vi phạm <span className="text-[#EE0033]">*</span>
                </label>
                <div
                  className={`border rounded-[8px] h-[42px] px-3 transition-colors ${
                    errors.employeeId
                      ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                      : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                  }`}
                >
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => handleEmployeeChange(e.target.value)}
                    disabled={isLoadingEmployees || createMutation.isPending}
                    className="w-full h-full bg-transparent text-[14px] text-[#202939] outline-none cursor-pointer disabled:cursor-not-allowed"
                  >
                    <option value="">-- Chọn nhân viên vi phạm --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.hasShiftToday ? '🟢 [Có ca hôm nay] ' : ''}
                        {emp.fullName} - {emp.employeeCode} ({emp.position === 'TRAINER' ? 'Huấn luyện viên' : 'Lễ tân'})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.employeeId && (
                  <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5">
                    {errors.employeeId}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#202939] block mb-1.5">
                  Vi phạm (Quy định phạt) <span className="text-[#EE0033]">*</span>
                </label>
                <div
                  className={`border rounded-[8px] h-[42px] px-3 transition-colors ${
                    !selectedEmployeeId
                      ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400'
                      : errors.penaltyRuleId
                      ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                      : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                  }`}
                >
                  <select
                    value={selectedRuleId}
                    onChange={(e) => handleRuleChange(e.target.value)}
                    disabled={!selectedEmployeeId || isLoadingRules || createMutation.isPending}
                    className="w-full h-full bg-transparent text-[14px] text-[#202939] outline-none cursor-pointer disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!selectedEmployeeId
                        ? 'Vui lòng chọn nhân viên trước...'
                        : isLoadingRules
                        ? 'Đang tải danh sách quy định...'
                        : '-- Chọn lỗi vi phạm --'}
                    </option>
                    {penaltyRules.map((rule) => (
                      <option key={rule.id} value={rule.id}>
                        {rule.name} - Mức phạt: {formatVND(rule.fineAmount)}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.penaltyRuleId && (
                  <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5">
                    {errors.penaltyRuleId}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#202939] block mb-1.5">
                  Tiền phạt (VNĐ)
                </label>
                <div className="bg-slate-100 border border-slate-200 rounded-[8px] h-[42px] px-3.5 flex items-center justify-between text-[14px] text-[#064343] font-semibold select-none">
                  <span>
                    {selectedRule ? formatVND(selectedRule.fineAmount) : '0 ₫'}
                  </span>
                  <span className="text-[12px] text-[#64748B] font-normal">
                    (Khóa cứng, snapshot từ quy định)
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#202939] block mb-1.5">
                  Thời gian vi phạm <span className="text-[#EE0033]">*</span>
                </label>
                <div
                  className={`border rounded-[8px] h-[42px] px-3.5 flex items-center transition-colors ${
                    errors.occurredAt
                      ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                      : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                  }`}
                >
                  <input
                    type="datetime-local"
                    value={occurredAt}
                    onChange={(e) => handleOccurredAtChange(e.target.value)}
                    max={getLocalCurrentDateTimeString()}
                    disabled={createMutation.isPending}
                    className="w-full bg-transparent text-[14px] text-[#202939] outline-none cursor-pointer"
                  />
                </div>
                {errors.occurredAt && (
                  <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5">
                    {errors.occurredAt}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase border-b border-[#F1F5F9] pb-2 mb-4">
              CHI TIẾT & BẰNG CHỨNG
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-medium text-[#202939] block mb-1.5">
                  Đường dẫn ảnh bằng chứng (Tùy chọn)
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-[8px] h-[42px] px-3.5 flex items-center focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343] transition-colors">
                  <input
                    type="url"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    disabled={createMutation.isPending}
                    className="w-full bg-transparent text-[14px] text-[#202939] outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#202939] block mb-1.5">
                  Ghi chú / Diễn giải sự việc (Tùy chọn)
                </label>
                <div className="relative bg-slate-50 border border-slate-200 rounded-[8px] focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343] transition-colors">
                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nhập mô tả chi tiết sự việc, vị trí hoặc nhân chứng..."
                    disabled={createMutation.isPending}
                    className="w-full p-3.5 pb-8 bg-transparent text-[14px] text-[#202939] outline-none resize-none placeholder:text-slate-400"
                  />
                  <div className="absolute bottom-2.5 right-3 text-[12px] text-slate-400 select-none">
                    {note.length}/1000
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="h-[72px] px-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={createMutation.isPending}
            className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="violation-form"
            disabled={createMutation.isPending}
            className="h-[40px] px-5 min-w-[120px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>Lưu biên bản</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViolationFormDialog;

