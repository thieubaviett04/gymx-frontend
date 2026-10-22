import React from 'react';
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  trend = 'up',
  description,
  iconColor = 'text-[#FF6B00]',
  iconBg = 'bg-[#FFF7ED]',
}: StatCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#99A1AF]">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-3xl font-black text-[#101828] font-['Plus_Jakarta_Sans',sans-serif]">
          {value}
        </div>

        {(change || description) && (
          <div className="flex items-center gap-2 mt-2 text-xs">
            {change && (
              <span
                className={`inline-flex items-center gap-1 font-bold ${
                  trend === 'up'
                    ? 'text-emerald-600'
                    : trend === 'down'
                    ? 'text-red-600'
                    : 'text-[#6A7282]'
                }`}
              >
                {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                {change}
              </span>
            )}
            {description && <span className="text-[#99A1AF]">{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
