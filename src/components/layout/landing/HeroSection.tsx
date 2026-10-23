'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Dumbbell,
  Sparkles,
  Star,
} from 'lucide-react';
import { heroPlanDetails, PlanType } from './data';

export default function HeroSection() {
  const [selectedHeroPlan, setSelectedHeroPlan] = useState<PlanType>('Pro');

  return (
    <section className="relative min-h-[903px] flex items-center justify-center bg-black overflow-hidden px-6 py-20">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[350px] bg-[#FF6B00]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-[1280px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              GYM HÀNG ĐẦU VIỆT NAM 2025
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl xl:text-[80px] font-extrabold text-white tracking-tight leading-[1.08] font-['Plus_Jakarta_Sans',sans-serif]">
              Biến hình{' '}
              <span className="relative inline-block">
                cơ thể
                <span className="absolute left-0 -bottom-1 w-full h-1.5 bg-gradient-to-r from-[#FF6B00] to-[#FFB800] rounded-full" />
              </span>
              .<br />
              Nâng cấp
              <br />
              cuộc sống.
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-white/70 max-w-xl font-normal leading-relaxed">
            Gym Max kết hợp thiết bị hiện đại, HLV đẳng cấp quốc tế và hệ thống quản lý thông minh — để bạn đạt mục
            tiêu nhanh hơn, dễ hơn.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-base shadow-[0_10px_25px_rgba(255,107,0,0.35)] transition-all flex items-center gap-2.5"
            >
              Đăng ký gói tập
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#pricing"
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md text-white font-semibold text-base transition-all"
            >
              Xem các gói tập
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#FF6B00]" />
              <span>Không ràng buộc</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#FF6B00]" />
              <span>Hoàn tiền 7 ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#FF6B00]" />
              <span>Kích hoạt ngay hôm nay</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="absolute -top-4 right-4 z-20 px-4 py-3 rounded-2xl bg-[#FFB800] text-[#101828] shadow-xl">
            <span className="block text-[11px] font-bold uppercase tracking-wider">Thành viên mới</span>
            <span className="block text-2xl font-black font-['Plus_Jakarta_Sans',sans-serif] leading-tight">+240</span>
            <span className="block text-[11px] font-medium text-[#101828]/70">tháng này</span>
          </div>

          <div className="bg-white rounded-3xl p-7 shadow-2xl relative z-10 border border-white/20 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#99A1AF]">Đăng ký nhanh</span>
                <h3 className="text-2xl font-bold text-[#101828] font-['Plus_Jakarta_Sans',sans-serif]">
                  Chọn gói tập
                </h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#FFF7ED] flex items-center justify-center text-[#FF6B00]">
                <Dumbbell className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-[#F3F4F6] p-1 rounded-xl">
              {(['Basic', 'Pro', 'Elite'] as const).map((plan) => (
                <button
                  key={plan}
                  onClick={() => setSelectedHeroPlan(plan)}
                  className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                    selectedHeroPlan === plan
                      ? 'bg-[#FF6B00] text-white shadow-md'
                      : 'text-[#6A7282] hover:text-[#101828]'
                  }`}
                >
                  {plan}
                </button>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF7ED] space-y-1">
              <span className="text-xs text-[#6A7282]">Chỉ từ</span>
              <div className="text-3xl font-black text-[#101828] font-['Plus_Jakarta_Sans',sans-serif]">
                {heroPlanDetails[selectedHeroPlan].price}
                <span className="text-base font-normal text-[#99A1AF]">đ/tháng</span>
              </div>
              <div className="text-xs font-semibold text-[#FF6B00]">
                {heroPlanDetails[selectedHeroPlan].save}
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {heroPlanDetails[selectedHeroPlan].perks.map((perk, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-[#4A5565]">
                  <div className="w-5 h-5 rounded-full bg-[#FFF7ED] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#FF6B00]" />
                  </div>
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="w-full py-3.5 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-center block shadow-[0_6px_20px_rgba(255,107,0,0.3)] transition-all"
            >
              Bắt đầu ngay hôm nay
            </Link>
          </div>

          <div className="absolute -bottom-4 -left-4 z-20 px-4 py-3 rounded-2xl bg-white border border-[#E5E7EB] shadow-xl flex items-center gap-3">
            <div className="flex text-[#FFB800]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <div>
              <span className="block text-sm font-bold text-[#101828]">4.9 / 5.0</span>
              <span className="block text-xs text-[#99A1AF]">1,200+ đánh giá</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 animate-bounce">
        <span className="text-xs uppercase tracking-widest font-medium">Khám phá</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </section>
  );
}
