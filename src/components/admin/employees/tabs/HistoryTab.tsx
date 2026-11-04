'use client';

import React from 'react';
import { EmployeeTabEmptyState } from './EmployeeTabEmptyState';

export function HistoryTab() {
  return (
    <div className="bg-white flex-1 flex flex-col">
      <div className="border-b border-[#F1F5F9] pb-2.5 mb-5 flex items-center justify-between">
        <h4 className="text-[14px] font-semibold text-[#011010] tracking-[-0.0069em] uppercase">
          NHẬT KÝ THAY ĐỔI THÔNG TIN
        </h4>
      </div>
      <EmployeeTabEmptyState message="Chưa có thay đổi nào gần đây" />
    </div>
  );
}

