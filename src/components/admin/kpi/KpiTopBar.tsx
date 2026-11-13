'use client';

import React from 'react';
import { Target } from 'lucide-react';

interface KpiTopBarProps {
  activeTab: 'progress' | 'templates';
  onTabChange: (tab: 'progress' | 'templates') => void;
  onOpenAssignModal?: () => void;
}

export function KpiTopBar({
  activeTab,
  onTabChange,
  onOpenAssignModal,
}: KpiTopBarProps) {
  return (
    <div className="w-full bg-white rounded-[12px] border border-[#EAEDF2] p-[16px_20px] shadow-[0px_6px_30px_0px_rgba(175,190,211,0.15)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onTabChange('progress')}
          className={`h-[48px] px-5 rounded-[8px] text-[14px] font-medium leading-[20px] transition-all flex items-center justify-center cursor-pointer select-none ${
            activeTab === 'progress'
              ? 'bg-[#064343] text-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
              : 'bg-[#F8FAFC] text-[#202939] border border-[#E2E8F0] hover:bg-slate-100'
          }`}
        >
          <span>Bảng tiến độ KPI</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('templates')}
          className={`h-[48px] px-5 rounded-[8px] text-[14px] font-medium leading-[20px] transition-all flex items-center justify-center cursor-pointer select-none ${
            activeTab === 'templates'
              ? 'bg-[#064343] text-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
              : 'bg-[#F8FAFC] text-[#202939] border border-[#E2E8F0] hover:bg-slate-100'
          }`}
        >
          <span>Danh mục mẫu KPI</span>
        </button>
      </div>

      <div className="flex items-center gap-2 justify-end">
        {activeTab === 'progress' && onOpenAssignModal && (
          <button
            type="button"
            onClick={onOpenAssignModal}
            className="h-[48px] px-5 rounded-[8px] bg-[#064343] hover:bg-[#053737] text-white text-[14px] font-medium leading-[20px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex items-center gap-2 transition-colors cursor-pointer select-none"
          >
            <Target className="w-4 h-4 text-white" />
            <span>Giao KPI</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default KpiTopBar;

