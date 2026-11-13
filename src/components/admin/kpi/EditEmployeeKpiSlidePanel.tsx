'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { FolderOpenIcon } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { EmployeeKpiProgressSummary, UpdateEmployeeKpiPayload } from '@/types/kpi';

interface EditEmployeeKpiSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  kpi: EmployeeKpiProgressSummary | null;
  onSave: (id: string, payload: UpdateEmployeeKpiPayload) => Promise<void>;
  isSaving?: boolean;
}

export function EditEmployeeKpiSlidePanel({
  isOpen,
  onClose,
  kpi,
  onSave,
  isSaving = false,
}: EditEmployeeKpiSlidePanelProps) {
  const [targetRevenue, setTargetRevenue] = useState<number>(0);
  const [targetBonusAmount, setTargetBonusAmount] = useState<number>(0);
  const [targetPtSessions, setTargetPtSessions] = useState<number | ''>('');
  const [targetNewMembers, setTargetNewMembers] = useState<number | ''>('');
  const [note, setNote] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (kpi) {
      setTargetRevenue(kpi.targetRevenue || 0);
      setTargetBonusAmount(kpi.targetBonusAmount || 0);
      setTargetPtSessions(
        kpi.targetPtSessions !== undefined && kpi.targetPtSessions !== null
          ? kpi.targetPtSessions
          : ''
      );
      setTargetNewMembers(
        kpi.targetNewMembers !== undefined && kpi.targetNewMembers !== null
          ? kpi.targetNewMembers
          : ''
      );
      setNote(kpi.note || '');
      setErrors({});
    }
  }, [kpi]);

  if (!isOpen || !kpi) return null;

  const isTrainer = kpi.position === 'TRAINER';

  const clearErrors = () => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (targetRevenue < 0) {
      newErrors.targetRevenue = 'Chỉ tiêu doanh thu không thể âm.';
    }
    if (targetBonusAmount < 0) {
      newErrors.targetBonusAmount = 'Mức thưởng không thể âm.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave(kpi.id, {
        targetRevenue,
        targetBonusAmount,
        targetPtSessions: targetPtSessions === '' ? null : Number(targetPtSessions),
        targetNewMembers: targetNewMembers === '' ? null : Number(targetNewMembers),
        note: note.trim() || undefined,
      });
      onClose();
    } catch {
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Điều chỉnh chỉ tiêu KPI cá nhân"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[680px] max-w-full bg-white h-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border-l border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <div className="pt-6 pb-4 pr-6 pl-0 flex items-center justify-between shrink-0 bg-white border-b border-[#F1F5F9]">
          <div className="flex items-center h-[28px] border-l-[4px] border-[#064343] pl-5 min-w-0">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              Điều chỉnh chỉ tiêu KPI cá nhân
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#525252] flex items-center justify-center transition-colors cursor-pointer ml-1 disabled:opacity-50"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          <div className="bg-white rounded-xl">
            <div className="border-b border-[#F1F5F9] pb-2 mb-4">
              <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                THÔNG TIN NHÂN VIÊN
              </h4>
            </div>

            <div className="px-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
              <InfoItem label="Mã NV" value={kpi.employeeCode} />
              <InfoItem label="Họ và tên" value={kpi.fullName} />
              <InfoItem label="Mẫu KPI" value={kpi.templateName} />
            </div>
          </div>

          <div className="bg-white rounded-xl">
            <div className="border-b border-[#F1F5F9] pb-2 mb-4">
              <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                CHỈ TIÊU ĐIỀU CHỈNH
              </h4>
            </div>

            <div className="px-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div
                  className="flex flex-col gap-1.5 min-w-0"
                  onClick={clearErrors}
                  onPointerDown={clearErrors}
                >
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Chỉ tiêu doanh thu <span className="text-[#EE0033]">*</span>
                  </label>
                  <div
                    className={cn(
                      'h-[42px] px-3.5 rounded-[8px] flex items-center transition-colors border',
                      errors.targetRevenue
                        ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                        : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                    )}
                  >
                    <input
                      type="number"
                      min="0"
                      step="500000"
                      disabled={isSaving}
                      value={targetRevenue || ''}
                      onPointerDown={clearErrors}
                      onFocus={clearErrors}
                      onClick={clearErrors}
                      onChange={(e) => {
                        clearErrors();
                        setTargetRevenue(Number(e.target.value));
                      }}
                      placeholder="Nhập"
                      className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
                    />
                    <div className="flex items-center gap-2 pl-2 select-none shrink-0">
                      <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                      <span className="text-[13px] font-semibold text-[#064343]">
                        VND
                      </span>
                    </div>
                  </div>
                  {errors.targetRevenue && (
                    <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
                      {errors.targetRevenue}
                    </p>
                  )}
                </div>

                <div
                  className="flex flex-col gap-1.5 min-w-0"
                  onClick={clearErrors}
                  onPointerDown={clearErrors}
                >
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Mức thưởng chỉ tiêu <span className="text-[#EE0033]">*</span>
                  </label>
                  <div
                    className={cn(
                      'h-[42px] px-3.5 rounded-[8px] flex items-center transition-colors border',
                      errors.targetBonusAmount
                        ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                        : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                    )}
                  >
                    <input
                      type="number"
                      min="0"
                      step="100000"
                      disabled={isSaving}
                      value={targetBonusAmount || ''}
                      onPointerDown={clearErrors}
                      onFocus={clearErrors}
                      onClick={clearErrors}
                      onChange={(e) => {
                        clearErrors();
                        setTargetBonusAmount(Number(e.target.value));
                      }}
                      placeholder="Nhập"
                      className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
                    />
                    <div className="flex items-center gap-2 pl-2 select-none shrink-0">
                      <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                      <span className="text-[13px] font-semibold text-[#064343]">
                        VND
                      </span>
                    </div>
                  </div>
                  {errors.targetBonusAmount && (
                    <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
                      {errors.targetBonusAmount}
                    </p>
                  )}
                </div>
              </div>

              {isTrainer ? (
                <div
                  className="flex flex-col gap-1.5 min-w-0"
                  onClick={clearErrors}
                  onPointerDown={clearErrors}
                >
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Chỉ tiêu số buổi dạy PT
                  </label>
                  <div
                    className={cn(
                      'h-[42px] px-3.5 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center transition-colors',
                      'focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                    )}
                  >
                    <input
                      type="number"
                      min="0"
                      step="1"
                      disabled={isSaving}
                      value={targetPtSessions}
                      onPointerDown={clearErrors}
                      onFocus={clearErrors}
                      onClick={clearErrors}
                      onChange={(e) => {
                        clearErrors();
                        setTargetPtSessions(
                          e.target.value === '' ? '' : Number(e.target.value)
                        );
                      }}
                      placeholder="Nhập"
                      className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col gap-1.5 min-w-0"
                  onClick={clearErrors}
                  onPointerDown={clearErrors}
                >
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Chỉ tiêu số hội viên mới
                  </label>
                  <div
                    className={cn(
                      'h-[42px] px-3.5 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center transition-colors',
                      'focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                    )}
                  >
                    <input
                      type="number"
                      min="0"
                      step="1"
                      disabled={isSaving}
                      value={targetNewMembers}
                      onPointerDown={clearErrors}
                      onFocus={clearErrors}
                      onClick={clearErrors}
                      onChange={(e) => {
                        clearErrors();
                        setTargetNewMembers(
                          e.target.value === '' ? '' : Number(e.target.value)
                        );
                      }}
                      placeholder="Nhập"
                      className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl">
            <div className="border-b border-[#F1F5F9] pb-2 mb-4">
              <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                GHI CHÚ ĐIỀU CHỈNH
              </h4>
            </div>

            <div className="px-5">
              <div
                className={cn(
                  'p-3 bg-slate-50 border border-slate-200 rounded-[8px] flex transition-all',
                  'focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                )}
                onClick={clearErrors}
              >
                <textarea
                  rows={3}
                  maxLength={500}
                  value={note}
                  onFocus={clearErrors}
                  onChange={(e) => {
                    clearErrors();
                    setNote(e.target.value);
                  }}
                  placeholder="Nhập"
                  disabled={isSaving}
                  className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none resize-none disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="h-[68px] px-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="h-[40px] px-5 min-w-[120px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <FolderOpenIcon className="w-4 h-4 text-white" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-[12px] font-medium text-[#64748B]">{label}</span>
      <span className="text-[14px] font-semibold text-[#011010] truncate">{value}</span>
    </div>
  );
}

export default EditEmployeeKpiSlidePanel;
