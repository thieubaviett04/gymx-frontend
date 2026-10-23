import React from 'react';
import { Link } from '@/i18n/routing';
import { Check, Star } from 'lucide-react';
import { pricingCards } from './data';

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-[#F9FAFB] py-28 px-6">
      <div className="max-w-[1280px] mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-sm font-bold uppercase tracking-wider text-[#FF6B00]">Gói thành viên</span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#101828] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
            Chọn gói phù hợp
          </h2>
          <p className="text-base sm:text-lg text-[#6A7282]">
            Tất cả gói đều bao gồm quyền truy cập đầy đủ thiết bị. Nâng cấp hoặc huỷ bất cứ lúc nào.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {pricingCards.map((card, i) => (
            <div
              key={i}
              className={`bg-white rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${card.borderClass}`}
            >
              {card.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#FF6B00] text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Phổ biến nhất
                </div>
              )}

              <div>
                <div className="space-y-1 pb-6 border-b border-[#F3F4F6]">
                  <span
                    className={`text-sm font-medium ${
                      card.popular ? 'text-[#FF6B00] font-semibold' : 'text-[#99A1AF]'
                    }`}
                  >
                    {card.tag}
                  </span>
                  <h3 className="text-4xl font-black text-[#101828] font-['Plus_Jakarta_Sans',sans-serif]">
                    {card.name}
                  </h3>
                  <div className="flex items-baseline gap-1 pt-3">
                    <span className="text-4xl font-black text-[#101828] font-['Plus_Jakarta_Sans',sans-serif]">
                      {card.price}
                    </span>
                    <span className="text-sm text-[#99A1AF] font-normal">{card.period}</span>
                  </div>
                </div>

                <div className="py-6 space-y-4">
                  {card.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-[#4A5565]">
                      <div className="w-5 h-5 rounded-full bg-[#FFF7ED] flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-[#FF6B00]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/register"
                  className={`w-full py-4 rounded-2xl text-center text-base font-bold block transition-all ${card.buttonClass}`}
                >
                  {card.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-[#99A1AF]">
          Cần tư vấn?{' '}
          <a href="#footer" className="text-[#FF6B00] font-semibold hover:underline">
            Liên hệ với chúng tôi
          </a>{' '}
          — phản hồi trong 5 phút.
        </div>
      </div>
    </section>
  );
}
