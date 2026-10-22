import React from 'react';
import { Link } from '@/i18n/routing';
import { ArrowRight, Star } from 'lucide-react';
import { trainers } from './data';

export default function TrainersSection() {
  return (
    <section id="trainers" className="bg-white py-28 px-6">
      <div className="max-w-[1280px] mx-auto space-y-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="text-sm font-bold uppercase tracking-wider text-[#FF6B00]">Đội ngũ HLV</span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#101828] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
              Những người thầy
              <br />
              xuất sắc nhất
            </h2>
          </div>
          <a href="#footer" className="text-sm font-bold text-[#FF6B00] flex items-center gap-1.5 hover:underline">
            Xem tất cả HLV <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {trainers.map((tr, i) => (
            <div
              key={i}
              className="rounded-3xl border border-[#E5E7EB] bg-white overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all group"
            >
              <div>
                <div className="h-64 relative overflow-hidden bg-[#F3F4F6]">
                  <img
                    src={tr.image}
                    alt={tr.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {tr.tag && (
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-bold text-white uppercase ${tr.tagBg}`}
                    >
                      {tr.tag}
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-1">
                  <h4 className="text-base font-bold text-[#101828] font-['Plus_Jakarta_Sans',sans-serif]">
                    {tr.name}
                  </h4>
                  <p className="text-xs text-[#99A1AF]">{tr.role}</p>

                  <div className="flex items-center justify-between pt-3 text-xs">
                    <div className="flex items-center gap-1 font-bold text-[#101828]">
                      <Star className="w-3.5 h-3.5 text-[#FFB800] fill-current" />
                      <span>{tr.rating}</span>
                    </div>
                    <span className="text-[#99A1AF]">{tr.sessions}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  href="/register"
                  className="w-full py-2.5 rounded-xl border-2 border-[#FF6B00]/20 hover:border-[#FF6B00] text-[#FF6B00] font-bold text-xs text-center block transition-colors"
                >
                  Đặt lịch PT
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
