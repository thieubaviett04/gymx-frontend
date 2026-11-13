'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import {
  FolderOpenIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type { EmployeeLookupItem, KpiTemplateLookup, AssignKpiPayload } from '@/types';

interface AssignKpiSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  templates: KpiTemplateLookup[];
  employees: EmployeeLookupItem[];
  onSubmit: (payload: AssignKpiPayload) => void;
  isSubmitting?: boolean;
}

export function AssignKpiSlidePanel({
  isOpen,
  onClose,
  templates,
  employees,
  onSubmit,
  isSubmitting = false,
}: AssignKpiSlidePanelProps) {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setSelectedMonth(today.getMonth() + 1);
      setSelectedYear(today.getFullYear());
      setSelectedTemplateId('');
      setSelectedEmployee('');
      setNote('');
      setErrors({});
    }
  }, [isOpen]);

  const currentYear = today.getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId),
    [templates, selectedTemplateId]
  );

  const filteredEmployees = useMemo(() => {
    if (!selectedTemplate) return employees;
    return employees.filter((e) => {
      const empPos = (e.position || '').toUpperCase();
      return empPos === selectedTemplate.targetRole;
    });
  }, [employees, selectedTemplate]);

  const clearErrors = () => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    clearErrors();
    setSelectedTemplateId(templateId);
    setSelectedEmployee('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors: Record<string, string> = {};

    if (!selectedTemplateId) {
      newErrors.templateId = 'Vui lòng chọn mẫu KPI để áp dụng.';
    }

    if (!selectedEmployee) {
      newErrors.employeeIds = 'Vui lòng chọn nhân sự áp dụng từ danh sách.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const employeeIds =
      selectedEmployee === 'ALL'
        ? filteredEmployees.map((e) => e.id)
        : [selectedEmployee];

    if (employeeIds.length === 0) {
      setErrors({ employeeIds: 'Không có nhân sự nào phù hợp để giao chỉ tiêu.' });
      return;
    }

    onSubmit({
      kpiTemplateId: selectedTemplateId,
      month: selectedMonth,
      year: selectedYear,
      employeeIds,
      note: note.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Giao chỉ tiêu KPI nhân viên"
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
              Giao chỉ tiêu KPI nhân viên
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#525252] flex items-center justify-center transition-colors cursor-pointer ml-1 disabled:opacity-50"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-7 flex-1">
            <div className="bg-white">
              <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  THÔNG TIN KỲ ÁP DỤNG
                </h4>
              </div>

              <div className="px-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="flex flex-col gap-1.5 min-w-0" onClick={clearErrors}>
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Kỳ tháng <span className="text-[#EE0033]">*</span>
                  </label>
                  <Select
                    value={String(selectedMonth)}
                    onValueChange={(val) => {
                      clearErrors();
                      setSelectedMonth(Number(val));
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      onFocus={clearErrors}
                      className="h-[42px] w-full rounded-[8px] bg-slate-50 px-3.5 py-2 text-[14px] text-[#202939] border-slate-200 shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer"
                    >
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[130px]">
                      {monthOptions.map((m) => (
                        <SelectItem key={m} value={String(m)} className="text-[14px] py-2 cursor-pointer">
                          Tháng {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5 min-w-0" onClick={clearErrors}>
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Năm áp dụng <span className="text-[#EE0033]">*</span>
                  </label>
                  <Select
                    value={String(selectedYear)}
                    onValueChange={(val) => {
                      clearErrors();
                      setSelectedYear(Number(val));
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      onFocus={clearErrors}
                      className="h-[42px] w-full rounded-[8px] bg-slate-50 px-3.5 py-2 text-[14px] text-[#202939] border-slate-200 shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer"
                    >
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg min-w-[110px]">
                      {yearOptions.map((y) => (
                        <SelectItem key={y} value={String(y)} className="text-[14px] py-2 cursor-pointer">
                          Năm {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-white">
              <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  MẪU KPI VÀ NHÂN VIÊN ÁP DỤNG
                </h4>
              </div>

              <div className="px-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div
                  className="flex flex-col gap-1.5 min-w-0"
                  onClick={clearErrors}
                  onPointerDown={clearErrors}
                >
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Mẫu KPI áp dụng <span className="text-[#EE0033]">*</span>
                  </label>
                  <Select
                    value={selectedTemplateId || undefined}
                    onValueChange={handleSelectTemplate}
                    onOpenChange={(open) => {
                      if (open) clearErrors();
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      onFocus={clearErrors}
                      onClick={clearErrors}
                      onPointerDown={clearErrors}
                      className={cn(
                        'h-[42px] px-3.5 rounded-[8px] text-[14px] text-[#202939] cursor-pointer transition-colors',
                        errors.templateId
                          ? 'border-[#EE464C] bg-[#FFF5F5] focus:border-[#EE464C] focus:ring-1 focus:ring-[#EE464C]'
                          : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]'
                      )}
                    >
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E2E8F0] shadow-md z-50 max-h-[280px]">
                      {templates.map((tpl) => (
                        <SelectItem key={tpl.id} value={tpl.id} className="text-[13px] cursor-pointer">
                          {tpl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.templateId && (
                    <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
                      {errors.templateId}
                    </p>
                  )}
                </div>

                <div
                  className="flex flex-col gap-1.5 min-w-0"
                  onClick={clearErrors}
                  onPointerDown={clearErrors}
                >
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Nhân viên áp dụng <span className="text-[#EE0033]">*</span>
                  </label>

                  <Select
                    value={selectedEmployee}
                    onValueChange={(val) => {
                      clearErrors();
                      setSelectedEmployee(val);
                    }}
                    onOpenChange={(open) => {
                      if (open) clearErrors();
                    }}
                    disabled={isSubmitting || !selectedTemplateId}
                  >
                    <SelectTrigger
                      onFocus={clearErrors}
                      onClick={clearErrors}
                      onPointerDown={clearErrors}
                      className={cn(
                        'h-[42px] px-3.5 rounded-[8px] text-[14px] text-[#202939] cursor-pointer transition-colors',
                        errors.employeeIds
                          ? 'border-[#EE464C] bg-[#FFF5F5] focus:border-[#EE464C] focus:ring-1 focus:ring-[#EE464C]'
                          : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]',
                        (!selectedTemplateId || isSubmitting) && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E2E8F0] shadow-md z-50 max-h-[280px]">
                      {filteredEmployees.length > 0 && (
                        <SelectItem value="ALL" className="text-[13px] cursor-pointer">
                          Chọn tất cả ({filteredEmployees.length} nhân sự)
                        </SelectItem>
                      )}
                      {filteredEmployees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id} className="text-[13px] cursor-pointer">
                          {emp.fullName} ({emp.employeeCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.employeeIds && (
                    <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1.5 animate-in fade-in duration-200">
                      {errors.employeeIds}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white">
              <div className="border-b border-[#F1F5F9] pb-2 mb-4">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  GHI CHÚ GIAO CHỈ TIÊU
                </h4>
              </div>

              <div className="px-5 flex flex-col gap-1.5 min-w-0" onClick={clearErrors}>
                <label className="text-[13px] font-medium text-[#202939]">
                  Ghi chú hoặc thông điệp gửi kèm
                </label>
                <div
                  className={cn(
                    'p-3 bg-slate-50 border rounded-[8px] flex transition-all',
                    'border-slate-200 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                  )}
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
                    disabled={isSubmitting}
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none resize-none disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-[72px] px-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              <span>Hủy</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[40px] px-5 min-w-[140px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Đang giao...</span>
                </>
              ) : (
                <>
                  <FolderOpenIcon className="w-4 h-4 text-white" />
                  <span>
                    {selectedEmployee === 'ALL' && filteredEmployees.length > 0
                      ? `Giao cho ${filteredEmployees.length} nhân sự`
                      : 'Giao chỉ tiêu'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignKpiSlidePanel;