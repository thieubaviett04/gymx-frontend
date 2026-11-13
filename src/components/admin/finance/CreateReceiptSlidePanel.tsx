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

export interface CreateReceiptPayload {
  customerName: string;
  customerPhone?: string;
  amount: number;
  paymentMethod: string;
  category: string;
  receiptDate: string;
  note?: string;
}

interface CreateReceiptSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateReceiptPayload) => Promise<void>;
  isSubmitting?: boolean;
}

const RECEIPT_CATEGORIES = [
  { value: 'SERVICE_FEE', label: 'Phí dịch vụ & Tiện ích (thẻ, tủ locker, phạt...)' },
  { value: 'DAY_TICKET', label: 'Thu bán vé tập ngày' },
  { value: 'RETAIL', label: 'Thu bán lẻ quầy (nước, whey, phụ kiện...)' },
  { value: 'OTHER', label: 'Thu khác (thanh lý tài sản, hoàn ứng, thuê sảnh...)' },
];

const PAYMENT_METHODS = [
  { value: 'Tiền mặt', label: 'Tiền mặt' },
  { value: 'Chuyển khoản', label: 'Chuyển khoản Vietcombank' },
  { value: 'Quẹt thẻ POS', label: 'Quẹt thẻ POS' },
];

const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function CreateReceiptSlidePanel({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateReceiptSlidePanelProps) {
  const todayStr = getLocalDateString();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');
  const [category, setCategory] = useState('SERVICE_FEE');
  const [receiptDate, setReceiptDate] = useState(todayStr);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const clearErrors = () => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  };

  const validate = () => {
    const err: Record<string, string> = {};
    if (!customerName.trim()) err.customerName = 'Vui lòng nhập tên người nộp / khách hàng.';
    if (!amount || Number(amount) <= 0) err.amount = 'Số tiền thu phải lớn hơn 0.';
    if (!receiptDate) err.receiptDate = 'Vui lòng chọn ngày thu tiền.';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        amount: Number(amount),
        paymentMethod,
        category,
        receiptDate,
        note: note.trim() || undefined,
      });

      setCustomerName('');
      setCustomerPhone('');
      setAmount('');
      setNote('');
      setCategory('SERVICE_FEE');
      setPaymentMethod('Tiền mặt');
      setReceiptDate(getLocalDateString());
      setErrors({});
    } catch {
      // Giữ nguyên dữ liệu trên form khi có lỗi để người dùng sửa lại
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lập phiếu thu tiền"
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
              Lập phiếu thu tiền
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
                THÔNG TIN NGƯỜI NỘP TIỀN
              </h4>
            </div>

            <div className="px-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div
                className="flex flex-col gap-1.5 min-w-0"
                onClick={clearErrors}
                onPointerDown={clearErrors}
              >
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Người nộp / Khách hàng <span className="text-[#EE0033]">*</span>
                </label>
                <div
                  className={cn(
                    'h-[42px] px-3.5 rounded-[8px] flex items-center transition-colors border',
                    errors.customerName
                      ? 'border-[#EE464C] bg-[#FFF5F5] focus-within:border-[#EE464C]'
                      : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                  )}
                >
                  <input
                    type="text"
                    disabled={isSubmitting}
                    value={customerName}
                    onPointerDown={clearErrors}
                    onFocus={clearErrors}
                    onClick={clearErrors}
                    onChange={(e) => {
                      clearErrors();
                      setCustomerName(e.target.value);
                    }}
                    placeholder="Nhập tên người nộp / hội viên"
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
                  />
                </div>
                {errors.customerName && (
                  <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1 animate-in fade-in duration-200">
                    {errors.customerName}
                  </p>
                )}
              </div>

              <div
                className="flex flex-col gap-1.5 min-w-0"
                onClick={clearErrors}
                onPointerDown={clearErrors}
              >
                <label className="text-[13px] font-medium text-[#202939]">
                  Số điện thoại
                </label>
                <div className="h-[42px] px-3.5 rounded-[8px] flex items-center transition-colors border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]">
                  <input
                    type="text"
                    disabled={isSubmitting}
                    value={customerPhone}
                    onPointerDown={clearErrors}
                    onFocus={clearErrors}
                    onClick={clearErrors}
                    onChange={(e) => {
                      clearErrors();
                      setCustomerPhone(e.target.value);
                    }}
                    placeholder="Nhập số điện thoại (tự nhận diện hội viên)"
                    className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl">
            <div className="border-b border-[#F1F5F9] pb-2 mb-4">
              <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                CHI TIẾT KHOẢN THU & THANH TOÁN
              </h4>
            </div>

            <div className="px-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
                <div
                  className="flex flex-col gap-1.5 min-w-0"
                  onClick={clearErrors}
                  onPointerDown={clearErrors}
                >
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Danh mục khoản thu <span className="text-[#EE0033]">*</span>
                  </label>
                  <Select
                    value={category}
                    onValueChange={(val) => {
                      clearErrors();
                      setCategory(val);
                    }}
                  >
                    <SelectTrigger className="h-[42px] w-full rounded-[8px] border-slate-200 bg-slate-50 px-3.5 text-[14px] text-[#202939] shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg">
                      {RECEIPT_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value} className="text-[14px] py-2 cursor-pointer">
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div
                  className="flex flex-col gap-1.5 min-w-0"
                  onClick={clearErrors}
                  onPointerDown={clearErrors}
                >
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Phương thức thanh toán <span className="text-[#EE0033]">*</span>
                  </label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(val) => {
                      clearErrors();
                      setPaymentMethod(val);
                    }}
                  >
                    <SelectTrigger className="h-[42px] w-full rounded-[8px] border-slate-200 bg-slate-50 px-3.5 text-[14px] text-[#202939] shadow-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343] cursor-pointer">
                      <SelectValue placeholder="Chọn phương thức" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E2E8F0] shadow-lg rounded-lg">
                      {PAYMENT_METHODS.map((pm) => (
                        <SelectItem key={pm.value} value={pm.value} className="text-[14px] py-2 cursor-pointer">
                          {pm.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div
                  className="flex flex-col gap-1.5 min-w-0"
                  onClick={clearErrors}
                  onPointerDown={clearErrors}
                >
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Ngày thu tiền <span className="text-[#EE0033]">*</span>
                  </label>
                  <DatePicker
                    value={receiptDate}
                    onChange={(val) => {
                      clearErrors();
                      setReceiptDate(val);
                    }}
                    placeholder="Chọn ngày"
                    className="h-[42px] bg-slate-50 border-slate-200"
                  />
                  {errors.receiptDate && (
                    <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1 animate-in fade-in duration-200">
                      {errors.receiptDate}
                    </p>
                  )}
                </div>
              </div>

              <div
                className="flex flex-col gap-1.5 min-w-0"
                onClick={clearErrors}
                onPointerDown={clearErrors}
              >
                <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                  Số tiền thu <span className="text-[#EE0033]">*</span>
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
                  <span className="text-[14px] font-medium text-[#64748B] shrink-0 pl-2">₫</span>
                </div>
                {errors.amount && (
                  <p className="text-[12px] text-[#EE464C] font-normal leading-none mt-1 animate-in fade-in duration-200">
                    {errors.amount}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl">
            <div className="border-b border-[#F1F5F9] pb-2 mb-4">
              <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                GHI CHÚ & DIỄN GIẢI
              </h4>
            </div>

            <div className="px-5">
              <textarea
                rows={3}
                disabled={isSubmitting}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập nội dung ghi chú diễn giải cho khoản thu..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-[8px] text-[14px] text-[#202939] placeholder:text-slate-400 outline-none resize-none focus:bg-white focus:border-[#064343] focus:ring-1 focus:ring-[#064343]"
              />
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
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <FolderOpenIcon className="w-4 h-4 text-white" />
                <span>Lập phiếu thu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateReceiptSlidePanel;
