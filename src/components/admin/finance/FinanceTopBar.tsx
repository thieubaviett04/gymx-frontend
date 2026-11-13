'use client';

import React from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { formatVND } from '@/lib/utils/formatters';

interface FinanceTopBarProps {
  activeTab: 'receipts' | 'expenses';
  onTabChange: (tab: 'receipts' | 'expenses') => void;
  onOpenCreateExpense?: () => void;
  onOpenCreateReceipt?: () => void;
  onExportExcel?: () => void;
  totalAmount?: number;
  totalCount?: number;
}

export function FinanceTopBar({
  activeTab,
  onTabChange,
  onOpenCreateExpense,
  onOpenCreateReceipt,
  onExportExcel,
  totalAmount = 0,
  totalCount = 0,
}: FinanceTopBarProps) {
  const formattedCount = totalCount < 10 ? `0${totalCount}` : String(totalCount);

  return (
    <div className="w-full bg-white rounded-[12px] border border-[#EAEDF2] p-[16px_20px] shadow-[0px_6px_30px_0px_rgba(175,190,211,0.15)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
      {/* Tab selectors */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onTabChange('receipts')}
          className={`h-[48px] px-5 rounded-[8px] text-[13px] font-medium leading-[20px] transition-all flex items-center justify-center cursor-pointer select-none ${
            activeTab === 'receipts'
              ? 'bg-[#064343] text-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
              : 'bg-[#F8FAFC] text-[#202939] border border-[#E2E8F0] hover:bg-slate-100'
          }`}
        >
          <span>Dữ liệu phiếu thu</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('expenses')}
          className={`h-[48px] px-5 rounded-[8px] text-[13px] font-medium leading-[20px] transition-all flex items-center justify-center cursor-pointer select-none ${
            activeTab === 'expenses'
              ? 'bg-[#064343] text-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
              : 'bg-[#F8FAFC] text-[#202939] border border-[#E2E8F0] hover:bg-slate-100'
          }`}
        >
          <span>Dữ liệu phiếu chi</span>
        </button>
      </div>

      {/* Right side: Stats & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-5">
        {/* Stats group */}
        <div className="flex items-center gap-4 sm:gap-5 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="text-[14px] sm:text-[15px] font-medium text-[#64748B] leading-none">
              {activeTab === 'receipts' ? 'Tổng thu' : 'Tổng chi'}
            </span>
            <span className="text-[16px] sm:text-[17px] font-bold leading-none tracking-tight text-[#064343]">
              {formatVND(totalAmount)}
            </span>
          </div>

          <div className="w-[1px] h-5 bg-[#E2E8F0] shrink-0" />

          <div className="flex items-center gap-2.5">
            <span className="text-[14px] sm:text-[15px] font-medium text-[#64748B] leading-none">
              Đã ghi nhận
            </span>
            <span className="text-[15px] sm:text-[16px] font-semibold text-[#202939] leading-none">
              {formattedCount}
            </span>
          </div>
        </div>

        <div className="hidden sm:block w-[1px] h-5 bg-[#E2E8F0] shrink-0" />

        {/* Buttons group */}
        <div className="flex items-center gap-2 shrink-0">
          {onExportExcel && (
            <button
              type="button"
              onClick={onExportExcel}
              className="h-[48px] px-4 rounded-[8px] bg-white border border-[#E2E8F0] shadow-[0px_3px_26px_0px_rgba(175,190,211,0.15)] hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer select-none shrink-0"
            >
              <Image
                src="/icons/excel-icon.svg"
                alt="Excel"
                width={24}
                height={24}
                className="w-6 h-6 shrink-0"
              />
              <span className="text-[#2F3D50] text-[15px] font-normal leading-[24px]">
                Xuất excel
              </span>
            </button>
          )}

          {activeTab === 'receipts' && onOpenCreateReceipt && (
            <button
              type="button"
              onClick={onOpenCreateReceipt}
              className="h-[48px] px-5 rounded-[8px] bg-[#064343] hover:bg-[#053737] text-white text-[14px] font-normal leading-[20px] tracking-[0.01em] shadow-[0px_6px_30px_0px_rgba(175,190,211,0.15)] flex items-center gap-2 transition-colors cursor-pointer select-none"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Lập phiếu thu</span>
            </button>
          )}

          {activeTab === 'expenses' && onOpenCreateExpense && (
            <button
              type="button"
              onClick={onOpenCreateExpense}
              className="h-[48px] px-5 rounded-[8px] bg-[#064343] hover:bg-[#053737] text-white text-[14px] font-normal leading-[20px] tracking-[0.01em] shadow-[0px_6px_30px_0px_rgba(175,190,211,0.15)] flex items-center gap-2 transition-colors cursor-pointer select-none"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Lập phiếu chi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinanceTopBar;
