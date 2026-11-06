'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  tabClassName?: string;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className,
  tabClassName,
}: TabsProps<T>) {
  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto select-none', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-2 rounded-[8px] text-[13px] leading-5 transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5',
              isActive
                ? 'bg-[#064343] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] font-semibold'
                : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#202939] hover:bg-slate-100 font-medium',
              tab.disabled && 'opacity-50 cursor-not-allowed',
              tabClassName
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 text-[11px] rounded-full leading-none font-medium',
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#202939]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;

