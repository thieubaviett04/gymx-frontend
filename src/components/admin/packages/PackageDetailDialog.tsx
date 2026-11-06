'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { Badge, Tabs } from '@/components/ui';
import { EditPencilIcon, FolderOpenIcon } from '@/components/ui/icons';
import { packageService } from '@/lib/api/modules/packageService';
import { usePackageForm } from '@/lib/hooks/usePackageForm';
import {
  getPackageStatusBadge,
  type PackageDetail,
  type PackageSummary,
  type UpdatePackagePayload,
} from '@/types/package';
import {
  PackageGeneralTab,
  PackageMembersTab,
  PackageHistoryTab,
} from './tabs';
import {
  PackageInfoSection,
  PackageDescriptionSection,
} from './sections';

interface PackageDetailDialogProps {
  isOpen: boolean;
  packageData: PackageDetail | PackageSummary | null;
  onClose: () => void;
  initialIsEditing?: boolean;
  onSave?: (payload: UpdatePackagePayload) => Promise<void> | void;
  isSubmitting?: boolean;
  onDiscontinue?: (pkg: PackageDetail | PackageSummary) => void;
}

const DETAIL_TABS = [
  { id: 'general', label: 'Thông tin chung' },
  { id: 'members', label: 'Hội viên sử dụng' },
  { id: 'history', label: 'Lịch sử' },
] as const;

export function PackageDetailDialog({
  isOpen,
  packageData,
  onClose,
  initialIsEditing = false,
  onSave,
  isSubmitting = false,
}: PackageDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'history'>('general');
  const [isEditing, setIsEditing] = useState(initialIsEditing);

  const {
    formData,
    errors,
    handleChange,
    resetForm,
    getUpdatePayload,
  } = usePackageForm({ initialData: packageData, isEdit: true });

  const { data: categoryData } = useQuery({
    queryKey: ['admin-package-categories-lookup'],
    queryFn: async () => {
      const res = await packageService.categoryLookup();
      return res.data;
    },
    enabled: isOpen,
  });

  const categories = categoryData || [];

  useEffect(() => {
    if (isOpen) {
      setIsEditing(initialIsEditing);
      setActiveTab('general');
    }
  }, [isOpen, initialIsEditing]);

  if (!isOpen || !packageData) return null;

  const currentStatus = isEditing ? formData.status : packageData.status;
  const currentStartDate = isEditing ? formData.effectiveStartDate : packageData.effectiveStartDate;
  const statusBadge = getPackageStatusBadge(currentStatus, currentStartDate);

  const isPriceDurationDisabled = false;
  const isStatusDisabled = false;

  const handleClose = () => {
    if (isSubmitting) return;
    if (isEditing) {
      resetForm();
      setIsEditing(false);
    }
    onClose();
  };

  const handleCancelEdit = () => {
    if (isSubmitting) return;
    resetForm();
    if (initialIsEditing) {
      onClose();
    } else {
      setIsEditing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !onSave) return;
    const payload = getUpdatePayload();
    if (!payload) return;
    await onSave(payload);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? 'Chỉnh sửa gói tập' : 'Chi tiết gói tập'}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[880px] max-w-full bg-white h-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border-l border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <div className="pt-6 pb-4 pr-6 pl-0 flex items-center justify-between shrink-0 bg-white border-b border-[#F1F5F9]">
          <div className="flex items-center h-[28px] border-l-[4px] border-[#064343] pl-5">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-none tracking-[-0.025em]">
              {isEditing ? 'Chỉnh sửa gói tập' : 'Chi tiết gói tập'}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#64748B] hidden sm:inline">Trạng thái:</span>
              <Badge
                variant={statusBadge.variant}
                className="text-[13px] font-normal leading-[16px] px-2.5 py-[3px] rounded-[6px]"
              >
                {statusBadge.label}
              </Badge>
            </div>

            <div className="hidden sm:block w-[1px] h-4 bg-[#E2E8F0]" />

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#525252] flex items-center justify-center transition-colors cursor-pointer ml-1 disabled:opacity-50"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 shrink-0 bg-white">
          <Tabs
            tabs={DETAIL_TABS as unknown as { id: 'general' | 'members' | 'history'; label: string }[]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-1 pb-8 space-y-8">
          {activeTab === 'general' && (
            isEditing ? (
              <div className="space-y-7">
                <PackageInfoSection
                  formData={formData}
                  errors={errors}
                  categories={categories}
                  isEdit={true}
                  isPriceDurationDisabled={isPriceDurationDisabled}
                  isStatusDisabled={isStatusDisabled}
                  onChangeField={handleChange}
                />
                <PackageDescriptionSection
                  value={formData.description}
                  onChange={(val) => handleChange('description', val)}
                  disabled={isSubmitting}
                />
              </div>
            ) : (
              <PackageGeneralTab packageData={packageData} />
            )
          )}
          {activeTab === 'members' && <PackageMembersTab packageData={packageData} />}
          {activeTab === 'history' && <PackageHistoryTab packageData={packageData} />}
        </div>

        <div className="h-[72px] px-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3 shrink-0">
          {!isEditing ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
              >
                <span>Đóng</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="h-[40px] px-5 min-w-[120px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <EditPencilIcon className="w-4 h-4" color="#FFFFFF" />
                <span>Chỉnh sửa</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="h-[40px] px-5 min-w-[80px] bg-white border border-[#E2E8F0] rounded-[10px] text-[13px] font-medium leading-[20px] text-[#202939] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
              >
                <span>Hủy</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="h-[40px] px-5 min-w-[120px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PackageDetailDialog;
