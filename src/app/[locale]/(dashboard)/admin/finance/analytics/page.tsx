'use client';

import React, { useState } from 'react';
import { Alert } from '@/components/ui';
import { RevenueAnalyticsView } from '@/components/admin/finance';

export default function AdminFinanceAnalyticsPage() {
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-6 sm:space-y-7">
      {toast && (
        <div className="fixed top-3.5 md:top-4 left-1/2 lg:left-[calc(50%+130px)] -translate-x-1/2 z-[100] max-w-[90vw] md:max-w-[620px] w-auto pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <Alert
            size="sm"
            variant={
              toast.type === 'success'
                ? 'success'
                : toast.type === 'warning'
                ? 'warning'
                : 'danger'
            }
            onClose={() => setToast(null)}
            className="w-auto min-w-[280px] max-w-[90vw] md:max-w-[620px] shadow-[0px_8px_24px_rgba(0,0,0,0.15)] border border-[#E5E5E5] bg-white pr-3"
          >
            <p className="text-[13px] font-normal text-[#202939] leading-snug break-words">
              {toast.message}
            </p>
          </Alert>
        </div>
      )}

      <RevenueAnalyticsView onShowToast={showToast} />
    </div>
  );
}

