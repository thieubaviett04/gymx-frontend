'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import {
  DatePicker,
  FolderOpenIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type { CreateExpensePayload, ExpenseCategory } from '@/types/finance';
import { EXPENSE_CATEGORY_LABELS } from './ExpensesToolbar';

interface CreateExpenseSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateExpensePayload) => Promise<void>;
  isSubmitting?: boolean;
}

const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function CreateExpenseSlidePanel({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateExpenseSlidePanelProps) {
  const todayStr = getLocalDateString();

  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [expenseDate, setExpenseDate] = useState<string>(todayStr);
  const [description, setDescription] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const clearErrors = () => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  };

  const validate = () => {
    const err: Record<string, string> = {};
    if (!category) err.category = 'Vui lòng chọn danh mục chi phí.';
    if (!amount || Number(amount) <= 0) err.amount = 'Số tiền chi phải lớn hơn 0.';
    if (!expenseDate) err.expenseDate = 'Vui lòng chọn ngày chi.';
    if (!description.trim()) err.description = 'Vui lòng nhập nội dung chi.';
    else if (description.trim().length > 500) err.description = 'Nội dung chi không được vượt quá 500 ký tự.';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        category: category as ExpenseCategory,
        amount: Number(amount),
        expenseDate,
        description: description.trim(),
      });

      setDescription('');
      setAmount('');
      setCategory('');
      setExpenseDate(getLocalDateString());
      setErrors({});
    } catch {
      // Giữ nguyên dữ liệu trên form khi có lỗi
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lập phiếu chi vận hành"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[700px] max-w-full bg-white h-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border-l border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <div className="pt-6 pb-4 pr-6 pl-0 flex items-center justify-between shrink-0 bg-white border-b border-[#F1F5F9]">
          <div className="flex items-center h-[28px] border-l-[4px] border-[#064343] pl-5 min-w-0">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              Lập phiếu chi vận hành
            </h2>
          </div>

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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          <div className="bg-white rounded-xl">
            <div className="border-b border-[#F1F5F9] pb-2 mb-4">
              <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                THÔNG TIN PHIẾU CHI
              </h4>
            </div>

            <div className="px-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div
                className="flex flex-col gap-1.5 min-w-0"
                onClick={clearErrors}
                onPointerDown={clearErrors}
              >
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Danh mục chi phí <span className="text-[#EE0033]">*</span>
                </label>
                <Select
                  value={category}
                  onValueChange={(val) => {
                    clearErrors();
                    setCategory(val as ExpenseCategory);
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      'h-[42px] w-full rounded-[8px] px-3.5 text-[14px] shadow-none cursor-pointer border transition-colors',
                      errors.category
                        ? 'border-[#EE464C] bg-[#FFF5F5] focus:border-[#EE464C]'
                        : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]',
                      !category && 'text-slate-400'
                    )}
                  >
                    <SelectValue placeholder="Chọn" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg">
                    {Object.entries(EXPENSE_CATEGORY_LABELS).map(([catKey, label]) => (
                      <SelectItem key={catKey} value={catKey} className="text-[14px] py-2 cursor-pointer">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1 animate-in fade-in duration-200">
                    {errors.category}
                  </p>
                )}
              </div>

              <div
                className="flex flex-col gap-1.5 min-w-0"
                onClick={clearErrors}
                onPointerDown={clearErrors}
              >
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Số tiền chi trả <span className="text-[#EE0033]">*</span>
                </label>
                <div
                  className={cn(
                    'h-[42px] px-3.5 rounded-[8px] flex items-center transition-colors border',
                    errors.amount
                      ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                      : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                  )}
                >
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    disabled={isSubmitting}
                    value={amount === '' ? '' : amount}
                    onPointerDown={clearErrors}
                    onFocus={clearErrors}
                    onClick={clearErrors}
                    onChange={(e) => {
                      clearErrors();
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setAmount(val);
                    }}
                    placeholder="Nhập"
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
                  />
                  <span className="text-[13px] font-medium text-[#64748B] shrink-0 pl-2">VND</span>
                </div>
                {errors.amount && (
                  <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1 animate-in fade-in duration-200">
                    {errors.amount}
                  </p>
                )}
              </div>

              <div
                className="flex flex-col gap-1.5 min-w-0"
                onClick={clearErrors}
                onPointerDown={clearErrors}
              >
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Ngày chi tiền <span className="text-[#EE0033]">*</span>
                </label>
                <DatePicker
                  value={expenseDate}
                  onChange={(val) => {
                    clearErrors();
                    setExpenseDate(val);
                  }}
                  placeholder="Chọn"
                  className="h-[42px] bg-slate-50 border-slate-200"
                />
                {errors.expenseDate && (
                  <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1 animate-in fade-in duration-200">
                    {errors.expenseDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl">
            <div className="border-b border-[#F1F5F9] pb-2 mb-4">
              <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                NỘI DUNG CHI TRẢ CHI TIẾT
              </h4>
            </div>

            <div
              className="px-5 flex flex-col gap-1.5 min-w-0"
              onClick={clearErrors}
              onPointerDown={clearErrors}
            >
              <textarea
                rows={4}
                maxLength={500}
                disabled={isSubmitting}
                value={description}
                onPointerDown={clearErrors}
                onFocus={clearErrors}
                onClick={clearErrors}
                onChange={(e) => {
                  clearErrors();
                  setDescription(e.target.value);
                }}
                placeholder="Nhập"
                className={cn(
                  'w-full p-3.5 rounded-[8px] text-[14px] text-[#202939] placeholder:text-slate-400 outline-none resize-none transition-colors border',
                  errors.description
                    ? 'border-[#EE464C] bg-[#FFF5F5] focus:border-[#EE464C]'
                    : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]'
                )}
              />
              {errors.description && (
                <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1 animate-in fade-in duration-200">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </form>

        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#EAEDF2] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-[40px] px-5 bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-[40px] px-5 rounded-[10px] text-[13px] font-medium leading-[20px] text-white bg-[#064343] hover:bg-[#053737] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <FolderOpenIcon className="w-4 h-4 text-white" />
                <span>Lập phiếu chi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateExpenseSlidePanel;
