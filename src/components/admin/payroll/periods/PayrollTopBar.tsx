'use client';

import React from 'react';
import Image from 'next/image';
import { RotateCcw } from 'lucide-react';
import { LockKeyIcon } from '@/components/ui';
import type { PayrollPeriodStatus } from '@/types/payroll';

interface PayrollTopBarProps {
  activeTab: 'attendance' | 'periods';
  onTabChange: (tab: 'attendance' | 'periods') => void;
  selectedMonth: number;
  selectedYear: number;
  periodStatus?: PayrollPeriodStatus | null;
  isCalculating?: boolean;
  isLocking?: boolean;
  onCalculate: () => void;
  onLockPeriod?: () => void;
  onExportExcel: () => void;
  onViewPeriodDetail?: () => void;
  isInDetailMode?: boolean;
}

export function PayrollTopBar({
  activeTab,
  onTabChange,
  periodStatus,
  isCalculating = false,
  isLocking = false,
  onCalculate,
  onLockPeriod,
  onExportExcel,
  isInDetailMode = false,
}: PayrollTopBarProps) {
  const isConfirmed = periodStatus === 'CONFIRMED' || periodStatus === 'LOCKED';
  const isCalculated = periodStatus === 'CALCULATED';

  return (
    <div className="w-full bg-white rounded-[12px] border border-[#EAEDF2] p-[16px_20px] shadow-[0px_6px_30px_0px_rgba(175,190,211,0.15)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onTabChange('attendance')}
          className={`h-[48px] px-4 rounded-[8px] text-[13px] font-medium leading-[20px] transition-all flex items-center justify-center cursor-pointer select-none ${
            activeTab === 'attendance'
              ? 'bg-[#064343] text-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
              : 'bg-[#F8FAFC] text-[#202939] border border-[#E2E8F0] hover:bg-slate-100'
          }`}
        >
          <span>Dữ liệu bảng công</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('periods')}
          className={`h-[48px] px-4 rounded-[8px] text-[13px] font-medium leading-[20px] transition-all flex items-center justify-center cursor-pointer select-none ${
            activeTab === 'periods'
              ? 'bg-[#064343] text-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
              : 'bg-[#F8FAFC] text-[#202939] border border-[#E2E8F0] hover:bg-slate-100'
          }`}
        >
          <span>Danh sách kỳ lương</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 justify-end">
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

        {activeTab === 'attendance' && (
          <>
            {isConfirmed ? (
              <div className="h-[48px] px-4 rounded-[8px] bg-slate-100 text-slate-500 text-[14px] font-normal flex items-center gap-2 border border-slate-200 select-none">
                <LockKeyIcon className="w-4 h-4 text-slate-400" />
                <span>Đã khóa</span>
              </div>
            ) : isCalculated ? (
              <button
                type="button"
                onClick={onCalculate}
                disabled={isCalculating}
                className="h-[48px] px-5 rounded-[8px] bg-[#064343] hover:bg-[#053737] text-white text-[14px] font-normal leading-[20px] tracking-[0.01em] shadow-[0px_6px_30px_0px_rgba(175,190,211,0.15)] flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed select-none"
              >
                <RotateCcw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
                <span>{isCalculating ? 'Đang tính...' : 'Tính lại bảng lương'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onCalculate}
                disabled={isCalculating}
                className="h-[48px] px-5 rounded-[8px] bg-[#064343] hover:bg-[#053737] text-white text-[14px] font-normal leading-[20px] tracking-[0.01em] shadow-[0px_6px_30px_0px_rgba(175,190,211,0.15)] flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed select-none"
              >
                {isCalculating ? (
                  <RotateCcw className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Image
                    src="/icons/calculate-icon.svg"
                    alt="+"
                    width={16}
                    height={16}
                    className="w-4 h-4 shrink-0"
                  />
                )}
                <span>{isCalculating ? 'Đang lập bảng...' : 'Lập bảng lương'}</span>
              </button>
            )}
          </>
        )}

        {activeTab === 'periods' && isInDetailMode && (
          <>
            {isConfirmed ? (
              <div className="h-[48px] px-4 rounded-[8px] bg-emerald-50 text-emerald-700 text-[13px] font-medium flex items-center gap-1.5 border border-emerald-200 select-none">
                <LockKeyIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã khóa</span>
              </div>
            ) : (
              onLockPeriod && (
                <button
                  type="button"
                  onClick={onLockPeriod}
                  disabled={isLocking}
                  className="h-[48px] px-5 rounded-[8px] bg-[#064343] hover:bg-[#053737] text-white text-[14px] font-normal leading-[20px] tracking-[0.01em] shadow-[0px_6px_30px_0px_rgba(175,190,211,0.15)] flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed select-none"
                >
                  <LockKeyIcon className="w-4 h-4 text-white" />
                  <span>{isLocking ? 'Đang khóa...' : 'Khóa kỳ lương'}</span>
                </button>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PayrollTopBar;
