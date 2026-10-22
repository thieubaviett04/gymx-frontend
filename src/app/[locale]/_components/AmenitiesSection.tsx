import React from 'react';
import { amenities } from './data';

export default function AmenitiesSection() {
  return (
    <section id="amenities" className="bg-[#F9FAFB] py-28 px-6">
      <div className="max-w-[1280px] mx-auto space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-sm font-bold uppercase tracking-wider text-[#FF6B00]">Tại sao Gym Max?</span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#101828] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight leading-tight">
              Hơn cả một phòng gym —<br />
              <span className="text-[#FF6B00]">một hệ sinh thái</span>
            </h2>
            <p className="text-base sm:text-lg text-[#6A7282] leading-relaxed">
              Từ thiết bị cao cấp, HLV chuyên nghiệp đến app theo dõi thông minh — chúng tôi xây dựng môi trường tốt
              nhất để bạn bứt phá giới hạn mỗi ngày.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="px-4 py-2 rounded-full bg-white border border-[#E5E7EB] text-xs font-semibold text-[#4A5565] shadow-sm">
                Không gian hiện đại
              </span>
              <span className="px-4 py-2 rounded-full bg-white border border-[#E5E7EB] text-xs font-semibold text-[#4A5565] shadow-sm">
                Cộng đồng năng động
              </span>
              <span className="px-4 py-2 rounded-full bg-white border border-[#E5E7EB] text-xs font-semibold text-[#4A5565] shadow-sm">
                Kết quả thực sự
              </span>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-2xl h-[340px] relative">
            <img
              src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1000&q=80"
              alt="Gym interior"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {amenities.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-white border border-[#E5E7EB] space-y-3">
                <div className={`w-12 h-12 rounded-2xl ${item.iconBg} ${item.iconColor} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-[#101828] font-['Plus_Jakarta_Sans',sans-serif]">
                  {item.title}
                </h4>
                <p className="text-sm text-[#6A7282] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
