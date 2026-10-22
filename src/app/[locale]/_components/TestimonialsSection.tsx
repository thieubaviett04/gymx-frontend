import React from 'react';
import { Star } from 'lucide-react';
import { testimonials } from './data';

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-white py-28 px-6">
      <div className="max-w-[1280px] mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-sm font-bold uppercase tracking-wider text-[#FF6B00]">Thành viên nói gì</span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#101828] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
            12,000+ người đã thay đổi
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="p-7 rounded-3xl bg-[#F9FAFB] border border-[#E5E7EB] flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <span className="inline-block px-3 py-1.5 rounded-full bg-[#FFF7ED] border border-[#FFEDD4] text-[#FF6B00] text-xs font-bold">
                  {item.pill}
                </span>

                <div className="flex text-[#FFB800] gap-0.5">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="text-base text-[#4A5565] leading-relaxed italic">{item.quote}</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#E5E7EB]">
                <img src={item.avatar} alt={item.author} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h5 className="text-sm font-bold text-[#101828]">{item.author}</h5>
                  <p className="text-xs text-[#99A1AF]">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
