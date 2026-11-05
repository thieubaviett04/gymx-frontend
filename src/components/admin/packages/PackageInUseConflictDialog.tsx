'use client';

import React from 'react';
import { AlertTriangle, ArrowRight, ShieldAlert, Sparkles, XCircle } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';

interface PackageInUseConflictDialogProps {
  isOpen: boolean;
  packageCode?: string;
  packageName?: string;
  activeCount?: number;
  isLoading?: boolean;
  onClose: () => void;
  onDiscontinueAndCreate: () => void;
  onDiscontinueOnly: () => void;
}

export function PackageInUseConflictDialog({
  isOpen,
  packageCode,
  packageName,
  activeCount = 0,
  isLoading = false,
  onClose,
  onDiscontinueAndCreate,
  onDiscontinueOnly,
}: PackageInUseConflictDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle>Gói tập đang có hội viên sử dụng</DialogTitle>
            <DialogDescription>
              {packageCode} – {packageName}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <DialogContent className="space-y-4 py-2">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-[13px] text-amber-900 leading-relaxed">
          <p>
            Gói tập này hiện đang có{' '}
            <strong className="font-semibold text-amber-950">
              {activeCount > 0 ? `${activeCount} hội viên` : 'người'}
            </strong>{' '}
            đang sử dụng. Theo quy chuẩn bảo vệ hợp đồng hội viên, bạn không thể sửa đè trực tiếp thông số gói này.
          </p>
        </div>

        <p className="text-[14px] text-[#202939] font-medium">
          Vui lòng chọn phương án xử lý mong muốn:
        </p>

        <div className="space-y-2.5">
          {/* Phương án 1 (Khuyên dùng) */}
          <div
            onClick={isLoading ? undefined : onDiscontinueAndCreate}
            className="p-3.5 border-2 border-[#064343] bg-[#064343]/5 rounded-xl hover:bg-[#064343]/10 transition-colors cursor-pointer flex items-start gap-3 group"
          >
            <div className="w-6 h-6 rounded-full bg-[#064343] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[14px] text-[#064343]">
                  1. Ngừng kinh doanh gói cũ &amp; Tạo gói mới thay thế (Khuyên dùng)
                </span>
                <ArrowRight className="w-4 h-4 text-[#064343] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[12px] text-[#525252] mt-0.5">
                Chuyển gói cũ sang trạng thái &quot;Ngừng kinh doanh&quot; và tự động tạo 1 gói mới mang các thông số bạn vừa sửa.
              </p>
            </div>
          </div>

          {/* Phương án 2 */}
          <div
            onClick={isLoading ? undefined : onDiscontinueOnly}
            className="p-3.5 border border-[#E2E8F0] hover:border-amber-300 bg-white hover:bg-amber-50/40 rounded-xl transition-colors cursor-pointer flex items-start gap-3 group"
          >
            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <XCircle className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[14px] text-[#0A0A0A]">
                  2. Chỉ cập nhật &quot;Ngừng kinh doanh&quot; cho gói này
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                Khóa gói này lại để không bán thêm cho khách mới, không tạo thêm gói mới.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogFooter className="mt-3 pt-3 border-t border-[#F1F5F9] flex items-center justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="h-[40px] px-5 border-[#E5E5E5] text-[#525252] hover:bg-slate-50 cursor-pointer"
        >
          Hủy bỏ
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default PackageInUseConflictDialog;

