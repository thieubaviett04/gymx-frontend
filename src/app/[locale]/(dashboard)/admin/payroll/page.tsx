'use client';

import React from 'react';
import { Banknote } from 'lucide-react';

export default function AdminPayrollPage() {
  return (
    <div className="w-full flex-1 flex flex-col space-y-6">
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xs border border-[#CDD5DF]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[20px] sm:text-[22px] font-bold text-[#011010] leading-tight tracking-[-0.025em]">
              Quản lý Bảng lương theo kỳ
            </h1>
            <p className="text-[13px] text-[#64748B] mt-1">
              Lập bảng lương định kỳ, quản lý phiếu lương và khóa kỳ tính lương GymX
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-12 shadow-xs border border-[#CDD5DF] flex flex-col items-center justify-center text-center min-h-[320px]">
        <div className="w-14 h-14 rounded-2xl bg-[#064343]/10 flex items-center justify-center mb-4 text-[#064343]">
          <Banknote className="w-7 h-7" />
        </div>
        <h2 className="text-[18px] font-semibold text-[#011010] mb-2">
          Phân hệ Lập Bảng lương theo kỳ
        </h2>
        <p className="text-[14px] text-[#64748B] max-w-[520px] leading-relaxed">
          Tính năng lập bảng lương tự động (P6.6) và khóa kỳ lương vĩnh viễn (P6.7) tách biệt độc lập với phân hệ Thiết lập công thức tính lương.
        </p>
      </div>
    </div>
  );
}
