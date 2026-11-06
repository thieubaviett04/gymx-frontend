'use client';

import React from 'react';
import { X, Loader2 } from 'lucide-react';
import {
  DatePicker,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { usePackageForm } from '@/lib/hooks/usePackageForm';
import { formatVND } from '@/lib/utils/formatters';
import { FolderOpenIcon } from '@/components/ui/icons';
import type {
  CreatePackagePayload,
  PackageDetail,
  PackageStatus,
  PackageSummary,
  UpdatePackagePayload,
} from '@/types/package';

interface PackageFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PackageDetail | PackageSummary | null;
  isEdit?: boolean;
  isSubmitting?: boolean;
  onSubmit: (payload: CreatePackagePayload | UpdatePackagePayload) => Promise<void> | void;
}

export function PackageFormDialog({
  isOpen,
  onClose,
  initialData,
  isEdit = false,
  isSubmitting = false,
  onSubmit,
}: PackageFormDialogProps) {
  const {
    formData,
    errors,
    handleChange,
    resetForm,
    getCreatePayload,
    getUpdatePayload,
  } = usePackageForm({ initialData, isEdit });

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (isEdit) {
      const payload = getUpdatePayload();
      if (!payload) return;
      await onSubmit(payload);
    } else {
      const payload = getCreatePayload();
      if (!payload) return;
      await onSubmit(payload);
    }
  };

  const parsedPrice = Number(formData.price);
  const showPricePreview = !isNaN(parsedPrice) && parsedPrice > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[720px] my-8 bg-white rounded-xl border border-[#E2E8F0] shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="pt-6 pb-4 pr-6 pl-0 border-b border-[#F1F5F9] flex items-center justify-between shrink-0">
          <div className="flex items-center h-[26px] border-l-[4px] border-[#064343] pl-5">
            <div>
              <h3 className="text-[20px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
                {isEdit ? 'Chỉnh sửa thông tin gói tập' : 'Thêm gói tập mới'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#525252] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 mt-3.5 mb-1 shrink-0">
          <p className="text-[13px] text-[#64748B]">
            {isEdit
              ? `Cập nhật thông tin chi tiết và điều khoản cho gói tập ${initialData?.packageCode || ''}.`
              : 'Điền đầy đủ thông tin bên dưới để khởi tạo một gói tập mới trong hệ thống.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-150px)] space-y-8">
            <div className="bg-white">
              <div className="border-b border-[#F1F5F9] pb-2.5 mb-5">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  THÔNG TIN CƠ BẢN
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="sm:col-span-2 flex flex-col gap-1.5 min-w-0">
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Tên gói tập <span className="text-[#EE0033]">*</span>
                  </label>
                  <div
                    className={`h-[42px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center transition-all ${
                      errors.name
                        ? 'border-red-400 bg-red-50/20'
                        : 'border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                    }`}
                  >
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="VD: Gói Tập VIP 6 Tháng Toàn Hệ Thống"
                      maxLength={100}
                      className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className={`flex flex-col gap-1.5 min-w-0 ${isEdit ? 'sm:col-span-1' : 'sm:col-span-2'}`}>
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Giá niêm yết (VNĐ) <span className="text-[#EE0033]">*</span>
                  </label>
                  <div
                    className={`h-[42px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center justify-between transition-all ${
                      errors.price
                        ? 'border-red-400 bg-red-50/20'
                        : 'border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                    }`}
                  >
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      placeholder="VD: 1500000"
                      className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                    />
                    <div className="flex items-center gap-2 pl-2 select-none shrink-0">
                      <div className="w-[1px] h-4 bg-[#CDD5DF]" />
                      <span className="text-[13px] font-semibold text-[#064343]">VND</span>
                    </div>
                  </div>
                  {showPricePreview && (
                    <p className="text-[12px] text-[#064343] font-medium mt-0.5">
                      Quy đổi: {formatVND(parsedPrice)}
                    </p>
                  )}
                  {errors.price && (
                    <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                      {errors.price}
                    </p>
                  )}
                </div>

                {isEdit && (
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                      Trạng thái kinh doanh <span className="text-[#EE0033]">*</span>
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(val) => handleChange('status', val as PackageStatus)}
                    >
                      <SelectTrigger className="h-[42px] w-full rounded-[8px] border-[#CDD5DF] bg-white px-3.5 py-2 text-[14px] text-[#2F3D50] focus:border-[#064343] focus:ring-1 focus:ring-[#064343]">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                        <SelectItem value="INACTIVE">Chưa kích hoạt</SelectItem>
                        <SelectItem value="DISCONTINUED">Ngừng kinh doanh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white">
              <div className="border-b border-[#F1F5F9] pb-2.5 mb-5">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  THÔNG SỐ VẬN HÀNH & HIỆU LỰC
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Thời hạn sử dụng (Tháng) <span className="text-[#EE0033]">*</span>
                  </label>
                  <div
                    className={`h-[42px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center transition-all ${
                      errors.durationMonths
                        ? 'border-red-400 bg-red-50/20'
                        : 'border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                    }`}
                  >
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={formData.durationMonths}
                      onChange={(e) => handleChange('durationMonths', e.target.value)}
                      placeholder="VD: 1, 3, 6, 12"
                      className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                    />
                  </div>
                  {errors.durationMonths && (
                    <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                      {errors.durationMonths}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 min-w-0">
                  <label className="text-[13px] font-medium text-[#202939]">
                    Lượt check-in tối đa (Tùy chọn)
                  </label>
                  <div
                    className={`h-[42px] px-3.5 py-2 bg-white border rounded-[8px] flex items-center transition-all ${
                      errors.maxCheckins
                        ? 'border-red-400 bg-red-50/20'
                        : 'border-[#CDD5DF] focus-within:border-[#064343] focus-within:ring-1 focus-within:ring-[#064343]'
                    }`}
                  >
                    <input
                      type="number"
                      min="1"
                      value={formData.maxCheckins}
                      onChange={(e) => handleChange('maxCheckins', e.target.value)}
                      placeholder="Để trống nếu không giới hạn"
                      className="w-full bg-transparent text-[14px] text-[#202939] placeholder:text-[#697586] outline-none"
                    />
                  </div>
                  {errors.maxCheckins && (
                    <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                      {errors.maxCheckins}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 min-w-0">
                  <label className="text-[13px] font-medium text-[#202939] flex items-center gap-1">
                    Ngày bắt đầu áp dụng <span className="text-[#EE0033]">*</span>
                  </label>
                  <DatePicker
                    value={formData.effectiveStartDate}
                    onChange={(val) => handleChange('effectiveStartDate', val)}
                    placeholder="Chọn ngày bắt đầu"
                    className={errors.effectiveStartDate ? 'border-red-400 bg-red-50/20' : ''}
                  />
                  {errors.effectiveStartDate && (
                    <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                      {errors.effectiveStartDate}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 min-w-0">
                  <label className="text-[13px] font-medium text-[#202939]">
                    Ngày kết thúc áp dụng (Tùy chọn)
                  </label>
                  <DatePicker
                    value={formData.effectiveEndDate}
                    onChange={(val) => handleChange('effectiveEndDate', val)}
                    placeholder="Chọn ngày kết thúc"
                    className={errors.effectiveEndDate ? 'border-red-400 bg-red-50/20' : ''}
                  />
                  {errors.effectiveEndDate && (
                    <p className="text-xs text-red-500 mt-0.5 animate-in fade-in duration-200">
                      {errors.effectiveEndDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white">
              <div className="border-b border-[#F1F5F9] pb-2.5 mb-5">
                <h4 className="text-[13px] font-semibold text-[#011010] tracking-[-0.0074em] uppercase">
                  QUYỀN LỢI & MÔ TẢ GÓI TẬP
                </h4>
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[13px] font-medium text-[#202939]">
                  Mô tả chi tiết & Quyền lợi gói tập
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Nhập thông tin giới thiệu, dịch vụ bao gồm và quyền lợi của gói tập..."
                  className="w-full p-3 bg-white border border-[#CDD5DF] rounded-[8px] text-[14px] text-[#202939] placeholder:text-[#697586] outline-none focus:border-[#064343] focus:ring-1 focus:ring-[#064343] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="h-[70px] px-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-[40px] px-5 min-w-[84px] bg-white border border-[#E2E8F0] rounded-[10px] text-[14px] font-normal leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              <span>Hủy bỏ</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[40px] px-5 min-w-[130px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[14px] font-normal leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <FolderOpenIcon className="w-4 h-4 text-white" />
                  <span>{isEdit ? 'Lưu thay đổi' : 'Tạo gói tập'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PackageFormDialog;
