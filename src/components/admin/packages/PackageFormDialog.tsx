'use client';

import React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { usePackageForm } from '@/lib/hooks/usePackageForm';
import { formatVND } from '@/lib/utils/formatters';
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
    <Dialog isOpen={isOpen} onClose={handleClose} size="xl">
      <form onSubmit={handleSubmit} noValidate>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa gói tập' : 'Thêm gói tập mới'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Cập nhật thông tin chi tiết cho gói tập ${initialData?.packageCode || ''}`
              : 'Điền đầy đủ thông tin bên dưới để khởi tạo một gói tập mới trong hệ thống.'}
          </DialogDescription>
        </DialogHeader>

        <DialogContent className="space-y-4 py-2">
          {/* 1. Tên gói tập */}
          <div>
            <label className="block text-[13px] font-medium text-[#0A0A0A] mb-1.5">
              Tên gói tập <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="VD: Gói Tập Pro 6 Tháng Không Giới Hạn"
              maxLength={100}
              className={`w-full h-[42px] px-3.5 rounded-[8px] bg-white border text-[14px] text-[#0A0A0A] placeholder-[#9EA5C0] outline-none transition-all ${
                errors.name
                  ? 'border-red-500 ring-2 ring-red-100'
                  : 'border-[#E2E8F0] focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/15'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-[12px] text-red-500 font-medium">{errors.name}</p>
            )}
          </div>

          {/* 2. Giá niêm yết & Thời hạn (Grid 2 cột) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#0A0A0A] mb-1.5">
                Giá niêm yết (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="VD: 1500000"
                className={`w-full h-[42px] px-3.5 rounded-[8px] bg-white border text-[14px] text-[#0A0A0A] placeholder-[#9EA5C0] outline-none transition-all ${
                  errors.price
                    ? 'border-red-500 ring-2 ring-red-100'
                    : 'border-[#E2E8F0] focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/15'
                }`}
              />
              {showPricePreview && (
                <p className="mt-1 text-[12px] text-[#064343] font-medium">
                  {formatVND(parsedPrice)}
                </p>
              )}
              {errors.price && (
                <p className="mt-1 text-[12px] text-red-500 font-medium">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#0A0A0A] mb-1.5">
                Thời hạn (Tháng) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={formData.durationMonths}
                onChange={(e) => handleChange('durationMonths', e.target.value)}
                placeholder="VD: 1, 3, 6, 12"
                className={`w-full h-[42px] px-3.5 rounded-[8px] bg-white border text-[14px] text-[#0A0A0A] placeholder-[#9EA5C0] outline-none transition-all ${
                  errors.durationMonths
                    ? 'border-red-500 ring-2 ring-red-100'
                    : 'border-[#E2E8F0] focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/15'
                }`}
              />
              {errors.durationMonths && (
                <p className="mt-1 text-[12px] text-red-500 font-medium">
                  {errors.durationMonths}
                </p>
              )}
            </div>
          </div>

          {/* 3. Check-in tối đa & Trạng thái */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#0A0A0A] mb-1.5">
                Lượt check-in tối đa (Tùy chọn)
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxCheckins}
                onChange={(e) => handleChange('maxCheckins', e.target.value)}
                placeholder="Để trống nếu không giới hạn"
                className={`w-full h-[42px] px-3.5 rounded-[8px] bg-white border text-[14px] text-[#0A0A0A] placeholder-[#9EA5C0] outline-none transition-all ${
                  errors.maxCheckins
                    ? 'border-red-500 ring-2 ring-red-100'
                    : 'border-[#E2E8F0] focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/15'
                }`}
              />
              {errors.maxCheckins && (
                <p className="mt-1 text-[12px] text-red-500 font-medium">
                  {errors.maxCheckins}
                </p>
              )}
            </div>

            {isEdit && (
              <div>
                <label className="block text-[13px] font-medium text-[#0A0A0A] mb-1.5">
                  Trạng thái kinh doanh
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => handleChange('status', val as PackageStatus)}
                >
                  <SelectTrigger className="w-full h-[42px] px-3.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[14px] text-[#0A0A0A] focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/15">
                    <SelectValue />
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

          {/* 4. Ngày áp dụng (Từ ngày – Đến ngày) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#0A0A0A] mb-1.5">
                Ngày bắt đầu áp dụng <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.effectiveStartDate}
                onChange={(e) => handleChange('effectiveStartDate', e.target.value)}
                className={`w-full h-[42px] px-3.5 rounded-[8px] bg-white border text-[14px] text-[#0A0A0A] outline-none transition-all ${
                  errors.effectiveStartDate
                    ? 'border-red-500 ring-2 ring-red-100'
                    : 'border-[#E2E8F0] focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/15'
                }`}
              />
              {errors.effectiveStartDate && (
                <p className="mt-1 text-[12px] text-red-500 font-medium">
                  {errors.effectiveStartDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#0A0A0A] mb-1.5">
                Ngày kết thúc áp dụng (Tùy chọn)
              </label>
              <input
                type="date"
                value={formData.effectiveEndDate}
                min={formData.effectiveStartDate || undefined}
                onChange={(e) => handleChange('effectiveEndDate', e.target.value)}
                className={`w-full h-[42px] px-3.5 rounded-[8px] bg-white border text-[14px] text-[#0A0A0A] outline-none transition-all ${
                  errors.effectiveEndDate
                    ? 'border-red-500 ring-2 ring-red-100'
                    : 'border-[#E2E8F0] focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/15'
                }`}
              />
              {errors.effectiveEndDate && (
                <p className="mt-1 text-[12px] text-red-500 font-medium">
                  {errors.effectiveEndDate}
                </p>
              )}
            </div>
          </div>

          {/* 5. Mô tả chi tiết */}
          <div>
            <label className="block text-[13px] font-medium text-[#0A0A0A] mb-1.5">
              Mô tả chi tiết & Quyền lợi gói tập
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="VD: Bao gồm quyền sử dụng toàn bộ phòng tập tạ, phòng xông hơi và nước uống miễn phí..."
              className="w-full p-3 rounded-[8px] bg-white border border-[#E2E8F0] text-[14px] text-[#0A0A0A] placeholder-[#9EA5C0] outline-none focus:border-[#064343] focus:ring-2 focus:ring-[#064343]/15 transition-all resize-none"
            />
          </div>
        </DialogContent>

        <DialogFooter className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-[40px] px-4 text-[#525252] border-[#E5E5E5] hover:bg-slate-50 cursor-pointer"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-[40px] px-6 bg-[#064343] hover:bg-[#085454] text-white font-medium rounded-[8px] shadow-sm cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang lưu...
              </span>
            ) : isEdit ? (
              'Cập nhật gói tập'
            ) : (
              'Tạo gói tập'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

export default PackageFormDialog;

