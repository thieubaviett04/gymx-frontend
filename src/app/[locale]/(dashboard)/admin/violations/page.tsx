'use client';

import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Plus, ShieldAlert } from 'lucide-react';
import { Alert } from '@/components/ui';
import { ViolationFormDialog } from '@/components/admin/violations';

export default function AdminViolationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSuccess = (violationCode: string) => {
    showToast('success', `Đã tạo biên bản vi phạm ${violationCode} thành công!`);
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-6">
      {toast && (
        <div className="fixed top-3.5 md:top-4 left-1/2 lg:left-[calc(50%+130px)] -translate-x-1/2 z-[100] max-w-[500px] w-auto pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <Alert
            size="sm"
            variant={toast.type === 'success' ? 'success' : 'danger'}
            onClose={() => setToast(null)}
            className="w-auto min-w-[280px] max-w-[500px] shadow-[0px_8px_24px_rgba(0,0,0,0.15)] border border-[#E5E5E5] bg-white"
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <p className="text-[13px] font-normal text-[#202939] leading-snug whitespace-nowrap">
                {toast.message}
              </p>
            </div>
          </Alert>
        </div>
      )}

      <div className="bg-white rounded-[8px] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-tight tracking-[-0.025em]">
            Quản lý vi phạm & Kỷ luật
          </h1>
          <p className="text-[13px] text-[#64748B] mt-1">
            Ghi nhận và quản lý các biên bản xử phạt vi phạm của nhân viên phòng gym
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="h-[40px] px-5 min-w-[140px] bg-[#064343] hover:bg-[#053737] rounded-[10px] text-[13px] font-medium leading-[20px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi nhận vi phạm</span>
        </button>
      </div>

      <div className="bg-white rounded-[8px] p-8 shadow-xs flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-[#064343]" />
        </div>
        <h3 className="text-[16px] font-semibold text-[#011010] mb-1">
          Hệ thống ghi nhận vi phạm nhân viên
        </h3>
        <p className="text-[13px] text-[#64748B] max-w-[480px] mb-6">
          Bấm nút &quot;Ghi nhận vi phạm&quot; ở trên để lập biên bản xử phạt nhân viên căn cứ theo quy định nội quy phòng gym.
        </p>
        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="h-[38px] px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#064343] rounded-[8px] text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Lập biên bản mới</span>
        </button>
      </div>

      <ViolationFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

