import React from 'react';
import { stats } from './data';

export default function StatsSection() {
  return (
    <section className="bg-white border-b border-[#F3F4F6] py-14">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] flex items-center justify-center text-[#FF6B00]">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#101828] font-['Plus_Jakarta_Sans',sans-serif]">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-[#6A7282]">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
